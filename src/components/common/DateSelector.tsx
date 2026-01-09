import React from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DateSelectorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateChange }) => {
    const handlePrevDay = () => {
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        onDateChange(prev);
    };

    const handleNextDay = () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        onDateChange(next);
    };

    const handleToday = () => {
        onDateChange(new Date());
    };

    const formatDate = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('es-ES', options).replace('.', '');
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    return (
        <div className="flex items-center justify-between bg-card text-card-foreground p-2 rounded-lg mb-4 border shadow-sm">
            <Button variant="ghost" size="icon" onClick={handlePrevDay}>
                <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex flex-col items-center">
                <span className="text-sm font-medium capitalize">{formatDate(selectedDate)}</span>
                {!isToday(selectedDate) && (
                    <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-primary"
                        onClick={handleToday}
                    >
                        Volver a Hoy
                    </Button>
                )}
            </div>

            <Button variant="ghost" size="icon" onClick={handleNextDay}>
                <ChevronRight className="h-5 w-5" />
            </Button>
        </div>
    );
};

export default DateSelector;
