
import React, { useState } from "react";
import { Play, ClipboardCheck, FileText, ChevronRight } from "lucide-react";
import { Card } from "@/components/Card";
import { cn } from "@/lib/utils";
import { useAssignedLibraryItems, AssignedLibraryItem } from "@/hooks/useAssignedLibraryItems";
import ScheduledVideoModal from "@/components/ScheduledVideoModal";
import ScheduledSurveyModal from "@/components/ScheduledSurveyModal";
import ScheduledDocumentModal from "@/components/ScheduledDocumentModal";
import { Browser } from '@capacitor/browser';

const AssignedLibraryItems: React.FC = () => {
    const { items, loading } = useAssignedLibraryItems();
    const [selectedItem, setSelectedItem] = useState<AssignedLibraryItem | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    if (loading) {
        return (
            <div className="mt-6 space-y-3">
                <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2].map((i) => (
                        <div key={i} className="min-w-[200px] h-24 bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }



    if (items.length === 0) return null;


    const handleOpenItem = async (item: AssignedLibraryItem) => {
        if (item.type === 'document' && item.file_url) {
            console.log("📄 Opening document:", item.file_url);
            try {
                // Primero intentamos la experiencia nativa (SFSafariViewController / Custom Tabs)
                await Browser.open({
                    url: item.file_url,
                    presentationStyle: 'fullscreen'
                });
            } catch (error) {
                console.error("❌ Error opening document with Browser plugin:", error);
                // Fallback: Abrir en el navegador del sistema (Safari/Chrome externo)
                // Esto casi siempre funciona si la URL es válida
                console.log("🔄 Attempting fallback to system browser (window.open)...");
                window.open(item.file_url, '_system');
            }
            return;
        }
        setSelectedItem(item);
        setModalOpen(true);
    };

    const renderIcon = (type: string) => {
        switch (type) {
            case 'video':
                return (
                    <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-xl border border-red-500/20">
                        <Play className="w-5 h-5 text-red-400 fill-current" />
                    </div>
                );
            case 'survey':
                return (
                    <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl border border-cyan-500/20">
                        <ClipboardCheck className="w-5 h-5 text-cyan-400" />
                    </div>
                );
            case 'document':
                return (
                    <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-500/20">
                        <FileText className="w-5 h-5 text-amber-400" />
                    </div>
                );
            default: return null;
        }
    };
    return (
        <div className="mt-8 mb-4">
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">Biblioteca</h2>
                    <div className="px-2 py-0.5 bg-white/10 rounded-full border border-white/5">
                        <span className="text-[10px] text-slate-300 font-bold">{items.length}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4">
                {items.map((item) => (
                    <Card
                        key={item.id}
                        onClick={() => handleOpenItem(item)}
                        className={cn(
                            "min-w-[280px] max-w-[280px] p-0 bg-[#1c1c1e]/40 border-white/5 hover:bg-white/5 transition-all duration-300",
                            "cursor-pointer group rounded-[24px] overflow-hidden relative backdrop-blur-sm"
                        )}
                    >
                        <div className="p-5 flex flex-col h-full gap-4">
                            <div className="flex items-start justify-between">
                                {renderIcon(item.type)}
                                <div className="mt-2 p-1 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-all transform group-hover:translate-x-0.5" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <h3 className="font-bold text-base text-white line-clamp-1 group-hover:text-primary transition-colors">
                                    {item.title}
                                </h3>
                                {item.description && (
                                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                        {item.description}
                                    </p>
                                )}
                            </div>

                            <div className="mt-auto pt-2 flex items-center gap-2">
                                <div className={cn(
                                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                                    item.type === 'video' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                                        item.type === 'survey' ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
                                            "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                )}>
                                    {item.type === 'video' ? 'Video' : item.type === 'survey' ? 'Encuesta' : 'Documento'}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Modals */}
            {selectedItem && selectedItem.type === 'video' && (
                <ScheduledVideoModal
                    video={{
                        title: selectedItem.title,
                        description: selectedItem.description || undefined,
                        youtube_url: selectedItem.youtube_url || undefined,
                        youtube_video_id: selectedItem.youtube_video_id || undefined,
                        is_completed: false
                    }}
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                />
            )}

            {selectedItem && selectedItem.type === 'survey' && (
                <ScheduledSurveyModal
                    survey={{
                        id: selectedItem.survey_id!,
                        task_id: "",
                        title: selectedItem.title,
                        description: selectedItem.description || undefined,
                        is_completed: false
                    }}
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                />
            )}

            {/* Document Modal Removed - opening directly as requested */}
        </div>
    );
};

export default AssignedLibraryItems;
