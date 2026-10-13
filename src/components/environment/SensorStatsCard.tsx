import React from 'react';
import { Card, CardContent, Typography, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { DailySensorSnapshot, SensorStats, SensorStatsKey } from '../../types/sensor';
import { SENSOR_METRICS } from '../../constants/metrics';

interface Props {
    snapshot: DailySensorSnapshot | null;
}

const DISPLAY_METRICS: SensorStatsKey[] = ['temperature', 'humidity', 'i_v_light', 'u_v_light'];

const SensorStatsCard: React.FC<Props> = ({ snapshot }) => {
    if (!snapshot) {
        return (
            <Card>
                <CardContent>
                    <Typography variant="body2" color="text.secondary">
                        センサー集約データがありません
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Grid container spacing={2}>
            {DISPLAY_METRICS.map((key) => {
                const config = SENSOR_METRICS[key];
                const stats = snapshot[key];
                return (
                    <Grid key={key} size={{ xs: 12, sm: 6, md: 3 }}>
                        <StatsCardTile config={config} stats={stats} />
                    </Grid>
                );
            })}
        </Grid>
    );
};

interface TileProps {
    config: { label: string; unit: string; color: string; precision: number };
    stats: SensorStats | undefined;
}

const StatsCardTile: React.FC<TileProps> = ({ config, stats }) => {
    const fmt = (v: number | undefined) =>
        typeof v === 'number' ? v.toFixed(config.precision) : '—';

    return (
        <Card sx={{ borderLeft: `4px solid ${config.color}` }}>
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 2 } }}>
                <Typography variant="caption" color="text.secondary">
                    {config.label} ({config.unit})
                </Typography>

                {!stats ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        データなし
                    </Typography>
                ) : (
                    <>
                        <Typography variant="h5" sx={{ color: config.color, mt: 0.5 }}>
                            {fmt(stats.mean)}
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ mt: 0.5 }}
                        >
                            <Typography variant="caption">
                                最小 <b>{fmt(stats.min)}</b>
                            </Typography>
                            <Typography variant="caption">
                                最大 <b>{fmt(stats.max)}</b>
                            </Typography>
                            {typeof stats.median === 'number' && (
                                <Typography variant="caption">
                                    中央値 <b>{fmt(stats.median)}</b>
                                </Typography>
                            )}
                            {typeof stats.sum === 'number' && (
                                <Typography variant="caption">
                                    合計 <b>{fmt(stats.sum)}</b>
                                </Typography>
                            )}
                            {typeof stats.count === 'number' && (
                                <Typography variant="caption" color="text.secondary">
                                    n={stats.count}
                                </Typography>
                            )}
                        </Stack>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default SensorStatsCard;