import React, { useMemo } from 'react';
import { Box, Stack, CircularProgress, Alert } from '@mui/material';
import type { Melon } from '../../types/melon';
import { useDailySensorSnapshots } from '../../hooks/useDailySensorSnapshots';
import { buildFieldKey } from '../../constants/aggregationKey';
import { toLocalDateStr, toCompactDateStr } from '../../utils/dateTime';
import GrowingMelonsGrid from '../overview/GrowingMelonsGrid';
import FieldSensorCard from '../overview/FieldSensorCard';

interface Props {
    fieldID: string;
    melons: Melon[];
    melonsLoading: boolean;
    melonsError: string | null;
    onMelonSelect?: (m: Melon) => void;
}

const OverviewView: React.FC<Props> = ({
    fieldID, melons, melonsLoading, melonsError, onMelonSelect,
}) => {
    const today = toLocalDateStr(new Date());
    const todayCompact = toCompactDateStr(today);

    const { data: snapshots, loading: snapLoading } = useDailySensorSnapshots({
        aggregationKey: buildFieldKey(fieldID),
        startDate: today,
        endDate:   today,
    });

    const todaySnapshot = useMemo(
        () => snapshots.find(s => s.dateJST === todayCompact) ?? null,
        [snapshots, todayCompact]
    );

    return (
        <Stack spacing={2}>
            {snapLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <FieldSensorCard fieldID={fieldID} snapshot={todaySnapshot} />
            )}

            {melonsError && <Alert severity="error">{melonsError}</Alert>}
            {melonsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <GrowingMelonsGrid melons={melons} onSelect={onMelonSelect} />
            )}
        </Stack>
    );
};

export default OverviewView;