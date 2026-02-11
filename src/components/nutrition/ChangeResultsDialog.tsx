
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Button from '@/components/Button';
import { X, Sparkles, Send } from 'lucide-react';

interface FoodData {
  custom_food_name: string;
  quantity_consumed: number;
  unit_consumed: string;
  calories_consumed: number;
  protein_g_consumed: number;
  carbs_g_consumed: number;
  fat_g_consumed: number;
  healthScore?: number;
  ingredients?: Array<{
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

interface UpdatedFoodData {
  custom_food_name: string;
  quantity_consumed: number;
  unit_consumed: string;
  calories_consumed: number;
  protein_g_consumed: number;
  carbs_g_consumed: number;
  fat_g_consumed: number;
  healthScore: number;
  ingredients: Array<{
    name: string;
    grams: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

interface ChangeResultsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: string) => void;
  onUpdate?: (updatedData: UpdatedFoodData) => void;
  foodData?: FoodData;
}

export const ChangeResultsDialog: React.FC<ChangeResultsDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onUpdate,
  foodData
}) => {
  const [request, setRequest] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const parseWebhookResponse = (responseData: any): UpdatedFoodData | null => {
    try {
      // Handle array format response
      if (Array.isArray(responseData) && responseData.length > 0) {
        const firstItem = responseData[0];
        if (firstItem && firstItem.output) {
          const output = firstItem.output;

          // Parse ingredients
          const ingredients = output.ingredients?.map((ing: any) => ({
            name: ing.name || '',
            grams: parseFloat(ing.grams) || 0,
            calories: parseFloat(ing.calories) || 0,
            protein: parseFloat(ing.protein) || 0,
            carbs: parseFloat(ing.carbs) || 0,
            fat: parseFloat(ing.fat) || 0
          })) || [];

          return {
            custom_food_name: output.custom_food_name || '',
            quantity_consumed: parseFloat(output.quantity_consumed) || 1,
            unit_consumed: output.unit_consumed || 'porción',
            calories_consumed: parseFloat(output.calories_consumed) || 0,
            protein_g_consumed: parseFloat(output.protein_g_consumed) || 0,
            carbs_g_consumed: parseFloat(output.carbs_g_consumed) || 0,
            fat_g_consumed: parseFloat(output.fat_g_consumed) || 0,
            healthScore: parseFloat(output.healthScore) || 7,
            ingredients
          };
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing webhook response:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (request.trim() && foodData) {
      setIsLoading(true);

      try {
        // Preparar la carga útil con toda la información de la comida
        const payload = {
          userRequest: request.trim(),
          foodData: {
            name: foodData.custom_food_name,
            quantity: foodData.quantity_consumed,
            unit: foodData.unit_consumed,
            calories: foodData.calories_consumed,
            protein: foodData.protein_g_consumed,
            carbs: foodData.carbs_g_consumed,
            fat: foodData.fat_g_consumed,
            healthScore: foodData.healthScore || 7,
            ingredients: foodData.ingredients || []
          },
          timestamp: new Date().toISOString()
        };

        console.log('Enviando datos al webhook:', payload);

        // Enviar al webhook y esperar respuesta
        const response = await fetch('https://n8n.gatofit.com/webhook/correccion-de-comida', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          console.log('Datos enviados exitosamente al webhook');

          // Cambiar a estado de actualización
          setIsLoading(false);
          setIsUpdating(true);

          try {
            const responseText = await response.text();
            console.log('Respuesta del webhook recibida:', responseText);

            let responseData;
            try {
              responseData = JSON.parse(responseText);
            } catch (parseError) {
              console.error('Error parseando respuesta del webhook:', parseError);
              throw new Error('Respuesta inválida del servidor');
            }

            // Parsear y validar la respuesta
            const updatedData = parseWebhookResponse(responseData);

            if (updatedData && onUpdate) {
              console.log('Actualizando datos de comida:', updatedData);
              onUpdate(updatedData);
              setRequest('');
              onClose();
            } else {
              console.error('No se pudieron obtener datos válidos de la respuesta');
              setRequest('');
              onClose();
            }
          } catch (updateError) {
            console.error('Error procesando actualización:', updateError);
            setRequest('');
            onClose();
          }
        } else {
          console.error('Error en la respuesta del webhook:', response.status);
          setRequest('');
          onClose();
        }
      } catch (error) {
        console.error('Error enviando al webhook:', error);
        setRequest('');
        onClose();
      } finally {
        setIsLoading(false);
        setIsUpdating(false);
      }
    }
  };

  const isProcessing = isLoading || isUpdating;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background border border-white/10 max-w-md mx-auto rounded-xl">
        <DialogHeader className="flex flex-row items-center justify-between pb-2">
          <DialogTitle className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Cambiar resultados con IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              ¿Qué te gustaría cambiar?
            </label>
            <Textarea
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              placeholder="Ej: Este no es un sandwich, es una ensalada..."
              className="min-h-[100px] resize-none"
              autoFocus
              disabled={isProcessing}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancelar
            </Button>

            <Button
              variant="primary"
              className="flex-1"
              onClick={handleSubmit}
              disabled={!request.trim() || isProcessing}
              leftIcon={isProcessing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            >
              {isLoading ? 'Enviando...' : isUpdating ? 'Actualizando...' : 'Enviar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
