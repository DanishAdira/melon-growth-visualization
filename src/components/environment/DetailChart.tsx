import React, { useMemo } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { Paper, Stack, Typography, Box } from '@mui/material';
import type { SensorData, SensorMetricKey, SensorMetricConfig } from '../../types/sensor';
import { formatHHmm } from '../../utils/dateTime';

interface Props {
    data: SensorData[];
    metric: SensorMetricConfig;
    metricKey: SensorMetricKey;
    windowStart: Date;
    windowEnd: Date;
    hourlyTicks: number[];
}

const DetailChart: React.FC<Props> = ({
    data, metric, metricKey, windowStart, windowEnd, hourlyTicks,
}) => {
    const chartData = useMemo(
        () => data.map(item => ({
            ts: new Date(item.timestamp).getTime(),
            value: (item as any)[metricKey] as number,
        })),
        [data, metricKey]
    );

    const domain: [number, number] = [windowStart.getTime(), windowEnd.getTime()];

    return (
        <Paper sx={{ p: 1.5, mb: 1 }}>
            <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">
                    {metric.label}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        ({metric.unit})
                    </Typography>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {formatHHmm(windowStart.getTime())} 〜 {formatHHmm(windowEnd.getTime())}
                </Typography>
            </Stack>
            <Box sx={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid stroke="#eee" vertical={false} />
                        <XAxis
                            dataKey="ts"
                            type="number"
                            domain={domain}
                            ticks={hourlyTicks}
                            tickFormatter={formatHHmm}
                            scale="time"
                            tick={{ fontSize: 11, fill: '#666' }}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fontSize: 11, fill: '#666' }}
                            width={45}
                        />
                        <Tooltip
                            labelFormatter={(v) => formatHHmm(v as number)}
                            formatter={(v: number) =>
                                [`${v?.toFixed(metric.precision)} ${metric.unit}`, metric.label]
                            }
                        />
                        <ReferenceLine x={windowEnd.getTime()} stroke="#bbb" strokeDasharray="3 3" />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke={metric.color}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 5 }}
                            isAnimationActive={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default DetailChart;