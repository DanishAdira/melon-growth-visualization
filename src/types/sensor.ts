// PiNodeSensorData（既存の listSensorDataByDevice/Plant 由来）と
// daily-sensor-snapshot（Phase 6 追加）の型。

export type SensorData = {
    deviceID: string;
    timestamp: string;
    imageKeys?: string[] | null;
    temperature: number;
    humidity: number;
    i_v_light: number;
    u_v_light: number;
    temperature_hq?: number;
    humidity_hq?: number;
    stem?: number;
    fruit_diagram?: number;
};

export type SensorMetricKey =
    | 'temperature' | 'humidity'
    | 'u_v_light'   | 'i_v_light'
    | 'stem'        | 'fruit_diagram';

export type SensorStatsKey = 'temperature' | 'humidity' | 'i_v_light' | 'u_v_light';

export type SensorMetricConfig = {
    label: string;
    unit: string;
    color: string;
    precision: number;
};

// ─── daily-sensor-snapshot ─────────────────────────────────
export type AggregationLevel = 'FIELD' | 'SECTION' | 'PLANT';

export interface SensorStats {
    min?: number;
    max?: number;
    mean?: number;
    median?: number;
    sum?: number;
    count?: number;
}

export type GddOrigin = 'FromPollination' | 'FromThinning' | 'FromNetOnset';

export interface GddEntry {
    origin: GddOrigin;
    value: number;
    coverageStart: string;
}

export interface DailySensorSnapshot {
    aggregationKey: string;
    dateJST: string;
    level: AggregationLevel;

    fieldID?: string;
    sectionID?: string;
    plantID?: string;
    deviceID?: string;

    sampleCount?: number;

    temperature?: SensorStats;
    humidity?: SensorStats;
    i_v_light?: SensorStats;
    u_v_light?: SensorStats;

    dailyGrowingDegreeDays?: number;
    GrowingDegreeDays?: GddEntry[];
}