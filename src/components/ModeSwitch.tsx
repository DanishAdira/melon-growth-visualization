import React from 'react';
import { Tabs, Tab, Paper } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import GridViewIcon from '@mui/icons-material/GridView';

export type Mode = 'growth' | 'environment' | 'overview';

interface Props {
    mode: Mode;
    onChange: (mode: Mode) => void;
}

const ModeSwitch: React.FC<Props> = ({ mode, onChange }) => (
    <Paper sx={{ mb: 2 }}>
        <Tabs
            value={mode}
            onChange={(_, v) => onChange(v as Mode)}
            variant="fullWidth"
        >
            <Tab icon={<ScienceIcon />}    iconPosition="start" label="生育" value="growth"      sx={{ textTransform: 'none' }} />
            <Tab icon={<ThermostatIcon />} iconPosition="start" label="環境" value="environment" sx={{ textTransform: 'none' }} />
            <Tab icon={<GridViewIcon />}   iconPosition="start" label="全体" value="overview"    sx={{ textTransform: 'none' }} />
        </Tabs>
    </Paper>
);

export default ModeSwitch;