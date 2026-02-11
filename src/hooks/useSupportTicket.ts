import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { validateImageFile } from "@/utils/validation";

export interface SupportTicketData {
  subject: string;
  message: string;
  category: "bug" | "suggestion" | "question" | "other";
  attachments: File[];
  email: string;
}

export const useSupportTicket = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'video/mp4', 'video/quicktime'
    ];

    if (file.size > maxSize) {
      return { isValid: false, error: `El archivo "${file.name}" excede el tamaño máximo de 10MB` };
    }

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: `El tipo de archivo "${file.name}" no está permitido` };
    }

    return { isValid: true };
  };

  const uploadAttachment = async (file: File, ticketId: string): Promise<string | null> => {
    try {
      if (!user) throw new Error("Usuario no autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${ticketId}/${crypto.randomUUID()}.${fileExt}`;

      console.log(`Uploading attachment: ${fileName}`);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('support-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      console.log("File uploaded successfully:", uploadData.path);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('support-attachments')
        .getPublicUrl(uploadData.path);

      // Insert attachment record in database
      const { error: dbError } = await supabase
        .from('support_ticket_attachments')
        .insert({
          ticket_id: ticketId,
          file_name: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          file_type: file.type
        });

      if (dbError) {
        console.error("Error saving attachment record:", dbError);
        // Clean up uploaded file
        await supabase.storage.from('support-attachments').remove([uploadData.path]);
        throw dbError;
      }

      return publicUrl;
    } catch (error) {
      console.error("Error in uploadAttachment:", error);
      return null;
    }
  };

  const submitTicket = async (ticketData: SupportTicketData): Promise<boolean> => {
    if (!user) {
      toast.error("Debes iniciar sesión para enviar un ticket");
      return false;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      // Validate attachments
      if (ticketData.attachments.length > 5) {
        toast.error("Máximo 5 archivos adjuntos permitidos");
        return false;
      }

      for (const file of ticketData.attachments) {
        const validation = validateFile(file);
        if (!validation.isValid) {
          toast.error(validation.error || "Archivo inválido");
          return false;
        }
      }

      console.log("Submitting support ticket:", {
        subject: ticketData.subject,
        category: ticketData.category,
        attachmentCount: ticketData.attachments.length
      });

      // Step 1: Create ticket in database first (without sending emails yet)
      const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: ticketData.subject.trim(),
          message: ticketData.message.trim(),
          category: ticketData.category,
          status: 'open',
          priority: 'medium'
        })
        .select()
        .single();

      if (ticketError || !ticket) {
        console.error("Error creating ticket:", ticketError);
        throw new Error("Error al crear el ticket");
      }

      const ticketId = ticket.id;
      console.log("Ticket created with ID:", ticketId);

      // Step 2: Upload attachments BEFORE sending emails
      const attachmentUrls: string[] = [];
      if (ticketData.attachments.length > 0) {
        console.log(`Uploading ${ticketData.attachments.length} attachments...`);

        for (let i = 0; i < ticketData.attachments.length; i++) {
          const file = ticketData.attachments[i];
          const uploadedUrl = await uploadAttachment(file, ticketId);

          if (uploadedUrl) {
            attachmentUrls.push(uploadedUrl);
          } else {
            console.warn(`Failed to upload attachment: ${file.name}`);
          }

          setUploadProgress(((i + 1) / ticketData.attachments.length) * 100);
        }
      }

      // Step 3: Now send emails with attachment URLs
      const { data, error } = await supabase.functions.invoke('send-support-email', {
        body: {
          ticketId: ticketId,
          subject: ticketData.subject,
          message: ticketData.message,
          category: ticketData.category,
          attachmentUrls: attachmentUrls,
          email: ticketData.email
        }
      });

      if (error) {
        console.error("Error calling edge function:", error);
        // Don't throw - ticket is already created, just log the error
        console.warn("Ticket created but email notification failed");
      }

      toast.success("¡Ticket enviado exitosamente! Te responderemos pronto.", {
        description: `Ticket #${ticketId.substring(0, 8)}`
      });

      return true;
    } catch (error: any) {
      console.error("Error submitting ticket:", error);
      toast.error("Error al enviar el ticket", {
        description: error.message || "Por favor, intenta nuevamente"
      });
      return false;
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return {
    submitTicket,
    isSubmitting,
    uploadProgress
  };
};
