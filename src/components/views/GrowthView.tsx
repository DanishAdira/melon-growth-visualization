import React, { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Typography, Slider, Stack, CircularProgress, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import type { Melon, HourlyMelonSnapshot, DailyMelonSnapshot } from '../../types/melon';
import { useDailyMelonSnapshots } from '../../hooks/useDailyMelonSnapshots';
import { useHourlyMelonSnapshots } from '../../hooks/useHourlyMelonSnapshots';
import { useIdealGrowthModels } from '../../hooks/useIdealGrowthModels';
import { extractSeasonName } from '../../utils/mathUtils';
import {
    daysBetween, toLocalDateStr, toCompactDateStr, fromCompactDateStr,
} from '../../utils/dateTime';
import InfoPanel from '../growth/InfoPanel';
import ImagePanel, { type ImageSnapshot } from '../growth/ImagePanel';
import DailyGrowthChart from '../growth/DailyGrowthChart';
import HourlyGrowthChart from '../growth/HourlyGrowthChart';
import GrowthViewToggle, { type GrowthViewMode } from '../growth/GrowthViewToggle';
import HourSlider from '../growth/HourSlider';

interface Props {
    melon: Melon | null;
    view: GrowthViewMode;
    onViewChange: (v: GrowthViewMode) => void;
    selectedDate: string;
    onSelectedDateChange: (d: string) => void;
}

const DEFAULT_HOUR = 12;
const MIN_HOUR = 6;
const MAX_HOUR = 18;

/**
 * 時刻 target_hour に対して近傍フォールバック付きで hourly snapshot を選ぶ。
 */
function pickNearestHourly(
    hourlies: HourlyMelonSnapshot[],
    targetHour: number
): HourlyMelonSnapshot | null {
    if (hourlies.length === 0) return null;
    let best: HourlyMelonSnapshot | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    for (const h of hourlies) {
        const hh = Number(h.hourTimestamp.slice(9, 11));
        if (!Number.isFinite(hh)) continue;
        const dist = Math.abs(hh - targetHour);
        if (dist < bestDist) {
            bestDist = dist;
            best = h;
        }
    }
    return best;
}

/**
 * HourlyMelonSnapshot を ImageSnapshot に変換。
 */
function hourlyToImageSnapshot(h: HourlyMelonSnapshot): ImageSnapshot {
    return {
        melonID: h.melonID,
        timeKey: h.hourTimestamp,
        representative_s3Key:       h.representative_s3Key,
        representative_mask_s3_key: h.representative_mask_s3_key,
        representative_capturedAt:  h.representative_capturedAt,
    };
}

/**
 * DailyMelonSnapshot を ImageSnapshot に変換（hourly が取れない時のフォールバック用）。
 */
function dailyToImageSnapshot(d: DailyMelonSnapshot): ImageSnapshot {
    return {
        melonID: d.melonID,
        timeKey: d.dateJST,
        representative_s3Key:       d.representative_s3Key,
        representative_mask_s3_key: d.representative_mask_s3_key,
        representative_capturedAt:  d.representative_capturedAt,
    };
}

const GrowthView: React.FC<Props> = ({
    melon, view, onViewChange, selectedDate, onSelectedDateChange,
}) => {
    const melonID    = melon?.melonID ?? null;
    const seasonName = melon ? extractSeasonName(melon.season) : null;

    const [selectedHour, setSelectedHour] = useState<number>(DEFAULT_HOUR);

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

    // hourly snapshots を日次/時次両モードで取得（画像の時刻連動用）
    const hourlyRange = useMemo(() => {
        if (!melonID) return { start: null, end: null };
        return { start: `${compactDate}-00`, end: `${compactDate}-23` };
    }, [melonID, compactDate]);

    const { data: hourlyData, loading: hourlyLoading } = useHourlyMelonSnapshots({
        melonID,
        startTimestamp: hourlyRange.start,
        endTimestamp:   hourlyRange.end,
    });

    // 赤破線はスライダー選択日に対応する DAP
    const currentDap = melon?.pollinationDate
        ? daysBetween(melon.pollinationDate, selectedDate)
        : 0;

    const selectedDailySnapshot = useMemo(
        () => dailyData.find(d => d.dateJST === compactDate) ?? null,
        [dailyData, compactDate]
    );

    // 画像用スナップショット: hourly を優先、無ければ daily にフォールバック
    const imageSnapshot: ImageSnapshot | null = useMemo(() => {
        const nearest = pickNearestHourly(hourlyData, selectedHour);
        if (nearest) return hourlyToImageSnapshot(nearest);
        if (selectedDailySnapshot) return dailyToImageSnapshot(selectedDailySnapshot);
        return null;
    }, [hourlyData, selectedHour, selectedDailySnapshot]);

    const sliderIndex = dateList.indexOf(compactDate);
    const sliderValue = sliderIndex >= 0 ? sliderIndex : Math.max(0, dateList.length - 1);

    const handleDateSliderChange = (_: Event, value: number | number[]) => {
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
                            onChange={handleDateSliderChange}
                            disabled={dateList.length <= 1}
                        />
                    </Paper>
                )}
                <HourSlider
                    hour={selectedHour}
                    onChange={setSelectedHour}
                    min={MIN_HOUR}
                    max={MAX_HOUR}
                    disabled={hourlyData.length === 0}
                />
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
                            <InfoPanel  melon={melon} snapshot={selectedDailySnapshot} />
                            <ImagePanel snapshot={imageSnapshot} />
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
                                    selectedHour={selectedHour}
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