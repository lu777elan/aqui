import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gamepad2, Play, Trophy, Timer } from 'lucide-react';

export default function GameStop() {
  const [gameState, setGameState] = useState('menu');
  const [currentLetter, setCurrentLetter] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [answers, setAnswers] = useState({});
  const [aiAnswers, setAiAnswers] = useState({});
  const [generatingAI, setGeneratingAI] = useState(false);

  const categories = [
    { id: 'nombre', label: 'Nombre Propio', placeholder: 'Ej: Ana' },
    { id: 'pais', label: 'País', placeholder: 'Ej: Argentina' },
    { id: 'alimento', label: 'Alimento', placeholder: 'Ej: Arroz' },
    { id: 'objeto', label: 'Objeto', placeholder: 'Ej: Abanico' },
    { id: 'animal', label: 'Animal', placeholder: 'Ej: Ardilla' },
    { id: 'color', label: 'Color', placeholder: 'Ej: Azul' },
    { id: 'profesion', label: 'Profesión', placeholder: 'Ej: Arquitecto' }
  ];

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleStop();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState, timeLeft]);

  const startGame = () => {
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    setCurrentLetter(randomLetter);
    setTimeLeft(60);
    setAnswers({});
    setAiAnswers({});
    setGameState('playing');
  };

  const handleStop = async () => {
    setGeneratingAI(true);
    
    try {
      const prompt = `Genera respuestas para el juego "Stop/Basta" con la letra ${currentLetter}. 
      Necesito una palabra para cada categoría que empiece con ${currentLetter}:
      - Nombre propio
      - País
      - Alimento
      - Objeto
      - Animal
      - Color
      - Profesión
      
      Responde en español y en formato JSON.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            nombre: { type: 'string' },
            pais: { type: 'string' },
            alimento: { type: 'string' },
            objeto: { type: 'string' },
            animal: { type: 'string' },
            color: { type: 'string' },
            profesion: { type: 'string' }
          }
        }
      });

      setAiAnswers(response);
    } catch (error) {
      console.error('Error generando respuestas AI:', error);
    } finally {
      setGeneratingAI(false);
      setGameState('results');
    }
  };

  const calculateScore = () => {
    let userScore = 0;
    let aiScore = 0;

    categories.forEach(cat => {
      const userAnswer = answers[cat.id]?.toLowerCase().trim();
      const aiAnswer = aiAnswers[cat.id]?.toLowerCase().trim();

      if (userAnswer && userAnswer.startsWith(currentLetter.toLowerCase())) {
        if (aiAnswer === userAnswer) {
          userScore += 5; // Misma respuesta
          aiScore += 5;
        } else {
          userScore += 10; // Respuesta diferente
        }
      }

      if (aiAnswer && aiAnswer.startsWith(currentLetter.toLowerCase()) && aiAnswer !== userAnswer) {
        aiScore += 10;
      }
    });

    return { userScore, aiScore };
  };

  const scores = gameState === 'results' ? calculateScore() : { userScore: 0, aiScore: 0 };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-warm-900 dark:text-warm-100 mb-2">Stop / Basta</h1>
          <p className="text-warm-600 dark:text-warm-400">Completa las categorías antes que Elán</p>
        </div>
        {gameState === 'playing' && (
          <Button variant="outline" onClick={() => setGameState('menu')}>
            Guardar y Salir
          </Button>
        )}
      </div>

      {gameState === 'menu' && (
        <Card className="shadow-2xl">
          <CardContent className="p-12 text-center">
            <Gamepad2 className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-4">
              ¡Juega Stop/Basta!
            </h2>
            <p className="text-warm-600 dark:text-warm-400 mb-8 max-w-md mx-auto">
              Se generará una letra random. Completa todas las categorías con palabras que empiecen con esa letra. Tienes 60 segundos.
            </p>
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8"
              onClick={startGame}
            >
              <Play className="w-5 h-5 mr-2" />
              Comenzar
            </Button>
          </CardContent>
        </Card>
      )}

      {gameState === 'playing' && (
        <Card className="shadow-2xl border-4 border-green-500">
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-5xl font-bold">{currentLetter}</span>
                </div>
                <CardTitle className="text-2xl">Letra: {currentLetter}</CardTitle>
              </div>
              <div className="flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full">
                <Timer className="w-6 h-6" />
                <span className="text-3xl font-bold">{timeLeft}s</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category.id} className="flex items-center gap-4">
                  <div className="w-32 font-semibold text-warm-900 dark:text-warm-100">
                    {category.label}
                  </div>
                  <Input
                    value={answers[category.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [category.id]: e.target.value })}
                    placeholder={category.placeholder}
                    className="text-lg"
                  />
                </div>
              ))}
            </div>

            <Button 
              onClick={handleStop} 
              className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white text-lg"
              size="lg"
            >
              ¡STOP!
            </Button>
          </CardContent>
        </Card>
      )}

      {gameState === 'results' && (
        <div className="space-y-6">
          <Card className="shadow-2xl">
            <CardContent className="p-12 text-center">
              <Trophy className="w-24 h-24 text-amber-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-4">
                {scores.userScore > scores.aiScore ? '¡Ganaste!' : scores.userScore === scores.aiScore ? '¡Empate!' : 'Elán ganó'}
              </h2>
              
              <div className="flex justify-center gap-12 mb-8">
                <div>
                  <p className="text-5xl font-bold text-blue-600">{scores.userScore}</p>
                  <p className="text-warm-600">Tu Puntuación</p>
                </div>
                <div className="border-l border-warm-300" />
                <div>
                  <p className="text-5xl font-bold text-purple-600">{scores.aiScore}</p>
                  <p className="text-warm-600">Elán Puntuación</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Comparación de Respuestas</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {categories.map(category => (
                  <div key={category.id} className="grid grid-cols-3 gap-4 items-center p-4 bg-warm-50 dark:bg-warm-800 rounded-lg">
                    <div className="font-semibold text-warm-900 dark:text-warm-100">
                      {category.label}
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-warm-600 mb-1">Tú</p>
                      <p className="font-medium text-warm-900 dark:text-warm-100">
                        {answers[category.id] || '-'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-warm-600 mb-1">Elán</p>
                      <p className="font-medium text-warm-900 dark:text-warm-100">
                        {aiAnswers[category.id] || '-'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={startGame} 
                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                Jugar de Nuevo
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}