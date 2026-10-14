import React from 'react';
import { Paper, Stack, Typography, Box, Skeleton } from '@mui/material';
import { useImageUrls } from '../../hooks/useImageUrls';

/**
 * 画像表示用に最小化した汎用スナップショット型。
 * DailyMelonSnapshot / HourlyMelonSnapshot の両方から渡せる。
 */
export interface ImageSnapshot {
    melonID: string;
    /** キャッシュキー用の時刻識別子 (dateJST or hourTimestamp) */
    timeKey: string;
    representative_s3Key?: string;
    representative_mask_s3_key?: string;
    representative_capturedAt?: string;
}

interface Props {
    snapshot: ImageSnapshot | null;
}

export const ImagePanel: React.FC<Props> = ({ snapshot }) => {
    const keys = [
        snapshot?.representative_s3Key,
        snapshot?.representative_mask_s3_key,
    ].filter((k): k is string => !!k);

    const cacheKey = snapshot ? `${snapshot.melonID}_${snapshot.timeKey}` : '';

    const { urls, loading } = useImageUrls(keys, cacheKey);
    const [originalUrl, maskUrl] = urls;

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
                <Typography variant="h6">メロン画像</Typography>
                {snapshot?.representative_capturedAt && (
                    <Typography variant="caption" color="text.secondary">
                        {snapshot.representative_capturedAt}
                    </Typography>
                )}
            </Stack>

            <Stack direction="row" spacing={2}>
                <Box sx={{ width: '50%' }}>
                    <Typography variant="caption" display="block" align="center">
                        撮影画像
                    </Typography>
                    {loading ? (
                        <Skeleton variant="rectangular" width="100%" height={180} />
                    ) : (
                        <ImageBox url={originalUrl} alt="Original" />
                    )}
                </Box>

                <Box sx={{ width: '50%' }}>
                    <Typography variant="caption" display="block" align="center">
                        網目検出結果
                    </Typography>
                    {loading ? (
                        <Skeleton variant="rectangular" width="100%" height={180} />
                    ) : (
                        <ImageBox url={maskUrl} alt="Mask" grayscale />
                    )}
                </Box>
            </Stack>
        </Paper>
    );
};

interface ImageBoxProps {
    url: string | undefined;
    alt: string;
    grayscale?: boolean;
}

const ImageBox: React.FC<ImageBoxProps> = ({ url, alt, grayscale }) => (
    <Box
        sx={{
            position: 'relative',
            minHeight: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
            borderRadius: 1,
            p: 0.5,
        }}
    >
        {url ? (
            <img
                src={url}
                alt={alt}
                style={{
                    maxWidth: '100%',
                    maxHeight: 240,
                    objectFit: 'contain',
                    borderRadius: 4,
                    filter: grayscale ? 'grayscale(100%)' : undefined,
                }}
            />
        ) : (
            <Typography variant="body2" color="text.secondary">
                No Image
            </Typography>
        )}
    </Box>
);

export default ImagePanel;