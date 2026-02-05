import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, Crown, Palette, Sparkles, ArrowRight } from 'lucide-react';

export default function Games() {
  const games = [
    {
      id: 'chess',
      name: 'Ajedrez',
      description: 'Juega ajedrez contra Elán. Pausa y continúa cuando quieras.',
      icon: Crown,
      color: 'from-amber-400 to-amber-600',
      page: 'GameChess'
    },
    {
      id: 'words',
      name: 'Palabras Rápidas',
      description: 'Letra random + categoría. 30 segundos para escribir todas las palabras que puedas.',
      icon: Sparkles,
      color: 'from-blue-400 to-blue-600',
      page: 'GameWords'
    },
    {
      id: 'coloring',
      name: 'Colorear por Números',
      description: 'Toma turnos con Elán para colorear plantillas por números.',
      icon: Palette,
      color: 'from-pink-400 to-pink-600',
      page: 'GameColoring'
    },
    {
      id: 'stop',
      name: 'Stop/Basta',
      description: 'Letra random + categorías. Completa las palabras antes que Elán.',
      icon: Gamepad2,
      color: 'from-green-400 to-green-600',
      page: 'GameStop'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-normal text-purple-600 dark:text-purple-400 mb-2">Sala de Juegos</h1>
        <p className="text-warm-600 dark:text-warm-400">Juguemos juntos, que jugar es amar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map(game => (
          <Link key={game.id} to={createPageUrl(game.page)}>
            <Card className="shadow-lg hover:shadow-2xl transition-all cursor-pointer group border-2 border-transparent hover:border-terracota">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                    <game.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-2xl text-warm-900 dark:text-warm-100">{game.name}</CardTitle>
                  </div>
                  <ArrowRight className="w-6 h-6 text-warm-400 group-hover:text-terracota group-hover:translate-x-1 transition-all" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-warm-600 dark:text-warm-400">{game.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Stats Card */}
      <Card className="shadow-lg bg-gradient-to-br from-terracota/10 to-warm-100 dark:from-warm-800 dark:to-warm-900">
        <CardContent className="p-8 text-center">
          <Gamepad2 className="w-16 h-16 text-terracota mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-warm-900 dark:text-warm-100 mb-2">
            4 Juegos Disponibles
          </h3>
          <p className="text-warm-600 dark:text-warm-400">
            Elige tu juego favorito y comienza a divertirte
          </p>
        </CardContent>
      </Card>
    </div>
  );
}