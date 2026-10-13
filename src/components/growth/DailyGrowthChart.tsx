import React, { useMemo } from 'react';
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
    ReferenceLine,
} from 'recharts';
import { Typography } from '@mui/material';
import type { DailyMelonSnapshot, IdealGrowthModel } from '../../types/melon';
import { calculateSigmoid } from '../../utils/mathUtils';
import { MAX_DAP, GROWTH_METRICS } from '../../constants/metrics';

interface Props {
    snapshots: DailyMelonSnapshot[];
    idealModels: Record<string, IdealGrowthModel>;
    currentDap: number;
    pollinationDate: string;
}

const Y_AXIS_WIDTH = 50;

export const DailyGrowthChart: React.FC<Props> = ({
    snapshots,
    idealModels,
    currentDap,
    pollinationDate,
}) => {
    const chartData = useMemo(() => {
        const data: any[] = [];
        const pDate = new Date(pollinationDate);

        const snapshotByDap: Record<number, DailyMelonSnapshot> = {};
        snapshots.forEach(s => {
            if (typeof s.daysAfterPollination === 'number') {
                snapshotByDap[s.daysAfterPollination] = s;
            }
        });

        for (let d = 0; d <= MAX_DAP; d++) {
            const targetDate = new Date(pDate);
            targetDate.setDate(pDate.getDate() + d);
            const dateLabel = `${targetDate.getMonth() + 1}/${targetDate.getDate()}`;

            const point: any = { dap: d, dateLabel };

            const pDen = idealModels['density']?.parameters;
            const pBra = idealModels['branch_points']?.parameters;
            const pH   = idealModels['h_component']?.parameters;
            const pV   = idealModels['v_component']?.parameters;

            if (pDen) point.density_ideal       = calculateSigmoid(d, pDen.L, pDen.k, pDen.t0);
            if (pBra) point.branch_points_ideal = calculateSigmoid(d, pBra.L, pBra.k, pBra.t0);
            if (pH)   point.h_component_ideal   = calculateSigmoid(d, pH.L,   pH.k,   pH.t0);
            if (pV)   point.v_component_ideal   = calculateSigmoid(d, pV.L,   pV.k,   pV.t0);

            const snap = snapshotByDap[d];
            if (snap) {
                if (snap.density       !== undefined) point.density_actual       = snap.density;
                if (snap.branch_points !== undefined) point.branch_points_actual = snap.branch_points;
                if (snap.h_component   !== undefined) point.h_component_actual   = snap.h_component;
                if (snap.v_component   !== undefined) point.v_component_actual   = snap.v_component;
                if (snap.relative_growth !== undefined) point.relative_growth_actual = snap.relative_growth;
            }

            data.push(point);
        }
        return data;
    }, [snapshots, idealModels, pollinationDate]);

    const renderCommonXAxis = () => (
        <XAxis
            dataKey="dap"
            type="number"
            domain={[0, MAX_DAP]}
            tickCount={14}
            tickFormatter={(dap) => {
                const item = chartData.find(d => d.dap === dap);
                return item ? item.dateLabel : String(dap);
            }}
            label={{
                value: '交配経過日数',
                position: 'insideBottomRight',
                offset: -5,
                fontSize: 11,
            }}
        />
    );

    const renderCurrentLine = (yAxisId?: string) => (
        <ReferenceLine x={currentDap} stroke="red" strokeDasharray="3 3" yAxisId={yAxisId} />
    );

    return (
        <>
            {/* Chart 1: 網目の縦横成分 */}
            <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" align="center">
                    網目の縦横成分 (H/V)
                </Typography>
                <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={chartData} syncId="melonGrowth">
                        <CartesianGrid strokeDasharray="3 3" />
                        {renderCommonXAxis()}
                        <YAxis domain={['auto', 'auto']} width={Y_AXIS_WIDTH} />
                        <YAxis
                            orientation="right"
                            yAxisId="dummy"
                            width={Y_AXIS_WIDTH}
                            tick={false}
                            axisLine={false}
                        />
                        <Tooltip labelFormatter={(d) => `DAP: ${d}`} />
                        <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '0.8rem' }} />
                        {renderCurrentLine()}

                        <Line
                            type="monotone"
                            dataKey="h_component_ideal"
                            stroke={GROWTH_METRICS.h_component.color}
                            dot={false}
                            name="理想値 (横成分)"
                            strokeWidth={2}
                        />
                        <Scatter
                            dataKey="h_component_actual"
                            fill={GROWTH_METRICS.h_component.color}
                            name="実測値 (横成分)"
                            shape="circle"
                        />
                        <Line
                            type="monotone"
                            dataKey="v_component_ideal"
                            stroke={GROWTH_METRICS.v_component.color}
                            dot={false}
                            name="理想値 (縦成分)"
                            strokeWidth={2}
                        />
                        <Scatter
                            dataKey="v_component_actual"
                            fill={GROWTH_METRICS.v_component.color}
                            name="実測値 (縦成分)"
                            shape="triangle"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Chart 2: 網目密度と分岐点数 */}
            <div>
                <Typography variant="subtitle2" align="center">
                    網目密度と分岐点数
                </Typography>
                <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={chartData} syncId="melonGrowth">
                        <CartesianGrid strokeDasharray="3 3" />
                        {renderCommonXAxis()}
                        <YAxis
                            yAxisId="left"
                            orientation="left"
                            domain={[0, 1]}
                            width={Y_AXIS_WIDTH}
                            label={{ value: '網目密度', angle: -90, position: 'insideLeft', fontSize: 11 }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            domain={[0, 'auto']}
                            width={Y_AXIS_WIDTH}
                            label={{ value: '分岐点数', angle: 90, position: 'insideRight', fontSize: 11 }}
                        />
                        <Tooltip labelFormatter={(d) => `DAP: ${d}`} />
                        <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '0.8rem' }} />
                        {renderCurrentLine('left')}

                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="density_ideal"
                            stroke={GROWTH_METRICS.density.color}
                            dot={false}
                            name="理想値 (網目密度)"
                        />
                        <Scatter
                            yAxisId="left"
                            dataKey="density_actual"
                            fill={GROWTH_METRICS.density.color}
                            name="実測値 (網目密度)"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="branch_points_ideal"
                            stroke={GROWTH_METRICS.branch_points.color}
                            dot={false}
                            name="理想値 (分岐点数)"
                        />
                        <Scatter
                            yAxisId="right"
                            dataKey="branch_points_actual"
                            fill={GROWTH_METRICS.branch_points.color}
                            name="実測値 (分岐点数)"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Chart 3: 相対肥大度合い */}
            <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" align="center">
                    相対肥大度合い（基準時 = 1.0x）
                </Typography>
                <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={chartData} syncId="melonGrowth">
                        <CartesianGrid strokeDasharray="3 3" />
                        {renderCommonXAxis()}
                        <YAxis
                            domain={[0, 'auto']}
                            tickFormatter={(v) => `${v.toFixed(1)}x`}
                            width={Y_AXIS_WIDTH}
                        />
                        <YAxis
                            orientation="right"
                            yAxisId="dummy"
                            width={Y_AXIS_WIDTH}
                            tick={false}
                            axisLine={false}
                        />
                        <Tooltip
                            labelFormatter={(d) => `DAP: ${d}`}
                            formatter={(v: number) => [`${v.toFixed(2)}x`, '相対肥大度合い']}
                        />
                        <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '0.8rem' }} />
                        {renderCurrentLine()}

                        <Scatter
                            dataKey="relative_growth_actual"
                            fill={GROWTH_METRICS.relative_growth.color}
                            name="実測値"
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </>
    );
};

export default DailyGrowthChart;