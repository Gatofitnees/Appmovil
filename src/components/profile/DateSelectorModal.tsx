
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DateSelectors from '@/components/onboarding/birth-date/DateSelectors';
import {
    generateDaysValues,
    generateMonthsValues,
    generateYearsValues
} from '@/components/onboarding/birth-date/DateUtils';

interface DateSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (date: Date) => void;
    initialDate?: Date;
}

const DateSelectorModal: React.FC<DateSelectorModalProps> = ({
    isOpen,
    onClose,
    onSelect,
    initialDate
}) => {
    // Calculate min/max dates (16-100 years old range)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 16);

    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 100);

    // Initialize with initialDate or default
    const getInitialState = () => {
        const date = initialDate || new Date(maxDate.getFullYear() - 9, 5, 15);
        return {
            day: date.getDate(),
            month: date.getMonth(),
            year: date.getFullYear()
        };
    };

    const [dateState, setDateState] = useState(getInitialState());

    // Update state when initialDate changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setDateState(getInitialState());
        }
    }, [isOpen, initialDate]);

    const [day, setDay] = useState(dateState.day);
    const [month, setMonth] = useState(dateState.month);
    const [year, setYear] = useState(dateState.year);

    // Sync internal state with prop changes
    useEffect(() => {
        setDay(dateState.day);
        setMonth(dateState.month);
        setYear(dateState.year);
    }, [dateState]);

    // Generate selector values
    const daysValues = generateDaysValues();
    const monthsValues = generateMonthsValues();
    const yearsValues = generateYearsValues(minDate, maxDate);

    const handleSave = () => {
        // Validate day based on month/year
        let adjustedDay = day;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        if (day > daysInMonth) {
            adjustedDay = daysInMonth;
        }

        const selectedDate = new Date(year, month, adjustedDay);
        onSelect(selectedDate);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[96%] max-w-[400px] rounded-xl border-zinc-800 bg-zinc-950/95 backdrop-blur-xl p-6">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-center text-xl font-bold">Fecha de Nacimiento</DialogTitle>
                    <DialogDescription className="sr-only">
                        Selecciona tu fecha de nacimiento utilizando los rodillos para día, mes y año.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 flex justify-center w-full">
                    <div className="w-full">
                        <DateSelectors
                            day={day}
                            month={month}
                            year={year}
                            setDay={setDay}
                            setMonth={setMonth}
                            setYear={setYear}
                            daysValues={daysValues}
                            monthsValues={monthsValues}
                            yearsValues={yearsValues}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1">
                        Cancelar
                    </Button>
                    <Button onClick={handleSave} className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
                        Confirmar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default DateSelectorModal;
