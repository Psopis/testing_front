import React, { useState } from 'react';
import Switch from '@mui/material/Switch';
import { ChevronLeft, ChevronDown, ChevronUp, X } from 'lucide-react';

interface Exchange {
  id: string;
  name: string;
  logo: string;
  color: string;
}

interface Category {
  name: string;
  subcategories: string[];
}

interface SettingsMenuProps {
  exchanges: Exchange[];
  categories: Category[];
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ exchanges, categories }) => {
  const [activeExchanges, setActiveExchanges] = useState<Record<string, boolean>>({});
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string[]>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [excludeWords, setExcludeWords] = useState<string[]>([]);
  const [excludeWordInput, setExcludeWordInput] = useState('');
  const [budget, setBudget] = useState(0);
  const [sendByAgreement, setSendByAgreement] = useState(false);

  // Указываем тип параметра exchange
  const toggleExchange = (exchange: Exchange) => {
    setActiveExchanges(prev => ({
      ...prev,
      [exchange.id]: !prev[exchange.id]
    }));
  };

  const selectExchange = (exchange: Exchange) => {
    if (!activeExchanges[exchange.id]) {
      return;
    }
    setSelectedExchange(exchange);
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({ ...prev, [categoryName]: !prev[categoryName] }));
  };

  const toggleSubcategory = (categoryName: string, subcategory: string) => {
    setSelectedCategories(prev => {
      const category = prev[categoryName] || [];

      if (subcategory === "Все специальности") {
        if (category.includes(subcategory)) {
          return { ...prev, [categoryName]: [] };
        } else {
          return { ...prev, [categoryName]: categories.find(cat => cat.name === categoryName)?.subcategories || [] };
        }
      }

      if (category.includes(subcategory)) {
        const newCategory = category.filter(sub => sub !== subcategory);
        return { ...prev, [categoryName]: newCategory.filter(sub => sub !== "Все специальности") };
      } else {
        const newCategory = [...category, subcategory];
        const allSubcategories = categories.find(cat => cat.name === categoryName)?.subcategories || [];
        const hasAllSelected = allSubcategories.every(sub =>
          sub === "Все специальности" || newCategory.includes(sub)
        );
        return {
          ...prev,
          [categoryName]: hasAllSelected ? [...newCategory, "Все специальности"] : newCategory
        };
      }
    });
  };

  const handleKeywordInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      setKeywords(prev => [...prev, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const handleExcludeWordInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && excludeWordInput.trim()) {
      setExcludeWords(prev => [...prev, excludeWordInput.trim()]);
      setExcludeWordInput('');
    }
  };

  const renderTagInput = (
    title: string,
    tags: string[],
    setTags: React.Dispatch<React.SetStateAction<string[]>>,
    inputValue: string,
    setInputValue: React.Dispatch<React.SetStateAction<string>>,
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  ) => (
    <div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-200 rounded-full flex items-center gap-1"
          >
            {tag}
            <X
              className="w-4 h-4 cursor-pointer hover:text-red-500"
              onClick={() => setTags(prev => prev.filter((_, i) => i !== index))}
            />
          </span>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full p-2 border rounded"
        placeholder="Нажмите Enter для добавления"
      />
    </div>
  );

  const renderExchangesList = () => (
    <div>
      <h3 className="text-lg font-medium mb-2">Биржи</h3>
      <ul className="space-y-2">
        {exchanges.map(exchange => (
          <li key={exchange.id} className="flex items-center justify-between rounded-lg overflow-hidden">
            <div
              className={`flex items-center flex-grow cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-green-100
                ${activeExchanges[exchange.id] ? '' : 'opacity-50 cursor-not-allowed'}
                ${selectedExchange?.id === exchange.id ? 'bg-green-100' : ''}`}
              onClick={() => selectExchange(exchange)}
            >
              <span className={`w-8 h-8 flex items-center justify-center ${exchange.color} text-white rounded-md mr-2`}>
                {exchange.logo}
              </span>
              <span className="flex-grow">{exchange.name}</span>
              <div onClick={e => e.stopPropagation()}>
                <Switch
                  checked={activeExchanges[exchange.id] || false}
                  onChange={() => toggleExchange(exchange)}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderCategoriesList = () => {
    if (!selectedExchange) return null;

    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
        <div className="flex items-center mb-4">
          <ChevronLeft className="cursor-pointer hover:text-green-500" onClick={() => setSelectedExchange(null)} />
          <span className={`w-8 h-8 flex items-center justify-center ${selectedExchange.color} text-white rounded-md mx-2`}>
            {selectedExchange.logo}
          </span>
          <span>{selectedExchange.name}</span>
        </div>
        <h2 className="text-xl font-semibold">Выбери категории</h2>
        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category.name} className="border-b">
              <div
                className="flex items-center justify-between py-2 cursor-pointer hover:bg-green-100 rounded-lg px-2"
                onClick={() => toggleCategory(category.name)}
              >
                <span>{category.name}</span>
                {expandedCategories[category.name] ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedCategories[category.name] && (
                <ul className="pl-4 pb-2 space-y-2">
                  {category.subcategories.map(subcategory => (
                    <li
                      key={subcategory}
                      className="flex items-center p-2 hover:bg-green-100 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <input
                          type="checkbox"
                          className="w-5 h-5 cursor-pointer"
                          checked={(selectedCategories[category.name] || []).includes(subcategory)}
                          onChange={() => toggleSubcategory(category.name, subcategory)}
                        />
                        <label
                          className="text-sm text-gray-600 cursor-pointer flex-grow"
                          onClick={() => toggleSubcategory(category.name, subcategory)}
                        >
                          {subcategory}
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
        <button
          className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={() => setSelectedExchange(null)}
        >
          Применить выбранные категории
        </button>
      </div>
    );
  };

  const renderMainSettings = () => (
    <>
      {renderTagInput("Ключевые слова", keywords, setKeywords, keywordInput, setKeywordInput, handleKeywordInputKeyDown)}
      {renderTagInput("Слова-исключения", excludeWords, setExcludeWords, excludeWordInput, setExcludeWordInput, handleExcludeWordInputKeyDown)}
      <div>
        <h3 className="text-lg font-medium mb-2">Бюджет</h3>
        <input
          type="number"
          value={budget}
          onChange={e => setBudget(Number(e.target.value))}
          className="w-full p-2 border rounded"
          placeholder="Введите бюджет"
        />
      </div>
      <div className="flex items-center">
        <Switch
          checked={sendByAgreement}
          onChange={() => setSendByAgreement(!sendByAgreement)}
        />
        <span className="ml-2">Отправлять по соглашению</span>
      </div>
    </>
  );

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
      {selectedExchange ? renderCategoriesList() : (
        <>
          <div>
            <h1 className="text-2xl font-bold text-blue-500">Привет, Александр</h1>
            <h2 className="text-xl font-semibold">Настрой под себя</h2>
          </div>
          {renderExchangesList()}
          {renderMainSettings()}
        </>
      )}
    </div>
  );
};

export default SettingsMenu;
