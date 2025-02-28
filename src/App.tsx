import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SettingsMenu from './SettingsMenu';
import NewOrderPage from './NewOrderPage';
const exchanges = [
    {
        id: 'fl.ru',
        name: 'Fl',
        logo: '/imges/fl.jpg',
        color: 'bg-blue-500'
    },
    {
        id: 'kwork',
        name: 'Kwork',
        logo: '/imges/kwork.jpg',
        color: 'bg-green-500'
    },
    {
        id: 'freelance.habr.com',
        name: 'Habr',
        logo: '/imges/habr.jpg',
        color: 'bg-purple-500'
    },
    {
        id: 'freelance.ru',
        name: 'Freelance',
        logo: '/imges/freelance.jpg',
        color: 'bg-red-500'
    }
];


const App = () => {
    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <div>
                            <SettingsMenu exchanges={exchanges} />
                        </div>
                    } 
                />
                <Route 
                    path="/new-order" 
                    element={<NewOrderPage />} 
                />
            </Routes>
        </Router>
    );
};

export default App;
