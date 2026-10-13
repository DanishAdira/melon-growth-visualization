import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';

export type GrowthViewMode = 'daily' | 'hourly';

interface Props {
    mode: GrowthViewMode;
    onChange: (mode: GrowthViewMode) => void;
}

const GrowthViewToggle: React.FC<Props> = ({ mode, onChange }) => {
    const handleChange = (_: React.MouseEvent<HTMLElement>, value: GrowthViewMode | null) => {
        if (value !== null) onChange(value);
    };

    return (
        <ToggleButtonGroup size="small" exclusive value={mode} onChange={handleChange}>
            <ToggleButton value="daily">日次</ToggleButton>
            <ToggleButton value="hourly">時次</ToggleButton>
        </ToggleButtonGroup>
    );
};

export default GrowthViewToggle;