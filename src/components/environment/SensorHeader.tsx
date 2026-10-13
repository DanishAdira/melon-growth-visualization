import React from 'react';
import { Paper, Stack, TextField, Button, Typography, Chip } from '@mui/material';

interface Props {
    selectedDate: string;        // "YYYY-MM-DD"
    todayStr: string;            // "YYYY-MM-DD"
    aggregationLabel: string;    // 例: "N1E2 / N1E2_1 (Plant)"
    onDateChange: (next: string) => void;
    onJumpToNow: () => void;
}

const SensorHeader: React.FC<Props> = ({
    selectedDate, todayStr, aggregationLabel, onDateChange, onJumpToNow,
}) => {
    const isToday = selectedDate === todayStr;

    return (
        <Paper sx={{ p: 1.5, mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {aggregationLabel}
                </Typography>
                <TextField
                    type="date"
                    size="small"
                    value={selectedDate}
                    onChange={(e) => onDateChange(e.target.value)}
                    inputProps={{ max: todayStr }}
                />
                {isToday ? (
                    <Chip label="今日" size="small" color="primary" variant="outlined" />
                ) : (
                    <Button size="small" variant="outlined" onClick={onJumpToNow}>
                        今日に戻る
                    </Button>
                )}
            </Stack>
        </Paper>
    );
};

export default SensorHeader;