import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceArea,
} from 'recharts';
import { Paper, Slider, Stack, Typography, Box } from '@mui/material';
import type { SensorData, SensorMetricKey, SensorMetricConfig } from '../../types/sensor';
import { formatHHmm } from '../../utils/dateTime';
import { DAY_MINUTES } from '../../constants/metrics';

interface Props {
    data: SensorData[];
    metric: SensorMetricConfig;
    metricKey: SensorMetricKey;
    dayStart: Date;
    dayEnd: Date;
    windowStart: Date;
    windowEnd: Date;
    dayTicks: number[];
    endTimeMinutes: number;
    onEndTimeChange: (minutes: number) => void;
}

const OverviewChart: React.FC<Props> = ({
    data, metric, metricKey, dayStart, dayEnd,
    windowStart, windowEnd, dayTicks,
    endTimeMinutes, onEndTimeChange,
}) => {
    const chartData = useMemo(
        () => data.map(item => ({
            ts: new Date(item.timestamp).getTime(),
            value: (item as any)[metricKey] as number,
        })),
        [data, metricKey]
    );

    const domain: [number, number] = [dayStart.getTime(), dayEnd.getTime()];

    return (
        <Paper sx={{ p: 1.5 }}>
            <Typography variant="caption" color="text.secondary">
                1日の全体像（帯 = 詳細グラフの表示範囲）
            </Typography>
            <Box sx={{ height: 90, mt: 0.5 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 6, left: 0, bottom: 0 }}>
                        <XAxis
                            dataKey="ts"
                            type="number"
                            domain={domain}
                            ticks={dayTicks}
                            tickFormatter={formatHHmm}
                            scale="time"
                            tick={{ fontSize: 10, fill: '#888' }}
                        />
                        <YAxis hide domain={['auto', 'auto']} />
                        <ReferenceArea
                            x1={Math.max(windowStart.getTime(), dayStart.getTime())}
                            x2={Math.min(windowEnd.getTime(),   dayEnd.getTime())}
                            fill={metric.color}
                            fillOpacity={0.18}
                            stroke={metric.color}
                            strokeOpacity={0.5}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={metric.color}
                            strokeWidth={1.2}
                            dot={false}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
            <Box sx={{ px: 1 }}>
                <Slider
                    size="small"
                    value={endTimeMinutes}
                    min={0}
                    max={DAY_MINUTES}
                    step={1}
                    onChange={(_, v) => onEndTimeChange(v as number)}
                    sx={{ color: metric.color }}
                />
                <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">00:00</Typography>
                    <Typography variant="caption" color="text.secondary">12:00</Typography>
                    <Typography variant="caption" color="text.secondary">24:00</Typography>
                </Stack>
            </Box>
        </Paper>
    );
};

export default OverviewChart;