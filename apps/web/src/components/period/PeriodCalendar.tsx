'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PeriodLog, CyclePrediction } from '@/types/period.types';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isoFmt(d: Date) {
  return d.toISOString().split('T')[0];
}

interface CalendarDayInfo {
  isMenstruating: boolean;
  isPredicted: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isPms: boolean;
  isToday: boolean;
  isFuture: boolean;
}

function getDayInfo(
  date: Date,
  logs: PeriodLog[],
  prediction: CyclePrediction | null | undefined
): CalendarDayInfo {
  const iso = isoFmt(date);
  const today = isoFmt(new Date());
  const isFuture = iso > today;

  // Is it within any period log?
  const isMenstruating = logs.some((log) => {
    const start = log.startDate;
    const end = log.endDate ?? (log.isActive ? today : null);
    return end ? iso >= start && iso <= end : iso >= start;
  });

  let isPredicted = false, isFertile = false, isOvulation = false, isPms = false;
  if (prediction && isFuture) {
    const nextStart = prediction.nextPeriodDate;
    const nextEnd = isoFmt(new Date(new Date(nextStart).getTime() + 5 * 86400000));
    isPredicted = iso >= nextStart && iso <= nextEnd;
    isFertile = iso >= prediction.fertileWindowStart && iso <= prediction.fertileWindowEnd;
    isOvulation = iso === prediction.ovulationDate;
    isPms = iso >= prediction.nextPmsWindowStart && iso < nextStart;
  }

  return { isMenstruating, isPredicted, isFertile, isOvulation, isPms, isToday: iso === today, isFuture };
}

interface PeriodCalendarProps {
  logs: PeriodLog[];
  prediction: CyclePrediction | null | undefined;
  onDayClick: (dateIso: string, inPeriod: boolean) => void;
}

export function PeriodCalendar({ logs, prediction, onDayClick }: PeriodCalendarProps) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const MONTH_NAMES = ['January','February','March','April','May','June',
    'July','August','September','October','November','December'];

  return (
    <div className="w-full">
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-white/10 text-text-muted transition-all">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <h3 className="text-base font-display font-bold">{MONTH_NAMES[month]} {year}</h3>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-white/10 text-text-muted transition-all">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-text-muted py-1 font-semibold">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {/* Leading blanks */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`blank-${i}`} />
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const cellDate = new Date(year, month, dayNum);
          const iso = isoFmt(cellDate);
          const info = getDayInfo(cellDate, logs, prediction);

          let bg = 'transparent';
          let textColor = 'text-text-primary';
          let border = 'border-transparent';
          let opacity = 'opacity-100';
          let dot = '';

          if (info.isMenstruating) {
            bg = 'rgba(255,95,126,0.2)';
            textColor = 'text-bio-coral';
            dot = '#FF5F7E';
          } else if (info.isOvulation) {
            bg = 'rgba(255,209,102,0.2)';
            textColor = 'text-bio-gold';
            dot = '#FFD166';
          } else if (info.isFertile) {
            bg = 'rgba(0,255,209,0.12)';
            textColor = 'text-bio-teal';
          } else if (info.isPredicted) {
            border = 'border-bio-coral/40';
            textColor = 'text-bio-coral';
            opacity = 'opacity-70';
          } else if (info.isPms) {
            bg = 'rgba(155,93,229,0.1)';
            textColor = 'text-bio-violet';
          }

          if (info.isFuture && !info.isPredicted && !info.isFertile && !info.isOvulation && !info.isPms) {
            opacity = 'opacity-40';
          }

          return (
            <button
              key={iso}
              onClick={() => onDayClick(iso, info.isMenstruating || info.isPms)}
              className={`relative flex flex-col items-center justify-center h-9 rounded-lg border transition-all hover:bg-white/10 ${textColor} ${border} ${opacity}`}
              style={{ background: bg }}
            >
              {info.isToday && (
                <div className="absolute inset-0 rounded-lg ring-2 ring-bio-teal/60 ring-offset-0" />
              )}
              <span className="text-xs font-mono z-10">{dayNum}</span>
              {dot && (
                <div
                  className="w-1 h-1 rounded-full mt-0.5 z-10"
                  style={{ background: dot }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 text-xs text-text-muted">
        {[['#FF5F7E', 'Period'], ['#00FFD1', 'Fertile'], ['#FFD166', 'Ovulation'], ['#9B5DE5', 'PMS']].map(
          ([color, label]) => (
            <span key={label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              {label}
            </span>
          )
        )}
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm border border-dashed border-bio-coral/40" />
          Predicted
        </span>
      </div>
    </div>
  );
}
