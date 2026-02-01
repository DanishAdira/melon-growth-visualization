import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import Grid from '@mui/material/Grid'; // Grid v2
import { generateClient } from "aws-amplify/api";

import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { ControlPanel } from './components/ControlPanel';
import { ImagePanel } from './components/ImagePanel';
import { InfoPanel } from './components/InfoPanel';
import { GrowthChart } from './components/GrowthChart';
import { RealtimeDashboard } from './components/RealtimeDashboard';

import { MelonInfo, GrowthSummary, IdealModel } from './types';
import { listDeviceMaps, listIdealModels, getGrowthSummaries } from './graphql/queries';
import './App.css'; 

const client = generateClient();

// APIレスポンス型
type DeviceMapResponse = { deviceID_cameraID: string; melonID: string; season: string; pollinationDate: string };

function App() {
  // --- 1. State Hooks ---
  const [melons, setMelons] = useState<MelonInfo[]>([]);
  
  // 選択状態
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedMelonId, setSelectedMelonId] = useState<string>('');
  
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState(12);
  const [dateList, setDateList] = useState<string[]>([]);
  
  // データ
  const [summaries, setSummaries] = useState<GrowthSummary[]>([]);
  const [idealModels, setIdealModels] = useState<Record<string, IdealModel>>({});
  const [loading, setLoading] = useState(false);

  // 表示モード ('summary' | 'realtime')
  const [viewMode, setViewMode] = useState<'summary' | 'realtime'>('summary');
  const lastSelectedDateRef = useRef<string>('');

  // --- 2. Helper Functions & Memos ---

  // deviceIDとcameraIDの抽出ヘルパー
  const getDeviceAndCamera = (idString: string) => {
    const parts = idString.split('_');
    return {
      deviceID: parts[0] || '',
      cameraID: parts[1] || '01'
    };
  };

  const deviceList = useMemo(() => {
    const ids = melons.map(m => getDeviceAndCamera(m.deviceID_cameraID).deviceID);
    return Array.from(new Set(ids)).sort();
  }, [melons]);

  const filteredMelons = useMemo(() => {
    if (!selectedDeviceId) return [];
    return melons.filter(m => getDeviceAndCamera(m.deviceID_cameraID).deviceID === selectedDeviceId);
  }, [melons, selectedDeviceId]);

  const handleDeviceChange = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    
    // デバイスが変わったら、そのデバイスに属する最初のメロンを自動選択
    const relatedMelons = melons.filter(m => getDeviceAndCamera(m.deviceID_cameraID).deviceID === newDeviceId);
    if (relatedMelons.length > 0) {
      setSelectedMelonId(relatedMelons[0].id);
    } else {
      setSelectedMelonId('');
    }
  };

  // メロン変更ハンドラ
  const handleMelonChange = (id: string) => {
    setSelectedMelonId(id);
  };

  // 選択中のメロン詳細情報
  const selectedMelonInfo = useMemo(() => 
    melons.find(m => m.id === selectedMelonId), 
  [melons, selectedMelonId]);

  const currentDateStr = dateList[selectedDateIndex] || '';

  // --- 3. Effects ---
  useEffect(() => {
    if (currentDateStr) {
      lastSelectedDateRef.current = currentDateStr;
    }
  }, [currentDateStr]);

  // 初期化: メロン一覧取得
  useEffect(() => {
    const fetchMelons = async () => {
      try {
        const result = await client.graphql({ query: listDeviceMaps }) as { data: { listDeviceMaps: DeviceMapResponse[] } };
        const rawData = result.data.listDeviceMaps;

        const uniqueMelons: MelonInfo[] = rawData.map(item => ({
          id: item.melonID,
          deviceID_cameraID: item.deviceID_cameraID,
          season: item.season,
          pollinationDate: item.pollinationDate
        }));
        
        // 重複除外
        const distinctMelons = Array.from(new Map(uniqueMelons.map(m => [m.id, m])).values());
        setMelons(distinctMelons);

        // 初期選択
        if (distinctMelons.length > 0) {
          const firstMelon = distinctMelons[0];
          const { deviceID } = getDeviceAndCamera(firstMelon.deviceID_cameraID);
          setSelectedDeviceId(deviceID);
          setSelectedMelonId(firstMelon.id);
        }
      } catch (error) {
        console.error("Error fetching melons:", error);
      }
    };
    fetchMelons();
  }, []);

  // 理想モデル取得
  useEffect(() => {
    const fetchIdealModels = async () => {
      if (!selectedMelonInfo) return;
      try {
        const result = await client.graphql({ 
          query: listIdealModels,
          variables: { season: selectedMelonInfo.season }
        }) as any;

        const models = result.data.listIdealModels;
        const modelMap: Record<string, IdealModel> = {};
        models.forEach((m: any) => {
          modelMap[m.metric_name] = m;
        });
        setIdealModels(modelMap);
      } catch (error) {
        console.error("Error fetching ideal models:", error);
      }
    };
    
    fetchIdealModels();
  }, [selectedMelonInfo]);

  // 生育サマリー履歴取得
  useEffect(() => {
    const fetchSummaries = async () => {
      if (!selectedMelonId) return;
      setLoading(true);
      try {
        const result = await client.graphql({
          query: getGrowthSummaries,
          variables: { melonID: selectedMelonId, limit: 100 }
        }) as any;
        
        const items = result.data.getGrowthSummaries.items as GrowthSummary[];
        items.sort((a, b) => a.targetDate.localeCompare(b.targetDate));
        
        setSummaries(items);
        
        const dates = items.map(i => i.targetDate);
        setDateList(dates);

        const lastDate = lastSelectedDateRef.current;
        const targetIndex = dates.indexOf(lastDate);

        if (targetIndex !== -1) {
          // 同じ日付が見つかった場合、その日付を選択
          setSelectedDateIndex(targetIndex);
        } else if (dates.length > 0) {
          // 見つからなかった場合のみ、最新の日付を選択
          setSelectedDateIndex(dates.length - 1);
        } else {
          setSelectedDateIndex(0);
        }

      } catch (error) {
        console.error("Error fetching summaries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [selectedMelonId]);

  // 現在表示用データ (計算済みのcurrentDateStrを使用)
  const currentSummary = useMemo(() => {
    if (!currentDateStr || summaries.length === 0) return null;
    return summaries.find(s => s.targetDate === currentDateStr) || null;
  }, [currentDateStr, summaries]);
  const currentDap = currentSummary?.dap ?? 0;

  // --- 4. Render ---
  return (
    <div className="main-container">
      <AppHeader />
      
      {/* コントロールパネル */}
      {selectedMelonInfo && (
        <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0', zIndex: 10 }}>
          <ControlPanel 
            deviceList={deviceList}
            selectedDeviceId={selectedDeviceId}
            onDeviceChange={handleDeviceChange}
            
            melons={filteredMelons}
            selectedMelonId={selectedMelonId}
            onMelonChange={handleMelonChange}
            
            selectedDateIndex={selectedDateIndex}
            dateList={dateList}
            onDateChange={setSelectedDateIndex}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}

            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </Box>
      )}

      {/* メインコンテンツエリア */}
      <Box className="content-area" sx={{ p: 2 }}>
        {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
        
        {!loading && selectedMelonInfo && (
          <>
            {viewMode === 'realtime' ? (
              // --- リアルタイムモード ---
              <Box sx={{ height: '100%' }}>
                {(() => {
                  const { deviceID } = getDeviceAndCamera(selectedMelonInfo.deviceID_cameraID);
                  return (
                    <RealtimeDashboard 
                      deviceID={deviceID} 
                      deviceMelons={filteredMelons} 
                    />
                  );
                })()}
              </Box>
            ) : (
              // --- サマリーモード ---
              <Grid container spacing={3} sx={{ height: '100%' }}>
                <Grid size={{ xs: 12, md: 4 }} className="left-column">
                  <div className="panel-card">
                     {currentSummary ? (
                       <InfoPanel 
                         info={selectedMelonInfo} 
                         summary={currentSummary}
                         onCheckStatus={() => setViewMode('realtime')}
                       />
                     ) : (
                       <Typography p={2}>No Data Available</Typography>
                     )}
                  </div>
                  <div className="panel-card image-panel">
                    <ImagePanel 
                      time={selectedTime} 
                      dateStr={currentDateStr}
                      deviceID_cameraID={selectedMelonInfo.deviceID_cameraID} 
                    />
                  </div>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }} className="right-column">
                  <GrowthChart 
                    summaries={summaries} 
                    idealModels={idealModels}
                    currentDap={currentDap}
                    pollinationDate={selectedMelonInfo.pollinationDate}
                  />
                </Grid>
              </Grid>
            )}
          </>
        )}
      </Box>
      <AppFooter />
    </div>
  );
}

export default App;