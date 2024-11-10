import React from 'react';
import SettingsMenu from './SettingsMenu'; // Импортируем компонент

import {useEffect, useState} from "react"

const exchanges = [
    {
        id: 'fl.ru',
        name: 'Fl',
        logo: '/front/imges/fl.jpg',
        color: 'bg-blue-500'
    },
    {
        id: 'kwork',
        name: 'Kwork',
        logo: '/front/imges/kwork.jpg',
        color: 'bg-green-500'
    },
    {
        id: 'freelance.habr.com',
        name: 'Habr',
        logo: '/front/imges/habr.jpg',
        color: 'bg-purple-500'
    },
    {
        id: 'freelance_ru',
        name: 'Freelance',
        logo: '/front/imges/freelance.jpg',
        color: 'bg-red-500'
    }
];


const App = () => {

    return (
        <div>

            <SettingsMenu exchanges={exchanges}/> {/* Передаем свойства */}
        </div>
    );
};

export default App;
