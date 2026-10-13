import React from 'react';
import { Paper, Stack, Typography, Box, Skeleton } from '@mui/material';
import { useImageUrls } from '../../hooks/useImageUrls';
import { formatHHmm } from '../../utils/dateTime';

interface Props {
    imageKeys: string[] | null | undefined;
    timestamp: string | null;
}

const CameraImagePanel: React.FC<Props> = ({ imageKeys, timestamp }) => {
    const cacheKey = timestamp ?? '';
    const { urls, loading } = useImageUrls(imageKeys ?? null, cacheKey);

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
                <Typography variant="h6">カメラ画像</Typography>
                <Typography variant="caption" color="text.secondary">
                    {timestamp ? formatHHmm(new Date(timestamp).getTime()) : '---'}
                </Typography>
            </Stack>

            {loading ? (
                <Skeleton variant="rectangular" width="100%" height={200} />
            ) : urls.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                    この時刻には画像がありません。
                </Typography>
            ) : (
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        overflowX: 'auto',
                        justifyContent: urls.length === 1 ? 'center' : 'flex-start',
                    }}
                >
                    {urls.map((url, i) => (
                        <Box
                            key={i}
                            sx={{
                                flex: '0 0 auto',
                                maxWidth: urls.length === 1 ? '100%' : 300,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <img
                                src={url}
                                alt={`camera ${i + 1}`}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: 300,
                                    objectFit: 'contain',
                                    borderRadius: 4,
                                }}
                            />
                        </Box>
                    ))}
                </Stack>
            )}
        </Paper>
    );
};

export default CameraImagePanel;