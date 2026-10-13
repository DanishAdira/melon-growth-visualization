import React, { useMemo } from 'react';
import { ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import type { Melon, HdrKey } from '../../types/melon';

interface Props {
    melons: Melon[];  // 選択中の plant に属する growing melons
    selectedCameraID: HdrKey | null;
    onChange: (cameraID: HdrKey) => void;
}

const HdrToggle: React.FC<Props> = ({ melons, selectedCameraID, onChange }) => {
    const availableCameras = useMemo<HdrKey[]>(() => {
        const set = new Set<HdrKey>();
        melons.forEach(m => set.add(m.cameraID));
        // "1","2","3","4" 等の文字列を数値順で返す
        return Array.from(set).sort((a, b) => Number(a) - Number(b));
    }, [melons]);

    if (availableCameras.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                この株に対応するメロンレコードがありません
            </Typography>
        );
    }

    const handleChange = (_: React.MouseEvent<HTMLElement>, value: HdrKey | null) => {
        if (value !== null) onChange(value);
    };

    return (
        <ToggleButtonGroup
            size="small"
            exclusive
            value={selectedCameraID}
            onChange={handleChange}
        >
            {availableCameras.map((cam) => (
                <ToggleButton key={cam} value={cam}>
                    HDR{cam}
                </ToggleButton>
            ))}
        </ToggleButtonGroup>
    );
};

export default HdrToggle;