import React, { useEffect, useState } from 'react';
import { Paper, Stack, Typography, Box, Skeleton } from '@mui/material';
// AWS SDK v3 & Amplify Auth imports (既存アプリの手法を踏襲)
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fetchAuthSession } from 'aws-amplify/auth';

interface Props {
  time: number;            // 選択された時間 (6-18)
  dateStr: string;         // 選択された日付 "YYYY-MM-DD"
  deviceID_cameraID?: string; // "22-27_01" のようなID
}

export const ImagePanel: React.FC<Props> = ({ time, dateStr, deviceID_cameraID }) => {
  const [imgUrls, setImgUrls] = useState<{ original: string | null; mask: string | null }>({ original: null, mask: null });
  const [loading, setLoading] = useState(false);

  // 署名付きURL生成関数 (既存ロジックを流用)
  const generatePresignedUrls = async (originalKey: string, maskKey: string) => {
    try {
      const session = await fetchAuthSession();
      if (!session.credentials) {
        console.warn("No credentials found");
        return null;
      }

      const s3 = new S3Client({
        region: process.env.REACT_APP_AWS_PROJECT_REGION!,
        credentials: {
          accessKeyId: session.credentials.accessKeyId,
          secretAccessKey: session.credentials.secretAccessKey,
          sessionToken: session.credentials.sessionToken,
        },
      });

      // 並列で2つのURLを取得
      const [originalUrl, maskUrl] = await Promise.all([
        getSignedUrl(s3, new GetObjectCommand({
          Bucket: process.env.REACT_APP_S3_BUCKET!,
          Key: originalKey,
        }), { expiresIn: 3600 }),
        getSignedUrl(s3, new GetObjectCommand({
          Bucket: process.env.REACT_APP_S3_BUCKET!,
          Key: maskKey,
        }), { expiresIn: 3600 })
      ]);

      return { original: originalUrl, mask: maskUrl };

    } catch (e) {
      console.error("Failed to generate presigned URLs:", e);
      return null;
    }
  };

  useEffect(() => {
    const fetchImages = async () => {
      // 必要な情報が揃っていない場合はクリアして終了
      if (!deviceID_cameraID || !dateStr) {
        setImgUrls({ original: null, mask: null });
        return;
      }
      
      setLoading(true);

      // 1. ファイル名の構築
      // dateStr: "2025-12-30" -> "20251230"
      const datePart = dateStr.replace(/-/g, '');
      // time: 12 -> "1200", 9 -> "0900"
      const timePart = time.toString().padStart(2, '0') + '00';
      // 例: "22-27_01_HDR_20251230-1200.jpg"
      const filename = `${deviceID_cameraID}_HDR_${datePart}-${timePart}.jpg`;

      // 2. パスの構築 (想定構造に基づく)
      // カメラID部分を取得 ("22-27_01" -> "01")
      const cameraIdPart = deviceID_cameraID.split('_')[1] || '01';
      // フォルダ番号を決定 ("01" -> "1")
      const folderNum = parseInt(cameraIdPart, 10).toString(); 
      
      // オリジナル画像パス: "image1/filename.jpg"
      const originalKey = `image${folderNum}/${filename}`;
      // マスク画像パス: "outputs/masks/filename.jpg"
      const maskKey = `outputs/masks/${filename}`;

      // 3. URL取得実行
      const urls = await generatePresignedUrls(originalKey, maskKey);
      
      if (urls) {
        setImgUrls(urls);
      } else {
        setImgUrls({ original: null, mask: null });
      }
      
      setLoading(false);
    };

    fetchImages();
  }, [time, dateStr, deviceID_cameraID]);

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>メロン画像 ({time}:00)</Typography>
      <Stack direction="row" spacing={2} justifyContent="center">
        
        {/* オリジナル画像 */}
        <Box sx={{ width: '50%' }}>
          <Typography variant="caption" display="block" align="center">撮影画像</Typography>
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={150} />
          ) : (
            <Box sx={{ position: 'relative', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f0f0', borderRadius: 1 }}>
              {imgUrls.original ? (
                <img 
                  src={imgUrls.original} 
                  alt="Original" 
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: 4 }} 
                  onError={(e) => {
                    // S3にファイルがない場合、署名付きURLは発行されるが読み込みで404になる
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('hidden');
                  }}
                />
              ) : null}
              {/* 画像がない、またはロードエラー時の表示 */}
              <Typography variant="body2" color="text.secondary" hidden={!!imgUrls.original} sx={{ position: 'absolute' }}>
                No Image
              </Typography>
            </Box>
          )}
        </Box>

        {/* マスク画像 */}
        <Box sx={{ width: '50%' }}>
          <Typography variant="caption" display="block" align="center">網目検出結果</Typography>
          {loading ? (
            <Skeleton variant="rectangular" width="100%" height={150} />
          ) : (
            <Box sx={{ position: 'relative', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f0f0', borderRadius: 1 }}>
              {imgUrls.mask ? (
                <img 
                  src={imgUrls.mask} 
                  alt="Mask" 
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: 4, filter: 'grayscale(100%)' }} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('hidden');
                  }}
                />
              ) : null}
              <Typography variant="body2" color="text.secondary" hidden={!!imgUrls.mask} sx={{ position: 'absolute' }}>
                No Mask
              </Typography>
            </Box>
          )}
        </Box>

      </Stack>
    </Paper>
  );
};