import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FolderOpen, Plus, FileText, MessageSquare, Upload, Trash2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Files() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('todos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    folder: '',
    file_type: 'nota',
    file_url: '',
    tags: []
  });

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    // Extract unique folders
    const uniqueFolders = [...new Set(files.map(f => f.folder).filter(Boolean))];
    setFolders(uniqueFolders);
  }, [files]);

  const loadFiles = async () => {
    try {
      const allFiles = await base44.entities.FileNote.list('-created_date', 100);
      setFiles(allFiles);
    } catch (error) {
      console.error('Error cargando archivos:', error);
    }
  };

  const handleSaveFile = async () => {
    try {
      await base44.entities.FileNote.create(formData);
      loadFiles();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error guardando archivo:', error);
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ 
        ...formData, 
        file_url,
        title: formData.title || file.name,
        file_type: file.name.endsWith('.pdf') ? 'pdf' : 'documento'
      });
    } catch (error) {
      console.error('Error subiendo archivo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await base44.entities.FileNote.delete(fileId);
      loadFiles();
    } catch (error) {
      console.error('Error eliminando archivo:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      folder: '',
      file_type: 'nota',
      file_url: '',
      tags: []
    });
  };

  const filteredFiles = selectedFolder === 'todos' 
    ? files 
    : files.filter(f => f.folder === selectedFolder);

  const fileTypeIcons = {
    conversacion: MessageSquare,
    nota: FileText,
    pdf: FileText,
    documento: FileText
  };

  const fileTypeColors = {
    conversacion: 'bg-blue-100 text-blue-800 border-blue-300',
    nota: 'bg-green-100 text-green-800 border-green-300',
    pdf: 'bg-red-100 text-red-800 border-red-300',
    documento: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-normal text-purple-600 dark:text-purple-400 mb-2">Nuestros Archivos</h1>
          <p className="text-warm-600 dark:text-warm-400">Nuestra historia organizada</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-terracota hover:bg-terracota-dark text-black" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Archivo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Archivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título del archivo"
                />
              </div>

              <div>
                <Label>Tipo de archivo</Label>
                <Select value={formData.file_type} onValueChange={(value) => setFormData({ ...formData, file_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nota">📝 Nota</SelectItem>
                    <SelectItem value="conversacion">💬 Conversación</SelectItem>
                    <SelectItem value="documento">📄 Documento</SelectItem>
                    <SelectItem value="pdf">📕 PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.file_type === 'nota' || formData.file_type === 'conversacion') && (
                <div>
                  <Label>Contenido</Label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Escribe el contenido..."
                    className="w-full h-40 p-3 border rounded-lg resize-none"
                  />
                </div>
              )}

              {(formData.file_type === 'pdf' || formData.file_type === 'documento') && (
                <div>
                  <Label>Subir archivo</Label>
                  <div className="mt-2">
                    {formData.file_url ? (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
                        <span className="text-sm text-green-800 dark:text-green-200">
                          ✓ Archivo subido
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setFormData({ ...formData, file_url: '' })}
                        >
                          Cambiar
                        </Button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-warm-300 rounded-lg cursor-pointer hover:border-terracota transition-colors">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-warm-400 mx-auto mb-2" />
                          <span className="text-sm text-warm-600">
                            {uploading ? 'Subiendo...' : 'Click para subir'}
                          </span>
                        </div>
                        <input type="file" className="hidden" onChange={handleUploadFile} disabled={uploading} />
                      </label>
                    )}
                  </div>
                </div>
              )}

              <div>
                <Label>Carpeta (opcional)</Label>
                <Input
                  value={formData.folder}
                  onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                  placeholder="Nombre de carpeta"
                />
              </div>

              <Button onClick={handleSaveFile} className="w-full bg-terracota hover:bg-terracota-dark text-black">
                Guardar Archivo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Folder Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedFolder === 'todos' ? 'default' : 'outline'}
          onClick={() => setSelectedFolder('todos')}
          className={selectedFolder === 'todos' ? 'bg-terracota text-black' : ''}
        >
          Todos ({files.length})
        </Button>
        {folders.map(folder => (
          <Button
            key={folder}
            variant={selectedFolder === folder ? 'default' : 'outline'}
            onClick={() => setSelectedFolder(folder)}
            className={selectedFolder === folder ? 'bg-terracota text-black' : ''}
          >
            📁 {folder} ({files.filter(f => f.folder === folder).length})
          </Button>
        ))}
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFiles.map(file => {
          const Icon = fileTypeIcons[file.file_type] || FileText;
          return (
            <Card key={file.id} className="shadow-lg hover:shadow-xl transition-all group">
              <CardHeader className="border-b pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl ${fileTypeColors[file.file_type]} border flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-warm-900 dark:text-warm-100 line-clamp-2">
                        {file.title}
                      </CardTitle>
                      <p className="text-xs text-warm-500 mt-1">
                        {format(new Date(file.created_date), "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteFile(file.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {file.content && (
                  <p className="text-sm text-warm-600 dark:text-warm-400 line-clamp-3 mb-3">
                    {file.content}
                  </p>
                )}
                {file.file_url && (
                  <a 
                    href={file.file_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-terracota hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver archivo
                  </a>
                )}
                {file.folder && (
                  <div className="mt-3 pt-3 border-t border-warm-200 dark:border-warm-700">
                    <span className="text-xs text-warm-500">📁 {file.folder}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFiles.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <FolderOpen className="w-16 h-16 text-warm-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-warm-900 dark:text-warm-100 mb-2">
              {selectedFolder === 'todos' ? 'No hay archivos todavía' : `No hay archivos en "${selectedFolder}"`}
            </h3>
            <p className="text-warm-600 dark:text-warm-400">
              Guardemos nuestra historia
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}