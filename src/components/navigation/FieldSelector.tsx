import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { FIELD_OPTIONS } from '../../constants/fields';

interface Props {
    fieldID: string;
    onChange: (nextFieldID: string) => void;
    disabled?: boolean;
}

const FieldSelector: React.FC<Props> = ({ fieldID, onChange, disabled }) => {
    const handleChange = (e: SelectChangeEvent) => {
        onChange(e.target.value);
    };

    if (FIELD_OPTIONS.length === 0) {
        return null;
    }

    return (
        <FormControl size="small" sx={{ minWidth: 180 }} disabled={disabled}>
            <InputLabel id="field-selector-label">圃場</InputLabel>
            <Select
                labelId="field-selector-label"
                value={fieldID}
                label="圃場"
                onChange={handleChange}
            >
                {FIELD_OPTIONS.map((f) => (
                    <MenuItem key={f.id} value={f.id}>{f.label}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default FieldSelector;