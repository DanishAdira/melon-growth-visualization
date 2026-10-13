import React, { useMemo, useState } from 'react';
import { Box, Alert, CircularProgress, Stack } from '@mui/material';
import type { Plant, Device } from '../../types/device';
import type { SensorMetricKey } from '../../types/sensor';
import { SENSOR_METRICS, DAY_MINUTES } from '../../constants/metrics';
import { useSensorDayData } from '../../hooks/useSensorDayData';
import { useSensorWindow } from '../../hooks/useSensorWindow';
import { useDailySensorSnapshots } from '../../hooks/useDailySensorSnapshots';
import { resolveAggregationKey } from '../../constants/aggregationKey';
import { toLocalDateStr, nowMinutesOfDay, toCompactDateStr } from '../../utils/dateTime';
import SensorHeader from '../environment/SensorHeader';
import MetricTabs from '../environment/MetricTabs';
import DetailChart from '../environment/DetailChart';
import OverviewChart from '../environment/OverviewChart';
import SensorStatsCard from '../environment/SensorStatsCard';
import GddCard from '../environment/GddCard';
import CameraImagePanel from '../environment/CameraImagePanel';

interface Props {
    fieldID: string;
    sectionID: string | null;
    plantID: string | null;
    plant: Plant | null;
    selectedDate: string;
    onSelectedDateChange: (d: string) => void;
}

const EnvironmentView: React.FC<Props> = ({
    fieldID, sectionID, plantID, plant, selectedDate, onSelectedDateChange,
}) => {
    const [endTimeMinutes, setEndTimeMinutes] = useState<number>(nowMinutesOfDay());
    const [selectedMetric, setSelectedMetric] = useState<SensorMetricKey>('temperature');
    const todayStr = toLocalDateStr(new Date());

    const resolved = useMemo(
        () => resolveAggregationKey({ fieldID, sectionID, plantID }),
        [fieldID, sectionID, plantID]
    );

    const aggregationLabel = useMemo(() => {
        if (!resolved) return '—';
        if (resolved.level === 'PLANT')   return `${sectionID} / ${plantID} (Plant)`;
        if (resolved.level === 'SECTION') return `${sectionID} (Section)`;
        return `${fieldID} (Field)`;
    }, [resolved, fieldID, sectionID, plantID]);

    const device: Device | undefined = plant?.melon;
    const deviceID = device?.deviceID ?? null;

    const dayStart = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);
    const dayEnd   = useMemo(() => {
        const d = new Date(dayStart);
        d.setDate(d.getDate() + 1);
        return d;
    }, [dayStart]);

    const isToday = selectedDate === todayStr;
    const { data: sensorData, loading: sensorLoading, error: sensorError } = useSensorDayData({
        deviceID,
        dayStart,
        dayEnd,
        autoRefresh: isToday,
    });

    const sw = useSensorWindow({ data: sensorData, selectedDate, endTimeMinutes });

    const compactDate = toCompactDateStr(selectedDate);
    const { data: snapshots, loading: snapLoading } = useDailySensorSnapshots({
        aggregationKey: resolved?.aggregationKey ?? null,
        startDate: selectedDate,
        endDate:   selectedDate,
    });
    const selectedSnapshot = snapshots.find(s => s.dateJST === compactDate) ?? null;

    const handleJumpToNow = () => {
        onSelectedDateChange(todayStr);
        setEndTimeMinutes(nowMinutesOfDay());
    };

    const handleDateChange = (next: string) => {
        onSelectedDateChange(next);
        setEndTimeMinutes(next === todayStr ? nowMinutesOfDay() : DAY_MINUTES - 1);
    };

    const metric = SENSOR_METRICS[selectedMetric];
    const isPlantLevel = resolved?.level === 'PLANT';

    return (
        <>
            <SensorHeader
                selectedDate={selectedDate}
                todayStr={todayStr}
                aggregationLabel={aggregationLabel}
                onDateChange={handleDateChange}
                onJumpToNow={handleJumpToNow}
            />

            {/* Plant レベル: リアルタイム画像パネル */}
            {isPlantLevel && deviceID && (
                <CameraImagePanel
                    imageKeys={sw.selectedItem?.imageKeys ?? null}
                    timestamp={sw.selectedItem?.timestamp ?? null}
                />
            )}

            {/* 集約カード */}
            {snapLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <Stack spacing={2} sx={{ mb: 2 }}>
                    <SensorStatsCard snapshot={selectedSnapshot} />
                    <GddCard snapshot={selectedSnapshot} />
                </Stack>
            )}

            {/* 時系列詳細（Plant のみ） */}
            {!isPlantLevel ? (
                <Alert severity="info">
                    株を選択するとセンサーの時系列詳細が表示されます。
                </Alert>
            ) : !deviceID ? (
                <Alert severity="warning">
                    この株に対応するデバイスが見つかりません。
                </Alert>
            ) : (
                <>
                    <MetricTabs
                        selected={selectedMetric}
                        onSelect={setSelectedMetric}
                    />
                    {sensorError ? (
                        <Alert severity="error">{sensorError}</Alert>
                    ) : sensorLoading && sensorData.length === 0 ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <DetailChart
                                data={sw.windowData}
                                metric={metric}
                                metricKey={selectedMetric}
                                windowStart={sw.windowStart}
                                windowEnd={sw.windowEnd}
                                hourlyTicks={sw.hourlyTicks}
                            />
                            <OverviewChart
                                data={sensorData}
                                metric={metric}
                                metricKey={selectedMetric}
                                dayStart={sw.dayStart}
                                dayEnd={sw.dayEnd}
                                windowStart={sw.windowStart}
                                windowEnd={sw.windowEnd}
                                dayTicks={sw.dayTicks}
                                endTimeMinutes={endTimeMinutes}
                                onEndTimeChange={setEndTimeMinutes}
                            />
                        </>
                    )}
                </>
            )}
        </>
    );
};

export default EnvironmentView;