import React from 'react';
import { UserProfile, Order } from '../types';
import { User, ShoppingBag, Terminal, Clock, MapPin, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface ContextPanelProps {
  userProfile: UserProfile | null;
  draftOrder: Order | null;
  toolLogs: { name: string; args: any; result: any; timestamp: Date }[];
}

export function ContextPanel({ userProfile, draftOrder, toolLogs }: ContextPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-y-auto p-6 space-y-6">
      
      {/* User Profile Section */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-gray-800">
          <User className="w-5 h-5 text-emerald-600" />
          <h2 className="font-semibold text-lg">User Context</h2>
        </div>
        {userProfile ? (
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="font-medium text-gray-500 w-20">Name:</span>
              <span className="text-gray-900">{userProfile.name}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <span className="text-gray-900">{userProfile.address}</span>
            </div>
            <div className="flex items-start gap-2">
              <Heart className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {userProfile.preferences.map((pref, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md text-xs border border-emerald-100">
                    {pref}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">Profile not loaded yet...</p>
        )}
      </section>

      {/* Current Order Section */}
      <section className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4 text-gray-800">
          <ShoppingBag className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-lg">Current Order State</h2>
        </div>
        {draftOrder ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="font-medium text-gray-900">{draftOrder.restaurantName}</span>
              <span className={`text-xs px-2 py-1 rounded-full uppercase tracking-wider font-semibold ${
                draftOrder.status === 'draft' ? 'bg-amber-100 text-amber-700' :
                draftOrder.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {draftOrder.status}
              </span>
            </div>
            <div className="space-y-2">
              {draftOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div className="flex gap-2 text-gray-700">
                    <span className="text-gray-400">{item.quantity}x</span>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-gray-900 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-100 font-semibold text-gray-900">
              <span>Total</span>
              <span>${draftOrder.total.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No active order.</p>
        )}
      </section>

      {/* ReAct Tool Logs */}
      <section className="bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-800 flex-1 flex flex-col min-h-[300px]">
        <div className="flex items-center gap-2 mb-4 text-gray-100">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold text-lg">Agent Thought Process</h2>
        </div>
        <div className="space-y-3 overflow-y-auto flex-1 font-mono text-xs">
          {toolLogs.length === 0 ? (
            <p className="text-gray-500 italic">Waiting for agent actions...</p>
          ) : (
            toolLogs.map((log, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className="bg-gray-800 rounded-lg p-3 border border-gray-700"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-emerald-400 font-semibold">ƒ {log.name}()</span>
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-gray-300 mb-1">
                  <span className="text-gray-500">Args:</span> {JSON.stringify(log.args)}
                </div>
                <div className="text-blue-300 truncate">
                  <span className="text-gray-500">Result:</span> {JSON.stringify(log.result).substring(0, 100)}...
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
