import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { useExerciseHistory } from "@/hooks/useExerciseHistory";
import Button from "@/components/Button";
import { Calendar, Dumbbell, X } from "lucide-react";
import { SessionStats } from "@/features/workout/components/active-workout/SessionStats";
import { DateNavigator } from "@/features/workout/components/active-workout/DateNavigator";
import { ProgressChart } from "@/features/workout/components/active-workout/ProgressChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExerciseHistoryDialogProps {
  exerciseId: number;
  exerciseName: string;
}

const ExerciseHistoryDialog: React.FC<ExerciseHistoryDialogProps> = ({
  exerciseId,
  exerciseName,
}) => {
  const [open, setOpen] = useState(false);
  const { stats, loading, isEmpty } = useExerciseHistory({ exerciseId });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isChangingDate, setIsChangingDate] = useState(false);

  // Group stats.sessions by date
  const historyByDate = stats.sessions.reduce<{ [key: string]: typeof stats.sessions }>((acc, session) => {
    const dateStr = session.date;
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(session);
    return acc;
  }, {});

  const dates = Object.keys(historyByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const sessionDates = stats.sessions.map(session => session.date);

  useEffect(() => {
    if (open && dates.length > 0 && !selectedDate) {
      setSelectedDate(dates[0]);
    }
    if (!open) {
      setSelectedDate(null);
      setIsChangingDate(false);
    }
  }, [open, dates, selectedDate]);

  const handleDateSelect = (date: string) => {
    setIsChangingDate(true);
    setSelectedDate(null);

    setTimeout(() => {
      setSelectedDate(date);
      setIsChangingDate(false);
    }, 150);
  };

  const selectedSession = selectedDate ? historyByDate[selectedDate]?.[0] : null;

  return (
    <>
      <Button
        variant="outline"
        leftIcon={<Calendar className="h-4 w-4" />}
        onClick={() => setOpen(true)}
        className="w-full"
      >
        Ver historial de entrenamiento
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md mx-auto max-h-[85vh] p-0 overflow-hidden flex flex-col gap-0 border border-white/5 bg-zinc-950">
          <DialogHeader className="p-6 pb-4 shrink-0 z-10 bg-zinc-950 border-b border-white/5 flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="text-base font-semibold text-center flex-1 ml-6">
              Historial de {exerciseName}
            </DialogTitle>
            <button
              className="text-muted-foreground hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
              </div>
            ) : isEmpty ? (
              <div className="text-center py-8 text-muted-foreground">
                <Dumbbell className="mx-auto h-12 w-12 mb-3 opacity-20" />
                <p>No hay historial registrado para este ejercicio</p>
                <p className="text-sm mt-2">
                  Cuando registres un entrenamiento con este ejercicio, el historial aparecerá aquí
                </p>
              </div>
            ) : (
              <div className="py-4 space-y-6">
                {/* Best Marks */}
                <div className="bg-secondary/20 rounded-lg border border-white/10 p-4">
                  <h4 className="font-medium mb-3">Mejores marcas</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Peso máximo</p>
                      <p className="text-lg font-bold text-primary">
                        {stats.maxWeight ? `${stats.maxWeight} kg` : '-'}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Reps máximas</p>
                      <p className="text-lg font-bold text-primary">
                        {stats.maxReps || '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="history" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-secondary/20">
                    <TabsTrigger value="history">Historial</TabsTrigger>
                    <TabsTrigger value="progress">Progreso</TabsTrigger>
                  </TabsList>

                  <TabsContent value="history" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Historial reciente</h4>
                      <DateNavigator
                        dates={dates}
                        selectedDate={selectedDate}
                        onDateSelect={handleDateSelect}
                      />
                    </div>

                    {isChangingDate ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : selectedSession ? (
                      <div className="border border-white/10 rounded-lg p-4 bg-secondary/10 fade-in">
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground">
                            Entrenamientos del {selectedDate}
                          </p>
                        </div>
                        <SessionStats session={selectedSession} />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        Selecciona una fecha para ver el detalle
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="progress" className="space-y-4">
                    <ProgressChart data={stats.progressData} />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExerciseHistoryDialog;
