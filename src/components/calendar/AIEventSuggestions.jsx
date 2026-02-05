import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Clock, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AIEventSuggestions({ onSelectSuggestion }) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const allEvents = await base44.entities.Event.list('-date', 50);
      
      const eventHistory = allEvents.map(e => ({
        title: e.title,
        category: e.category,
        date: e.date,
        time: e.time,
        attended: e.attended
      }));

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analiza el historial de eventos del usuario y sugiere 3 fechas y horarios óptimos para nuevos eventos en los próximos 14 días.
        
Historial de eventos:
${JSON.stringify(eventHistory, null, 2)}

Considera:
- Patrones de días preferidos
- Horarios más frecuentes
- Categorías más comunes
- Espaciado entre eventos
- Balance entre tipos de eventos

Responde SOLO con JSON, sin texto adicional.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  date: { type: "string" },
                  time: { type: "string" },
                  reason: { type: "string" },
                  recommended_category: { type: "string" }
                }
              }
            },
            insights: { type: "string" }
          }
        }
      });

      setSuggestions(response);
    } catch (error) {
      console.error('Error generando sugerencias:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-purple-200 dark:border-purple-800">
      <CardHeader className="border-b border-purple-200 dark:border-purple-700">
        <CardTitle className="flex items-center gap-2 text-warm-900 dark:text-warm-100">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Sugerencias de IA para Eventos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {!suggestions ? (
          <div className="text-center py-6">
            <p className="text-warm-600 dark:text-warm-400 mb-4">
              Deja que la IA analice tus patrones y sugiera los mejores momentos para tus próximos eventos
            </p>
            <Button 
              onClick={generateSuggestions} 
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar Sugerencias
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.insights && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-warm-700 dark:text-warm-300">{suggestions.insights}</p>
              </div>
            )}
            
            <div className="space-y-3">
              {suggestions.suggestions?.map((suggestion, idx) => (
                <div 
                  key={idx}
                  className="p-4 bg-white dark:bg-warm-800 rounded-lg border border-warm-200 dark:border-warm-700 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-purple-500" />
                        <span className="font-semibold text-warm-900 dark:text-warm-100">
                          {format(new Date(suggestion.date), "EEEE, d 'de' MMMM", { locale: es })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-warm-600 dark:text-warm-400">{suggestion.time}</span>
                      </div>
                      <p className="text-sm text-warm-600 dark:text-warm-400">{suggestion.reason}</p>
                      {suggestion.recommended_category && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                          Categoría sugerida: {suggestion.recommended_category}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onSelectSuggestion(suggestion)}
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      Usar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              onClick={generateSuggestions}
              disabled={loading}
              className="w-full"
            >
              Generar Nuevas Sugerencias
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}