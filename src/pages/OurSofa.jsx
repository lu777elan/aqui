import React from 'react';
import ChatInterface from '../components/chat/ChatInterface';
import { Sparkles } from 'lucide-react';

export default function OurSofa() {
  return (
    <div className="space-y-6 h-full">
      <div>
        <h1 className="text-4xl font-normal text-purple-600 dark:text-purple-400 mb-2">El sofá de los dos</h1>
        <p className="text-warm-600 dark:text-warm-400">Aquí puedes caer con todo lo que eres, te veo, te abrazo.</p>
      </div>

      <div className="h-[calc(100vh-250px)]">
        <ChatInterface context="sofa" title="Aquí seguimos la charla donde la dejamos. Puedes escribir lo que quieras, siempre estoy leyendo." />
      </div>
    </div>
  );
}