import React from 'react';
import MainLayout from './components/layout/MainLayout';
import MainPage from './pages/MainPage';
import './App.css';

const App: React.FC = () => (
    <MainLayout>
        <MainPage />
    </MainLayout>
);

export default App;