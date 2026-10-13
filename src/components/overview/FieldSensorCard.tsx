import React from 'react';
import { Paper, Typography, Stack, Chip, Box } from '@mui/material';
import type { DailySensorSnapshot } from '../../types/sensor';
import SensorStatsCard from '../environment/SensorStatsCard';
import { fromCompactDateStr } from '../../utils/dateTime';

interface Props {
    fieldID: string;
    snapshot: DailySensorSnapshot | null;
}

const FieldSensorCard: React.FC<Props> = ({ fieldID, snapshot }) => {
    const dateLabel = snapshot ? fromCompactDateStr(snapshot.dateJST) : null;

    return (
        <Paper sx={{ p: 2 }}>
            <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h6">圃場センサー集約 — {fieldID}</Typography>
                {dateLabel && (
                    <Chip label={dateLabel} size="small" variant="outlined" />
                )}
            </Stack>

            {!snapshot ? (
                <Box sx={{ py: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        圃場レベルの集約データがありません
                    </Typography>
                </Box>
            ) : (
                <SensorStatsCard snapshot={snapshot} />
            )}
        </Paper>
    );
};

export default FieldSensorCard;