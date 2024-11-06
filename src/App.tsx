import React from 'react';
import SettingsMenu from './SettingsMenu'; // Импортируем компонент

import {useEffect, useState} from "react"

const exchanges = [
    {
        id: 'fl.ru',
        name: 'Fl',
        logo: 'FL',
        color: 'bg-blue-500'
    },
    {
        id: 'kwork',
        name: 'Kwork',
        logo: 'KW',
        color: 'bg-green-500'
    },
    {
        id: 'freelance.habr.com',
        name: 'HABR',
        logo: 'HB',
        color: 'bg-purple-500'
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
