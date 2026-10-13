import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import type { Plant } from '../../types/device';
import type { Melon } from '../../types/melon';

interface Props {
    plants: Plant[];
    selectedPlantID: string | null;
    melons?: Melon[];
    onSelect: (plantID: string) => void;
}

const PlantList: React.FC<Props> = ({ plants, selectedPlantID, melons = [], onSelect }) => {
    // 1株に複数 HDR の melon があるので、代表 status を detected > pending の優先度で決める
    const statusByPlant: Record<string, 'detected' | 'pending' | undefined> = {};
    melons.forEach(m => {
        const current = statusByPlant[m.plantID];
        if (m.netDetectionStatus === 'detected') statusByPlant[m.plantID] = 'detected';
        else if (!current && m.netDetectionStatus === 'pending') statusByPlant[m.plantID] = 'pending';
    });

    if (plants.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                株が登録されていません
            </Typography>
        );
    }

    return (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {plants.map((p) => {
                const isSelected = p.plantID === selectedPlantID;
                const status = statusByPlant[p.plantID];
                const color: 'success' | 'error' | 'primary' =
                    status === 'detected' ? 'success' :
                    status === 'pending'  ? 'error'   :
                                            'primary';
                return (
                    <Button
                        key={p.plantID}
                        size="small"
                        variant={isSelected ? 'contained' : 'outlined'}
                        color={color}
                        onClick={() => onSelect(p.plantID)}
                        sx={{ minWidth: 80 }}
                    >
                        {p.plantID}
                    </Button>
                );
            })}
        </Stack>
    );
};

export default PlantList;