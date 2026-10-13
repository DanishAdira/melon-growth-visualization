import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Paper, Typography, Stack, Alert, IconButton } from '@mui/material';
import Grid from '@mui/material/Grid';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import type { HdrKey, Melon } from '../types/melon';
import { useDevices } from '../hooks/useDevices';
import { useGrowingMelonsByField } from '../hooks/useGrowingMelonsByField';
import { useDeviceMapping } from '../hooks/useDeviceMapping';
import { getInitialFieldID, FIELD_STORAGE_KEY } from '../constants/fields';
import { toLocalDateStr } from '../utils/dateTime';

import FieldSelector from '../components/navigation/FieldSelector';
import SectionGrid from '../components/navigation/SectionGrid';
import PlantList from '../components/navigation/PlantList';
import HdrToggle from '../components/navigation/HdrToggle';
import ModeSwitch, { type Mode } from '../components/ModeSwitch';

import GrowthView from '../components/views/GrowthView';
import EnvironmentView from '../components/views/EnvironmentView';
import OverviewView from '../components/views/OverviewView';

import type { GrowthViewMode } from '../components/growth/GrowthViewToggle';

const MainPage: React.FC = () => {
    // Navigation state
    const [fieldID, setFieldID]     = useState<string>(() => getInitialFieldID());
    const [sectionID, setSectionID] = useState<string | null>(null);
    const [plantID, setPlantID]     = useState<string | null>(null);
    const [cameraID, setCameraID]   = useState<HdrKey | null>(null);
    const [navCollapsed, setNavCollapsed] = useState<boolean>(false);

    // Mode & dates
    const [mode, setMode]                 = useState<Mode>('growth');
    const [growthView, setGrowthView]     = useState<GrowthViewMode>('daily');
    const [selectedDate, setSelectedDate] = useState<string>(() => toLocalDateStr(new Date()));

    // Data
    const { devices, loading: devicesLoading, error: devicesError } = useDevices(fieldID);
    const { melons,  loading: melonsLoading,  error: melonsError }  = useGrowingMelonsByField(fieldID);
    const { sections, plantsByKey } = useDeviceMapping(devices);

    // Derived
    const section = sectionID ? sections[sectionID] : null;
    const plant   = sectionID && plantID ? plantsByKey[`${sectionID}#${plantID}`] : null;

    const sectionMelons = useMemo(
        () => (sectionID ? melons.filter(m => m.sectionID === sectionID) : []),
        [melons, sectionID]
    );
    const plantMelons = useMemo(
        () => (plantID ? sectionMelons.filter(m => m.plantID === plantID) : []),
        [sectionMelons, plantID]
    );
    const selectedMelon = useMemo<Melon | null>(
        () => plantMelons.find(m => m.cameraID === cameraID) ?? null,
        [plantMelons, cameraID]
    );

    // 初期化: 最初の section + 株を自動選択
    useEffect(() => {
        if (sectionID || devices.length === 0) return;
        const firstSection = Object.values(sections).find(s => s.plants.length > 0);
        if (!firstSection) return;
        const firstPlant = firstSection.plants.reduce(
            (min, p) => (p.plantNumber < min.plantNumber ? p : min),
            firstSection.plants[0]
        );
        setSectionID(firstSection.sectionID);
        setPlantID(firstPlant.plantID);
    }, [devices, sections, sectionID]);

    // plant 変更時: 最初の cameraID を自動選択
    useEffect(() => {
        if (plantMelons.length === 0) { setCameraID(null); return; }
        if (!cameraID || !plantMelons.find(m => m.cameraID === cameraID)) {
            const sorted = [...plantMelons].sort((a, b) => Number(a.cameraID) - Number(b.cameraID));
            setCameraID(sorted[0].cameraID);
        }
    }, [plantMelons, cameraID]);

    // Handlers
    const handleFieldChange = useCallback((next: string) => {
        setFieldID(next);
        setSectionID(null);
        setPlantID(null);
        setCameraID(null);
        try { localStorage.setItem(FIELD_STORAGE_KEY, next); } catch { /* ignore */ }
    }, []);

    const handleSectionSelect = useCallback((sid: string) => {
        setSectionID(sid);
        const s = sections[sid];
        if (!s?.plants.length) { setPlantID(null); return; }
        const firstPlant = s.plants.reduce(
            (min, p) => (p.plantNumber < min.plantNumber ? p : min),
            s.plants[0]
        );
        setPlantID(firstPlant.plantID);
    }, [sections]);

    const handleMelonSelect = useCallback((m: Melon) => {
        setSectionID(m.sectionID);
        setPlantID(m.plantID);
        setCameraID(m.cameraID);
        setMode('growth');
    }, []);

    return (
        <Box sx={{ p: 2 }}>
            {/* 折りたたみトグル */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <IconButton
                    size="small"
                    onClick={() => setNavCollapsed(!navCollapsed)}
                    aria-label={navCollapsed ? 'ナビゲーションを展開' : 'ナビゲーションを折りたたむ'}
                >
                    {navCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
                <Typography variant="caption" color="text.secondary">
                    {navCollapsed ? 'ナビゲーションを展開' : 'ナビゲーションを折りたたむ'}
                </Typography>
            </Stack>

            {devicesError && <Alert severity="error" sx={{ mb: 2 }}>{devicesError}</Alert>}

            <Grid container spacing={2}>
                {/* 左ペイン: Navigation（折りたたみ時は非表示） */}
                {!navCollapsed && (
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Stack spacing={2}>
                            <FieldSelector
                                fieldID={fieldID}
                                onChange={handleFieldChange}
                                disabled={devicesLoading}
                            />
                            <Paper sx={{ p: 1.5 }}>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                    セクション
                                </Typography>
                                <SectionGrid
                                    sections={sections}
                                    melons={melons}
                                    selectedSectionID={sectionID}
                                    onSelect={handleSectionSelect}
                                />
                            </Paper>
                            {section && (
                                <Paper sx={{ p: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                        株 ({section.sectionID})
                                    </Typography>
                                    <PlantList
                                        plants={section.plants}
                                        melons={sectionMelons}
                                        selectedPlantID={plantID}
                                        onSelect={setPlantID}
                                    />
                                </Paper>
                            )}
                            {mode === 'growth' && plant && (
                                <Paper sx={{ p: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                        カメラ (HDR)
                                    </Typography>
                                    <HdrToggle
                                        melons={plantMelons}
                                        selectedCameraID={cameraID}
                                        onChange={setCameraID}
                                    />
                                </Paper>
                            )}
                        </Stack>
                    </Grid>
                )}

                {/* 右ペイン */}
                <Grid size={{ xs: 12, md: navCollapsed ? 12 : 9 }}>
                    <ModeSwitch mode={mode} onChange={setMode} />

                    {mode === 'growth' && (
                        <GrowthView
                            melon={selectedMelon}
                            view={growthView}
                            onViewChange={setGrowthView}
                            selectedDate={selectedDate}
                            onSelectedDateChange={setSelectedDate}
                        />
                    )}
                    {mode === 'environment' && (
                        <EnvironmentView
                            fieldID={fieldID}
                            sectionID={sectionID}
                            plantID={plantID}
                            plant={plant}
                            selectedDate={selectedDate}
                            onSelectedDateChange={setSelectedDate}
                        />
                    )}
                    {mode === 'overview' && (
                        <OverviewView
                            fieldID={fieldID}
                            melons={melons}
                            melonsLoading={melonsLoading}
                            melonsError={melonsError}
                            onMelonSelect={handleMelonSelect}
                        />
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default MainPage;