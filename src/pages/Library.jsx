import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Star, Trash2, Upload, MessageSquare } from 'lucide-react';
import ChatInterface from '../components/chat/ChatInterface';

export default function Library() {
  const [books, setBooks] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    rating: 0,
    status: 'por_leer',
    month: '',
    year: new Date().getFullYear(),
    notes: '',
    cover_url: ''
  });

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const allBooks = await base44.entities.Book.list('-year', 100);
      setBooks(allBooks);
    } catch (error) {
      console.error('Error cargando libros:', error);
    }
  };

  const handleSaveBook = async () => {
    try {
      await base44.entities.Book.create(formData);
      loadBooks();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error guardando libro:', error);
    }
  };

  const handleUploadCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, cover_url: file_url });
    } catch (error) {
      console.error('Error subiendo portada:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRateBook = async (bookId, rating) => {
    try {
      await base44.entities.Book.update(bookId, { rating });
      loadBooks();
    } catch (error) {
      console.error('Error calificando libro:', error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await base44.entities.Book.delete(bookId);
      loadBooks();
    } catch (error) {
      console.error('Error eliminando libro:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      rating: 0,
      status: 'por_leer',
      month: '',
      year: new Date().getFullYear(),
      notes: '',
      cover_url: ''
    });
  };

  const statusColors = {
    por_leer: 'bg-blue-100 text-blue-800',
    leyendo: 'bg-green-100 text-green-800',
    leido: 'bg-purple-100 text-purple-800'
  };

  const statusLabels = {
    por_leer: 'Por Leer',
    leyendo: 'Leyendo',
    leido: 'Leído'
  };

  if (showChat) {
    return (
      <div className="space-y-6 h-full">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-normal text-purple-600 dark:text-purple-400 mb-2">Nuestra Biblioteca</h1>
            <p className="text-warm-600 dark:text-warm-400">Conversemos sobre libros</p>
          </div>
          <Button onClick={() => setShowChat(false)} variant="outline">
            Volver a la Biblioteca
          </Button>
        </div>
        <div className="h-[calc(100vh-250px)]">
          <ChatInterface context="biblioteca" title="Chat de Biblioteca" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-normal text-purple-600 dark:text-purple-400 mb-2">Nuestra Biblioteca</h1>
          <p className="text-warm-600 dark:text-warm-400">Nuestros libros ♡</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowChat(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-terracota hover:bg-terracota-dark text-black" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar Libro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Agregar Libro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título del libro"
                  />
                </div>
                <div>
                  <Label>Autor</Label>
                  <Input
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Nombre del autor"
                  />
                </div>
                <div>
                  <Label>Portada (opcional)</Label>
                  {formData.cover_url ? (
                    <div className="relative">
                      <img src={formData.cover_url} alt="Portada" className="w-full h-40 object-cover rounded-lg" />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData({ ...formData, cover_url: '' })}
                      >
                        Cambiar
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-warm-300 rounded-lg cursor-pointer hover:border-terracota transition-colors">
                      <div className="text-center">
                        <Upload className="w-6 h-6 text-warm-400 mx-auto mb-1" />
                        <span className="text-xs text-warm-600">{uploading ? 'Subiendo...' : 'Subir portada'}</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleUploadCover} disabled={uploading} />
                    </label>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Mes</Label>
                    <Select value={formData.month} onValueChange={(value) => setFormData({ ...formData, month: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona mes" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Año</Label>
                    <Input
                      type="number"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Estado</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="por_leer">📚 Por Leer</SelectItem>
                      <SelectItem value="leyendo">📖 Leyendo</SelectItem>
                      <SelectItem value="leido">✅ Leído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveBook} className="w-full bg-terracota hover:bg-terracota-dark text-white">
                  Guardar Libro
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {books.map(book => (
          <Card key={book.id} className="shadow-lg hover:shadow-xl transition-all">
            <div className="aspect-[2/3] bg-warm-200 dark:bg-warm-700 rounded-t-lg overflow-hidden">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-warm-400" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold text-lg text-warm-900 dark:text-warm-100 mb-1 line-clamp-2">{book.title}</h3>
              {book.author && (
                <p className="text-sm text-warm-600 dark:text-warm-400 mb-2">{book.author}</p>
              )}
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => handleRateBook(book.id, rating)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        rating <= book.rating ? 'fill-amber-400 text-amber-400' : 'text-warm-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[book.status]}`}>
                  {statusLabels[book.status]}
                </span>
                {book.month && (
                  <span className="text-xs text-warm-500">{book.month}</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteBook(book.id)}
                className="w-full mt-2 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Eliminar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-warm-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-warm-900 dark:text-warm-100 mb-2">
              No hay libros todavía
            </h3>
            <p className="text-warm-600 dark:text-warm-400">
              Leyendo y debatiendo juntos
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}