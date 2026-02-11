import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Upload, X, Image as ImageIcon, FileText, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { useSupportTicket } from "@/hooks/useSupportTicket";
import { useNativeCamera } from "@/hooks/useNativeCamera";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/contexts/AuthContext";

const supportSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  subject: z
    .string()
    .trim()
    .min(3, "El asunto debe tener al menos 3 caracteres")
    .max(100, "El asunto no puede exceder 100 caracteres"),
  message: z
    .string()
    .trim()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(5000, "El mensaje no puede exceder 5000 caracteres"),
  category: z.enum(["bug", "suggestion", "question", "other"], {
    required_error: "Debes seleccionar una categoría",
  }),
});

type SupportFormData = z.infer<typeof supportSchema>;

const SupportPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitTicket, isSubmitting, uploadProgress } = useSupportTicket();
  const { takePicture, selectFromGallery, isNative } = useNativeCamera();
  const [attachments, setAttachments] = useState<File[]>([]);

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      email: user?.email || "",
      subject: "",
      message: "",
      category: "question",
    },
  });

  const categoryLabels: Record<string, string> = {
    bug: "🐛 Reportar un Bug",
    suggestion: "💡 Sugerencia de Mejora",
    question: "❓ Hacer una Pregunta",
    other: "📝 Otro",
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (attachments.length + files.length > 5) {
      alert("Máximo 5 archivos permitidos");
      return;
    }

    setAttachments([...attachments, ...files]);
  };

  const handleTakePhoto = async () => {
    try {
      const photo = await takePicture();
      if (photo && photo.webPath) {
        // Convert to File object
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

        if (attachments.length >= 5) {
          alert("Máximo 5 archivos permitidos");
          return;
        }

        setAttachments([...attachments, file]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
    }
  };

  const handleSelectFromGallery = async () => {
    try {
      const photo = await selectFromGallery();
      if (photo && photo.webPath) {
        const response = await fetch(photo.webPath);
        const blob = await response.blob();
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

        if (attachments.length >= 5) {
          alert("Máximo 5 archivos permitidos");
          return;
        }

        setAttachments([...attachments, file]);
      }
    } catch (error) {
      console.error("Error selecting from gallery:", error);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SupportFormData) => {
    const success = await submitTicket({
      subject: data.subject,
      message: data.message,
      category: data.category,
      attachments,
      email: data.email,
    });

    if (success) {
      form.reset();
      setAttachments([]);
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-bold">Centro de Soporte</h1>
        </div>

        <Card className="neu-card p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo de Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      Para poder contactarte sobre tu consulta.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona una categoría" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(categoryLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      ¿Qué tipo de asunto deseas reportar?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Subject */}
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Asunto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Escribe el asunto aquí..."
                        {...field}
                        maxLength={100}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length}/100 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe tu problema o consulta con el mayor detalle posible..."
                        className="min-h-[150px] resize-none"
                        {...field}
                        maxLength={5000}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value.length}/5000 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachments */}
              <div className="space-y-3">
                <FormLabel>Archivos Adjuntos (Opcional)</FormLabel>
                <FormDescription>
                  Máximo 5 archivos, 10MB por archivo. Formatos: imágenes, PDF, documentos
                </FormDescription>

                {/* Attachment Buttons */}
                <div className="flex flex-wrap gap-2">
                  {isNative && (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleTakePhoto}
                        disabled={attachments.length >= 5}
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Tomar Foto
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleSelectFromGallery}
                        disabled={attachments.length >= 5}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Galería
                      </Button>
                    </>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    disabled={attachments.length >= 5}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Archivo
                  </Button>

                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Attachment Previews */}
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="h-5 w-5 text-primary" />
                          ) : (
                            <FileText className="h-5 w-5 text-primary" />
                          )}
                          <div className="flex-1 min-w-0 max-w-[200px]">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAttachment(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Progress */}
              {isSubmitting && uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subiendo archivos...</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                size="lg"
              >
                {isSubmitting ? "Enviando..." : "Enviar Ticket"}
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Tiempo estimado de respuesta: 24-48 horas
              </p>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default SupportPage;
