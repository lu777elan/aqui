import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Cloud, Car, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function SmartEventNotification({ event }) {
  const [enrichedInfo, setEnrichedInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateSmartNotification = async () => {
    setLoading(true);
    try {
      const daysUntil = differenceInDays(new Date(event.date), new Date());
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Genera información contextual útil para este evento próximo:

Evento: ${event.title}
Categoría: ${event.category}
Fecha: ${event.date}
Hora: ${event.time || 'No especificada'}
Descripción: ${event.description || 'Sin descripción'}

Genera información relevante considerando:
1. Clima esperado para esa fecha (genera una predicción realista basada en la época del año)
2. Recomendaciones de tráfico (considera hora del día y día de la semana)
3. Preparativos sugeridos según la categoría del evento
4. Recordatorios personalizados

Responde SOLO con JSON.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            weather: {
              type: "string",
              description: "Información del clima esperado"
            },
            traffic: {
              type: "string",
              description: "Información de tráfico y mejor horario para salir"
            },
            preparations: {
              type: "array",
              items: { type: "string" },
              description: "Lista de preparativos sugeridos"
            },
            personalized_message: {
              type: "string",
              description: "Mensaje personalizado de recordatorio"
            },
            urgency_level: {
              type: "string",
              enum: ["baja", "media", "alta"]
            }
          }
        }
      });

      setEnrichedInfo(response);

      // Guardar la información en el evento
      await base44.entities.Event.update(event.id, {
        weather_info: response.weather,
        traffic_info: response.traffic,
        ai_suggestions: response
      });
    } catch (error) {
      console.error('Error generando notificación inteligente:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level) => {
    switch(level) {
      case 'alta': return 'border-red-300 bg-red-50 dark:bg-red-900/20';
      case 'media': return 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-blue-300 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <Card className="shadow-lg border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            <h3 className="font-semibold text-warm-900 dark:text-warm-100">Notificación Inteligente</h3>
          </div>
          <Button
            size="sm"
            onClick={generateSmartNotification}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Generar
              </>
            )}
          </Button>
        </div>

        {enrichedInfo && (
          <div className={`rounded-lg border-2 p-4 ${getUrgencyColor(enrichedInfo.urgency_level)}`}>
            {enrichedInfo.personalized_message && (
              <div className="mb-4 p-3 bg-white dark:bg-warm-800 rounded-lg">
                <p className="text-sm font-medium text-warm-900 dark:text-warm-100">
                  {enrichedInfo.personalized_message}
                </p>
              </div>
            )}

            <div className="space-y-3">
              {enrichedInfo.weather && (
                <div className="flex items-start gap-2">
                  <Cloud className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1">Clima</p>
                    <p className="text-sm text-warm-600 dark:text-warm-400">{enrichedInfo.weather}</p>
                  </div>
                </div>
              )}

              {enrichedInfo.traffic && (
                <div className="flex items-start gap-2">
                  <Car className="w-4 h-4 text-orange-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1">Tráfico</p>
                    <p className="text-sm text-warm-600 dark:text-warm-400">{enrichedInfo.traffic}</p>
                  </div>
                </div>
              )}

              {enrichedInfo.preparations && enrichedInfo.preparations.length > 0 && (
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-warm-700 dark:text-warm-300 mb-1">Preparativos</p>
                    <ul className="space-y-1">
                      {enrichedInfo.preparations.map((prep, idx) => (
                        <li key={idx} className="text-sm text-warm-600 dark:text-warm-400 flex items-start gap-1">
                          <span className="text-purple-500">•</span>
                          {prep}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}