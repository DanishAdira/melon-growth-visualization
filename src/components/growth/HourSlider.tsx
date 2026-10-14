import React from 'react';
import { Paper, Typography, Slider } from '@mui/material';

interface Props {
    hour: number;
    onChange: (hour: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    label?: string;
}

/**
 * Growth モード共通の時刻スライダー。
 * 日次/時次両モードで画像の時刻切替に使用する。
 */
const HourSlider: React.FC<Props> = ({
    hour,
    onChange,
    min = 6,
    max = 18,
    disabled = false,
    label = '表示時刻',
}) => {
    const handleChange = (_: Event, value: number | number[]) => {
        onChange(value as number);
    };

    return (
        <Paper sx={{ p: 1.5, flex: 1, minWidth: 240 }}>
            <Typography variant="caption">
                {label}: {hour}時
            </Typography>
            <Slider
                size="small"
                value={hour}
                min={min}
                max={max}
                step={1}
                marks
                onChange={handleChange}
                disabled={disabled}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v}時`}
            />
        </Paper>
    );
};

export default HourSlider;