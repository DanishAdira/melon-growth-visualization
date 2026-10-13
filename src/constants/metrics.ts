import type { SensorMetricKey, SensorMetricConfig } from '../types/sensor';
import type { GrowthMetricKey, GrowthMetricConfig } from '../types/melon';

// ─── センサーメトリクス（Environment モード）───────────────
export const SENSOR_METRICS: Record<SensorMetricKey, SensorMetricConfig> = {
    temperature:   { label: '温度',     unit: '°C', color: '#e74c3c', precision: 2 },
    humidity:      { label: '湿度',     unit: '%',  color: '#3498db', precision: 1 },
    u_v_light:     { label: '外部照度', unit: 'lx', color: '#f39c12', precision: 0 },
    i_v_light:     { label: '内部照度', unit: 'lx', color: '#e67e22', precision: 0 },
    stem:          { label: '茎径',     unit: 'V',  color: '#27ae60', precision: 3 },
    fruit_diagram: { label: '果実径',   unit: 'V',  color: '#8e44ad', precision: 3 },
};
export const SENSOR_METRIC_KEYS = Object.keys(SENSOR_METRICS) as SensorMetricKey[];

// ─── Growth メトリクス（Growth モード）─────────────────────
export const GROWTH_METRICS: Record<GrowthMetricKey, GrowthMetricConfig> = {
    density:       { label: '網目密度',   unit: '',   color: '#82ca9d', precision: 3 },
    branch_points: { label: '分岐点数',   unit: '', color: '#ffc658', precision: 1 },
    v_component:   { label: '網目縦成分', unit: 'px', color: '#387908', precision: 1 },
    h_component:   { label: '網目横成分', unit: 'px', color: '#ff7300', precision: 1 },
    relative_growth: { label: '相対肥大度合い',   unit: 'x',  color: '#8884d8', precision: 2 },
};
export const GROWTH_METRIC_KEYS = Object.keys(GROWTH_METRICS) as GrowthMetricKey[];

// ─── 共通定数 ────────────────────────────────────────────
export const WINDOW_HOURS = 3;
export const WINDOW_MS    = WINDOW_HOURS * 60 * 60 * 1000;
export const HOUR_MS      = 60 * 60 * 1000;
export const DAY_MINUTES  = 24 * 60;
export const MAX_PAGES    = 10;
export const REFRESH_INTERVAL_MS = 30000;

// ─── Growth モード ───────────────────────────────────────
export const MAX_DAP = 65;              // 栽培期間の上限（横軸最大）
export const DEFAULT_IMAGE_TIME = 12;   // 画像時刻のデフォルト
export const IMAGE_HOUR_MIN = 6;
export const IMAGE_HOUR_MAX = 18;