import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onConfirmPayment: (orderId: string) => void;
}

export function Chat({ messages, onSendMessage, isLoading, onConfirmPayment }: ChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-emerald-600 text-white">
        <h1 className="text-xl font-semibold">AI Food Agent</h1>
        <p className="text-sm opacity-80">Your personal culinary assistant</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>
              
              {msg.isPaymentRequest && msg.orderId && (
                <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Order Ready for Payment</span>
                    <span className="text-sm text-gray-500">#{msg.orderId.substring(0, 8)}</span>
                  </div>
                  <button
                    onClick={() => onConfirmPayment(msg.orderId!)}
                    className="w-full mt-2 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Pay
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Agent is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., Order my usual from Healthy Bites..."
            className="flex-1 bg-white border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-emerald-600 text-white rounded-full p-3 w-12 h-12 flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
