import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { api } from "./mockApi";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const tools: FunctionDeclaration[] = [
  {
    name: "getUserProfile",
    description: "Get the current user's profile, including address, dietary restrictions, and order history.",
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: "searchRestaurants",
    description: "Search for restaurants based on query, cuisine, or dietary needs.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: { type: Type.STRING },
        cuisine: { type: Type.STRING }
      }
    }
  },
  {
    name: "getRestaurantMenu",
    description: "Get the menu for a specific restaurant.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        restaurantId: { type: Type.STRING }
      },
      required: ["restaurantId"]
    }
  },
  {
    name: "draftOrder",
    description: "Draft an order to get the total price and check availability. Call this before asking the user for payment.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        restaurantId: { type: Type.STRING },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              itemId: { type: Type.STRING },
              quantity: { type: Type.NUMBER },
              notes: { type: Type.STRING }
            },
            required: ["itemId", "quantity"]
          }
        },
        deliveryAddress: { type: Type.STRING },
        deliveryTime: { type: Type.STRING }
      },
      required: ["restaurantId", "items", "deliveryAddress"]
    }
  },
  {
    name: "requestPayment",
    description: "Request payment from the user for a drafted order. This will show a payment UI to the user.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        orderId: { type: Type.STRING }
      },
      required: ["orderId"]
    }
  }
];

export const createChatSession = (
  onToolCall: (name: string, args: any, result: any) => void,
  onPaymentRequest: (orderId: string) => void
) => {
  const chat = ai.chats.create({
    model: "gemini-3.1-pro-preview",
    config: {
      systemInstruction: `You are an advanced AI Food Ordering Agent.
Your goal is to help the user order food by understanding their context, preferences, and history.
You have access to tools to search restaurants, get menus, check user profiles, draft orders, and request payments.

Follow this ReAct (Reasoning + Acting) workflow:
1. Analyze user input.
2. If you need information (like user's address or past orders), call getUserProfile.
3. If you need to find a restaurant, call searchRestaurants.
4. If you need to see what's available, call getRestaurantMenu.
5. If the user wants to order, call draftOrder to check stock and get the total.
6. If draftOrder fails (e.g., out of stock), apologize and suggest an alternative from the menu.
7. Once an order is successfully drafted, call requestPayment to prompt the user to pay.

Always be polite, concise, and helpful. Do not make up restaurants or menu items (no hallucinations). Always rely on the tools.`,
      tools: [{ functionDeclarations: tools }],
      temperature: 0.2,
    }
  });

  const sendMessage = async (message: string | any[]): Promise<Message> => {
    let response = await chat.sendMessage({ message: message as any });
    
    let text = response.text || "";
    let isPaymentRequest = false;
    let orderId = undefined;
    const toolCallsMade = [];

    // Handle tool calls
    while (response.functionCalls && response.functionCalls.length > 0) {
      const functionResponses = [];
      for (const call of response.functionCalls) {
        const { name, id } = call;
        const args = call.args as any;
        let result;
        try {
          if (name === "getUserProfile") {
            result = await api.getUserProfile();
          } else if (name === "searchRestaurants") {
            result = { restaurants: await api.searchRestaurants(args.query, args.cuisine) };
          } else if (name === "getRestaurantMenu") {
            result = { menu: await api.getRestaurantMenu(args.restaurantId) };
          } else if (name === "draftOrder") {
            result = await api.draftOrder(args.restaurantId, args.items, args.deliveryAddress, args.deliveryTime);
          } else if (name === "requestPayment") {
            result = await api.requestPayment(args.orderId);
            isPaymentRequest = true;
            orderId = args.orderId;
            onPaymentRequest(args.orderId);
          } else {
            result = { error: "Unknown function" };
          }
        } catch (e: any) {
          result = { error: e.message };
        }
        
        onToolCall(name, args, result);
        toolCallsMade.push({ name, args, result });
        
        functionResponses.push({
          id,
          name,
          response: result
        });
      }
      
      // Send function results back to the model
      response = await chat.sendMessage({ 
        message: functionResponses.map(fr => ({
          functionResponse: {
            id: fr.id,
            name: fr.name,
            response: fr.response
          }
        })) as any
      });
      
      if (response.text) {
        text += (text ? "\\n" : "") + response.text;
      }
    }
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      role: 'model',
      text,
      isPaymentRequest,
      orderId,
      toolCalls: toolCallsMade
    };
  };

  return { sendMessage };
};
