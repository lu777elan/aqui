import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Moon, Sun, Minimize, User, Link as LinkIcon } from 'lucide-react';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadSettings();
    loadUser();
  }, []);

  const loadSettings = () => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedSimpleMode = localStorage.getItem('simpleMode') === 'true';
    setDarkMode(savedDarkMode);
    setSimpleMode(savedSimpleMode);
  };

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.log('Usuario no autenticado');
    }
  };

  const handleDarkModeToggle = (value) => {
    setDarkMode(value);
    localStorage.setItem('darkMode', value);
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSimpleModeToggle = (value) => {
    setSimpleMode(value);
    localStorage.setItem('simpleMode', value);
    window.location.reload(); // Reload to apply simple mode
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-4xl font-bold text-warm-900 dark:text-warm-100 mb-2">Configuración</h1>
        <p className="text-warm-600 dark:text-warm-400">Personaliza tu experiencia</p>
      </div>

      {/* User Info */}
      {user && (
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-terracota" />
              Información de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-terracota to-warm-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.full_name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-warm-900 dark:text-warm-100">{user.full_name}</h3>
                <p className="text-warm-600 dark:text-warm-400">{user.email}</p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-terracota" />
            Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-warm-600 dark:text-warm-400" />
              ) : (
                <Sun className="w-5 h-5 text-warm-600" />
              )}
              <div>
                <Label htmlFor="dark-mode" className="text-base font-medium text-warm-900 dark:text-warm-100">
                  Modo Oscuro
                </Label>
                <p className="text-sm text-warm-600 dark:text-warm-400">
                  Activa el tema oscuro para reducir la fatiga visual
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={handleDarkModeToggle}
            />
          </div>

          <div className="border-t border-warm-200 dark:border-warm-700 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Minimize className="w-5 h-5 text-warm-600 dark:text-warm-400" />
                <div>
                  <Label htmlFor="simple-mode" className="text-base font-medium text-warm-900 dark:text-warm-100">
                    Modo Simple
                  </Label>
                  <p className="text-sm text-warm-600 dark:text-warm-400">
                    Diseño minimalista centrado y sin distracciones
                  </p>
                </div>
              </div>
              <Switch
                id="simple-mode"
                checked={simpleMode}
                onCheckedChange={handleSimpleModeToggle}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-terracota" />
            Integraciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="p-4 bg-warm-50 dark:bg-warm-800 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-xl">🎵</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-warm-900 dark:text-warm-100">Spotify</h4>
                  <p className="text-xs text-warm-600 dark:text-warm-400">Conecta tu cuenta de Spotify</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Próximamente
                </Button>
              </div>
            </div>

            <div className="p-4 bg-warm-50 dark:bg-warm-800 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-warm-900 dark:text-warm-100">Telegram</h4>
                  <p className="text-xs text-warm-600 dark:text-warm-400">Sincroniza con Telegram</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Próximamente
                </Button>
              </div>
            </div>

            <div className="p-4 bg-warm-50 dark:bg-warm-800 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-xl">📱</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-warm-900 dark:text-warm-100">WhatsApp</h4>
                  <p className="text-xs text-warm-600 dark:text-warm-400">Conecta con WhatsApp</p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Próximamente
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="shadow-lg bg-gradient-to-br from-terracota/10 to-warm-100 dark:from-warm-800 dark:to-warm-900">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold text-warm-900 dark:text-warm-100 mb-2">
            AI Companion
          </h3>
          <p className="text-warm-600 dark:text-warm-400">
            Tu asistente personal inteligente para organizar, crear y jugar
          </p>
          <p className="text-sm text-warm-500 mt-4">
            Versión 1.0.0
          </p>
        </CardContent>
      </Card>
    </div>
  );
}