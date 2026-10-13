import React, { useEffect, useMemo } from 'react';
import { Box, Paper, Typography, Slider, Stack, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { Melon } from '../../types/melon';
import { useDailyMelonSnapshots } from '../../hooks/useDailyMelonSnapshots';
import { useHourlyMelonSnapshots } from '../../hooks/useHourlyMelonSnapshots';
import { useIdealGrowthModels } from '../../hooks/useIdealGrowthModels';
import { extractSeasonName } from '../../utils/mathUtils';
import {
    daysBetween, toLocalDateStr, toCompactDateStr, fromCompactDateStr,
} from '../../utils/dateTime';
import InfoPanel from '../growth/InfoPanel';
import ImagePanel from '../growth/ImagePanel';
import DailyGrowthChart from '../growth/DailyGrowthChart';
import HourlyGrowthChart from '../growth/HourlyGrowthChart';
import GrowthViewToggle, { type GrowthViewMode } from '../growth/GrowthViewToggle';

interface Props {
    melon: Melon | null;
    view: GrowthViewMode;
    onViewChange: (v: GrowthViewMode) => void;
    selectedDate: string;
    onSelectedDateChange: (d: string) => void;
}

const GrowthView: React.FC<Props> = ({
    melon, view, onViewChange, selectedDate, onSelectedDateChange,
}) => {
    const melonID    = melon?.melonID ?? null;
    const seasonName = melon ? extractSeasonName(melon.season) : null;

    const { data: dailyData, loading: dailyLoading, error: dailyError } =
        useDailyMelonSnapshots({ melonID });

    const { models: idealModels, loading: idealLoading } =
        useIdealGrowthModels(seasonName);

    const compactDate = toCompactDateStr(selectedDate);
    const dateList = useMemo(() => dailyData.map(d => d.dateJST).sort(), [dailyData]);

    // 選択日に対応する daily snapshot が無ければ、最新の利用可能な日に自動遷移
    useEffect(() => {
        if (dateList.length === 0) return;
        if (!dateList.includes(compactDate)) {
            const latest = dateList[dateList.length - 1];
            onSelectedDateChange(fromCompactDateStr(latest));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateList]);

    const hourlyRange = useMemo(() => {
        if (view !== 'hourly' || !melonID) return { start: null, end: null };
        return { start: `${compactDate}-00`, end: `${compactDate}-23` };
    }, [view, melonID, compactDate]);

    const { data: hourlyData, loading: hourlyLoading } = useHourlyMelonSnapshots({
        melonID: view === 'hourly' ? melonID : null,
        startTimestamp: hourlyRange.start,
        endTimestamp:   hourlyRange.end,
    });

    // 赤破線はスライダー選択日に対応する DAP
    const currentDap = melon?.pollinationDate
        ? daysBetween(melon.pollinationDate, selectedDate)
        : 0;

    const selectedSnapshot = useMemo(
        () => dailyData.find(d => d.dateJST === compactDate) ?? null,
        [dailyData, compactDate]
    );

    const sliderIndex = dateList.indexOf(compactDate);
    const sliderValue = sliderIndex >= 0 ? sliderIndex : Math.max(0, dateList.length - 1);

    const handleSliderChange = (_: Event, value: number | number[]) => {
        const idx = value as number;
        const d = dateList[idx];
        if (d) onSelectedDateChange(fromCompactDateStr(d));
    };

    if (!melon) {
        return (
            <Alert severity="info">
                株とカメラ (HDR) を選択するとメロン生育情報が表示されます。
            </Alert>
        );
    }

    const loading = dailyLoading || idealLoading;
    const today = toLocalDateStr(new Date());

    return (
        <>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
                <GrowthViewToggle mode={view} onChange={onViewChange} />
                {dateList.length > 0 && (
                    <Paper sx={{ p: 1.5, flex: 1, minWidth: 240 }}>
                        <Typography variant="caption">
                            選択日: {fromCompactDateStr(dateList[sliderValue] ?? compactDate)}
                        </Typography>
                        <Slider
                            size="small"
                            value={sliderValue}
                            min={0}
                            max={Math.max(0, dateList.length - 1)}
                            step={1}
                            onChange={handleSliderChange}
                            disabled={dateList.length <= 1}
                        />
                    </Paper>
                )}
            </Stack>

            {dailyError && <Alert severity="error" sx={{ mb: 2 }}>{dailyError}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack spacing={2}>
                            <InfoPanel  melon={melon} snapshot={selectedSnapshot} />
                            <ImagePanel snapshot={selectedSnapshot} />
                        </Stack>
                    </Grid>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper sx={{ p: 2 }}>
                            {view === 'daily' ? (
                                <DailyGrowthChart
                                    snapshots={dailyData}
                                    idealModels={idealModels}
                                    currentDap={currentDap}
                                    pollinationDate={melon.pollinationDate ?? today}
                                />
                            ) : hourlyLoading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <HourlyGrowthChart
                                    snapshots={hourlyData}
                                    selectedDate={selectedDate}
                                />
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </>
    );
};

export default GrowthView;