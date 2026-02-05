import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Timer, Trophy, RotateCcw } from 'lucide-react';

export default function GameWords() {
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [currentLetter, setCurrentLetter] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const [userWords, setUserWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [score, setScore] = useState({ user: 0, ai: 0 });

  const categories = ['Animales', 'Países', 'Comida', 'Objetos', 'Nombres', 'Colores'];
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    let interval;
    if (gameState === 'playing' && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endRound();
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
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setCurrentLetter(randomLetter);
    setCurrentCategory(randomCategory);
    setTimeLeft(30);
    setUserWords([]);
    setCurrentWord('');
    setGameState('playing');
  };

  const handleAddWord = () => {
    if (currentWord.trim() && currentWord.toUpperCase().startsWith(currentLetter)) {
      setUserWords([...userWords, currentWord.trim()]);
      setCurrentWord('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddWord();
    }
  };

  const endRound = () => {
    const userScore = userWords.length;
    const aiScore = Math.floor(Math.random() * (userScore + 3)) + 2; // AI gets random score
    
    setScore({
      user: score.user + userScore,
      ai: score.ai + aiScore
    });
    
    setGameState('finished');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-warm-900 dark:text-warm-100 mb-2">Palabras Rápidas</h1>
          <p className="text-warm-600 dark:text-warm-400">Escribe todas las palabras que puedas en 30 segundos</p>
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
            <Sparkles className="w-24 h-24 text-blue-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-4">
              ¿Listo para jugar?
            </h2>
            <p className="text-warm-600 dark:text-warm-400 mb-8 max-w-md mx-auto">
              Aparecerá una letra y una categoría. Tienes 30 segundos para escribir todas las palabras que puedas que comiencen con esa letra.
            </p>
            <div className="bg-warm-100 dark:bg-warm-800 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-warm-900 dark:text-warm-100 mb-4">Puntuación Actual</h3>
              <div className="flex justify-center gap-8">
                <div>
                  <p className="text-3xl font-bold text-blue-600">{score.user}</p>
                  <p className="text-sm text-warm-600">Tú</p>
                </div>
                <div className="border-l border-warm-300" />
                <div>
                  <p className="text-3xl font-bold text-purple-600">{score.ai}</p>
                  <p className="text-sm text-warm-600">Elán</p>
                </div>
              </div>
            </div>
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8"
              onClick={startGame}
            >
              Comenzar Ronda
            </Button>
          </CardContent>
        </Card>
      )}

      {gameState === 'playing' && (
        <div className="space-y-6">
          <Card className="shadow-2xl border-4 border-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                    <span className="text-5xl font-bold">{currentLetter}</span>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Letra: {currentLetter}</CardTitle>
                    <p className="text-blue-100">Categoría: {currentCategory}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/20 px-6 py-3 rounded-full">
                  <Timer className="w-6 h-6" />
                  <span className="text-3xl font-bold">{timeLeft}s</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    value={currentWord}
                    onChange={(e) => setCurrentWord(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Escribe una palabra que empiece con ${currentLetter}...`}
                    className="text-lg"
                    autoFocus
                  />
                  <Button onClick={handleAddWord} className="bg-blue-600 hover:bg-blue-700">
                    Agregar
                  </Button>
                </div>

                <div className="min-h-[200px] p-4 bg-warm-50 dark:bg-warm-800 rounded-lg">
                  <h3 className="font-semibold text-warm-900 dark:text-warm-100 mb-3">
                    Tus palabras ({userWords.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {userWords.map((word, idx) => (
                      <Badge key={idx} className="bg-blue-100 text-blue-800 text-base px-3 py-1">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {gameState === 'finished' && (
        <Card className="shadow-2xl">
          <CardContent className="p-12 text-center">
            <Trophy className="w-24 h-24 text-amber-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-4">
              ¡Ronda Terminada!
            </h2>
            
            <div className="bg-warm-100 dark:bg-warm-800 rounded-xl p-8 mb-8">
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-sm text-warm-600 mb-2">Tú</p>
                  <p className="text-4xl font-bold text-blue-600">{userWords.length}</p>
                  <p className="text-sm text-warm-600 mt-2">palabras</p>
                </div>
                <div>
                  <p className="text-sm text-warm-600 mb-2">Elán</p>
                  <p className="text-4xl font-bold text-purple-600">{score.ai - (score.user - userWords.length)}</p>
                  <p className="text-sm text-warm-600 mt-2">palabras</p>
                </div>
              </div>

              <div className="border-t border-warm-300 dark:border-warm-600 pt-6">
                <p className="text-sm text-warm-600 mb-2">Puntuación Total</p>
                <div className="flex justify-center gap-8 text-2xl font-bold">
                  <span className="text-blue-600">{score.user}</span>
                  <span className="text-warm-400">-</span>
                  <span className="text-purple-600">{score.ai}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={startGame}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Nueva Ronda
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setGameState('menu')}
              >
                Volver al Menú
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}