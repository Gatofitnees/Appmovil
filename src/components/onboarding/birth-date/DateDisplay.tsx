
import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface DateDisplayProps {
  date: Date;
  age: number;
}

const DateDisplay: React.FC<DateDisplayProps> = ({ date, age }) => {
  return (
    <div className="mt-8 text-center p-6 rounded-xl bg-secondary/20 border border-white/5 backdrop-blur-sm">
      <p className="text-sm text-muted-foreground mb-1">Tu edad</p>
      <p className="text-3xl font-bold text-primary">
        {age} años
      </p>
      <p className="text-sm text-muted-foreground mt-2">
        {format(date, "PPP", { locale: es })}
      </p>
    </div>
  );
};

export default DateDisplay;
