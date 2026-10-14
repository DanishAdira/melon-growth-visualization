import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Chip,
    Stack,
    Box,
    Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import type { Melon, DailyMelonSnapshot } from '../../types/melon';
import { daysBetween, toLocalDateStr } from '../../utils/dateTime';
import { useLatestDailyMelonSnapshotsByMelons } from '../../hooks/useLatestDailyMelonSnapshotsByMelons';
import {
    densityToColor, pickTextColor, DENSITY_STOPS, NO_DATA_COLOR,
} from '../../utils/densityHeatmap';

interface Props {
    melons: Melon[];
    onSelect?: (melon: Melon) => void;
}

const sortMelons = (melons: Melon[]): Melon[] =>
    [...melons].sort((a, b) => {
        if (a.sectionID !== b.sectionID) return a.sectionID.localeCompare(b.sectionID);
        if (a.plantID   !== b.plantID)   return a.plantID.localeCompare(b.plantID);
        return a.cameraID.localeCompare(b.cameraID);
    });

const GrowingMelonsGrid: React.FC<Props> = ({ melons, onSelect }) => {
    const sorted = useMemo(() => sortMelons(melons), [melons]);
    const today  = toLocalDateStr(new Date());

    // ヒートマップ用: 各メロンの最新 daily snapshot を取得（直近7日の範囲で最新を拾う）
    const melonIDs = useMemo(() => sorted.map(m => m.melonID), [sorted]);
    const lookbackStart = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return toLocalDateStr(d);
    }, []);

    const { data: latestByMelon } = useLatestDailyMelonSnapshotsByMelons({
        melonIDs,
        startDate: lookbackStart,
        endDate:   today,
    });

    if (sorted.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                栽培中のメロンがありません
            </Typography>
        );
    }

    return (
        <>
            <HeatmapLegend />
            <Grid container spacing={2}>
                {sorted.map((m) => {
                    const dap = m.pollinationDate
                        ? daysBetween(m.pollinationDate, today)
                        : null;
                    const snap = latestByMelon[m.melonID] ?? null;
                    return (
                        <Grid key={m.melonID} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                            <MelonCard
                                melon={m}
                                dap={dap}
                                snapshot={snap}
                                onClick={onSelect ? () => onSelect(m) : undefined}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </>
    );
};

interface MelonCardProps {
    melon: Melon;
    dap: number | null;
    snapshot: DailyMelonSnapshot | null;
    onClick?: () => void;
}

const MelonCard: React.FC<MelonCardProps> = ({ melon, dap, snapshot, onClick }) => {
    const density = snapshot?.density ?? null;
    const { color: heatColor, label: heatLabel } = densityToColor(density);
    const textColor = pickTextColor(heatColor);

    const statusBadge = (() => {
        if (melon.netDetectionStatus === 'detected') {
            return { label: '網目検出済み', color: 'success' as const };
        }
        if (melon.netDetectionStatus === 'pending') {
            return { label: '網目発生前', color: 'default' as const };
        }
        return null;
    })();

    const densityTooltip = density != null
        ? `網目密度 ${density.toFixed(3)} (${heatLabel})`
        : '網目密度データなし';

    const content = (
        <CardContent sx={{ position: 'relative' }}>
            {/* 右上の網目密度バッジ (ヒートマップ色) */}
            <Tooltip title={densityTooltip} arrow>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: heatColor,
                        color: textColor,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        lineHeight: 1.4,
                        minWidth: 48,
                        textAlign: 'center',
                    }}
                >
                    {density != null ? density.toFixed(3) : '—'}
                </Box>
            </Tooltip>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1, pr: 7 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {melon.sectionID} / {melon.plantID}
                </Typography>
                <Chip label={`HDR${melon.cameraID}`} size="small" variant="outlined" />
            </Stack>

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1, wordBreak: 'break-all' }}
            >
                {melon.melonID}
            </Typography>

            <Stack direction="row" spacing={2} alignItems="baseline" sx={{ mb: 1 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary">DAP</Typography>
                    <Typography variant="h5" color="primary" sx={{ lineHeight: 1 }}>
                        {dap ?? '—'}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">交配日</Typography>
                    <Typography variant="body2">
                        {melon.pollinationDate ?? '—'}
                    </Typography>
                </Box>
            </Stack>

            {statusBadge && (
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip label={statusBadge.label} color={statusBadge.color} size="small" />
                    {melon.netDetectionStatus === 'detected'
                     && melon.netOnsetDaysAfterPollination != null && (
                        <Typography variant="caption" color="success.main">
                            DAP {melon.netOnsetDaysAfterPollination} に検出
                        </Typography>
                    )}
                </Stack>
            )}
        </CardContent>
    );

    return (
        <Card
            variant="outlined"
            sx={{
                // 左端にヒートマップ色の帯を出して俯瞰時の視認性を上げる
                borderLeft: `6px solid ${heatColor}`,
            }}
        >
            {onClick ? (
                <CardActionArea onClick={onClick}>{content}</CardActionArea>
            ) : (
                content
            )}
        </Card>
    );
};

/**
 * ヒートマップ凡例。
 */
const HeatmapLegend: React.FC = () => (
    <Stack
        direction="row"
        spacing={0.5}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 2 }}
    >
        <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            網目密度:
        </Typography>
        {DENSITY_STOPS.map((stop) => (
            <Stack
                key={stop.label}
                direction="row"
                spacing={0.5}
                alignItems="center"
                sx={{ mr: 1 }}
            >
                <Box
                    sx={{
                        width: 14,
                        height: 14,
                        borderRadius: 0.5,
                        bgcolor: stop.color,
                        border: '1px solid rgba(0,0,0,0.1)',
                    }}
                />
                <Typography variant="caption" color="text.secondary">
                    {stop.label}
                </Typography>
            </Stack>
        ))}
        <Stack direction="row" spacing={0.5} alignItems="center">
            <Box
                sx={{
                    width: 14,
                    height: 14,
                    borderRadius: 0.5,
                    bgcolor: NO_DATA_COLOR,
                    border: '1px solid rgba(0,0,0,0.1)',
                }}
            />
            <Typography variant="caption" color="text.secondary">
                データなし
            </Typography>
        </Stack>
    </Stack>
);

export default GrowingMelonsGrid;