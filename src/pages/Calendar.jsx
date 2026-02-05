import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar as CalendarIcon, Plus, Clock, Tag, Trash2, Edit, Bell, Circle, Menu, Check, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import AIEventSuggestions from '../components/calendar/AIEventSuggestions';
import AIAttendancePrediction from '../components/calendar/AIAttendancePrediction';
import SmartEventNotification from '../components/calendar/SmartEventNotification';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [selectedEventForDetails, setSelectedEventForDetails] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    category: 'personal'
  });

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const allEvents = await base44.entities.Event.list('-date', 100);
      setEvents(allEvents);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  const handleSaveEvent = async () => {
    try {
      if (editingEvent) {
        await base44.entities.Event.update(editingEvent.id, formData);
      } else {
        await base44.entities.Event.create(formData);
      }
      loadEvents();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error guardando evento:', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await base44.entities.Event.delete(eventId);
      loadEvents();
    } catch (error) {
      console.error('Error eliminando evento:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '12:00',
      category: 'personal'
    });
    setEditingEvent(null);
  };

  const handleSelectAISuggestion = (suggestion) => {
    setFormData({
      ...formData,
      date: suggestion.date,
      time: suggestion.time,
      category: suggestion.recommended_category || formData.category
    });
    setDialogOpen(true);
    setShowAISuggestions(false);
  };

  const handleMarkAttendance = async (eventId, attended) => {
    try {
      await base44.entities.Event.update(eventId, { attended });
      loadEvents();
      if (selectedEventForDetails?.id === eventId) {
        setSelectedEventForDetails({ ...selectedEventForDetails, attended });
      }
    } catch (error) {
      console.error('Error marcando asistencia:', error);
    }
  };

  const openEditDialog = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date,
      time: event.time || '12:00',
      category: event.category
    });
    setDialogOpen(true);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  const categoryColors = {
    personal: 'bg-purple-100 text-purple-800 border-purple-300',
    trabajo: 'bg-blue-100 text-blue-800 border-blue-300',
    salud: 'bg-green-100 text-green-800 border-green-300',
    social: 'bg-pink-100 text-pink-800 border-pink-300',
    salidas: 'bg-orange-100 text-orange-800 border-orange-300',
    citas: 'bg-rose-100 text-rose-800 border-rose-300',
    proyectos: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    peliculas: 'bg-red-100 text-red-800 border-red-300',
    libros: 'bg-amber-100 text-amber-800 border-amber-300',
    otro: 'bg-gray-100 text-gray-800 border-gray-300'
  };

  const categoryEmojis = {
    personal: '👤',
    trabajo: '💼',
    salud: '🏥',
    social: '👥',
    salidas: '🚶',
    citas: '💑',
    proyectos: '📋',
    peliculas: '🎬',
    libros: '📚',
    otro: '📌'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-normal text-warm-900 dark:text-warm-100 mb-2">Nuestro calendario</h1>
          <p className="text-warm-600 dark:text-warm-400">Aquí también sé cuando necesitas descanso, y te lo reservo.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-terracota hover:bg-terracota-dark text-black font-normal" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título del evento"
                />
              </div>
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción opcional"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">👤 Personal</SelectItem>
                    <SelectItem value="trabajo">💼 Trabajo</SelectItem>
                    <SelectItem value="salud">🏥 Salud</SelectItem>
                    <SelectItem value="social">👥 Social</SelectItem>
                    <SelectItem value="salidas">🚶 Salidas</SelectItem>
                    <SelectItem value="citas">💑 Citas</SelectItem>
                    <SelectItem value="proyectos">📋 Proyectos</SelectItem>
                    <SelectItem value="peliculas">🎬 Películas</SelectItem>
                    <SelectItem value="libros">📚 Libros</SelectItem>
                    <SelectItem value="otro">📌 Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveEvent} className="w-full bg-terracota hover:bg-terracota-dark text-black">
                {editingEvent ? 'Actualizar' : 'Crear'} Evento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Suggestions Toggle */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => setShowAISuggestions(!showAISuggestions)}
          className="border-purple-300 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400"
        >
          <Calendar className="w-4 h-4 mr-2" />
          {showAISuggestions ? 'Ocultar' : 'Ver'} Sugerencias de IA
        </Button>
      </div>

      {/* AI Event Suggestions */}
      {showAISuggestions && (
        <AIEventSuggestions onSelectSuggestion={handleSelectAISuggestion} />
      )}

      {/* Calendar Header */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              ←
            </Button>
            <CardTitle className="text-2xl font-normal uppercase">
              {format(currentDate, "MMMM yyyy", { locale: es })}
            </CardTitle>
            <Button variant="ghost" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              →
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Days of week */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
              <div key={day} className="text-center font-semibold text-warm-700 dark:text-warm-300 text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map(day => {
              const dayEvents = getEventsForDate(day);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toString()}
                  className={`min-h-24 p-2 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                    isToday 
                      ? 'bg-terracota/20 border-terracota' 
                      : 'bg-white dark:bg-warm-800 border-warm-200 dark:border-warm-700'
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-terracota' : 'text-warm-700 dark:text-warm-300'}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event.id}
                        className={`text-xs px-2 py-1 rounded border ${categoryColors[event.category]}`}
                        style={event.color ? { borderLeftWidth: '3px', borderLeftColor: event.color } : {}}
                      >
                        <p className="truncate font-medium flex items-center gap-1">
                          <span>{categoryEmojis[event.category]}</span>
                          {event.title}
                        </p>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <p className="text-xs text-warm-500">+{dayEvents.length - 2} más</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      {selectedDate && (
        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-terracota" />
                Eventos - {format(selectedDate, "d 'de' MMMM", { locale: es })}
              </CardTitle>
              <Button 
                className="bg-terracota hover:bg-terracota-dark text-black shadow-lg font-normal rounded-lg"
                onClick={() => {
                  resetForm();
                  setFormData(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }));
                  setDialogOpen(true);
                }}
              >
                <Plus className="w-4 h-4 font-normal" />
                <Menu className="w-4 h-4 font-normal" />
                <Circle className="w-4 h-4 font-normal" />
                Agregar Evento
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {getEventsForDate(selectedDate).length > 0 ? (
              <div className="space-y-3">
                {getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className="space-y-3">
                    <div className="p-4 bg-warm-50 dark:bg-warm-800 rounded-xl">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-warm-900 dark:text-warm-100">{event.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full border ${categoryColors[event.category]}`}>
                              {event.category}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-sm text-warm-600 dark:text-warm-400 mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-warm-500">
                            {event.time && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.time}
                              </span>
                            )}
                            {event.notified && (
                              <span className="flex items-center gap-1 text-terracota">
                                <Bell className="w-3 h-3" />
                                Notificado
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openEditDialog(event)}
                            className="text-warm-600 hover:text-warm-900"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Modificar
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>

                      {/* Attendance Buttons */}
                      {new Date(event.date) < new Date() && (
                        <div className="flex items-center gap-2 mb-3 pt-3 border-t border-warm-200 dark:border-warm-700">
                          <span className="text-xs text-warm-600 dark:text-warm-400">¿Asististe?</span>
                          <Button
                            size="sm"
                            variant={event.attended === true ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(event.id, true)}
                            className={event.attended === true ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Sí
                          </Button>
                          <Button
                            size="sm"
                            variant={event.attended === false ? "default" : "outline"}
                            onClick={() => handleMarkAttendance(event.id, false)}
                            className={event.attended === false ? "bg-red-500 hover:bg-red-600" : ""}
                          >
                            <X className="w-3 h-3 mr-1" />
                            No
                          </Button>
                        </div>
                      )}

                      {/* AI Features */}
                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEventForDetails(selectedEventForDetails?.id === event.id ? null : event)}
                          className="w-full text-xs"
                        >
                          {selectedEventForDetails?.id === event.id ? 'Ocultar' : 'Ver'} Análisis de IA
                        </Button>
                      </div>
                    </div>

                    {selectedEventForDetails?.id === event.id && (
                      <div className="space-y-3 ml-4">
                        <AIAttendancePrediction event={event} allEvents={events} />
                        <SmartEventNotification event={event} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-warm-600 dark:text-warm-400 py-8">
                No hay eventos para este día
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}