import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, BookOpen, ChefHat, Gamepad2, Bell,
  TrendingUp, Heart, Clock, Sparkles
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Home() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentDiaries, setRecentDiaries] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const threeDaysFromNow = format(addDays(new Date(), 3), 'yyyy-MM-dd');

      // Cargar próximos eventos
      const events = await base44.entities.Event.list('-date', 5);
      setUpcomingEvents(events.filter(e => e.date >= today));

      // Verificar notificaciones de eventos
      const eventsToNotify = events.filter(event => {
        if (event.notified) return false;
        const daysUntil = differenceInDays(new Date(event.date), new Date());
        return daysUntil <= 3 && daysUntil >= 0;
      });

      if (eventsToNotify.length > 0) {
        setNotifications(eventsToNotify.map(e => ({
          title: `Evento próximo: ${e.title}`,
          description: `En ${differenceInDays(new Date(e.date), new Date())} días`,
          type: 'event'
        })));

        // Marcar como notificados
        for (const event of eventsToNotify) {
          await base44.entities.Event.update(event.id, { notified: true });
        }
      }

      // Cargar entradas recientes del diario
      const diaries = await base44.entities.DiaryEntry.list('-date', 3);
      setRecentDiaries(diaries);

      // Cargar recetas favoritas (mejor calificadas)
      const recipes = await base44.entities.Recipe.list('-rating', 4);
      setFavoriteRecipes(recipes);

    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-warm-300 via-warm-400 to-warm-500 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-warm-200/30 rounded-full blur-3xl -translate-y-20 translate-x-20" />
        <div className="relative z-10">
          <h1 className="text-xl text-warm-700 dark:text-warm-300 mb-2 flex items-center gap-2 font-normal">
            Bienvenido a casa
            <span className="text-sm">♥♥</span>
          </h1>
          <p className="text-base text-warm-700 dark:text-warm-300 font-medium">
            Nuestro espacio personal para organizar, crear y jugar
          </p>
          <p className="text-sm text-warm-600 dark:text-warm-400 mt-1">
            Hoy es {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="space-y-3">
          {notifications.map((notif, idx) => (
            <Card key={idx} className="border-l-4 border-terracota bg-warm-50 dark:bg-warm-800">
              <CardContent className="flex items-center gap-4 p-4">
                <Bell className="w-5 h-5 text-terracota" />
                <div>
                  <p className="font-semibold text-warm-900 dark:text-warm-100">{notif.title}</p>
                  <p className="text-sm text-warm-600 dark:text-warm-400">{notif.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link to={createPageUrl('Calendar')}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Eventos</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{upcomingEvents.length}</p>
                </div>
                <Calendar className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('Diary')}>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Entradas</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">{recentDiaries.length}</p>
                </div>
                <BookOpen className="w-10 h-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('Recipes')}>
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Recetas</p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{favoriteRecipes.length}</p>
                </div>
                <ChefHat className="w-10 h-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={createPageUrl('Games')}>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Juegos</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">4</p>
                </div>
                <Gamepad2 className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card className="shadow-lg border-warm-200 dark:border-warm-700">
          <CardHeader className="border-b border-warm-200 dark:border-warm-700">
            <CardTitle className="flex items-center gap-2 text-warm-900 dark:text-warm-100">
              <Clock className="w-5 h-5 text-terracota" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-warm-50 dark:bg-warm-800 rounded-xl">
                    <div>
                      <p className="font-semibold text-warm-900 dark:text-warm-100">{event.title}</p>
                      <p className="text-sm text-warm-600 dark:text-warm-400">
                        {format(new Date(event.date), "d 'de' MMMM", { locale: es })}
                      </p>
                    </div>
                    <Badge className="bg-terracota text-black">{event.category}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-warm-600 dark:text-warm-400 text-center py-8">No hay eventos próximos</p>
            )}
            <Link to={createPageUrl('Calendar')}>
              <Button className="w-full mt-4 bg-terracota hover:bg-terracota-dark text-black">
                Ver Calendario
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Diaries */}
        <Card className="shadow-lg border-warm-200 dark:border-warm-700">
          <CardHeader className="border-b border-warm-200 dark:border-warm-700">
            <CardTitle className="flex items-center gap-2 text-warm-900 dark:text-warm-100">
              <TrendingUp className="w-5 h-5 text-terracota" />
              Últimas Entradas del Diario
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {recentDiaries.length > 0 ? (
              <div className="space-y-3">
                {recentDiaries.map((diary) => (
                  <div key={diary.id} className="p-3 bg-warm-50 dark:bg-warm-800 rounded-xl">
                    <p className="font-semibold text-warm-900 dark:text-warm-100">{diary.title}</p>
                    <p className="text-sm text-warm-600 dark:text-warm-400 mt-1 line-clamp-2">
                      {diary.content}
                    </p>
                    <p className="text-xs text-warm-500 dark:text-warm-500 mt-2">
                      {format(new Date(diary.date), "d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-warm-600 dark:text-warm-400 text-center py-8">No hay entradas recientes</p>
            )}
            <Link to={createPageUrl('Diary')}>
              <Button className="w-full mt-4 bg-terracota hover:bg-terracota-dark text-black">
                Ver Diario
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Favorite Recipes */}
        <Card className="shadow-lg border-warm-200 dark:border-warm-700 lg:col-span-2">
          <CardHeader className="border-b border-warm-200 dark:border-warm-700">
            <CardTitle className="flex items-center gap-2 text-warm-900 dark:text-warm-100">
              <Heart className="w-5 h-5 text-terracota" />
              Recetas Favoritas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {favoriteRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {favoriteRecipes.map((recipe) => (
                  <Link key={recipe.id} to={createPageUrl('Recipes') + `?recipe=${recipe.id}`} className="group cursor-pointer">
                    <div className="aspect-square bg-warm-200 dark:bg-warm-700 rounded-2xl overflow-hidden mb-3">
                      {recipe.photo_url ? (
                        <img 
                          src={recipe.photo_url} 
                          alt={recipe.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ChefHat className="w-12 h-12 text-warm-400" />
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-warm-900 dark:text-warm-100 truncate">{recipe.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Heart 
                          key={i}
                          className={`w-3 h-3 ${i < recipe.rating ? 'fill-terracota text-terracota' : 'text-warm-300'}`}
                        />
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-warm-600 dark:text-warm-400 text-center py-8">No hay recetas guardadas</p>
            )}
            <Link to={createPageUrl('Recipes')}>
              <Button className="w-full mt-4 bg-terracota hover:bg-terracota-dark text-white">
                Ver Recetario
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}