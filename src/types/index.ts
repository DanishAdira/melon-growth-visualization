// src/types/index.ts

export interface MelonInfo {
  id: string;
  season: string;
  pollinationDate: string;
  deviceID_cameraID: string;
}

export interface MetricParams {
  L: number;
  k: number;
  t0: number;
}

export interface IdealModel {
  metric_name: string;
  parameters: MetricParams;
}

export interface DailyMetrics {
  density: number;
  branch_points: number;
  estimated_volume_px3: number;
  h_component_px: number;
  v_component_px: number;
  [key: string]: number;
}

export interface GrowthSummary {
  targetDate: string;
  dap: number;
  actual_metrics: DailyMetrics;
  deviation: DailyMetrics;
}