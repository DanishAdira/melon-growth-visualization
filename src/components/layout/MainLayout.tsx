import React from 'react';
import { Box } from '@mui/material';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

interface Props {
    children: React.ReactNode;
}

const MainLayout: React.FC<Props> = ({ children }) => (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <AppHeader />
        <Box component="main" sx={{ flex: 1 }}>
            {children}
        </Box>
        <AppFooter />
    </Box>
);

export default MainLayout;