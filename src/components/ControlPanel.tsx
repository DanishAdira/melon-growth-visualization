import React from 'react';
import { 
  Paper, FormControl, InputLabel, Select, MenuItem, 
  Slider, Typography, Stack, SelectChangeEvent, 
  Switch, FormControlLabel, Box, Divider
} from '@mui/material';
import { MelonInfo } from '../types';

interface Props {
  seasonList: string[];
  selectedSeason: string;
  onSeasonChange: (season: string) => void;

  pollinationDateList: string[];
  selectedPollinationDate: string;
  onPollinationDateChange: (date: string) => void;

  deviceList: string[];
  selectedDeviceId: string;
  onDeviceChange: (id: string) => void;

  melons: MelonInfo[];
  selectedMelonId: string;
  onMelonChange: (id: string) => void;

  selectedDateIndex: number;
  dateList: string[]; 
  onDateChange: (index: number) => void;
  selectedTime: number; 
  onTimeChange: (time: number) => void;

  viewMode: 'summary' | 'realtime';
  onViewModeChange: (mode: 'summary' | 'realtime') => void;
}

export const ControlPanel: React.FC<Props> = ({
  seasonList, selectedSeason, onSeasonChange,
  pollinationDateList, selectedPollinationDate, onPollinationDateChange,
  deviceList, selectedDeviceId, onDeviceChange,
  melons, selectedMelonId, onMelonChange,
  selectedDateIndex, dateList, onDateChange,
  selectedTime, onTimeChange,
  viewMode, onViewModeChange
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Season</InputLabel>
          <Select
            value={selectedSeason}
            label="Season"
            onChange={(e: SelectChangeEvent) => onSeasonChange(e.target.value)}
          >
            {seasonList.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>交配日</InputLabel>
          <Select
            value={selectedPollinationDate}
            label="交配日"
            onChange={(e: SelectChangeEvent) => onPollinationDateChange(e.target.value)}
            disabled={pollinationDateList.length === 0}
          >
            {pollinationDateList.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Device ID</InputLabel>
          <Select
            value={selectedDeviceId}
            label="Device ID"
            onChange={(e: SelectChangeEvent) => onDeviceChange(e.target.value)}
          >
            {deviceList.map(id => <MenuItem key={id} value={id}>{id}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Melon ID</InputLabel>
          <Select
            value={selectedMelonId}
            label="Melon ID"
            onChange={(e: SelectChangeEvent) => onMelonChange(e.target.value)}
          >
            {melons.map(m => <MenuItem key={m.id} value={m.id}>{m.id}</MenuItem>)}
          </Select>
        </FormControl>

        <Divider orientation="vertical" flexItem />

        <Stack sx={{ flexGrow: 1, minWidth: 200 }} spacing={1}>
          <Typography variant="caption">
             撮影日: {dateList[selectedDateIndex] || '---'}
          </Typography>
          <Slider
            value={selectedDateIndex}
            min={0}
            max={Math.max(0, dateList.length - 1)}
            step={1}
            onChange={(_, val) => onDateChange(val as number)}
            disabled={dateList.length === 0}
            size="small"
          />
        </Stack>

        <Stack spacing={1} sx={{ width: 120 }}>
          <Typography variant="caption">撮影時間: {selectedTime}:00</Typography>
          <Slider
            value={selectedTime}
            min={6}
            max={18}
            step={1}
            marks
            onChange={(_, val) => onTimeChange(val as number)}
            size="small"
          />
        </Stack>

        <Divider orientation="vertical" flexItem />

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={viewMode === 'realtime'}
                onChange={(e) => onViewModeChange(e.target.checked ? 'realtime' : 'summary')}
                color="primary"
              />
            }
            label={viewMode === 'realtime' ? "リアルタイム" : "サマリー"}
          />
        </Box>

      </Stack>
    </Paper>
  );
};