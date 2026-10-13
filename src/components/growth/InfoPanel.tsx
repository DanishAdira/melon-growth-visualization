import React from 'react';
import { Paper, Typography, Chip, Box, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { Melon, DailyMelonSnapshot } from '../../types/melon';
import { GROWTH_METRIC_KEYS, GROWTH_METRICS } from '../../constants/metrics';

interface Props {
    melon: Melon;
    snapshot: DailyMelonSnapshot | null;
}

export const InfoPanel: React.FC<Props> = ({ melon, snapshot }) => {
    const netBadge = (() => {
        if (melon.netDetectionStatus === 'detected') {
            return { label: '網目検出済み', color: 'success' as const };
        }
        if (melon.netDetectionStatus === 'pending') {
            return { label: '網目発生前', color: 'default' as const };
        }
        return null;
    })();

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="h6">生育情報</Typography>
                {netBadge && (
                    <Chip label={netBadge.label} color={netBadge.color} size="small" />
                )}
            </Stack>

            <Box sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                    {melon.melonID}
                </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
                <Grid size={{ xs: 6 }}>
                    <Typography variant="body2">
                        栽培季節: <b>{melon.season}</b>
                    </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                    <Typography variant="body2">
                        交配日: <b>{melon.pollinationDate ?? '—'}</b>
                    </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="h5" color="primary">
                        交配経過日数: {snapshot?.daysAfterPollination ?? '—'} 日
                    </Typography>
                </Grid>
                {melon.netDetectionStatus === 'detected' && melon.netOnsetDaysAfterPollination != null && (
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="success.main">
                            網目発生日: DAP {melon.netOnsetDaysAfterPollination}
                        </Typography>
                    </Grid>
                )}
            </Grid>

            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                現在の生長度指標 (±偏差)
            </Typography>

            <Grid container spacing={1} sx={{ width: '100%' }}>
                {GROWTH_METRIC_KEYS.map((key) => {
                    const config = GROWTH_METRICS[key];
                    const val   = snapshot?.[key] as number | undefined;
                    const diff  = snapshot?.[`${key}_diff` as keyof DailyMelonSnapshot] as number | undefined;
                    const hasValue = typeof val === 'number';
                    const hasDiff  = typeof diff === 'number';
                    const diffColor: 'success' | 'error' = (diff ?? 0) >= 0 ? 'success' : 'error';

                    return (
                        <Grid key={key} size={{ xs: 6 }}>
                            <Paper variant="outlined" sx={{ p: 1 }}>
                                <Typography variant="caption" color="textSecondary">
                                    {config.label}
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Typography variant="body1">
                                        {hasValue ? val.toFixed(config.precision) : '—'}
                                        {hasValue && config.unit && ` ${config.unit}`}
                                    </Typography>
                                    {hasDiff && (
                                        <Chip
                                            label={`${diff! >= 0 ? '+' : ''}${diff!.toFixed(config.precision)}`}
                                            color={diffColor}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.65rem',
                                                '& .MuiChip-label': { px: 0.75 },
                                            }}
                                        />
                                    )}
                                </Stack>
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </Paper>
    );
};

export default InfoPanel;