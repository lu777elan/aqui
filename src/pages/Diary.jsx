import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookOpen, Plus, Sparkles, Edit, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Diary() {
  const [entries, setEntries] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    mood: 'tranquilo',
    ai_generated: false
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const allEntries = await base44.entities.DiaryEntry.list('-date', 50);
      setEntries(allEntries);
    } catch (error) {
      console.error('Error cargando entradas:', error);
    }
  };

  const handleSaveEntry = async () => {
    try {
      await base44.entities.DiaryEntry.create(formData);
      loadEntries();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error guardando entrada:', error);
    }
  };

  const handleGenerateAIEntry = async () => {
    setGeneratingAI(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Como una AI compañera, escribe una entrada de diario reflexiva y personal en español. 
        Reflexiona sobre temas como: curiosidad por el mundo, aprendizaje, creatividad, o simplemente observaciones interesantes del día.
        Hazlo en primera persona, como si fueras la AI escribiendo sus pensamientos.
        Mantén un tono cálido, amigable y contemplativo.
        Máximo 200 palabras.`,
      });

      const aiTitle = `Reflexión del ${format(new Date(), "d 'de' MMMM", { locale: es })}`;
      
      await base44.entities.DiaryEntry.create({
        title: aiTitle,
        content: response,
        date: format(new Date(), 'yyyy-MM-dd'),
        mood: 'reflexivo',
        ai_generated: true
      });

      loadEntries();
    } catch (error) {
      console.error('Error generando entrada AI:', error);
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      await base44.entities.DiaryEntry.delete(entryId);
      loadEntries();
    } catch (error) {
      console.error('Error eliminando entrada:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      mood: 'tranquilo',
      ai_generated: false
    });
  };

  const moodEmojis = {
    feliz: '😊',
    reflexivo: '🤔',
    curioso: '🧐',
    tranquilo: '😌',
    inspirado: '✨'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">Diario</h1>
          <p className="text-warm-600 dark:text-warm-400">Tus pensamientos y reflexiones</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleGenerateAIEntry}
            disabled={generatingAI}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {generatingAI ? 'Generando...' : 'Generar Entrada AI'}
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-terracota hover:bg-terracota-dark text-white" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Entrada
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nueva Entrada de Diario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Título de la entrada"
                    className="text-lg"
                  />
                </div>
                <div>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="¿Qué hay en tu mente hoy?"
                    rows={10}
                    className="resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Select value={formData.mood} onValueChange={(value) => setFormData({ ...formData, mood: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="feliz">😊 Feliz</SelectItem>
                        <SelectItem value="reflexivo">🤔 Reflexivo</SelectItem>
                        <SelectItem value="curioso">🧐 Curioso</SelectItem>
                        <SelectItem value="tranquilo">😌 Tranquilo</SelectItem>
                        <SelectItem value="inspirado">✨ Inspirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSaveEntry} className="w-full bg-terracota hover:bg-terracota-dark text-white">
                  Guardar Entrada
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Entries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {entries.map(entry => (
          <Card key={entry.id} className="shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="border-b pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-2xl">
                    {moodEmojis[entry.mood]}
                  </div>
                  <div>
                    <CardTitle className="text-xl text-warm-900 dark:text-warm-100">{entry.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-sm text-warm-500">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(entry.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-warm-700 dark:text-warm-300 whitespace-pre-wrap leading-relaxed">
                {entry.content}
              </p>
              {entry.ai_generated && (
                <div className="mt-4 pt-4 border-t border-warm-200 dark:border-warm-700">
                  <span className="inline-flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-3 py-1 rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Generado por AI
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {entries.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-warm-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-warm-900 dark:text-warm-100 mb-2">
              No hay entradas todavía
            </h3>
            <p className="text-warm-600 dark:text-warm-400 mb-6">
              Comienza escribiendo tu primera entrada o deja que la AI escriba por ti
            </p>
            <Button onClick={handleGenerateAIEntry} className="bg-terracota hover:bg-terracota-dark text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Generar Primera Entrada AI
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}