import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import styles from './AppHeader.module.css'; // CSS Modulesを利用

export const AppHeader: React.FC = () => {
  return (
    <AppBar position="static" color="default" elevation={1} className={styles.headerRoot}>
      <Toolbar>
        {/* ロゴやアイコンがある場合はここに配置 */}
        <Box className={styles.logoArea}>
          <Typography variant="h6" component="div" className={styles.title}>
            メロン生育過程可視化システム
          </Typography>
          <Typography variant="caption" className={styles.subtitle}>
            Melon Growth Monitoring System
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};