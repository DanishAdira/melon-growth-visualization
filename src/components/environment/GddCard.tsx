import React from 'react';
import { Card, CardContent, Typography, Stack, Chip, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { DailySensorSnapshot, GddOrigin } from '../../types/sensor';

interface Props {
    snapshot: DailySensorSnapshot | null;
}

const ORIGIN_LABEL: Record<GddOrigin, string> = {
    FromPollination: '交配日から',
    FromThinning:    '摘果日から',
    FromNetOnset:    '網目発生日から',
};

const ORIGIN_COLOR: Record<GddOrigin, string> = {
    FromPollination: '#2e7d32',
    FromThinning:    '#ed6c02',
    FromNetOnset:    '#1565c0',
};

const GddCard: React.FC<Props> = ({ snapshot }) => {
    if (!snapshot || snapshot.level !== 'PLANT') {
        return null;
    }

    const daily = snapshot.dailyGrowingDegreeDays;
    const entries = snapshot.GrowingDegreeDays ?? [];
    const byOrigin: Partial<Record<GddOrigin, { value: number; coverageStart: string }>> = {};
    entries.forEach(e => {
        byOrigin[e.origin] = { value: e.value, coverageStart: e.coverageStart };
    });

    const origins: GddOrigin[] = ['FromPollination', 'FromThinning', 'FromNetOnset'];

    return (
        <Card sx={{ mt: 2 }}>
            <CardContent>
                <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h6">積算温度 (GDD)</Typography>
                    {typeof daily === 'number' && (
                        <Chip
                            label={`本日 +${daily.toFixed(2)} °C·d`}
                            size="small"
                            variant="outlined"
                        />
                    )}
                </Stack>

                <Grid container spacing={2}>
                    {origins.map((origin) => {
                        const entry = byOrigin[origin];
                        const color = ORIGIN_COLOR[origin];
                        return (
                            <Grid key={origin} size={{ xs: 12, sm: 4 }}>
                                <Box sx={{ borderLeft: `4px solid ${color}`, pl: 1.5, py: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {ORIGIN_LABEL[origin]}
                                    </Typography>
                                    {entry ? (
                                        <>
                                            <Typography variant="h5" sx={{ color, lineHeight: 1.2 }}>
                                                {entry.value.toFixed(1)}
                                                <Typography component="span" variant="caption" sx={{ ml: 0.5 }}>
                                                    °C·d
                                                </Typography>
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                起算日: {entry.coverageStart}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                            未開始
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default GddCard;