import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChefHat, Plus, Star, Clock, Trash2, Upload, Heart } from 'lucide-react';

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo_url: '',
    ingredients: [''],
    procedure: '',
    rating: 0,
    category: 'comida',
    prep_time: ''
  });

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const allRecipes = await base44.entities.Recipe.list('-rating', 100);
      setRecipes(allRecipes);
    } catch (error) {
      console.error('Error cargando recetas:', error);
    }
  };

  const handleSaveRecipe = async () => {
    try {
      const cleanedIngredients = formData.ingredients.filter(i => i.trim() !== '');
      await base44.entities.Recipe.create({
        ...formData,
        ingredients: cleanedIngredients
      });
      loadRecipes();
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error guardando receta:', error);
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, photo_url: file_url });
    } catch (error) {
      console.error('Error subiendo foto:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleRateRecipe = async (recipeId, rating) => {
    try {
      await base44.entities.Recipe.update(recipeId, { rating });
      loadRecipes();
      if (selectedRecipe?.id === recipeId) {
        setSelectedRecipe({ ...selectedRecipe, rating });
      }
    } catch (error) {
      console.error('Error calificando receta:', error);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      await base44.entities.Recipe.delete(recipeId);
      loadRecipes();
      setViewDialogOpen(false);
    } catch (error) {
      console.error('Error eliminando receta:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      photo_url: '',
      ingredients: [''],
      procedure: '',
      rating: 0,
      category: 'comida',
      prep_time: ''
    });
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
  };

  const updateIngredient = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const categoryEmojis = {
    desayuno: '🍳',
    comida: '🍽️',
    cena: '🌙',
    postre: '🍰',
    snack: '🍿',
    bebida: '🥤'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-normal text-warm-900 dark:text-warm-100 mb-2">Recetario</h1>
          <p className="text-warm-600 dark:text-warm-400">Nuestra colección de recetas favoritas</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-300 hover:bg-purple-400 text-white" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Receta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Receta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Nombre del platillo</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Tacos al pastor"
                />
              </div>
              
              <div>
                <Label>Descripción breve</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Una breve descripción"
                />
              </div>

              <div>
                <Label>Foto del platillo</Label>
                <div className="mt-2">
                  {formData.photo_url ? (
                    <div className="relative">
                      <img src={formData.photo_url} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData({ ...formData, photo_url: '' })}
                      >
                        Cambiar
                      </Button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-warm-300 rounded-lg cursor-pointer hover:border-terracota transition-colors">
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-warm-400 mx-auto mb-2" />
                        <span className="text-sm text-warm-600">Subir foto</span>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleUploadPhoto} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <Label>Ingredientes</Label>
                <div className="space-y-2 mt-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        placeholder={`Ingrediente ${index + 1}`}
                      />
                      {formData.ingredients.length > 1 && (
                        <Button variant="ghost" size="icon" onClick={() => removeIngredient(index)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addIngredient}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar ingrediente
                  </Button>
                </div>
              </div>

              <div>
                <Label>Procedimiento</Label>
                <Textarea
                  value={formData.procedure}
                  onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                  placeholder="Describe los pasos de preparación..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Categoría</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desayuno">🍳 Desayuno</SelectItem>
                      <SelectItem value="comida">🍽️ Comida</SelectItem>
                      <SelectItem value="cena">🌙 Cena</SelectItem>
                      <SelectItem value="postre">🍰 Postre</SelectItem>
                      <SelectItem value="snack">🍿 Snack</SelectItem>
                      <SelectItem value="bebida">🥤 Bebida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tiempo de preparación</Label>
                  <Input
                    value={formData.prep_time}
                    onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                    placeholder="Ej: 30 minutos"
                  />
                </div>
              </div>

              <Button onClick={handleSaveRecipe} className="w-full bg-terracota hover:bg-terracota-dark text-white">
                Guardar Receta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <Card 
            key={recipe.id} 
            className="shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => {
              setSelectedRecipe(recipe);
              setViewDialogOpen(true);
            }}
          >
            <div className="aspect-video bg-warm-200 dark:bg-warm-700 rounded-t-lg overflow-hidden">
              {recipe.photo_url ? (
                <img 
                  src={recipe.photo_url} 
                  alt={recipe.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ChefHat className="w-16 h-16 text-warm-400" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-warm-900 dark:text-warm-100 mb-1">{recipe.name}</h3>
                  <p className="text-sm text-warm-600 dark:text-warm-400 line-clamp-2">{recipe.description}</p>
                </div>
                <span className="text-2xl ml-2">{categoryEmojis[recipe.category]}</span>
              </div>
              
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-warm-200 dark:border-warm-700">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Heart 
                      key={i}
                      className={`w-4 h-4 ${i < recipe.rating ? 'fill-terracota text-terracota' : 'text-warm-300'}`}
                    />
                  ))}
                </div>
                {recipe.prep_time && (
                  <span className="text-xs text-warm-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.prep_time}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {recipes.length === 0 && (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <ChefHat className="w-16 h-16 text-warm-400 mx-auto mb-4" />
            <h3 className="text-xl font-normal text-warm-900 dark:text-warm-100 mb-2">
              No hay recetas todavía
            </h3>
            <p className="text-warm-600 dark:text-warm-400">
              Vamos creando delicias juntos ♡
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recipe Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedRecipe && (
            <div>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center justify-between">
                  <span>{selectedRecipe.name}</span>
                  <span className="text-3xl">{categoryEmojis[selectedRecipe.category]}</span>
                </DialogTitle>
              </DialogHeader>
              
              {selectedRecipe.photo_url && (
                <img 
                  src={selectedRecipe.photo_url} 
                  alt={selectedRecipe.name}
                  className="w-full h-64 object-cover rounded-lg my-4"
                />
              )}

              <div className="space-y-6">
                {selectedRecipe.description && (
                  <p className="text-warm-700 dark:text-warm-300">{selectedRecipe.description}</p>
                )}

                {selectedRecipe.prep_time && (
                  <div className="flex items-center gap-2 text-warm-600">
                    <Clock className="w-5 h-5" />
                    <span>Tiempo de preparación: {selectedRecipe.prep_time}</span>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-warm-900 dark:text-warm-100 mb-3">Ingredientes</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredients?.map((ingredient, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-warm-700 dark:text-warm-300">
                        <div className="w-2 h-2 rounded-full bg-terracota" />
                        {ingredient}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-warm-900 dark:text-warm-100 mb-3">Procedimiento</h3>
                  <p className="text-warm-700 dark:text-warm-300 whitespace-pre-wrap leading-relaxed">
                    {selectedRecipe.procedure}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-warm-900 dark:text-warm-100 mb-3">Calificación</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => handleRateRecipe(selectedRecipe.id, rating)}
                        className="transition-transform hover:scale-110"
                      >
                        <Heart 
                          className={`w-8 h-8 ${rating <= selectedRecipe.rating ? 'fill-terracota text-terracota' : 'text-warm-300'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => handleDeleteRecipe(selectedRecipe.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Eliminar Receta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}