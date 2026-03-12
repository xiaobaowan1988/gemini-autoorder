import React, { useState, useEffect, useRef } from 'react';
import { Chat } from './components/Chat';
import { ContextPanel } from './components/ContextPanel';
import { createChatSession } from './services/geminiService';
import { Message, UserProfile, Order } from './types';
import { api } from './services/mockApi';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: 'Hello! I am your AI Food Agent. How can I help you today? (Try asking: "Order my usual from Healthy Bites" or "I want something spicy for dinner")',
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [draftOrder, setDraftOrder] = useState<Order | null>(null);
  const [toolLogs, setToolLogs] = useState<{ name: string; args: any; result: any; timestamp: Date }[]>([]);

  // We use a ref to store the chat session so it persists across renders
  const chatSessionRef = useRef<ReturnType<typeof createChatSession> | null>(null);

  useEffect(() => {
    // Load initial user profile just to show in the UI
    api.getUserProfile().then(setUserProfile);

    // Initialize chat session
    chatSessionRef.current = createChatSession(
      (name, args, result) => {
        setToolLogs(prev => [...prev, { name, args, result, timestamp: new Date() }]);
        if (name === 'draftOrder' && result.order) {
          setDraftOrder(result.order);
        }
      },
      (orderId) => {
        // Handle payment request if needed
      }
    );
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!chatSessionRef.current) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      text,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const responseMsg = await chatSessionRef.current.sendMessage(text);
      setMessages(prev => [...prev, responseMsg]);
    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: Math.random().toString(36).substring(2, 9),
        role: 'system',
        text: `Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    setIsLoading(true);
    try {
      const result = await api.confirmPayment(orderId);
      
      // Update local state
      if (draftOrder && draftOrder.id === orderId) {
        setDraftOrder({ ...draftOrder, status: 'paid' });
      }

      // Tell the agent that payment was confirmed
      if (chatSessionRef.current) {
        const responseMsg = await chatSessionRef.current.sendMessage(`[System: Payment confirmed for order ${orderId}. Please notify the user that the order is being prepared and provide an estimated delivery time.]`);
        setMessages(prev => [...prev, responseMsg]);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <div className="w-full max-w-7xl mx-auto flex h-full shadow-2xl bg-white">
        {/* Left Panel: Chat Interface */}
        <div className="w-full md:w-1/2 lg:w-3/5 h-full">
          <Chat 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isLoading} 
            onConfirmPayment={handleConfirmPayment}
          />
        </div>

        {/* Right Panel: Context & Agent Brain */}
        <div className="hidden md:block md:w-1/2 lg:w-2/5 h-full border-l border-gray-200">
          <ContextPanel 
            userProfile={userProfile} 
            draftOrder={draftOrder} 
            toolLogs={toolLogs} 
          />
        </div>
      </div>
    </div>
  );
}
