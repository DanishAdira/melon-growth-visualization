// InfoPanel.tsx
import React from 'react';
import { Paper, Typography, Chip } from '@mui/material';
import Grid from '@mui/material/Grid'; // ★ 新Grid
import { GrowthSummary, MelonInfo } from '../types';

interface Props {
  info: MelonInfo;
  summary: GrowthSummary;
}

export const InfoPanel: React.FC<Props> = ({ info, summary }) => {
  const metrics = [
    { key: 'estimated_volume_px3', label: '肥大度合い (推定体積)' },
    { key: 'density', label: '網目密度' },
    { key: 'branch_points', label: '分岐点数' },
    { key: 'h_component_px', label: '網目横成分' },
    { key: 'v_component_px', label: '網目縦成分' },
  ] as const;

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>生育情報</Typography>

      <Grid container spacing={2} sx={{ mb: 2, width: '100%' }}>
        <Grid size={{ xs: 6 }}>
          <Typography variant="body2">栽培季節： <b>{info.season}</b></Typography>
        </Grid>
        <Grid size={{ xs: 6 }}>
          <Typography variant="body2">交配日： <b>{info.pollinationDate}</b></Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" color="primary">交配経過日数： {summary.dap} 日</Typography>
        </Grid>
      </Grid>

      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>現在の生長度指標 (±偏差)</Typography>

      <Grid container spacing={1} sx={{ width: '100%' }}>
        {metrics.map((m) => {
          const val = summary.actual_metrics[m.key] ?? 0;
          const diff = summary.deviation[m.key] ?? 0;
          const color = diff >= 0 ? 'success' : 'error';

          return (
            <Grid key={m.key} size={{ xs: 6 }}>
              <Paper variant="outlined" sx={{ p: 1 }}>
                <Typography variant="caption" color="textSecondary">{m.label}</Typography>
                <Typography variant="body1">
                  {val.toFixed(2)}
                  <Chip
                    label={`${diff > 0 ? '+' : ''}${diff.toFixed(2)}`}
                    color={color}
                    size="small"
                    sx={{ ml: 1, height: 20, fontSize: '0.6rem' }}
                  />
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};
