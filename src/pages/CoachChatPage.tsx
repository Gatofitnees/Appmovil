import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCoachAssignment } from '@/hooks/useCoachAssignment';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Paperclip, FileText, Image as ImageIcon, Video, X, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface Message {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    is_read: boolean;
    message_type: 'text' | 'image' | 'video' | 'file';
    attachment_url?: string;
}

const CoachChatPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { coachId, loading: coachLoading } = useCoachAssignment();
    const { toast } = useToast();

    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [sending, setSending] = useState(false);
    const [coachProfile, setCoachProfile] = useState<any>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Coach Profile
    useEffect(() => {
        const fetchCoachProfile = async () => {
            if (!coachId) return;

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', coachId)
                .single();

            if (data) setCoachProfile(data);
        };

        fetchCoachProfile();
    }, [coachId]);

    // Load Conversation and Messages
    useEffect(() => {
        const loadConversation = async () => {
            if (!user || !coachId) return;

            try {
                setLoadingMessages(true);

                // 1. Find existing conversation
                const { data: existingConvs, error: findError } = await supabase
                    .from('conversations')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('coach_id', coachId)
                    .limit(1);

                if (findError) throw findError;

                let convId = existingConvs?.[0]?.id;

                // 2. If not exists, create it
                if (!convId) {
                    const { data: newConv, error: createError } = await supabase
                        .from('conversations')
                        .insert({
                            user_id: user.id,
                            coach_id: coachId
                        })
                        .select()
                        .single();

                    if (createError) throw createError;
                    convId = newConv.id;
                }

                setConversationId(convId);

                // 3. Load messages (get last 50)
                const { data: msgs, error: msgsError } = await supabase
                    .from('chat_messages')
                    .select('*')
                    .eq('conversation_id', convId)
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (msgsError) throw msgsError;

                // Reverse to show oldest to newest
                const orderedMessages = (msgs as Message[] || []).reverse();
                setMessages(orderedMessages);

                // 4. Mark messages as read (those from coach)
                await supabase
                    .from('chat_messages')
                    .update({ is_read: true })
                    .eq('conversation_id', convId)
                    .eq('sender_id', coachId) // Messages sent BY coach
                    .eq('is_read', false);

            } catch (error) {
                console.error('Error loading chat:', error);
                toast({
                    title: "Error",
                    description: "No se pudo cargar el chat",
                    variant: "destructive"
                });
            } finally {
                setLoadingMessages(false);
            }
        };

        if (!coachLoading && coachId) {
            loadConversation();
        }
    }, [user, coachId, coachLoading, toast]);

    // Realtime Subscription
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`chat:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages(prev => [...prev, newMessage]);

                    // If message is from coach, mark as read
                    if (newMessage.sender_id === coachId) {
                        supabase
                            .from('chat_messages')
                            .update({ is_read: true })
                            .eq('id', newMessage.id);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId, coachId]);

    // Scroll to bottom
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (!loadingMessages && messages.length > 0) {
            // Use auto for instant jump on load, smooth for updates
            scrollToBottom('auto');
            // Small timeout to ensure rendering is complete
            setTimeout(() => scrollToBottom('smooth'), 100);
        }
    }, [messages.length, loadingMessages]);

    const handleSend = async (attachmentUrl?: string, type: 'text' | 'image' | 'video' | 'file' = 'text') => {
        if ((!inputValue.trim() && !attachmentUrl) || !conversationId || !user || sending) return;

        try {
            setSending(true);
            const content = inputValue.trim();
            setInputValue(''); // Clear immediately for UX

            const messageData = {
                conversation_id: conversationId,
                sender_id: user.id,
                content: content || (type === 'image' ? '📷 Imagen' : type === 'video' ? '🎥 Video' : '📎 Archivo'),
                message_type: type,
                attachment_url: attachmentUrl || null
            };

            const { error } = await supabase
                .from('chat_messages')
                .insert(messageData);

            if (error) throw error;

            // Update conversation timestamp
            await supabase
                .from('conversations')
                .update({
                    last_message_at: new Date().toISOString(),
                    last_message_preview: type === 'text' ? content.substring(0, 50) : `[${type}]`
                })
                .eq('id', conversationId);

        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Error",
                description: "No se pudo enviar el mensaje",
                variant: "destructive"
            });
            if (!attachmentUrl) setInputValue(inputValue); // Use state value instead of local const
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';

        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            toast({
                title: "Archivo muy grande",
                description: "El tamaño máximo es de 50MB",
                variant: "destructive"
            });
            return;
        }

        try {
            setIsUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
            const filePath = `${conversationId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('chat-attachments')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('chat-attachments')
                .getPublicUrl(filePath);

            let type: 'image' | 'video' | 'file' = 'file';
            if (file.type.startsWith('image/')) type = 'image';
            else if (file.type.startsWith('video/')) type = 'video';

            await handleSend(publicUrl, type);

        } catch (error) {
            console.error('Error uploading file:', error);
            toast({
                title: "Error",
                description: "No se pudo subir el archivo",
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (coachLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!coachId) {
        return (
            <div className="h-screen bg-background flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold mb-2">No tienes entrenador asignado</h2>
                <Button onClick={() => navigate('/')}>Volver al inicio</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[100dvh] bg-background fixed inset-0">
            {/* Header - Safe Area Top aware */}
            <div
                className="flex items-center p-4 bg-background z-10 border-b border-border/10"
                style={{ marginTop: 'max(var(--safe-area-inset-top), 50px)' }}
            >
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
                    <ArrowLeft className="h-6 w-6" />
                </Button>

                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage src={coachProfile?.avatar_url} />
                        <AvatarFallback>{coachProfile?.first_name?.[0] || 'C'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="font-semibold text-sm">Chat con Entrenador</h1>
                        <p className="text-xs text-muted-foreground">{coachProfile?.first_name ? coachProfile.first_name : 'Entrenador'}</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground mt-10">
                        <p>Comienza la conversación con tu entrenador.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === user?.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${isMe
                                        ? 'bg-primary text-primary-foreground rounded-br-none'
                                        : 'bg-muted text-foreground rounded-bl-none'
                                        }`}
                                >
                                    {/* Content Rendering based on Type */}
                                    {msg.message_type === 'image' && msg.attachment_url && (
                                        <div className="mb-2 rounded-lg overflow-hidden cursor-pointer" onClick={() => setPreviewImage(msg.attachment_url || null)}>
                                            <img src={msg.attachment_url} alt="Adjunto" className="max-w-full h-auto max-h-[200px] object-cover" />
                                        </div>
                                    )}

                                    {msg.message_type === 'video' && msg.attachment_url && (
                                        <div className="mb-2 rounded-lg overflow-hidden">
                                            <video src={msg.attachment_url} controls className="max-w-full max-h-[200px]" />
                                        </div>
                                    )}

                                    {msg.message_type === 'file' && msg.attachment_url && (
                                        <a
                                            href={msg.attachment_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 p-2 rounded-lg mb-2 transition-colors ${isMe ? 'bg-primary-foreground/10 hover:bg-primary-foreground/20' : 'bg-background/50 hover:bg-background/80'}`}
                                        >
                                            <FileText className="h-5 w-5" />
                                            <span className="text-sm underline truncate max-w-[150px]">Ver archivo adjunto</span>
                                        </a>
                                    )}

                                    {msg.content && msg.message_type === 'text' && (
                                        <p className="text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                                    )}

                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
                {isUploading && (
                    <div className="flex justify-end">
                        <div className="bg-primary/20 text-primary rounded-2xl rounded-br-none px-4 py-3 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-xs">Subiendo archivo...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - Safe Area Bottom aware */}
            <div
                className="p-3 border-t bg-background z-20"
                style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
                <div className="flex gap-2 items-end">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        accept="image/*,video/*,application/pdf,.doc,.docx"
                    />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full shrink-0 text-muted-foreground hover:text-foreground"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={sending || isUploading}
                    >
                        <Paperclip className="h-5 w-5" />
                    </Button>

                    <div className="flex-1 bg-muted/50 rounded-2xl flex items-center px-3 min-h-[44px]">
                        <textarea
                            placeholder="Mensaje..."
                            value={inputValue}
                            onChange={(e) => {
                                setInputValue(e.target.value);
                                // Auto-grow
                                e.target.style.height = 'inherit';
                                e.target.style.height = `${e.target.scrollHeight}px`;
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            rows={1}
                            className="flex-1 bg-transparent border-none focus:outline-none resize-none py-3 text-sm max-h-[100px]"
                            disabled={sending || isUploading}
                        />
                    </div>

                    <Button
                        size="icon"
                        onClick={() => handleSend()}
                        disabled={(!inputValue.trim() && !isUploading) || sending}
                        className="rounded-full h-11 w-11 shrink-0 shadow-sm"
                    >
                        {sending || isUploading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                            <Send className="h-5 w-5 ml-0.5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Image Preview Modal */}
            <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
                <DialogContent className="max-w-screen-md p-0 overflow-hidden bg-black/90 border-none">
                    <div className="relative w-full h-full flex items-center justify-center p-4">

                        {previewImage && (
                            <img src={previewImage} alt="Full preview" className="max-w-full max-h-[85vh] object-contain" />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CoachChatPage;
