import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Download, Upload, ExternalLink, Trash2, FileText, Image, File } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    filename: '',
    file_url: '',
    file_type: '',
    size: '',
    source_url: ''
  });

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const allDownloads = await base44.entities.Download.list('-download_date', 100);
      setDownloads(allDownloads);
    } catch (error) {
      console.error('Error cargando descargas:', error);
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      const fileType = file.type || 'unknown';
      
      setFormData({
        filename: file.name,
        file_url,
        file_type: fileType,
        size: `${fileSizeInMB} MB`,
        source_url: '',
        download_date: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      console.error('Error subiendo archivo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDownload = async () => {
    try {
      await base44.entities.Download.create({
        ...formData,
        download_date: format(new Date(), 'yyyy-MM-dd')
      });
      loadDownloads();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error guardando descarga:', error);
    }
  };

  const handleDeleteDownload = async (downloadId) => {
    try {
      await base44.entities.Download.delete(downloadId);
      loadDownloads();
    } catch (error) {
      console.error('Error eliminando descarga:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      filename: '',
      file_url: '',
      file_type: '',
      size: '',
      source_url: ''
    });
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return File;
    if (fileType.includes('image')) return Image;
    if (fileType.includes('pdf') || fileType.includes('text')) return FileText;
    return File;
  };

  const getFileColor = (fileType) => {
    if (!fileType) return 'bg-gray-100 text-gray-800';
    if (fileType.includes('image')) return 'bg-blue-100 text-blue-800';
    if (fileType.includes('pdf')) return 'bg-red-100 text-red-800';
    if (fileType.includes('text')) return 'bg-green-100 text-green-800';
    return 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-normal text-warm-900 dark:text-warm-100 mb-2">Descargas</h1>
          <p className="text-warm-600 dark:text-warm-400">Gestion de nuestros archivos descargados</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-terracota hover:bg-terracota-dark text-black" onClick={resetForm}>
              <Upload className="w-4 h-4 mr-2" />
              Subir Archivo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Subir Archivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Seleccionar archivo</Label>
                <div className="mt-2">
                  {formData.file_url ? (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-200 mb-2">✓ Archivo subido</p>
                      <p className="text-xs text-warm-600">{formData.filename}</p>
                      <p className="text-xs text-warm-500 mt-1">{formData.size}</p>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-warm-300 rounded-lg cursor-pointer hover:border-terracota transition-colors">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-warm-400 mx-auto mb-2" />
                        <span className="text-sm text-warm-600">
                          {uploading ? 'Subiendo...' : 'Click para seleccionar'}
                        </span>
                      </div>
                      <input type="file" className="hidden" onChange={handleUploadFile} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              {formData.file_url && (
                <>
                  <div>
                    <Label>Nombre personalizado (opcional)</Label>
                    <Input
                      value={formData.filename}
                      onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
                      placeholder="Nombre del archivo"
                    />
                  </div>
                  <div>
                    <Label>URL de origen (opcional)</Label>
                    <Input
                      value={formData.source_url}
                      onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <Button onClick={handleSaveDownload} className="w-full bg-terracota hover:bg-terracota-dark text-white">
                    Guardar Archivo
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Downloads List */}
      <div className="space-y-4">
        {downloads.map(download => {
          const FileIcon = getFileIcon(download.file_type);
          const fileColor = getFileColor(download.file_type);
          
          return (
            <Card key={download.id} className="shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-xl ${fileColor} flex items-center justify-center`}>
                    <FileIcon className="w-8 h-8" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-warm-900 dark:text-warm-100 truncate">
                      {download.filename}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-warm-600">
                      {download.size && <span>{download.size}</span>}
                      {download.download_date && (
                        <span>{format(new Date(download.download_date), "d MMM yyyy", { locale: es })}</span>
                      )}
                    </div>
                    {download.source_url && (
                      <a 
                        href={download.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-terracota hover:underline mt-1 inline-block truncate max-w-md"
                      >
                        {download.source_url}
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <a 
                      href={download.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteDownload(download.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {downloads.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <Download className="w-16 h-16 text-warm-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-warm-900 dark:text-warm-100 mb-2">
              No hay archivos descargados
            </h3>
            <p className="text-warm-600 dark:text-warm-400 mb-6">
              Descarga tu primer archivo para comenzar
            </p>
            <Button onClick={() => setDialogOpen(true)} className="bg-terracota hover:bg-terracota-dark text-black">
              <Upload className="w-4 h-4 mr-2" />
              Subir Primer Archivo
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}