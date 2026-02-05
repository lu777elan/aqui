import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function AIAttendancePrediction({ event, allEvents }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event && allEvents) {
      predictAttendance();
    }
  }, [event?.id]);

  const predictAttendance = async () => {
    setLoading(true);
    try {
      const historicalData = allEvents
        .filter(e => e.attended !== null && e.attended !== undefined)
        .map(e => ({
          category: e.category,
          dayOfWeek: new Date(e.date).getDay(),
          time: e.time,
          attended: e.attended
        }));

      if (historicalData.length < 3) {
        setPrediction({ probability: 85, reason: "Datos insuficientes. Predicción basada en optimismo." });
        setLoading(false);
        return;
      }

      const eventDate = new Date(event.date);
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Predice la probabilidad de asistencia a este evento basándote en el historial.

Evento actual:
- Categoría: ${event.category}
- Día de la semana: ${eventDate.getDay()}
- Hora: ${event.time}

Historial de eventos:
${JSON.stringify(historicalData, null, 2)}

Analiza patrones de asistencia por categoría, día de la semana y hora. Responde SOLO con JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            probability: { 
              type: "number",
              description: "Probabilidad de asistencia entre 0-100"
            },
            reason: { 
              type: "string",
              description: "Breve explicación de la predicción"
            },
            confidence: {
              type: "string",
              enum: ["alta", "media", "baja"]
            }
          }
        }
      });

      setPrediction(response);
      
      // Guardar predicción en el evento
      await base44.entities.Event.update(event.id, {
        attendance_prediction: response.probability
      });
    } catch (error) {
      console.error('Error prediciendo asistencia:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!prediction && !loading) return null;

  const getProbabilityColor = (prob) => {
    if (prob >= 70) return 'text-green-600 dark:text-green-400';
    if (prob >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getProbabilityIcon = (prob) => {
    if (prob >= 70) return TrendingUp;
    if (prob >= 40) return Minus;
    return TrendingDown;
  };

  const Icon = prediction ? getProbabilityIcon(prediction.probability) : Brain;

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-warm-900 dark:text-warm-100">Predicción de Asistencia</h4>
              {prediction && (
                <Badge variant="outline" className="text-xs">
                  Confianza: {prediction.confidence}
                </Badge>
              )}
            </div>
            {loading ? (
              <p className="text-sm text-warm-600 dark:text-warm-400">Analizando patrones...</p>
            ) : prediction ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-5 h-5 ${getProbabilityColor(prediction.probability)}`} />
                  <span className={`text-2xl font-bold ${getProbabilityColor(prediction.probability)}`}>
                    {Math.round(prediction.probability)}%
                  </span>
                </div>
                <p className="text-sm text-warm-600 dark:text-warm-400">{prediction.reason}</p>
              </>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}