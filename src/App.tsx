import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid'; // Grid v2
import { generateClient } from "aws-amplify/api";

import { AppHeader } from './components/layout/AppHeader';
import { AppFooter } from './components/layout/AppFooter';
import { ControlPanel } from './components/ControlPanel';
import { ImagePanel } from './components/ImagePanel';
import { InfoPanel } from './components/InfoPanel';
import { GrowthChart } from './components/GrowthChart';
import { RealtimeDashboard } from './components/RealtimeDashboard';

import { MelonInfo, GrowthSummary, IdealModel, MelonRegistryItem } from './types';
import { listMelonsBySeason, listIdealModels, getGrowthSummaries } from './graphql/queries';
import './App.css'; 

const client = generateClient();

const SEASON_LIST = ['Spring', 'Summer', 'AutumnWinter', 'EarlySummer'];

function App() {
  const [melons, setMelons] = useState<MelonInfo[]>([]);
  
  const [selectedSeason, setSelectedSeason] = useState<string>('AutumnWinter'); 
  
  const [selectedPollinationDate, setSelectedPollinationDate] = useState<string>('');
  
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedMelonId, setSelectedMelonId] = useState<string>('');
  
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState(12);
  const [dateList, setDateList] = useState<string[]>([]);
  
  const [summaries, setSummaries] = useState<GrowthSummary[]>([]);
  const [idealModels, setIdealModels] = useState<Record<string, IdealModel>>({});
  const [loading, setLoading] = useState(false);

  const [viewMode, setViewMode] = useState<'summary' | 'realtime'>('summary');
  const lastSelectedDateRef = useRef<string>('');


  const getDeviceAndCamera = (idString: string) => {
    const parts = idString.split('_');
    return {
      deviceID: parts[0] || '',
      cameraID: parts[1] || '01'
    };
  };

  const pollinationDateList = useMemo(() => {
    const dates = melons.map(m => m.pollinationDate);
    return Array.from(new Set(dates)).sort().reverse();
  }, [melons]);

  // 交配日でメロンを絞り込み
  const filteredMelonsByDate = useMemo(() => {
    if (!selectedPollinationDate) return melons;
    return melons.filter(m => m.pollinationDate === selectedPollinationDate);
  }, [melons, selectedPollinationDate]);

  // デバイスリスト (絞り込まれたメロンから抽出)
  const deviceList = useMemo(() => {
    const ids = filteredMelonsByDate.map(m => getDeviceAndCamera(m.deviceID_cameraID).deviceID);
    return Array.from(new Set(ids)).sort();
  }, [filteredMelonsByDate]);

  // 最終的なメロンリスト (交配日 AND デバイスID)
  const filteredMelons = useMemo(() => {
    if (!selectedDeviceId) return [];
    return filteredMelonsByDate.filter(m => getDeviceAndCamera(m.deviceID_cameraID).deviceID === selectedDeviceId);
  }, [filteredMelonsByDate, selectedDeviceId]);


  // --- Event Handlers ---

  const handleSeasonChange = (newSeason: string) => {
    setSelectedSeason(newSeason);
  };

  // 交配日変更ハンドラ
  const handlePollinationDateChange = (newDate: string) => {
    setSelectedPollinationDate(newDate);
    setSelectedDeviceId('');
    setSelectedMelonId('');
  };

  const handleDeviceChange = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    // 自動で最初のメロンを選択
    const relatedMelons = filteredMelonsByDate.filter(m => getDeviceAndCamera(m.deviceID_cameraID).deviceID === newDeviceId);
    if (relatedMelons.length > 0) {
      setSelectedMelonId(relatedMelons[0].id);
    } else {
      setSelectedMelonId('');
    }
  };

  const handleMelonChange = (id: string) => {
    setSelectedMelonId(id);
  };

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

  // データ取得 (MelonRegistry)
  useEffect(() => {
    const fetchMelons = async () => {
      setLoading(true);
      try {
        const result = await client.graphql({ 
          query: listMelonsBySeason,
          variables: { season: selectedSeason, limit: 1000 } 
        }) as { data: { listMelonsBySeason: { items: MelonRegistryItem[] } } };
        
        const rawData = result.data.listMelonsBySeason.items;

        const convertedMelons: MelonInfo[] = rawData.map(item => {
          let deviceID_cameraID = '';
          
          if (item.melonID.includes('_') && item.melonID.split('_').length >= 3) {
             const parts = item.melonID.split('_');
             deviceID_cameraID = `${parts[0]}_${parts[1]}`;
          } else {
             deviceID_cameraID = item.deviceID ? `${item.deviceID}_01` : item.melonID;
          }
          
          return {
            id: item.melonID,
            season: item.season,
            pollinationDate: item.pollinationDate,
            deviceID_cameraID: deviceID_cameraID
          };
        });
        
        setMelons(convertedMelons);

        // データ取得後、最新の交配日を自動選択
        if (convertedMelons.length > 0) {
            const dates = convertedMelons.map(m => m.pollinationDate);
            const distinctDates = Array.from(new Set(dates)).sort().reverse();
            
            if (distinctDates.length > 0) {
                setSelectedPollinationDate(prev => distinctDates.includes(prev) ? prev : distinctDates[0]);
            }
        } else {
            setSelectedPollinationDate('');
        }

      } catch (error) {
        console.error("Error fetching melons:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMelons();
  }, [selectedSeason]);

  useEffect(() => {
      if (!selectedDeviceId && deviceList.length > 0) {
          const firstDevice = deviceList[0];
          setSelectedDeviceId(firstDevice);
          
          const relatedMelons = filteredMelonsByDate.filter(m => getDeviceAndCamera(m.deviceID_cameraID).deviceID === firstDevice);
          if (relatedMelons.length > 0) {
              setSelectedMelonId(relatedMelons[0].id);
          }
      }

      else if (selectedDeviceId && !selectedMelonId) {
          const relatedMelons = filteredMelonsByDate.filter(m => getDeviceAndCamera(m.deviceID_cameraID).deviceID === selectedDeviceId);
          if (relatedMelons.length > 0) {
              setSelectedMelonId(relatedMelons[0].id);
          }
      }
  }, [deviceList, selectedDeviceId, selectedMelonId, filteredMelonsByDate]);

  // 理想モデル取得
  useEffect(() => {
    const fetchIdealModels = async () => {
      if (!selectedSeason) return;
      try {
        const result = await client.graphql({ 
          query: listIdealModels,
          variables: { season: selectedSeason }
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
  }, [selectedSeason]);

  // 生育サマリー取得
  useEffect(() => {
    const fetchSummaries = async () => {
      if (!selectedMelonId) return;
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
          setSelectedDateIndex(targetIndex);
        } else if (dates.length > 0) {
          setSelectedDateIndex(dates.length - 1);
        } else {
          setSelectedDateIndex(0);
        }
      } catch (error) {
        console.error("Error fetching summaries:", error);
      }
    };
    fetchSummaries();
  }, [selectedMelonId]);

  const currentSummary = useMemo(() => {
    if (!currentDateStr || summaries.length === 0) return null;
    return summaries.find(s => s.targetDate === currentDateStr) || null;
  }, [currentDateStr, summaries]);
  const currentDap = currentSummary?.dap ?? 0;

  return (
    <div className="main-container">
      <AppHeader />
      
      <Box sx={{ p: 2, bgcolor: 'white', borderBottom: '1px solid #e0e0e0', zIndex: 10 }}>
        <ControlPanel 
          seasonList={SEASON_LIST}
          selectedSeason={selectedSeason}
          onSeasonChange={handleSeasonChange}

          pollinationDateList={pollinationDateList}
          selectedPollinationDate={selectedPollinationDate}
          onPollinationDateChange={handlePollinationDateChange}

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

      {/* メインコンテンツエリア */}
      <Box className="content-area" sx={{ p: 2 }}>
        {loading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}
        
        {!loading && selectedMelonInfo && (
          <>
            {viewMode === 'realtime' ? (
              <Box sx={{ height: '100%' }}>
                <RealtimeDashboard 
                  deviceID={getDeviceAndCamera(selectedMelonInfo.deviceID_cameraID).deviceID} 
                  deviceMelons={filteredMelons} 
                />
              </Box>
            ) : (
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