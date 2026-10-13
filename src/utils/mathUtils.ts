// src/utils/mathUtils.ts

// シグモイド関数計算
export const calculateSigmoid = (days: number, L: number, k: number, t0: number): number => {
    try {
        return L / (1 + Math.exp(-k * (days - t0)));
    } catch {
        return days < t0 ? 0 : L;
    }
};

// season から年を剥がす: "2026Fall" → "Fall"
// ideal-growth を引く際に使う
export const extractSeasonName = (fullSeason: string): string => {
    const m = fullSeason.match(/^\d{4}(.+)$/);
    return m ? m[1] : fullSeason;
};