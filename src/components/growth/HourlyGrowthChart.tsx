import React, { useMemo } from 'react';
import {
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ReferenceLine,
    ResponsiveContainer,
} from 'recharts';
import { Typography } from '@mui/material';
import type { HourlyMelonSnapshot } from '../../types/melon';
import { GROWTH_METRICS } from '../../constants/metrics';
import { toCompactDateStr } from '../../utils/dateTime';

interface Props {
    snapshots: HourlyMelonSnapshot[];
    selectedDate: string; // "YYYY-MM-DD"
    selectedHour?: number | null;  // 現在選択中の時刻（画像と連動する縦破線）
}

const Y_AXIS_WIDTH = 50;
const CURSOR_COLOR = '#1976d2';

export const HourlyGrowthChart: React.FC<Props> = ({ snapshots, selectedDate, selectedHour }) => {
    const chartData = useMemo(() => {
        const compact = toCompactDateStr(selectedDate);
        return snapshots
            .filter(s => s.hourTimestamp.startsWith(compact))
            .map(s => {
                const hour = Number(s.hourTimestamp.slice(9, 11));
                return {
                    hour,
                    density:       s.density,
                    branch_points: s.branch_points,
                    v_component:   s.v_component,
                    h_component:   s.h_component,
                    relative_growth: s.relative_growth,
                };
            })
            .sort((a, b) => a.hour - b.hour);
    }, [snapshots, selectedDate]);

    if (chartData.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                {selectedDate} の時次データがありません
            </Typography>
        );
    }

    const renderCursorLine = (yAxisId?: string) =>
        selectedHour != null ? (
            <ReferenceLine
                x={selectedHour}
                stroke={CURSOR_COLOR}
                strokeDasharray="4 3"
                strokeWidth={1.5}
                yAxisId={yAxisId}
                ifOverflow="visible"
            />
        ) : null;

    return (
        <>
            {/* Chart 1: 網目の縦横成分（時次） */}
            <div style={{ marginBottom: 16 }}>
                <Typography variant="subtitle2" align="center">
                    網目の縦横成分 (H/V) — {selectedDate}
                </Typography>
                <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={chartData} syncId="melonHourly">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="hour"
                            type="number"
                            domain={[0, 23]}
                            tickCount={12}
                            tickFormatter={(h) => `${h}時`}
                        />
                        <YAxis domain={['auto', 'auto']} width={Y_AXIS_WIDTH} />
                        <YAxis
                            orientation="right"
                            yAxisId="dummy"
                            width={Y_AXIS_WIDTH}
                            tick={false}
                            axisLine={false}
                        />
                        <Tooltip labelFormatter={(h) => `${h}時`} />
                        <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '0.8rem' }} />

                        {renderCursorLine()}

                        <Line
                            type="monotone"
                            dataKey="h_component"
                            stroke={GROWTH_METRICS.h_component.color}
                            name="横成分"
                            strokeWidth={2}
                            connectNulls
                        />
                        <Line
                            type="monotone"
                            dataKey="v_component"
                            stroke={GROWTH_METRICS.v_component.color}
                            name="縦成分"
                            strokeWidth={2}
                            connectNulls
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Chart 2: 網目密度と分岐点数（時次） */}
            <div>
                <Typography variant="subtitle2" align="center">
                    網目密度と分岐点数 — {selectedDate}
                </Typography>
                <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={chartData} syncId="melonHourly">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="hour"
                            type="number"
                            domain={[0, 23]}
                            tickCount={12}
                            tickFormatter={(h) => `${h}時`}
                        />
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
                        <Tooltip labelFormatter={(h) => `${h}時`} />
                        <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '0.8rem' }} />

                        {renderCursorLine('left')}

                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="density"
                            stroke={GROWTH_METRICS.density.color}
                            name="網目密度"
                            strokeWidth={2}
                            connectNulls
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="branch_points"
                            stroke={GROWTH_METRICS.branch_points.color}
                            name="分岐点数"
                            strokeWidth={2}
                            connectNulls
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Chart 3: 相対肥大度合い（時次） */}
            <div>
                <Typography variant="subtitle2" align="center">
                    相対肥大度合い（時次） — {selectedDate}
                </Typography>
                <ResponsiveContainer width="100%" height={240}>
                    <ComposedChart data={chartData} syncId="melonHourly">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="hour"
                            type="number"
                            domain={[0, 23]}
                            tickCount={12}
                            tickFormatter={(h) => `${h}時`}
                        />
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
                            labelFormatter={(h) => `${h}時`}
                            formatter={(v: number) => [`${v.toFixed(2)}x`, '相対肥大度合い']}
                        />
                        <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: '0.8rem' }} />

                        {renderCursorLine()}

                        <Line
                            type="monotone"
                            dataKey="relative_growth"
                            stroke={GROWTH_METRICS.relative_growth.color}
                            name="相対肥大度合い"
                            strokeWidth={2}
                            connectNulls
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

        </>
    );
};

export default HourlyGrowthChart;