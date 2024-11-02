import React from 'react';
import SettingsMenu from './SettingsMenu'; // Импортируем компонент

const exchanges = [
  {
    id: 'fl',
    name: 'Freelance.ru',
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
    id: 'youdo',
    name: 'YouDo',
    logo: 'YD',
    color: 'bg-purple-500'
  }
];

const categories = [
  {
    name: "Разработка",
    subcategories: [
      "Все специальности",
      "Frontend",
      "Backend",
      "Mobile",
      "Full Stack",
      "Desktop"
    ]
  },
  {
    name: "Дизайн",
    subcategories: [
      "Все специальности",
      "UI/UX",
      "Графический дизайн",
      "Веб-дизайн",
      "Логотипы",
      "3D"
    ]
  },
  {
    name: "Маркетинг",
    subcategories: [
      "Все специальности",
      "SMM",
      "SEO",
      "Контекстная реклама",
      "Email-маркетинг",
      "Контент-маркетинг"
    ]
  }
];

const App = () => {
  return (
    <div>
      
      <SettingsMenu exchanges={exchanges} categories={categories} /> {/* Передаем свойства */}
    </div>
  );
};

export default App;
