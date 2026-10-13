import React from 'react';
import { Box } from '@mui/material';
import type { Section } from '../../types/device';
import type { Melon } from '../../types/melon';
import SectionCell from './SectionCell';
import { ALL_SECTIONS } from '../../utils/sectionParser';

interface Props {
    sections: Record<string, Section>;
    selectedSectionID: string | null;
    melons?: Melon[];
    onSelect: (sectionID: string) => void;
}

const SectionGrid: React.FC<Props> = ({ sections, selectedSectionID, melons = [], onSelect }) => {
    const melonCountBySection: Record<string, number> = {};
    melons.forEach(m => {
        melonCountBySection[m.sectionID] = (melonCountBySection[m.sectionID] ?? 0) + 1;
    });

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1,
                maxWidth: 360,
            }}
        >
            {ALL_SECTIONS.map((sid) => {
                const section = sections[sid];
                if (!section) return null;
                return (
                    <SectionCell
                        key={sid}
                        section={section}
                        selected={sid === selectedSectionID}
                        growingMelonCount={melonCountBySection[sid]}
                        onClick={() => onSelect(sid)}
                    />
                );
            })}
        </Box>
    );
};

export default SectionGrid;