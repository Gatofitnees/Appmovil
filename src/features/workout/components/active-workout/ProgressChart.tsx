
import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

interface ProgressChartProps {
  data: { date: string; maxWeight: number }[];
}

type Timeframe = '1M' | '3M' | '6M' | '1Y' | 'ALL';

export const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('ALL');

  // Filter data based on selected timeframe
  const filteredData = useMemo(() => {
    if (timeframe === 'ALL' || data.length === 0) return data;

    const now = new Date();
    let cutoffDate = new Date();

    switch (timeframe) {
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    return data.filter(item => {
      // Parse DD/MM/YYYY
      const [day, month, year] = item.date.split('/');
      const itemDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return itemDate >= cutoffDate;
    });
  }, [data, timeframe]);

  if (filteredData.length === 0 && data.length > 0) {
    return (
      <div className="space-y-4">
        {renderTimeframeSelector()}
        <div className="text-center text-sm text-muted-foreground py-8">
          No hay datos en este período
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        No hay datos suficientes para mostrar progreso
      </div>
    );
  }

  const maxValue = Math.max(...filteredData.map(d => d.maxWeight));
  const minValue = Math.min(...filteredData.map(d => d.maxWeight));
  const range = maxValue - minValue || 1;

  const chartHeight = 120;
  const chartWidth = 280;
  const padding = 20;

  const getY = (value: number) => {
    return chartHeight - padding - ((value - minValue) / range) * (chartHeight - 2 * padding);
  };

  const getX = (index: number) => {
    return padding + (index / (filteredData.length - 1 || 1)) * (chartWidth - 2 * padding);
  };

  const pathData = filteredData.map((point, index) => {
    const x = getX(index);
    const y = getY(point.maxWeight);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  function renderTimeframeSelector() {
    const options: { label: string; value: Timeframe }[] = [
      { label: '1M', value: '1M' },
      { label: '3M', value: '3M' },
      { label: '6M', value: '6M' },
      { label: '1A', value: '1Y' },
      { label: 'Todo', value: 'ALL' },
    ];

    return (
      <div className="flex items-center justify-between bg-secondary/20 p-1 rounded-md mb-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTimeframe(opt.value)}
            className={cn(
              "flex-1 text-xs py-1.5 rounded-sm transition-colors font-medium",
              timeframe === opt.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-white"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {renderTimeframeSelector()}
      <h5 className="text-sm font-medium">Progreso de peso máximo</h5>

      <div className="bg-secondary/10 rounded-lg p-4">
        <svg
          width={chartWidth}
          height={chartHeight}
          className="w-full h-auto"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        >
          {/* Grid lines */}
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padding}
              y1={padding + ratio * (chartHeight - 2 * padding)}
              x2={chartWidth - padding}
              y2={padding + ratio * (chartHeight - 2 * padding)}
              stroke="hsl(var(--border))"
              strokeOpacity="0.3"
              strokeWidth="1"
            />
          ))}

          {/* Progress line */}
          {filteredData.length > 1 && (
            <path
              d={pathData}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {filteredData.map((point, index) => (
            <circle
              key={index}
              cx={getX(index)}
              cy={getY(point.maxWeight)}
              r="4"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth="2"
            />
          ))}
        </svg>

        {/* Legend */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{filteredData[0]?.date}</span>
          <span>{filteredData[filteredData.length - 1]?.date}</span>
        </div>
      </div>

      <div className="flex justify-between text-xs">
        <div>
          <span className="text-muted-foreground">Mín: </span>
          <span className="font-medium">{minValue} kg</span>
        </div>
        <div>
          <span className="text-muted-foreground">Máx: </span>
          <span className="font-medium">{maxValue} kg</span>
        </div>
      </div>
    </div>
  );
};
