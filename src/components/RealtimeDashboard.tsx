// RealtimeDashboard.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { Box, Paper, Typography, CircularProgress, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid'; // Grid v2
import { generateClient } from "aws-amplify/api";
import { listSensorData } from '../graphql/queries';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { MelonInfo } from '../types';

interface Props {
  deviceID: string;
  deviceMelons: MelonInfo[];
}

const client = generateClient();

export const RealtimeDashboard: React.FC<Props> = ({ deviceID, deviceMelons }) => {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentImages, setCurrentImages] = useState<{ url: string; melonId: string; key: string }[]>([]);

  const Y_AXIS_WIDTH = 50;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result: any = await client.graphql({
          query: listSensorData,
          variables: { deviceID, limit: 100 }
        });
        
        const items = result.data.listSensorData.items;
        const sorted = items.sort((a: any, b: any) => Number(a.timestamp) - Number(b.timestamp));
        setSensorData(sorted);
      } catch (e) {
        console.error("Error fetching sensor data", e);
      } finally {
        setLoading(false);
      }
    };

    if (deviceID) {
      fetchData();
    }
  }, [deviceID]);

  useEffect(() => {
    const updateImages = async () => {
      if (sensorData.length === 0) {
        setCurrentImages([]);
        return;
      }

      const latest = sensorData[sensorData.length - 1];
      const imageKeys: string[] = latest.imageKeys || [];

      if (imageKeys.length === 0) {
        setCurrentImages([]);
        return;
      }

      try {
        const session = await fetchAuthSession();
        if (!session.credentials) return;

        const s3 = new S3Client({
          region: process.env.REACT_APP_AWS_PROJECT_REGION,
          credentials: session.credentials
        });

        const promises = imageKeys.map(async (key) => {
          const command = new GetObjectCommand({
            Bucket: process.env.REACT_APP_S3_BUCKET,
            Key: key
          });
          const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

          const matchedMelon = deviceMelons.find(m => key.includes(m.deviceID_cameraID));
          const melonId = matchedMelon ? matchedMelon.id : "Unknown";

          return { url, melonId, key };
        });

        const results = await Promise.all(promises);
        setCurrentImages(results);

      } catch (err) {
        console.error("Failed to generate signed urls", err);
        setCurrentImages([]);
      }
    };

    updateImages();
  }, [sensorData, deviceMelons]);

  const chartData = useMemo(() => {
    return sensorData.map(d => {
      const date = new Date(Number(d.timestamp) * 1000);
      return {
        ...d,
        timeLabel: `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`,
        temp: parseFloat(d.temperature),
        hum: parseFloat(d.humidity),
        lux_i: parseFloat(d.i_v_light),
        lux_u: parseFloat(d.u_v_light)
      };
    });
  }, [sensorData]);

  const latest = sensorData.length > 0 ? sensorData[sensorData.length - 1] : null;

  if (loading) return <CircularProgress />;
  if (!latest) return <Typography>No Sensor Data Available</Typography>;

  return (
    <Box sx={{ p: 2, height: '100%', overflowY: 'hidden' }}>
      <Grid container spacing={3} sx={{ height: '100%' }}>

        <Grid size={{ xs: 12, md: 8 }} sx={{ height: '100%', overflowY: 'auto', pr: 1 }}>
          <Typography variant="h5" gutterBottom>リアルタイム計測状況 (Device: {deviceID})</Typography>

          <Grid container spacing={2} direction="column">
            
            <Grid size={{ xs: 12 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Card>
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 2 } }}>
                      <Typography color="textSecondary" variant="caption">温度</Typography>
                      <Typography variant="h5">{parseFloat(latest.temperature).toFixed(1)}°C</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Card>
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 2 } }}>
                      <Typography color="textSecondary" variant="caption">湿度</Typography>
                      <Typography variant="h5">{parseFloat(latest.humidity).toFixed(1)}%</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Card>
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 2 } }}>
                      <Typography color="textSecondary" variant="caption">内部照度</Typography>
                      <Typography variant="h5">{latest.i_v_light} lx</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Card>
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 2 } }}>
                      <Typography color="textSecondary" variant="caption">外部照度</Typography>
                      <Typography variant="h5">{latest.u_v_light} lx</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* 温湿度推移グラフ */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 1, height: 250 }}>
                <Typography variant="subtitle2" gutterBottom>温湿度推移</Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeLabel" fontSize={12} />
                    <YAxis 
                      yAxisId="left" 
                      fontSize={12} 
                      label={{ value: '温度', angle: -90, position: 'insideLeft', fontSize: 10 }} 
                      width={Y_AXIS_WIDTH} 
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      fontSize={12} 
                      label={{ value: '湿度', angle: 90, position: 'insideRight', fontSize: 10 }} 
                      width={Y_AXIS_WIDTH} 
                    />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }}/>
                    <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#ff7300" name="温度" dot={false} strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="hum" stroke="#8884d8" name="湿度" dot={false} strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* 照度推移グラフ */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 1, height: 250 }}>
                <Typography variant="subtitle2" gutterBottom>照度推移</Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeLabel" fontSize={12} />
                    
                    <YAxis 
                      yAxisId="left" 
                      fontSize={12} 
                      label={{ value: '照度 (lx)', angle: -90, position: 'insideLeft', fontSize: 10 }} 
                      width={Y_AXIS_WIDTH} 
                    />
                    
                    <YAxis 
                      yAxisId="dummy" 
                      orientation="right" 
                      width={Y_AXIS_WIDTH} 
                      tick={false} 
                      axisLine={false} 
                    />

                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '12px' }}/>
                    
                    <Line yAxisId="left" type="monotone" dataKey="lux_i" stroke="#387908" name="内部照度" dot={false} strokeWidth={2} />
                    <Line yAxisId="left" type="monotone" dataKey="lux_u" stroke="#ffc658" name="外部照度" dot={false} strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ height: '100%', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>最新画像</Typography>
          
          <Grid container spacing={2} direction="column">
            {currentImages.length > 0 ? (
              currentImages.map((img, idx) => (
                <Grid key={idx} size={{ xs: 12 }}>
                  <Paper sx={{ p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ height: 300, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#00000008', borderRadius: 1 }}>
                      <img 
                        src={img.url} 
                        alt={`Melon ${img.melonId}`} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 4 }} 
                      />
                    </Box>
                    <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {img.melonId}
                    </Typography>
                    <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                      {img.key.split('/').pop()}
                    </Typography>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2, height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="textSecondary">画像なし</Typography>
                </Paper>
              </Grid>
            )}
            
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" display="block" align="right" sx={{ mt: 1 }}>
                取得時刻: {new Date(Number(latest.timestamp) * 1000).toLocaleString()}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

      </Grid>
    </Box>
  );
};