import React from 'react';
import { Box, Typography } from '@mui/material';
import styles from './AppFooter.module.css';

export const AppFooter: React.FC = () => {
  return (
    <Box component="footer" className={styles.footerRoot}>
      <Typography variant="body2" color="textSecondary" align="center">
        © {new Date().getFullYear()} 峰野研究室 All rights reserved.
      </Typography>
    </Box>
  );
};