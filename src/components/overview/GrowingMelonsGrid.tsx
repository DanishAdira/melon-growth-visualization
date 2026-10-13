import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    CardActionArea,
    Typography,
    Chip,
    Stack,
    Box,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import type { Melon } from '../../types/melon';
import { daysBetween, toLocalDateStr } from '../../utils/dateTime';

interface Props {
    melons: Melon[];
    onSelect?: (melon: Melon) => void;  // 将来 Growth モードへジャンプ
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

    if (sorted.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                栽培中のメロンがありません
            </Typography>
        );
    }

    return (
        <Grid container spacing={2}>
            {sorted.map((m) => {
                const dap = m.pollinationDate
                    ? daysBetween(m.pollinationDate, today)
                    : null;
                return (
                    <Grid key={m.melonID} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <MelonCard
                            melon={m}
                            dap={dap}
                            onClick={onSelect ? () => onSelect(m) : undefined}
                        />
                    </Grid>
                );
            })}
        </Grid>
    );
};

interface MelonCardProps {
    melon: Melon;
    dap: number | null;
    onClick?: () => void;
}

const MelonCard: React.FC<MelonCardProps> = ({ melon, dap, onClick }) => {
    const statusBadge = (() => {
        if (melon.netDetectionStatus === 'detected') {
            return { label: '網目検出済み', color: 'success' as const };
        }
        if (melon.netDetectionStatus === 'pending') {
            return { label: '網目発生前', color: 'default' as const };
        }
        return null;
    })();

    const content = (
        <CardContent>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
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
        <Card variant="outlined">
            {onClick ? (
                <CardActionArea onClick={onClick}>{content}</CardActionArea>
            ) : (
                content
            )}
        </Card>
    );
};

export default GrowingMelonsGrid;