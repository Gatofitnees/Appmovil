import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Clock,
  Target,
  Eye,
  Play,
  CheckCircle2,
  Apple,
  Video as VideoIcon,
  FileText,
  ClipboardCheck,
  Activity,
  Loader2,
  ExternalLink
} from "lucide-react";
import { Browser } from '@capacitor/browser';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedProgramData } from "@/hooks/useActiveProgramUnified";
import ScheduledVideoModal from "./ScheduledVideoModal";
import ScheduledSurveyModal from "./ScheduledSurveyModal";
import ScheduledDocumentModal from "./ScheduledDocumentModal";

interface ProgrammedRoutinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (taskId: string) => Promise<void>;
  activeProgram: UnifiedProgramData | null;
  todayRoutines: any[];
  onStartRoutine: (routineId: number) => void;
  selectedDate: Date;
  programType?: 'weekly' | 'gatofit' | 'admin';
}

const ProgrammedRoutinesModal: React.FC<ProgrammedRoutinesModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  activeProgram,
  todayRoutines: initialRoutines,
  onStartRoutine,
  selectedDate: initialSelectedDate,
  programType = 'weekly'
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate);
  const [loading, setLoading] = useState(false);
  const [routines, setRoutines] = useState<any[]>(initialRoutines);
  const [nutritionPlans, setNutritionPlans] = useState<any[]>(activeProgram?.nutritionPlans || []);
  const [videos, setVideos] = useState<any[]>(activeProgram?.videos || []);
  const [documents, setDocuments] = useState<any[]>(activeProgram?.documents || []);
  const [surveys, setSurveys] = useState<any[]>(activeProgram?.surveys || []);
  const [hasEvolution, setHasEvolution] = useState<boolean>(activeProgram?.hasEvolution || false);
  const [completedRoutines, setCompletedRoutines] = useState<Set<number>>(new Set());

  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const fetchRoutinesForDate = async (date: Date) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      let progHasEvolution = false;

      // 0. Fetch ALL scheduled tasks for the date
      const { data: scheduledTasks } = await (supabase
        .from('user_scheduled_tasks' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', dateString) as any);

      // Create a map for quick lookup of existing tasks
      const taskLookup = new Map();
      (scheduledTasks || []).forEach((t: any) => {
        if (t.task_type === 'video' && t.library_video_id) taskLookup.set(`video-${t.library_video_id}`, t);
        if (t.task_type === 'document' && t.library_document_id) taskLookup.set(`doc-${t.library_document_id}`, t);
        if (t.task_type === 'survey' && t.library_survey_id) taskLookup.set(`survey-${t.library_survey_id}`, t);
      });

      // 0.1 Fetch routine details
      let sRoutines = [];
      const sRoutineIds = (scheduledTasks || []).filter((t: any) => t.task_type === 'workout' && t.routine_id).map((t: any) => t.routine_id);
      if (sRoutineIds.length > 0) {
        const { data: rDetails } = await supabase.from('routines').select('*').in('id', sRoutineIds);
        const map = new Map(rDetails?.map((r: any) => [r.id, r]) || []);
        sRoutines = (scheduledTasks || [])
          .filter((t: any) => t.task_type === 'workout' && t.routine_id)
          .map((t: any) => ({
            id: t.id,
            routine_id: t.routine_id,
            routine: map.get(t.routine_id) || { id: t.routine_id, name: t.title, type: 'strength', estimated_duration_minutes: 60 },
            order_in_day: 999,
            notes: t.description,
            is_scheduled_task: true
          }));
      }

      // 0.2 Fetch nutrition details
      let sNutrition = [];
      const sNutritionIds = (scheduledTasks || []).filter((t: any) => t.task_type === 'nutrition' && t.nutrition_plan_id).map((t: any) => t.nutrition_plan_id);
      if (sNutritionIds.length > 0) {
        const { data: nDetails } = await supabase.from('nutrition_plans').select('*').in('id', sNutritionIds);
        const map = new Map(nDetails?.map((n: any) => [n.id, n]) || []);
        sNutrition = (scheduledTasks || [])
          .filter((t: any) => t.task_type === 'nutrition' && t.nutrition_plan_id)
          .map((t: any) => ({ ...map.get(t.nutrition_plan_id), notes: t.description, is_scheduled_task: true }));
      }

      // 0.3 Fetch video details
      let sVideos: any[] = [];
      const svTasks = (scheduledTasks || []).filter((t: any) => t.task_type === 'video');
      const sVideoIds = svTasks.filter((t: any) => t.library_video_id).map((t: any) => t.library_video_id);

      const vDetailsMap = new Map();
      if (sVideoIds.length > 0) {
        const { data: vDetails } = await supabase
          .from('library_videos' as any)
          .select('id, title, description, youtube_url, youtube_video_id, created_at, updated_at, created_by_admin')
          .in('id', sVideoIds);
        vDetails?.forEach((v: any) => vDetailsMap.set(v.id, v));
      }

      sVideos = svTasks.map((t: any) => {
        const video = t.library_video_id ? vDetailsMap.get(t.library_video_id) : null;
        return {
          ...(video || {}),
          id: t.library_video_id || video?.id,
          task_id: t.id,
          is_completed: t.is_completed,
          title: video?.title || t.title || "Video",
          description: video?.description || t.description,
          youtube_url: video?.youtube_url || t.youtube_url,
          youtube_video_id: video?.youtube_video_id || t.youtube_video_id,
          task_type: 'video'
        };
      });

      // 0.4 Fetch document details
      let sDocuments = [];
      const sDocIds = (scheduledTasks || []).filter((t: any) => t.task_type === 'document' && t.library_document_id).map((t: any) => t.library_document_id);
      if (sDocIds.length > 0) {
        const { data: dDetails } = await supabase
          .from('library_documents' as any)
          .select('id, title, description, file_url, created_at, updated_at, created_by_admin')
          .in('id', sDocIds);
        const map = new Map(dDetails?.map((d: any) => [d.id, d]) || []);
        sDocuments = (scheduledTasks || [])
          .filter((t: any) => t.task_type === 'document' && t.library_document_id)
          .map((t: any) => {
            const doc = map.get(t.library_document_id);
            return {
              ...(doc || {}),
              id: t.library_document_id,
              task_id: t.id,
              is_completed: t.is_completed,
              title: doc?.title || t.title,
              description: doc?.description || t.description,
              task_type: 'document'
            };
          });
      }

      // 0.5 Fetch survey details
      let sSurveys = [];
      const sSurveyIds = (scheduledTasks || []).filter((t: any) => t.task_type === 'survey' && t.library_survey_id).map((t: any) => t.library_survey_id);
      if (sSurveyIds.length > 0) {
        const { data: surveyDetails } = await supabase
          .from('library_surveys' as any)
          .select('id, title, description, questions, created_at, updated_at, created_by_admin')
          .in('id', sSurveyIds);
        const map = new Map(surveyDetails?.map((s: any) => [s.id, s]) || []);
        sSurveys = (scheduledTasks || [])
          .filter((t: any) => t.task_type === 'survey' && t.library_survey_id)
          .map((t: any) => {
            const survey = map.get(t.library_survey_id);
            return {
              ...(survey || {}),
              id: t.library_survey_id,
              task_id: t.id,
              is_completed: t.is_completed,
              title: survey?.title || t.title,
              description: survey?.description || t.description,
              task_type: 'survey'
            };
          });
      }

      const hasScheduledEvolution = (scheduledTasks || []).some((t: any) => t.task_type === 'evolution');

      // 1. Fetch program routines and nutrition
      let pRoutines: any[] = [];
      let pNutrition: any[] = [];
      let progDocuments: any[] = [];
      let progVideos: any[] = [];
      let progSurveys: any[] = [];

      if (programType === 'weekly' && activeProgram?.program?.id) {
        const jsDay = date.getDay();
        const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;
        const { data: wr } = await supabase.from('weekly_program_routines').select(`*, routine:routine_id (*)`).eq('program_id', activeProgram.program.id).eq('day_of_week', dayOfWeek);
        pRoutines = wr || [];
      } else if (programType === 'gatofit' && activeProgram?.program?.id) {
        const startDate = new Date(activeProgram?.userProgress?.started_at || "");
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0) {
          const weekNumber = Math.floor(daysDiff / 7) + 1;
          const jsDay = date.getDay();
          const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;
          const { data: gr } = await supabase.from('gatofit_program_routines').select(`*, routine:routine_id (*)`).eq('program_id', activeProgram.program.id).eq('week_number', weekNumber).eq('day_of_week', dayOfWeek);
          pRoutines = gr || [];
        }
      } else if (programType === 'admin' && activeProgram?.program?.id) {
        const normalize = (d: string | Date) => {
          const dd = new Date(d);
          return new Date(dd.getFullYear(), dd.getMonth(), dd.getDate());
        };
        let targetProgramId = activeProgram.program.id;

        let assignment = null;
        if (targetProgramId === 'scheduled') {
          const { data: activeAssignment } = await supabase.from('user_assigned_programs').select('started_at, program_id').eq('user_id', user.id).eq('is_active', true).limit(1).maybeSingle();
          assignment = activeAssignment;
          if (activeAssignment) targetProgramId = activeAssignment.program_id;
        } else {
          const { data: existingAssignment } = await supabase.from('user_assigned_programs').select('started_at').eq('user_id', user.id).eq('program_id', targetProgramId).eq('is_active', true).single();
          assignment = existingAssignment;
        }

        if (assignment) {
          const daysDiff = Math.floor((normalize(date).getTime() - normalize(assignment.started_at).getTime()) / (1000 * 60 * 60 * 24));
          const weekNumber = Math.floor(daysDiff / 7) + 1;
          const jsDay = date.getDay();
          const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

          const { data: ar } = await supabase.from('admin_program_routines').select('*').eq('program_id', targetProgramId).eq('week_number', weekNumber).eq('day_of_week', dayOfWeek);
          if (ar && ar.length > 0) {
            const { data: details } = await supabase.from('routines').select('*').in('id', ar.map(x => x.routine_id));
            const map = new Map(details?.map((rd: any) => [rd.id, rd]) || []);
            pRoutines = ar.map(x => ({ ...x, routine: map.get(x.routine_id) }));
          }

          const { data: an } = await supabase.from('admin_program_nutrition_plans').select('*').eq('program_id', targetProgramId).eq('week_number', weekNumber).eq('day_of_week', dayOfWeek);
          if (an && an.length > 0) {
            const { data: details } = await supabase.from('nutrition_plans').select('*').in('id', an.map(x => x.nutrition_plan_id));
            const map = new Map(details?.map((nd: any) => [nd.id, nd]) || []);
            pNutrition = an.map(x => ({ ...map.get(x.nutrition_plan_id), notes: x.notes, is_program_item: true }));
          }

          // Fetch Admin Program Videos
          const { data: apv } = await supabase.from('admin_program_videos' as any).select('*').eq('program_id', targetProgramId).eq('week_number', weekNumber).eq('day_of_week', dayOfWeek);
          console.log("🐛🐛🐛 Admin Program Videos Found:", apv?.length, apv);

          if (apv && apv.length > 0) {
            const { data: details } = await supabase
              .from('library_videos' as any)
              .select('id, title, description, youtube_url, youtube_video_id, created_at, updated_at, created_by_admin')
              .in('id', apv.map((x: any) => x.library_video_id));
            const map = new Map(details?.map((vd: any) => [vd.id, vd]) || []);
            progVideos = apv.map((x: any) => {
              const video = map.get(x.library_video_id);
              const existingTask = taskLookup.get(`video-${x.library_video_id}`);
              return {
                ...(video || {}),
                id: x.library_video_id || video?.id,
                task_id: existingTask?.id || null,
                is_completed: existingTask?.is_completed || false,
                title: video?.title || "Video",
                description: video?.description || "",
                youtube_url: video?.youtube_url || "",
                youtube_video_id: video?.youtube_video_id || "",
                is_program_item: true,
                task_type: 'video'
              };
            });
          }

          // Fetch Admin Program Documents
          const { data: apd } = await supabase.from('admin_program_documents' as any).select('*').eq('program_id', targetProgramId).eq('week_number', weekNumber).eq('day_of_week', dayOfWeek);

          if (apd && apd.length > 0) {
            const { data: details } = await supabase
              .from('library_documents' as any)
              .select('id, title, description, file_url, created_at, updated_at, created_by_admin')
              .in('id', apd.map((x: any) => x.library_document_id));
            const map = new Map(details?.map((dd: any) => [dd.id, dd]) || []);
            progDocuments = apd.map((x: any) => {
              const doc = map.get(x.library_document_id);
              const existingTask = taskLookup.get(`doc-${x.library_document_id}`);
              return {
                ...(doc || {}),
                id: x.library_document_id || doc?.id,
                task_id: existingTask?.id || null,
                is_completed: existingTask?.is_completed || false,
                title: doc?.title || "Documento",
                description: doc?.description || "",
                file_url: doc?.file_url || "",
                is_program_item: true,
                task_type: 'document'
              };
            });
          }

          // Fetch Admin Program Surveys
          const { data: aps } = await supabase.from('admin_program_surveys' as any).select('*').eq('program_id', targetProgramId).eq('week_number', weekNumber).eq('day_of_week', dayOfWeek);

          if (aps && aps.length > 0) {
            const { data: details } = await supabase
              .from('library_surveys' as any)
              .select('id, title, description, questions, created_at, updated_at, created_by_admin')
              .in('id', aps.map((x: any) => x.library_survey_id));
            const map = new Map(details?.map((sd: any) => [sd.id, sd]) || []);
            progSurveys = aps.map((x: any) => {
              const survey = map.get(x.library_survey_id);
              const existingTask = taskLookup.get(`survey-${x.library_survey_id}`);
              return {
                ...(survey || {}),
                id: x.library_survey_id || survey?.id,
                task_id: existingTask?.id || null,
                is_completed: existingTask?.is_completed || false,
                title: survey?.title || "Encuesta",
                description: survey?.description || "",
                questions: survey?.questions || [],
                is_program_item: true,
                task_type: 'survey'
              };
            });
          }

          // Fetch Admin Program Evolution
          // Fetch Admin Program Evolution
          const { data: ape } = await supabase.from('admin_program_evolutions').select('*').eq('program_id', targetProgramId).eq('week_number', weekNumber).eq('day_of_week', dayOfWeek).limit(1);
          if (ape && ape.length > 0) {
            progHasEvolution = true;
          }
        }
      }


      console.log("🟢🟢🟢 About to setVideos. sVideos:", sVideos);
      console.log("🟢🟢🟢 About to setVideos. progVideos:", progVideos);
      const combinedVideos = [...sVideos, ...progVideos];
      console.log("🟢🟢🟢 Combined videos to set in state:", combinedVideos);
      setVideos(combinedVideos);
      setDocuments([...sDocuments, ...progDocuments]);
      setSurveys([...sSurveys, ...progSurveys]);
      setRoutines([...pRoutines, ...sRoutines]);
      setNutritionPlans([...pNutrition, ...sNutrition]);
      setHasEvolution(hasScheduledEvolution || progHasEvolution);

      const { data: logs } = await supabase.from('workout_logs').select('routine_id').eq('user_id', user.id).gte('workout_date', `${dateString}T00:00:00.000Z`).lte('workout_date', `${dateString}T23:59:59.999Z`);
      setCompletedRoutines(new Set((logs || []).map(l => l.routine_id)));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching routines/activities:", error);
      setLoading(false);
    }
  };

  const handleToggleTaskCompletion = async (taskId: string | null, metadata?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Normalize taskId: treating empty strings or undefined as null
      const normalizedTaskId = (taskId === "" || taskId === undefined) ? null : taskId;
      let effectiveTaskId = normalizedTaskId;

      if (!normalizedTaskId && metadata) {
        // We need to create the task first
        const dateString = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

        console.log("📝 Creating new task for program item:", { metadata, dateString });

        const { data: newTask, error: insertError } = await supabase
          .from('user_scheduled_tasks' as any)
          .insert({
            user_id: user.id,
            scheduled_date: dateString,
            task_type: metadata.task_type,
            title: metadata.title,
            library_video_id: metadata.task_type === 'video' ? metadata.id : null,
            library_document_id: metadata.task_type === 'document' ? metadata.id : null,
            library_survey_id: metadata.task_type === 'survey' ? metadata.id : null,
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error("❌ Error inserting new task:", insertError);
          throw insertError;
        }

        console.log("✅ Task created successfully:", newTask);
        effectiveTaskId = newTask.id;
      } else if (normalizedTaskId) {
        // Update existing task
        console.log("📝 Updating existing task completion:", normalizedTaskId);
        const { error } = await supabase
          .from('user_scheduled_tasks' as any)
          .update({
            is_completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', normalizedTaskId)
          .eq('user_id', user.id);

        if (error) {
          console.error("❌ Error updating existing task:", error);
          throw error;
        }
        console.log("✅ Task updated successfully:", normalizedTaskId);
      }

      if (!effectiveTaskId) {
        console.warn("⚠️ No effectiveTaskId found after completion toggle");
        return;
      }

      // Update local state to reflect completion immediately
      const matchCondition = (item: any) =>
        (normalizedTaskId && item.task_id === normalizedTaskId) ||
        (metadata && item.id === metadata.id && item.task_type === metadata.task_type);

      setVideos(prev => prev.map(v => matchCondition(v) ? { ...v, is_completed: true, task_id: effectiveTaskId as string } : v));
      setDocuments(prev => prev.map(d => matchCondition(d) ? { ...d, is_completed: true, task_id: effectiveTaskId as string } : d));
      setSurveys(prev => prev.map(s => matchCondition(s) ? { ...s, is_completed: true, task_id: effectiveTaskId as string } : s));

      // Update secondary modals
      const updateRef = (prev: any) => (prev && matchCondition(prev)) ? { ...prev, is_completed: true, task_id: effectiveTaskId as string } : prev;
      setSelectedVideo(updateRef);
      setSelectedDocument(updateRef);
      setSelectedSurvey(updateRef);

      if (onComplete) {
        await onComplete(effectiveTaskId);
      }
    } catch (error) {
      console.error("🚨 Error updating task completion:", error);
    }
  };

  const handleStartRoutine = (routine: any) => {
    onStartRoutine(routine.routine_id);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedDate(initialSelectedDate);
      fetchRoutinesForDate(initialSelectedDate);
    }
  }, [isOpen, initialSelectedDate]);

  const navDate = (offset: number) => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + offset);
    setSelectedDate(next);
    fetchRoutinesForDate(next);
  };

  if (!isOpen || !activeProgram) return null;

  const totalItems = routines.length + nutritionPlans.length + videos.length + documents.length + surveys.length + (hasEvolution ? 1 : 0);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl w-[95vw] bg-black/60 backdrop-blur-2xl border-white/10 text-white p-0 overflow-hidden rounded-3xl sm:rounded-3xl shadow-2xl">
          <VisuallyHidden>
            <DialogTitle>Actividades Programadas</DialogTitle>
            <DialogDescription>Listado de tareas, rutinas y actividades asignadas para el día seleccionado.</DialogDescription>
          </VisuallyHidden>
          <div className="flex flex-col h-full max-h-[92vh]">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/5">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">Actividades</DialogTitle>
                <DialogDescription className="text-slate-400">Tus tareas programadas para hoy</DialogDescription>
              </DialogHeader>

              <div className="flex items-center justify-between bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
                <button
                  onClick={() => navDate(-1)}
                  className="p-3 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-tighter mb-0.5">
                    {new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(selectedDate)}
                  </p>
                  <p className="text-xl font-black tracking-tight">
                    {new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(selectedDate)}
                  </p>
                  {selectedDate.toDateString() === new Date().toDateString() && (
                    <div className="mt-1">
                      <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20">Hoy</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navDate(1)}
                  className="p-3 hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : totalItems === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                  <p className="text-slate-400">No hay actividades programadas</p>
                </div>
              ) : (
                <>
                  {hasEvolution && (
                    <section>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Evolución</h3>
                      <div className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center justify-between backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                            <Activity className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-base">Registrar evolución</h4>
                            <p className="text-xs text-slate-400">Actualiza tus datos físicos</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => window.location.href = '/profile/body-measurements'}
                          className="bg-purple-600 hover:bg-purple-700 h-11 px-6 rounded-xl font-bold transition-all active:scale-95"
                        >
                          Registrar
                        </Button>
                      </div>
                    </section>
                  )}

                  {routines.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Entrenamiento</h3>
                      <div className="space-y-4">
                        {routines.map((item, idx) => (
                          <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-sm">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
                                <Dumbbell className="w-6 h-6 text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-base line-clamp-1">{item.routine?.name}</h4>
                                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">
                                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md"><Clock className="w-3 h-3" /> {item.routine?.estimated_duration_minutes}m</span>
                                  <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md"><Target className="w-3 h-3" /> {item.routine?.type}</span>
                                </div>
                              </div>
                              {completedRoutines.has(item.routine_id) && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <Button variant="outline" className="h-11 border-white/10 rounded-xl gap-2 text-xs hover:bg-white/5 transition-all" onClick={() => window.location.href = `/workouts/details/${item.routine_id}`}>
                                <Eye className="w-4 h-4" /> Detalle
                              </Button>
                              <Button className="h-11 bg-blue-600 hover:bg-blue-700 rounded-xl gap-2 text-xs font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20" onClick={() => handleStartRoutine(item)}>
                                <Play className="w-4 h-4" /> Iniciar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {nutritionPlans.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Nutrición</h3>
                      <div className="space-y-4">
                        {nutritionPlans.map((plan, idx) => (
                          <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center justify-between backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20">
                                <Apple className="w-6 h-6 text-green-400" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-base">{plan.name}</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Plan personalizado</p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              className="border-white/10 h-10 px-6 rounded-xl hover:bg-white/5 transition-all text-sm font-bold"
                              onClick={() => window.location.href = `/nutrition-program`}
                            >
                              Ver Plan
                            </Button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {videos.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Videos</h3>
                      <div className="space-y-4">
                        {videos.map((v, idx) => (
                          <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center justify-between backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                                <VideoIcon className="w-6 h-6 text-red-500" />
                              </div>
                              <h4 className="font-semibold text-base line-clamp-1">{v.title}</h4>
                            </div>
                            <div className="flex items-center gap-3">
                              {v.is_completed ? (
                                <>
                                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                                  <Button
                                    variant="outline"
                                    className="border-white/10 h-10 px-6 rounded-xl hover:bg-white/5 transition-all text-sm font-bold"
                                    onClick={() => setSelectedVideo(v)}
                                  >
                                    Ver
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="border-white/10 h-10 px-6 rounded-xl hover:bg-white/5 transition-all text-sm font-bold"
                                  onClick={() => setSelectedVideo(v)}
                                >
                                  Ver
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {documents.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Documentos</h3>
                      <div className="space-y-4">
                        {documents.map((doc, idx) => (
                          <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center justify-between backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                                <FileText className="w-6 h-6 text-amber-500" />
                              </div>
                              <h4 className="font-semibold text-base line-clamp-1">{doc.title}</h4>
                            </div>
                            <div className="flex items-center gap-3">
                              {doc.is_completed ? (
                                <>
                                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                                  <Button
                                    variant="outline"
                                    className="border-white/10 h-10 px-6 rounded-xl hover:bg-white/5 transition-all text-sm font-bold"
                                    onClick={() => Browser.open({ url: doc.file_url })}
                                  >
                                    Ver
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  variant="outline"
                                  className="border-white/10 h-10 px-6 rounded-xl hover:bg-white/5 transition-all text-sm font-bold"
                                  onClick={() => {
                                    Browser.open({ url: doc.file_url });
                                    handleToggleTaskCompletion(doc.task_id, doc);
                                  }}
                                >
                                  Ver
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {surveys.length > 0 && (
                    <section>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Formularios</h3>
                      <div className="space-y-4">
                        {surveys.map((s, idx) => (
                          <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/5 flex items-center justify-between backdrop-blur-sm">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                                <ClipboardCheck className="w-6 h-6 text-cyan-500" />
                              </div>
                              <h4 className="font-semibold text-base line-clamp-1">{s.title}</h4>
                            </div>
                            <div className="flex items-center gap-3">
                              {s.is_completed ? (
                                <>
                                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                                  <Button
                                    variant="outline"
                                    className="border-white/10 h-10 px-6 rounded-xl hover:bg-white/5 transition-all text-sm font-bold"
                                    onClick={() => setSelectedSurvey(s)}
                                  >
                                    Ver
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  className="bg-cyan-600 hover:bg-cyan-700 h-10 px-6 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-cyan-600/20"
                                  onClick={() => setSelectedSurvey(s)}
                                >
                                  Completar
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Secondary Modals outside the main Dialog to avoid nesting issues */}
      {
        selectedVideo && (
          <ScheduledVideoModal
            isOpen={!!selectedVideo}
            onClose={() => setSelectedVideo(null)}
            video={selectedVideo}
            onComplete={(tid) => handleToggleTaskCompletion(tid, selectedVideo)}
          />
        )
      }

      {/* Document Modal Removed - opening directly */}

      {
        selectedSurvey && (
          <ScheduledSurveyModal
            survey={selectedSurvey}
            isOpen={!!selectedSurvey}
            onClose={() => setSelectedSurvey(null)}
            onComplete={(tid) => handleToggleTaskCompletion(tid, selectedSurvey)}
          />
        )
      }
    </>
  );
};

export default ProgrammedRoutinesModal;
