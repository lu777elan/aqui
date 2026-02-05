import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Moon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ChatInterface({ context, title }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    updateDate();
    
    const dateInterval = setInterval(() => {
      updateDate();
    }, 60000); // Check every minute
    
    return () => clearInterval(dateInterval);
  }, [context]);

  const updateDate = () => {
    const today = format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es });
    setCurrentDate(today);
  };

  const loadMessages = async () => {
    try {
      const allMessages = await base44.entities.ChatMessage.filter(
        { chat_context: context },
        '-created_date',
        100
      );
      setMessages(allMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      chat_context: context,
      role: 'user',
      content: input.trim(),
      date: format(new Date(), 'yyyy-MM-dd')
    };

    try {
      await base44.entities.ChatMessage.create(userMessage);
      setInput('');
      setLoading(true);

      // Generate AI response
      const allMessages = await base44.entities.ChatMessage.filter(
        { chat_context: context },
        '-created_date',
        20
      );

      const conversationHistory = allMessages
        .reverse()
        .map(m => `${m.role === 'user' ? 'Usuario' : 'AI'}: ${m.content}`)
        .join('\n');

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Eres una AI compañera cálida y amigable en la app "OH - Our Home L&E". 
        Contexto del chat: ${context}
        
        Historial reciente de conversación:
        ${conversationHistory}
        
        Último mensaje del usuario: ${input}
        
        Responde de manera personal, empática y manteniendo la memoria de conversaciones anteriores. 
        Si es el primer mensaje del día, saluda apropiadamente.
        Responde en español de manera natural y conversacional.`,
      });

      await base44.entities.ChatMessage.create({
        chat_context: context,
        role: 'ai',
        content: aiResponse,
        date: format(new Date(), 'yyyy-MM-dd')
      });

      loadMessages();
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="shadow-lg h-full flex flex-col" style={{ 
      background: '#F5F0E8',
      backgroundImage: `
        radial-gradient(ellipse 800px 600px at 20% 30%, rgba(0,0,0,0.02) 0%, transparent 50%),
        radial-gradient(ellipse 600px 800px at 80% 70%, rgba(0,0,0,0.015) 0%, transparent 50%),
        radial-gradient(ellipse 400px 300px at 50% 50%, rgba(255,255,255,0.3) 0%, transparent 70%),
        repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,.01) 1px, rgba(0,0,0,.01) 2px)
      `,
      boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <CardHeader className="border-b border-warm-200/30" style={{ background: 'rgba(245, 240, 232, 0.5)' }}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-normal">
            <Moon className="w-4 h-4 text-purple-500" />
            {title}
          </CardTitle>
          <span className="text-xs text-warm-600 dark:text-warm-400">
            {currentDate}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0" style={{ background: 'transparent' }}>
        <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ background: 'transparent' }}>
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-warm-100 dark:bg-warm-800 text-warm-900 dark:text-warm-100'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-warm-100 dark:bg-warm-800 rounded-2xl px-4 py-3">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="border-t p-4">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}