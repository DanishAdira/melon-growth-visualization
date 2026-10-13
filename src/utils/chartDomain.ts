export type NumDomain = [number | 'auto', number | 'auto'];

// 値域から 10% パディング付きのドメインを計算
export const padDomain = (values: number[], padRatio = 0.1): NumDomain => {
    if (values.length === 0) return ['auto', 'auto'];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = Math.max(max - min, 1e-9);
    const pad = span * padRatio;
    return [min - pad, max + pad];
};

// 0 を下限として固定するドメイン
export const zeroBasedDomain = (values: number[]): NumDomain => {
    if (values.length === 0) return [0, 'auto'];
    const max = Math.max(...values);
    return [0, max * 1.1];
};