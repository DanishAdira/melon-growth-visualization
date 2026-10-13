// Phase 6 GraphQL スキーマに対応する Growth モード用の型。

export type HdrKey = string;  // "1", "2", "3", "4",

export interface Melon {
    melonID: string;
    fieldID: string;
    sectionID: string;
    plantID: string;
    deviceID: string;
    cameraID: HdrKey;
    deviceCameraID: string;
    projectID?: string;
    season: string;
    variety?: string;
    status: string;

    pollinationDate?: string;
    thinningDate?: string;
    harvestDate?: string;

    netDetectionStatus?: 'pending' | 'detected' | string;
    netOnsetAt?: string;
    netOnsetDaysAfterPollination?: number;

    updatedAt?: string;

    baseline_estimated_volume?: number;
    baseline_capturedAt?: string;
    baseline_sample_count?: number;
    baselineComputedAt?: string;

}

export interface IdealGrowthParams {
    L: number;
    k: number;
    t0: number;
}

export interface IdealGrowthModel {
    season: string;
    metric: string;
    parameters: IdealGrowthParams;
    r2_score?: number;
    updatedAt?: string;
}

// 時次 / 日次 共通で使う Growth メトリクスキー
export type GrowthMetricKey =
    | 'density'
    | 'branch_points'
    | 'v_component'
    | 'h_component'
    | 'relative_growth';
    
export interface HourlyMelonSnapshot {
    melonID: string;
    hourTimestamp: string; // "YYYYMMDD-HH"

    projectID?: string;
    fieldID?: string;
    sectionID?: string;
    plantID?: string;
    deviceID?: string;
    cameraID?: HdrKey;

    sampleCount?: number;
    daysAfterPollination?: number;

    density?: number;
    branch_points?: number;
    v_component?: number;
    h_component?: number;
    estimated_volume?: number;
    relative_growth?: number;

    density_ideal?: number;
    branch_points_ideal?: number;
    v_component_ideal?: number;
    h_component_ideal?: number;

    density_diff?: number;
    branch_points_diff?: number;
    v_component_diff?: number;
    h_component_diff?: number;

    representative_capturedAt?: string;
    representative_s3Key?: string;
    representative_mask_s3_key?: string;
}

export interface DailyMelonSnapshot {
    melonID: string;
    dateJST: string; // "YYYYMMDD"

    projectID?: string;
    fieldID?: string;
    sectionID?: string;
    plantID?: string;
    deviceID?: string;
    cameraID?: HdrKey;

    daysAfterPollination?: number;

    density?: number;
    branch_points?: number;
    v_component?: number;
    h_component?: number;

    density_raw?: number;
    branch_points_raw?: number;
    v_component_raw?: number;
    h_component_raw?: number;

    density_ideal?: number;
    branch_points_ideal?: number;
    v_component_ideal?: number;
    h_component_ideal?: number;

    density_diff?: number;
    branch_points_diff?: number;
    v_component_diff?: number;
    h_component_diff?: number;

    estimated_volume?: number;
    estimated_volume_raw?: number;
    relative_growth?: number;
    relative_growth_raw?: number;

    representative_hourTimestamp?: string;
    representative_capturedAt?: string;
    representative_s3Key?: string;
    representative_mask_s3_key?: string;
    hourly_sample_count?: number;
}

export type GrowthMetricConfig = {
    label: string;
    unit: string;
    color: string;
    precision: number;
};