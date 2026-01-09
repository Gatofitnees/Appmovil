import React from "react";
import { Play, Clock, CheckCircle2, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Capacitor } from "@capacitor/core";


interface ScheduledVideoModalProps {
    video: {
        id?: string;
        task_id?: string;
        title: string;
        description?: string;
        youtube_url?: string;
        youtube_video_id?: string;
        is_completed?: boolean;
        // Alias para compatibilidad con el patrón que funciona
        libraryVideo?: {
            youtube_video_id?: string;
            title?: string;
            description?: string;
        };
    };
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (taskId: string) => Promise<void>;
}

const ScheduledVideoModal: React.FC<ScheduledVideoModalProps> = ({ video, isOpen, onClose, onComplete }) => {
    // Usar youtube_video_id directamente desde video o desde video.libraryVideo si existe
    const youtubeVideoId = video.youtube_video_id || video.libraryVideo?.youtube_video_id;
    const videoTitle = video.title || video.libraryVideo?.title || 'Video';
    const videoDescription = video.description || video.libraryVideo?.description;
    const [submitting, setSubmitting] = React.useState(false);
    const embedUrl = youtubeVideoId
        ? `https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&playsinline=1&modestbranding=1&rel=0&origin=${encodeURIComponent(window.location.origin)}`
        : null;

    console.log("🎬 ScheduledVideoModal - Video data:", {
        video,
        youtubeVideoId,
        videoTitle,
        videoDescription
    });

    const handleComplete = async () => {
        if (!onComplete) return;
        try {
            setSubmitting(true);
            await onComplete(video.task_id || "");
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const isWeb = Capacitor.getPlatform() === "web";
    const playerRef = React.useRef<HTMLDivElement>(null);

    // Plan B: Standard Iframe Implementation
    // No native initialization needed, no transparency hack needed.

    // Auto-complete countdown logic remains the same (handled by onComplete button mostly)

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl w-[95vw] bg-[#121212]/95 backdrop-blur-xl border-white/5 text-white p-0 overflow-hidden rounded-[2.5rem] shadow-2xl [&>button.absolute]:hidden">
                {/* Visual Header */}
                <div className="p-6 pb-0 flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                <Play className="w-4 h-4 text-white fill-current translate-x-0.5" />
                            </div>
                        </div>
                        <div>
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-white tracking-tight">{videoTitle}</DialogTitle>
                                <DialogDescription className="sr-only">
                                    Visualización del video programado: {videoTitle}
                                </DialogDescription>
                            </DialogHeader>
                            <div className={`mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${video.is_completed ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                {video.is_completed ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                {video.is_completed ? "Completado" : "Pendiente"}
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-white/5 rounded-full text-slate-400"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <div className="p-6 pt-4 flex flex-col gap-6">
                    {/* Video Player Card */}
                    <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-inner p-1 relative">
                        <div className="p-3 pb-2 flex items-center gap-2">
                            <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                                <Play className="w-3 h-3 text-red-500 fill-current" />
                            </div>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Video</span>
                        </div>

                        {/* YouTube Video Player */}
                        {youtubeVideoId ? (
                            <div className="space-y-4 p-1">
                                <div className="aspect-video rounded-lg overflow-hidden bg-black/20 relative w-full">
                                    <iframe
                                        className="w-full h-full absolute inset-0 rounded-lg"
                                        src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&playsinline=1&controls=1`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={videoTitle || "Video"}
                                    />
                                </div>
                                {(!isWeb) && (
                                    <button
                                        onClick={() => window.open(`https://www.youtube.com/watch?v=${youtubeVideoId}`, '_system')}
                                        className="text-xs text-muted-foreground underline mt-1 w-full text-center"
                                    >
                                        ¿No carga? Ver en YouTube App
                                    </button>
                                )}
                                {videoDescription && (
                                    <div className="px-3 pb-3">
                                        <p className="text-slate-400 text-sm leading-relaxed antialiased">
                                            {videoDescription}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="aspect-video w-full relative overflow-hidden rounded-2xl bg-black/40">
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-4 p-8 text-center">
                                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-red-500/30 flex items-center justify-center">
                                        <Play className="w-6 h-6 text-red-500/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-300">No se encontró información del video</p>
                                        <p className="text-[10px] opacity-50">No se pudo obtener el ID del video de YouTube</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                    {!video.is_completed && (
                        <Button
                            onClick={handleComplete}
                            disabled={submitting}
                            className="bg-red-600 hover:bg-red-700 text-white h-14 rounded-2xl font-bold text-lg shadow-lg shadow-red-900/20 active:scale-[0.98] transition-all"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                "Completar Video"
                            )}
                        </Button>
                    )}
                </div>
                <div className="h-4 shrink-0" />
            </DialogContent>
        </Dialog>
    );
};

export default ScheduledVideoModal;
