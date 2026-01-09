import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Weight, Ruler, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useProfileContext } from '@/contexts/ProfileContext';

const BodyMeasurementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfileContext();

  const [formData, setFormData] = useState({
    current_weight_kg: profile?.current_weight_kg || '',
    height_cm: profile?.height_cm || '',
    body_fat_percentage: profile?.body_fat_percentage || '',
    target_weight_kg: profile?.target_weight_kg || '',
    chest_circumference_cm: profile?.chest_circumference_cm || '',
    arm_circumference_cm: profile?.arm_circumference_cm || '',
    leg_circumference_cm: profile?.leg_circumference_cm || '',
    abdomen_circumference_cm: profile?.abdomen_circumference_cm || ''
  });

  const [recalculateMacros, setRecalculateMacros] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    const updates: any = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '') {
        updates[key] = parseFloat(value as string) || null;
      }
    });

    const success = await updateProfile(updates, !recalculateMacros);
    if (success) {
      navigate('/profile');
    }
    setSaving(false);
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.current_weight_kg as string);
    const height = parseFloat(formData.height_cm as string);
    if (weight && height) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  return (
    <div className="min-h-screen pt-6 pb-24 px-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <h1 className="text-xl font-bold">Medidas Corporales</h1>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile/progress')}
            className="h-9 w-9"
          >
            <TrendingUp className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className="px-3"
          >
            <Save className="h-4 w-4 mr-1" />
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Switch Recalcular Macros */}
        <Card className="p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="recalc-macros" className="text-base font-semibold">
              Calcular nuevas macros
            </Label>
            <p className="text-sm text-muted-foreground">
              Recalcular plan nutricional con nuevas medidas
            </p>
          </div>
          <Switch
            id="recalc-macros"
            checked={recalculateMacros}
            onCheckedChange={setRecalculateMacros}
          />
        </Card>

        {/* Medidas básicas */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Weight className="h-5 w-5" />
            Medidas Básicas
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.current_weight_kg}
                  onChange={(e) => handleInputChange('current_weight_kg', e.target.value)}
                  placeholder="70"
                />
              </div>

              <div>
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height_cm}
                  onChange={(e) => handleInputChange('height_cm', e.target.value)}
                  placeholder="175"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bodyFat">% Graso</Label>
                <Input
                  id="bodyFat"
                  type="number"
                  value={formData.body_fat_percentage}
                  onChange={(e) => handleInputChange('body_fat_percentage', e.target.value)}
                  placeholder="15"
                />
              </div>

              <div>
                <Label htmlFor="targetWeight">Peso Objetivo (kg)</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  value={formData.target_weight_kg}
                  onChange={(e) => handleInputChange('target_weight_kg', e.target.value)}
                  placeholder="68"
                />
              </div>
            </div>

            {calculateBMI() && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">IMC Calculado</p>
                <p className="text-lg font-semibold">{calculateBMI()}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Circunferencias */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Circunferencias (cm)
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chest">Pecho</Label>
                <Input
                  id="chest"
                  type="number"
                  value={formData.chest_circumference_cm}
                  onChange={(e) => handleInputChange('chest_circumference_cm', e.target.value)}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="arm">Brazo</Label>
                <Input
                  id="arm"
                  type="number"
                  value={formData.arm_circumference_cm}
                  onChange={(e) => handleInputChange('arm_circumference_cm', e.target.value)}
                  placeholder="35"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leg">Pierna</Label>
                <Input
                  id="leg"
                  type="number"
                  value={formData.leg_circumference_cm}
                  onChange={(e) => handleInputChange('leg_circumference_cm', e.target.value)}
                  placeholder="55"
                />
              </div>

              <div>
                <Label htmlFor="abdomen">Abdomen</Label>
                <Input
                  id="abdomen"
                  type="number"
                  value={formData.abdomen_circumference_cm}
                  onChange={(e) => handleInputChange('abdomen_circumference_cm', e.target.value)}
                  placeholder="85"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BodyMeasurementsPage;
