import React, { useMemo } from 'react';
import { Typography } from '@mui/material';
import { 
  ComposedChart, 
  Line, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine 
} from 'recharts';
import { GrowthSummary, IdealModel } from '../types';
import { calculateSigmoid } from '../utils/mathUtils'; 

interface Props {
  summaries: GrowthSummary[];
  idealModels: Record<string, IdealModel>;
  currentDap: number;
  pollinationDate: string;
}

export const GrowthChart: React.FC<Props> = ({ summaries, idealModels, currentDap, pollinationDate }) => {
  
  // --- データ生成 ---
  const chartData = useMemo(() => {
    const data = [];
    const maxDay = 65; // ★修正: 最大日数を65日に変更

    const pDate = new Date(pollinationDate);

    for (let d = 0; d <= maxDay; d++) {
      const targetDate = new Date(pDate);
      targetDate.setDate(pDate.getDate() + d);
      const dateLabel = `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;

      const point: any = { 
        dap: d,
        dateLabel: dateLabel
      };
      
      const pVol = idealModels['estimated_volume_px3']?.parameters;
      const pDen = idealModels['density']?.parameters;
      const pBra = idealModels['branch_points']?.parameters;
      const pH = idealModels['h_component_px']?.parameters;
      const pV = idealModels['v_component_px']?.parameters;

      if (pVol) point.volume_ideal = calculateSigmoid(d, pVol.L, pVol.k, pVol.t0);
      if (pDen) point.density_ideal = calculateSigmoid(d, pDen.L, pDen.k, pDen.t0);
      if (pBra) point.branch_ideal = calculateSigmoid(d, pBra.L, pBra.k, pBra.t0);
      if (pH) point.h_ideal = calculateSigmoid(d, pH.L, pH.k, pH.t0);
      if (pV) point.v_ideal = calculateSigmoid(d, pV.L, pV.k, pV.t0);

      const dailySummary = summaries.find(s => s.dap === d);
      if (dailySummary?.actual_metrics) {
        const m = dailySummary.actual_metrics;
        point.volume_actual = m.estimated_volume_px3;
        point.density_actual = m.density;
        point.branch_actual = m.branch_points;
        point.h_actual = m.h_component_px;
        point.v_actual = m.v_component_px;
      }

      data.push(point);
    }
    return data;
  }, [summaries, idealModels, pollinationDate]);

  // X軸の共通設定
  const renderCommonXAxis = () => (
    <XAxis 
      dataKey="dap" 
      type="number" 
      domain={[0, 65]} 
      tickCount={14}
      tickFormatter={(dap) => {
        const item = chartData.find(d => d.dap === dap);
        return item ? item.dateLabel : dap;
      }}
      label={{ value: '交配経過日数', position: 'insideBottomRight', offset: -5 }} 
    />
  );

  // 現在日ラインの描画（軸IDを指定可能に）
  const renderCurrentLine = (yAxisId?: string) => (
    <ReferenceLine 
      x={currentDap} 
      stroke="red" 
      strokeDasharray="3 3" 
      label=""
      yAxisId={yAxisId} 
    />
  );

  // ★修正: 軸の幅を統一するための定数
  const Y_AXIS_WIDTH = 50;

  return (
    <div className="right-column-inner">
      
      {/* Chart 1: Volume */}
      <div className="chart-container">
        <Typography variant="subtitle2" align="center">肥大度合い (推定体積)</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} syncId="melonGrowth">
            <CartesianGrid strokeDasharray="3 3" />
            {renderCommonXAxis()}
            
            {/* 左軸: 幅を固定 */}
            <YAxis 
              tickFormatter={(val) => (val / 1000000).toFixed(0) + 'M'} 
              width={Y_AXIS_WIDTH}
            />
            {/* ★修正: レイアウトを揃えるためのダミー右軸 */}
            <YAxis 
              orientation="right" 
              yAxisId="dummy" 
              width={Y_AXIS_WIDTH} 
              tick={false} 
              axisLine={false} 
            />

            <Tooltip labelFormatter={(d) => `DAP: ${d}`} />
            <Legend verticalAlign="top" height={36}/>
            
            {renderCurrentLine()} 
            
            <Line type="monotone" dataKey="volume_ideal" stroke="#8884d8" dot={false} name="理想値" strokeWidth={2} />
            <Scatter dataKey="volume_actual" fill="#8884d8" name="実測値" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Net Components */}
      <div className="chart-container">
        <Typography variant="subtitle2" align="center">網目の縦横成分 (H/V)</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} syncId="melonGrowth">
            <CartesianGrid strokeDasharray="3 3" />
            {renderCommonXAxis()}
            
            {/* 左軸: 幅を固定 */}
            <YAxis 
              domain={['auto', 'auto']} 
              width={Y_AXIS_WIDTH}
            />
            {/* ★修正: ダミー右軸 */}
            <YAxis 
              orientation="right" 
              yAxisId="dummy" 
              width={Y_AXIS_WIDTH} 
              tick={false} 
              axisLine={false} 
            />

            <Tooltip labelFormatter={(d) => `DAP: ${d}`} />
            <Legend verticalAlign="top" height={36}/>
            
            {renderCurrentLine()}

            <Line type="monotone" dataKey="h_ideal" stroke="#ff7300" dot={false} name="理想値 (横成分)" strokeWidth={2} />
            <Scatter dataKey="h_actual" fill="#ff7300" name="実測値 (横成分)" shape="circle" />

            <Line type="monotone" dataKey="v_ideal" stroke="#387908" dot={false} name="理想値 (縦成分)" strokeWidth={2} />
            <Scatter dataKey="v_actual" fill="#387908" name="実測値 (縦成分)" shape="triangle" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 3: Quality Metrics (左右に軸あり) */}
      <div className="chart-container">
        <Typography variant="subtitle2" align="center">網目密度と分岐点数</Typography>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} syncId="melonGrowth">
            <CartesianGrid strokeDasharray="3 3" />
            {renderCommonXAxis()}
            
            {/* 左軸: Density */}
            <YAxis 
              yAxisId="left" 
              orientation="left" 
              domain={[0, 1]} 
              label={{ value: '網目密度', angle: -90, position: 'insideLeft' }} 
              width={Y_AXIS_WIDTH}
            />
            {/* 右軸: Branches */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 'auto']} 
              label={{ value: '分岐点数', angle: 90, position: 'insideRight' }} 
              width={Y_AXIS_WIDTH}
            />
            
            <Tooltip labelFormatter={(d) => `DAP: ${d}`} />
            <Legend verticalAlign="top" height={36}/>

            {renderCurrentLine("left")} 

            <Line yAxisId="left" type="monotone" dataKey="density_ideal" stroke="#82ca9d" dot={false} name="理想値 (網目密度)" />
            <Scatter yAxisId="left" dataKey="density_actual" fill="#82ca9d" name="実測値 (網目密度)" />

            <Line yAxisId="right" type="monotone" dataKey="branch_ideal" stroke="#ffc658" dot={false} name="理想値 (分岐点数)" />
            <Scatter yAxisId="right" dataKey="branch_actual" fill="#ffc658" name="実測値 (分岐点数)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};