import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';
import { Sparkles } from 'lucide-react';

export default function OurSofa() {
  return (
    <div className="space-y-6 h-full">
      <div>
        <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">Nuestro Sofá</h1>
        <p className="text-warm-600 dark:text-warm-400">Tu espacio personal para conversar</p>
      </div>

      <div className="h-[calc(100vh-250px)]">
        <ChatInterface context="sofa" title="Conversación Continua" />
      </div>
    </div>
  );
}