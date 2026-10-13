import React from 'react';
import { Box, Typography } from '@mui/material';
import type { Section } from '../../types/device';

interface Props {
    section: Section;
    selected: boolean;
    growingMelonCount?: number;
    onClick: () => void;
}

const SectionCell: React.FC<Props> = ({ section, selected, growingMelonCount = 0, onClick }) => {
    const hasPlants = section.plants.length > 0;

    return (
        <Box
            onClick={hasPlants ? onClick : undefined}
            sx={{
                aspectRatio: '1 / 1',
                border: '2px solid',
                borderColor: selected ? 'primary.main' : 'divider',
                borderRadius: 1.5,
                bgcolor: selected
                    ? 'primary.light'
                    : hasPlants ? 'background.paper' : 'action.disabledBackground',
                color: selected ? 'primary.contrastText' : 'text.primary',
                cursor: hasPlants ? 'pointer' : 'not-allowed',
                opacity: hasPlants ? 1 : 0.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms ease',
                userSelect: 'none',
                '&:hover': hasPlants ? {
                    borderColor: 'primary.main',
                    bgcolor: selected ? 'primary.main' : 'action.hover',
                } : {},
            }}
        >
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                {section.sectionID}
            </Typography>
            {hasPlants && (
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.7rem' }}>
                    {section.plants.length}株
                    {growingMelonCount > 0 && ` / ${growingMelonCount}個`}
                </Typography>
            )}
        </Box>
    );
};

export default SectionCell;