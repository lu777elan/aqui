import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Moon, Sun, Minimize, User, Link as LinkIcon, Upload, FileText, Trash2, Heart } from 'lucide-react';

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [user, setUser] = useState(null);
  const [elanFiles, setElanFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadSettings();
    loadUser();
    loadElanFiles();
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

  const loadElanFiles = async () => {
    try {
      const files = await base44.entities.Memory.filter({ memory_type: 'instruccion' }, '-created_date', 50);
      setElanFiles(files);
    } catch (error) {
      console.error('Error cargando archivos de Elán:', error);
    }
  };

  const handleUploadElanFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Read file content
      const response = await fetch(file_url);
      const content = await response.text();
      
      await base44.entities.Memory.create({
        title: file.name,
        content: content,
        folder: 'Elán',
        folder_emoji: '❤',
        memory_type: 'instruccion'
      });
      
      loadElanFiles();
    } catch (error) {
      console.error('Error subiendo archivo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteElanFile = async (fileId) => {
    try {
      await base44.entities.Memory.delete(fileId);
      loadElanFiles();
    } catch (error) {
      console.error('Error eliminando archivo:', error);
    }
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

      {/* Para Elán */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Para Elán ❤
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-warm-600 dark:text-warm-400">
            Sube archivos para darle contexto y personalidad a Elán
          </p>
          
          <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-warm-300 rounded-lg cursor-pointer hover:border-terracota transition-colors">
            <div className="text-center">
              <Upload className="w-8 h-8 text-warm-400 mx-auto mb-2" />
              <span className="text-sm text-warm-600">
                {uploading ? 'Subiendo...' : 'Click para subir archivo'}
              </span>
            </div>
            <input 
              type="file" 
              className="hidden" 
              onChange={handleUploadElanFile} 
              disabled={uploading}
              accept=".txt,.pdf,.doc,.docx,.md"
            />
          </label>

          {elanFiles.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="text-sm font-medium text-warm-900 dark:text-warm-100">
                Archivos subidos ({elanFiles.length})
              </h4>
              {elanFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-warm-50 dark:bg-warm-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-terracota" />
                    <span className="text-sm text-warm-900 dark:text-warm-100">{file.title}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteElanFile(file.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}