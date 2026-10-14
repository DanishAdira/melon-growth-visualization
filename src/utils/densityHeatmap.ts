/**
 * 網目密度 (density) をヒートマップ色に変換するユーティリティ。
 *
 * スケール設計:
 *   低域 (0〜0.3) を細かく、高域 (0.3〜0.8+) を粗くした段階表現。
 *   網目発生初期の微細な進行度を識別しやすくするため。
 */

export interface DensityStop {
    /** この区間の下限 (以上) */
    min: number;
    /** この区間の上限 (未満)。null は +∞。 */
    max: number | null;
    /** 塗りつぶし色 (HEX) */
    color: string;
    /** カード上に出す区間ラベル */
    label: string;
}

export const DENSITY_STOPS: DensityStop[] = [
    { min: 0.00, max: 0.05, color: '#c62828', label: '0.00 – 0.05' },
    { min: 0.05, max: 0.10, color: '#e53935', label: '0.05 – 0.10' },
    { min: 0.10, max: 0.20, color: '#fb8c00', label: '0.10 – 0.20' },
    { min: 0.20, max: 0.30, color: '#fdd835', label: '0.20 – 0.30' },
    { min: 0.30, max: 0.50, color: '#c0ca33', label: '0.30 – 0.50' },
    { min: 0.50, max: 0.80, color: '#43a047', label: '0.50 – 0.80' },
    { min: 0.80, max: null, color: '#2e7d32', label: '0.80 以上' },
];

export const NO_DATA_COLOR = '#9e9e9e';

/**
 * density 値 (0〜1 想定) に対応する色・ラベルを返す。
 * null/undefined/NaN の場合は NO_DATA_COLOR とフォールバックラベル。
 */
export function densityToColor(density: number | null | undefined): {
    color: string;
    label: string;
} {
    if (density == null || !Number.isFinite(density)) {
        return { color: NO_DATA_COLOR, label: 'データなし' };
    }
    for (const stop of DENSITY_STOPS) {
        const upperOk = stop.max == null ? true : density < stop.max;
        if (density >= stop.min && upperOk) {
            return { color: stop.color, label: stop.label };
        }
    }
    // 想定外（負値など）
    return { color: NO_DATA_COLOR, label: 'データなし' };
}

/**
 * 色のコントラスト用: 背景色に対して読みやすい文字色 (白 or 黒) を返す。
 * Y = 0.299R + 0.587G + 0.114B の輝度判定。
 */
export function pickTextColor(bgHex: string): string {
    const hex = bgHex.replace('#', '');
    if (hex.length !== 6) return '#000';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    return y > 160 ? '#000' : '#fff';
}