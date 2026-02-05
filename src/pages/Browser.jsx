import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Globe, Search, ArrowLeft, RotateCcw, ExternalLink } from 'lucide-react';

export default function Browser() {
  const [url, setUrl] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleNavigate = () => {
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      setCurrentUrl(formattedUrl);
    }
  };

  const handleSearch = () => {
    if (searchQuery) {
      setCurrentUrl(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&igu=1`);
      setSearchQuery('');
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-warm-900 dark:text-warm-100 mb-2">Navegador Web</h1>
        <p className="text-warm-600 dark:text-warm-400">Explora la web desde la aplicación</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              disabled={!currentUrl}
              onClick={() => setCurrentUrl('')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              disabled={!currentUrl}
              onClick={() => setCurrentUrl(currentUrl)}
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            <div className="flex-1 flex gap-2">
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleNavigate)}
                placeholder="Ingresa una URL (ej: google.com)"
                className="flex-1"
              />
              <Button onClick={handleNavigate} className="bg-terracota hover:bg-terracota-dark text-white">
                <Globe className="w-4 h-4 mr-2" />
                Ir
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {currentUrl ? (
            <iframe
              src={currentUrl}
              className="w-full"
              style={{ height: 'calc(100vh - 300px)', minHeight: '500px' }}
              title="Browser"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          ) : (
            <div className="p-12 text-center">
              <Globe className="w-24 h-24 text-warm-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-warm-900 dark:text-warm-100 mb-4">
                Comienza a navegar
              </h2>
              <p className="text-warm-600 dark:text-warm-400 mb-8 max-w-md mx-auto">
                Ingresa una URL en la barra superior o busca algo en Google
              </p>

              {/* Quick Search */}
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-3">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, handleSearch)}
                    placeholder="Buscar en Google..."
                    className="text-lg"
                  />
                  <Button onClick={handleSearch} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Search className="w-5 h-5 mr-2" />
                    Buscar
                  </Button>
                </div>

                {/* Quick Links */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Google', url: 'https://google.com' },
                    { name: 'YouTube', url: 'https://youtube.com' },
                    { name: 'Wikipedia', url: 'https://wikipedia.org' },
                    { name: 'GitHub', url: 'https://github.com' }
                  ].map(site => (
                    <button
                      key={site.name}
                      onClick={() => {
                        setUrl(site.url);
                        setCurrentUrl(site.url);
                      }}
                      className="p-4 bg-warm-100 dark:bg-warm-800 rounded-xl hover:shadow-lg transition-all"
                    >
                      <ExternalLink className="w-6 h-6 text-terracota mx-auto mb-2" />
                      <p className="font-medium text-warm-900 dark:text-warm-100">{site.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="bg-warm-100 dark:bg-warm-800 rounded-lg p-4 text-sm text-warm-600 dark:text-warm-400">
        <p>💡 <strong>Nota:</strong> Algunos sitios web pueden no cargarse correctamente debido a restricciones de seguridad (CORS). 
        Para la mejor experiencia, usa el navegador para búsquedas y sitios web compatibles.</p>
      </div>
    </div>
  );
}