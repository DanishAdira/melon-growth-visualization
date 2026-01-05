import React, { useState, useEffect, useMemo } from 'react';
import { Box, AppBar, Toolbar, Typography, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid'; // Grid v2
import { generateClient } from "aws-amplify/api";

import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';

import { ControlPanel } from './components/ControlPanel';
import { ImagePanel } from './components/ImagePanel';
import { InfoPanel } from './components/InfoPanel';
import { GrowthChart } from './components/GrowthChart';
import { MelonInfo, GrowthSummary, IdealModel } from './types';
import { listDeviceMaps, listIdealModels, getGrowthSummaries } from './graphql/queries';
import './App.css'; 

const client = generateClient();

// APIレスポンス型
type DeviceMapResponse = { deviceID_cameraID: string; melonID: string; season: string; pollinationDate: string };

function App() {
  const [melons, setMelons] = useState<MelonInfo[]>([]);
  const [selectedMelonId, setSelectedMelonId] = useState('');
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState(12);
  const [dateList, setDateList] = useState<string[]>([]);
  
  const [summaries, setSummaries] = useState<GrowthSummary[]>([]);
  const [idealModels, setIdealModels] = useState<Record<string, IdealModel>>({});
  const [loading, setLoading] = useState(false);

  // --- 1. 初期化: メロン一覧取得 ---
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
        if (distinctMelons.length > 0) {
          setSelectedMelonId(distinctMelons[0].id);
        }
      } catch (error) {
        console.error("Error fetching melons:", error);
      }
    };
    fetchMelons();
  }, []);

  // --- 定義順序の修正: 先に selectedMelonInfo を計算する ---
  const selectedMelonInfo = useMemo(() => 
    melons.find(m => m.id === selectedMelonId), 
  [melons, selectedMelonId]);

  // --- 2. 理想モデルの取得 (selectedMelonInfoに依存) ---
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

  // --- 3. 生育サマリー履歴の取得 ---
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
        // 日付順にソート
        items.sort((a, b) => a.targetDate.localeCompare(b.targetDate));
        
        setSummaries(items);
        
        // 日付リスト更新
        const dates = items.map(i => i.targetDate);
        setDateList(dates);
        // 最新の日付を選択
        if (dates.length > 0) {
          setSelectedDateIndex(dates.length - 1);
        }
      } catch (error) {
        console.error("Error fetching summaries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [selectedMelonId]);

  // 現在の日付文字列
  const currentDateStr = dateList[selectedDateIndex] || '';

  // 現在のサマリーデータ
  const currentSummary = useMemo(() => {
    if (!currentDateStr || summaries.length === 0) return null;
    return summaries.find(s => s.targetDate === currentDateStr) || null;
  }, [currentDateStr, summaries]);

  // 現在のDAP
  const currentDap = currentSummary?.dap ?? 0;

//   return (
//     <div className="main-container">
//       {/* 1. ヘッダー */}
//       <AppBar position="static" color="default" elevation={1}>
//         <Toolbar>
//           <Typography variant="h6" color="inherit">PiNode Visualization</Typography>
//         </Toolbar>
//       </AppBar>

//       {/* 2. コントロールパネル */}
//       {selectedMelonInfo && (
//         <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0', zIndex: 10 }}>
//           <ControlPanel
//             melons={melons}
//             selectedMelonId={selectedMelonId}
//             onMelonChange={setSelectedMelonId}
//             selectedDateIndex={selectedDateIndex}
//             dateList={dateList}
//             onDateChange={setSelectedDateIndex}
//             selectedTime={selectedTime}
//             onTimeChange={setSelectedTime}
//           />
//         </Box>
//       )}

//       {/* 3. メインコンテンツエリア */}
//       <Box className="content-area">
//         {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
        
//         {!loading && selectedMelonInfo && (
//           <Grid container spacing={3} sx={{ height: '100%' }}>
            
//             {/* --- 左カラム: Info (上) + 画像 (下) --- */}
//             <Grid size={{ xs: 12, md: 4 }} className="left-column">
              
//               {/* ① 基本情報・指標 (InfoPanel) */}
//               <div className="panel-card">
//                  {currentSummary ? (
//                    <InfoPanel info={selectedMelonInfo} summary={currentSummary} />
//                  ) : (
//                    <Typography p={2}>No Data Available</Typography>
//                  )}
//               </div>

//               {/* ② 画像 (ImagePanel) */}
//               <div className="panel-card image-panel">
//                 <ImagePanel 
//                   time={selectedTime} 
//                   dateStr={currentDateStr}
//                   deviceID_cameraID={selectedMelonInfo.deviceID_cameraID} 
//                 />
//               </div>

//             </Grid>

//             {/* --- 右カラム: 3つのグラフ --- */}
//             <Grid size={{ xs: 12, md: 8 }} className="right-column">
//               {/* GrowthChart内部で .chart-container (カードスタイル) がレンダリングされます */}
//               <GrowthChart 
//                 summaries={summaries} 
//                 idealModels={idealModels}
//                 currentDap={currentDap}
//                 pollinationDate={selectedMelonInfo.pollinationDate}
//               />
//             </Grid>

//           </Grid>
//         )}
//       </Box>
//     </div>
//   );
// }

return (
    <div className="main-container">
      {/* 1. ヘッダー (コンポーネント化) */}
      <AppHeader />

      {/* 2. コントロールパネル (固定表示エリアに含めるか、コンテンツの一部とするか) */}
      {/* デザイン的にはヘッダー直下に固定した方が使いやすいですが、今回はスクロール外に置きます */}
      {selectedMelonInfo && (
        <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0', zIndex: 10 }}>
          <ControlPanel
            melons={melons}
            selectedMelonId={selectedMelonId}
            onMelonChange={setSelectedMelonId}
            selectedDateIndex={selectedDateIndex}
            dateList={dateList}
            onDateChange={setSelectedDateIndex}
            selectedTime={selectedTime}
            onTimeChange={setSelectedTime}
          />
        </Box>
      )}

      {/* 3. メインコンテンツエリア (スクロール対象) */}
      <Box className="content-area">
        {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
        
        {!loading && selectedMelonInfo && (
          <Grid container spacing={3} sx={{ height: '100%' }}>
            
            {/* 左カラム */}
            <Grid size={{ xs: 12, md: 4 }} className="left-column">
              <div className="panel-card">
                 {currentSummary ? (
                   <InfoPanel info={selectedMelonInfo} summary={currentSummary} />
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

            {/* 右カラム */}
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
      </Box>

      {/* 4. フッター (コンポーネント化) */}
      <AppFooter />
    </div>
  );
}

export default App;