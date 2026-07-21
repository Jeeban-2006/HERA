import { PCODAnalysisResult } from "@/types/pcod.types";
import { CorrelationResult } from "@/types/mood.types";
import { RouteResult } from "@/types/safety.types";

export function transformPCODResponse(raw: any): PCODAnalysisResult {
  return {
    subtype: raw.subtype,
    subtypeLabel: raw.subtype_label ?? raw.subtypeLabel,
    riskScore: raw.risk_score ?? raw.riskScore,
    confidence: raw.confidence,
    drivers: (raw.drivers ?? raw.driver_breakdown ?? []).map((d: any) => ({
      label: d.label, 
      value: d.value, 
      color: d.color,
    })),
    recommendations: (raw.recommendations ?? []).map((r: any) => ({
      category: r.category, 
      title: r.title, 
      desc: r.desc,
      priority: r.priority,
      iconName: r.icon_name ?? r.iconName,
    })),
    labFlags: (raw.lab_flags ?? raw.labFlags ?? []).map((f: any) => ({
      marker: f.marker, 
      value: f.value, 
      status: f.status, 
      range: f.range,
    })),
  };
}

export function transformCorrelationResponse(raw: any): CorrelationResult {
  return {
    correlationScore: raw.correlation_score ?? raw.correlationScore,
    patternDetected: raw.pattern_detected ?? raw.patternDetected,
    phaseAverages: (raw.phase_averages ?? raw.phaseAverages ?? []).map((p: any) => ({
      phase: p.phase, 
      avgMood: p.avg_mood ?? p.avgMood, 
      avgEnergy: p.avg_energy ?? p.avgEnergy,
      daysLogged: p.days_logged ?? p.daysLogged,
    })),
    pmsDays: raw.pms_days ?? raw.pmsDays ?? [],
    peakEnergyWindow: {
      startDay: raw.peak_energy_window?.start_day ?? raw.peakEnergyWindow?.startDay,
      endDay: raw.peak_energy_window?.end_day ?? raw.peakEnergyWindow?.endDay,
    },
    insights: (raw.insights ?? []).map((i: any) => ({
      type: i.type,
      title: i.title,
      message: i.message,
      confidence: i.confidence,
      sparkline: i.sparkline,
    })),
    trendData: (raw.trend_data ?? raw.trendData ?? []).map((t: any) => ({
      date: t.date, 
      moodScore: t.mood_score ?? t.moodScore,
      moodState: t.mood_state ?? t.moodState,
      energyLevel: t.energy_level ?? t.energyLevel,
      cycleDay: t.cycle_day ?? t.cycleDay,
      phase: t.phase,
    })),
  };
}

export function transformRouteResponse(raw: any): RouteResult {
  return { 
    safestRoute: {
      ...raw.safest_route,
      safetyScore: raw.safest_route?.safety_score ?? raw.safest_route?.safetyScore,
      signals: (raw.safest_route?.signals ?? []).map((s: any) => ({
        ...s,
        iconName: s.icon_name ?? s.iconName
      }))
    }, 
    fastestRoute: {
      ...raw.fastest_route,
      safetyScore: raw.fastest_route?.safety_score ?? raw.fastest_route?.safetyScore,
      signals: (raw.fastest_route?.signals ?? []).map((s: any) => ({
        ...s,
        iconName: s.icon_name ?? s.iconName
      }))
    }
  };
}
