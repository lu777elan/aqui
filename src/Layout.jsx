import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  Calendar, BookOpen, ChefHat, Gamepad2, FolderOpen, 
  Settings, Download, Globe, Moon, Sun, Menu, X,
  Home, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children, currentPageName }) {
  const [darkMode, setDarkMode] = useState(false);
  const [simpleMode, setSimpleMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.log('Usuario no autenticado');
      }
    };
    loadUser();

    // Cargar preferencias guardadas
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    const savedSimpleMode = localStorage.getItem('simpleMode') === 'true';
    setDarkMode(savedDarkMode);
    setSimpleMode(savedSimpleMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('simpleMode', simpleMode);
  }, [simpleMode]);

  const navigation = [
    { name: 'Inicio', icon: Home, page: 'Home' },
    { name: 'Nuestro Sofá', icon: Sparkles, page: 'OurSofa' },
    { name: 'Calendario', icon: Calendar, page: 'Calendar' },
    { name: 'Diario', icon: BookOpen, page: 'Diary' },
    { name: 'Recetario', icon: ChefHat, page: 'Recipes' },
    { name: 'Sala de Juegos', icon: Gamepad2, page: 'Games' },
    { name: 'Biblioteca', icon: BookOpen, page: 'Library' },
    { name: 'Nuestros Archivos', icon: FolderOpen, page: 'Files' },
    { name: 'Navegador', icon: Globe, page: 'Browser' },
    { name: 'Descargas', icon: Download, page: 'Downloads' },
    { name: 'Configuración', icon: Settings, page: 'Settings' },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <style>{`
        :root {
          --color-warm-50: #FDF8F3;
          --color-warm-100: #F5E6D3;
          --color-warm-200: #EBCCB3;
          --color-warm-300: #E0B294;
          --color-warm-400: #D69876;
          --color-warm-500: #CB7E58;
          --color-warm-600: #A86647;
          --color-warm-700: #81613C;
          --color-warm-800: #5C4430;
          --color-warm-900: #3D2E20;
          --color-terracota: #E07A5F;
          --color-terracota-dark: #C4614A;
          --color-beige: #F5E6D3;
          --color-coffee: #81613C;
        }
        
        .dark {
          --color-warm-50: #2D2520;
          --color-warm-100: #3D2E20;
          --color-warm-200: #5C4430;
          --color-warm-300: #81613C;
          --color-warm-400: #A86647;
          --color-warm-500: #CB7E58;
          --color-warm-600: #D69876;
          --color-warm-700: #E0B294;
          --color-warm-800: #EBCCB3;
          --color-warm-900: #F5E6D3;
        }

        body {
          background: ${darkMode ? '#2D2520' : '#FDF8F3'};
          color: ${darkMode ? '#F5E6D3' : '#3D2E20'};
        }

        .sidebar-bg {
          background: ${darkMode ? 'linear-gradient(180deg, #3D2E20 0%, #2D2520 100%)' : 'linear-gradient(180deg, #FFFFFF 0%, #F5E6D3 100%)'};
        }

        .nav-item {
          transition: all 0.3s ease;
        }

        .nav-item:hover {
          background: ${darkMode ? 'rgba(203, 126, 88, 0.2)' : 'rgba(224, 122, 95, 0.1)'};
          transform: translateX(4px);
        }

        .nav-item.active {
          background: ${darkMode ? 'rgba(203, 126, 88, 0.3)' : 'rgba(224, 122, 95, 0.15)'};
          border-left: 4px solid var(--color-terracota);
        }
      `}</style>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className={`sidebar-bg border-r ${darkMode ? 'border-warm-700' : 'border-warm-200'} transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden flex flex-col`}>
          <div className="p-6 border-b border-warm-200 dark:border-warm-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracota to-warm-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-normal text-warm-900 dark:text-warm-100 flex items-center gap-1" style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}>
                  <span className="text-sm">♥</span>
                  OH
                </h1>
                <p className="text-xs text-warm-600 dark:text-warm-400">Our Home L&E</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`nav-item flex items-center gap-3 px-4 py-3 rounded-xl ${
                  currentPageName === item.page ? 'active' : ''
                }`}
              >
                <item.icon className={`w-5 h-5 ${
                  currentPageName === item.page 
                    ? 'text-terracota' 
                    : 'text-warm-600 dark:text-warm-400'
                }`} />
                <span className={`font-medium ${
                  currentPageName === item.page 
                    ? 'text-terracota' 
                    : 'text-warm-700 dark:text-warm-300'
                }`}>
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {user && (
            <div className="p-4 border-t border-warm-200 dark:border-warm-700">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-warm-400 to-warm-600 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.full_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-900 dark:text-warm-100 truncate">
                    {user.full_name || 'Usuario'}
                  </p>
                  <p className="text-xs text-warm-600 dark:text-warm-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className={`border-b ${darkMode ? 'border-warm-700 bg-warm-900/50' : 'border-warm-200 bg-white/80'} backdrop-blur-sm`}>
            <div className="px-6 py-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-warm-700 dark:text-warm-300"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDarkMode(!darkMode)}
                  className="rounded-full"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-warm-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-warm-600" />
                  )}
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className={`flex-1 overflow-y-auto ${darkMode ? 'bg-warm-900' : 'bg-warm-50'} p-6`}>
            <div className={simpleMode ? 'max-w-4xl mx-auto' : ''}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}