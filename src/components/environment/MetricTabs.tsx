import React from 'react';
import { Tabs, Tab, Paper } from '@mui/material';
import type { SensorMetricKey } from '../../types/sensor';
import { SENSOR_METRICS } from '../../constants/metrics';

interface Props {
    selected: SensorMetricKey;
    onSelect: (key: SensorMetricKey) => void;
    availableKeys?: SensorMetricKey[];  // 省略時は全キー
}

const MetricTabs: React.FC<Props> = ({ selected, onSelect, availableKeys }) => {
    const keys = availableKeys ?? (Object.keys(SENSOR_METRICS) as SensorMetricKey[]);

    return (
        <Paper sx={{ mb: 2 }}>
            <Tabs
                value={selected}
                onChange={(_, v) => onSelect(v as SensorMetricKey)}
                variant="scrollable"
                scrollButtons="auto"
            >
                {keys.map((k) => {
                    const config = SENSOR_METRICS[k];
                    return (
                        <Tab
                            key={k}
                            value={k}
                            label={config.label}
                            sx={{
                                '&.Mui-selected': { color: config.color },
                                textTransform: 'none',
                            }}
                        />
                    );
                })}
            </Tabs>
        </Paper>
    );
};

export default MetricTabs;