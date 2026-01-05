// src/utils/mathUtils.ts

// シグモイド関数計算
export const calculateSigmoid = (t: number, L: number, k: number, t0: number) => {
  return L / (1 + Math.exp(-k * (t - t0)));
};