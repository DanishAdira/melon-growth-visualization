import React from 'react';
import { Paper, FormControl, InputLabel, Select, MenuItem, Slider, Typography, Stack, SelectChangeEvent } from '@mui/material';
import { MelonInfo } from '../types';

interface Props {
  melons: MelonInfo[];
  selectedMelonId: string;
  onMelonChange: (id: string) => void;
  selectedDateIndex: number;
  dateList: string[]; // 利用可能な日付リスト
  onDateChange: (index: number) => void;
  selectedTime: number; // 6-18
  onTimeChange: (time: number) => void;
}

export const ControlPanel: React.FC<Props> = ({
  melons, selectedMelonId, onMelonChange,
  selectedDateIndex, dateList, onDateChange,
  selectedTime, onTimeChange
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" spacing={4} alignItems="center">
        {/* メロン選択 */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>メロンID</InputLabel>
          <Select
            value={selectedMelonId}
            label="Melon ID"
            onChange={(e: SelectChangeEvent) => onMelonChange(e.target.value)}
          >
            {melons.map(m => <MenuItem key={m.id} value={m.id}>{m.id}</MenuItem>)}
          </Select>
        </FormControl>

        {/* 日付スクロール (スライダー) */}
        <Stack sx={{ flexGrow: 1 }} spacing={1}>
          <Typography variant="caption">撮影日選択： {dateList[selectedDateIndex]}</Typography>
          <Slider
            value={selectedDateIndex}
            min={0}
            max={dateList.length - 1}
            step={1}
            onChange={(_, val) => onDateChange(val as number)}
            valueLabelDisplay="auto"
            valueLabelFormat={(idx) => dateList[idx]}
          />
        </Stack>

        {/* 時間選択 (6:00 - 18:00) */}
        <Stack spacing={1} sx={{ width: 150 }}>
          <Typography variant="caption">撮影時間帯選択： {selectedTime}:00</Typography>
          <Slider
            value={selectedTime}
            min={6}
            max={18}
            step={1}
            marks
            onChange={(_, val) => onTimeChange(val as number)}
          />
        </Stack>
      </Stack>
    </Paper>
  );
};