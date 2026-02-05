import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Play, User, Sparkles } from 'lucide-react';

export default function GameColoring() {
  const [gameState, setGameState] = useState('menu');
  const [currentPlayer, setCurrentPlayer] = useState('user');
  const [coloredAreas, setColoredAreas] = useState({});
  const [selectedNumber, setSelectedNumber] = useState(null);

  // Plantilla simplificada de colorear
  const template = {
    areas: [
      { id: 1, number: 1, x: 100, y: 100, label: 'Área 1' },
      { id: 2, number: 2, x: 200, y: 100, label: 'Área 2' },
      { id: 3, number: 3, x: 150, y: 200, label: 'Área 3' },
      { id: 4, number: 1, x: 250, y: 200, label: 'Área 4' },
      { id: 5, number: 2, x: 100, y: 300, label: 'Área 5' },
      { id: 6, number: 3, x: 200, y: 300, label: 'Área 6' },
    ]
  };

  const colorPalette = {
    1: '#FF6B6B',
    2: '#4ECDC4',
    3: '#FFE66D',
    4: '#A8E6CF',
    5: '#FFB6C1'
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentPlayer('user');
    setColoredAreas({});
  };

  const handleColorArea = (areaId, number) => {
    if (currentPlayer !== 'user' || coloredAreas[areaId]) return;

    setColoredAreas({ ...coloredAreas, [areaId]: colorPalette[number] });
    setCurrentPlayer('ai');
    
    // AI turn
    setTimeout(() => {
      const uncoloredAreas = template.areas.filter(a => !coloredAreas[a.id] && a.id !== areaId);
      if (uncoloredAreas.length > 0) {
        const randomArea = uncoloredAreas[Math.floor(Math.random() * uncoloredAreas.length)];
        setColoredAreas(prev => ({ ...prev, [randomArea.id]: colorPalette[randomArea.number] }));
      }
      setCurrentPlayer('user');
    }, 1500);
  };

  const isComplete = Object.keys(coloredAreas).length === template.areas.length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-warm-900 dark:text-warm-100 mb-2">Colorear por Números</h1>
          <p className="text-warm-600 dark:text-warm-400">Toma turnos con la AI para colorear</p>
        </div>
      </div>

      {gameState === 'menu' && (
        <Card className="shadow-2xl">
          <CardContent className="p-12 text-center">
            <Palette className="w-24 h-24 text-pink-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-warm-900 dark:text-warm-100 mb-4">
              Colorea con la AI
            </h2>
            <p className="text-warm-600 dark:text-warm-400 mb-8 max-w-md mx-auto">
              Selecciona un número y colorea un área. Luego será el turno de la AI.
            </p>
            <Button 
              size="lg" 
              className="bg-pink-600 hover:bg-pink-700 text-white text-lg px-8"
              onClick={startGame}
            >
              <Play className="w-5 h-5 mr-2" />
              Comenzar
            </Button>
          </CardContent>
        </Card>
      )}

      {gameState === 'playing' && (
        <div className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Turno actual</CardTitle>
                <div className={`px-4 py-2 rounded-full font-medium flex items-center gap-2 ${
                  currentPlayer === 'user' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {currentPlayer === 'user' ? (
                    <>
                      <User className="w-4 h-4" />
                      Tu turno
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Turno de AI
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {/* Color Palette */}
              <div className="mb-6">
                <h3 className="font-semibold text-warm-900 dark:text-warm-100 mb-3">Selecciona un número</h3>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => setSelectedNumber(num)}
                      className={`w-16 h-16 rounded-xl font-bold text-white text-2xl transition-all ${
                        selectedNumber === num ? 'ring-4 ring-terracota scale-110' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: colorPalette[num] }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Drawing Area */}
              <div className="bg-white dark:bg-warm-800 rounded-xl p-8 border-4 border-warm-200 dark:border-warm-700">
                <div className="relative" style={{ height: '400px' }}>
                  {template.areas.map(area => (
                    <div
                      key={area.id}
                      onClick={() => selectedNumber && handleColorArea(area.id, selectedNumber)}
                      className={`absolute w-24 h-24 rounded-lg border-4 border-warm-800 flex items-center justify-center text-2xl font-bold cursor-pointer transition-all ${
                        coloredAreas[area.id] ? '' : 'hover:scale-105'
                      }`}
                      style={{
                        left: area.x,
                        top: area.y,
                        backgroundColor: coloredAreas[area.id] || '#F5E6D3',
                        color: coloredAreas[area.id] ? 'white' : '#81613C'
                      }}
                    >
                      {!coloredAreas[area.id] && area.number}
                    </div>
                  ))}
                </div>
              </div>

              {isComplete && (
                <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                  <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                    ¡Dibujo Completado!
                  </h3>
                  <Button onClick={startGame} className="mt-4 bg-pink-600 hover:bg-pink-700 text-white">
                    Nueva Plantilla
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}