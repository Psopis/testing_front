import React, {useState, useEffect, useRef} from 'react';
import Switch from '@mui/material/Switch';
import {ChevronLeft, ChevronDown, ChevronUp, X} from 'lucide-react';


interface Exchange {
    id: string;
    name: string;
    logo: string;
    color: string;
}

interface Category {
    name: string;
    subcategories: { id: string; name: string }[];
    id: string;
}

interface SettingsMenuProps {
    exchanges: Exchange[];

}


// @ts-ignore
const tg = window.Telegram.WebApp;


const baseurl = "https://023a-85-143-145-216.ngrok-free.app"
const url_categories = baseurl + "/api/projects/categories/"


const SettingsMenu: React.FC<SettingsMenuProps> = ({exchanges}) => {
    const [categoriesByExchange, setCategoriesByExchange] = useState<Record<string, Category[]>>({});
    const [activeExchanges, setActiveExchanges] = useState<Record<string, boolean>>({});
    const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);

    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [keywords, setKeywords] = useState<string[]>([]);
    const [keywordInput, setKeywordInput] = useState('');
    const [excludeWords, setExcludeWords] = useState<string[]>([]);
    const [excludeWordInput, setExcludeWordInput] = useState('');
    const [budget, setBudget] = useState(0);
    const [sendByAgreement, setSendByAgreement] = useState(true);
    const [userCategories, setUserCategories] = useState<number[]>([]);
    const [combinedCategories, setCombinedCategories] = useState<number[]>([]);
    const [userNickname, setUserNickname] = useState<string | null>(null);
    const [userIfd, setUserId] = useState<number>();
    const intervalRef = useRef<NodeJS.Timeout | null>(null); // Ref to hold the interval ID
    const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Re
    useEffect(() => {
        if (tg) {
            tg.ready();


            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                const user = tg.initDataUnsafe.user;
                setUserNickname(user.first_name || null);
                setUserId(1337)
            }
        }
        fetchCategories();
        fetchUserData();

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current); // Clear interval on unmount
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current); // Clear timeout on unmount
            }
        };
    }, []);
    const userId = 1337

    const url_user_data = baseurl + "/api/users/project_settings/" + userId?.toString() + '/'
    const fetchCategories = async () => {
        try {
            const response = await fetch(url_categories);
            if (!response.ok) {
                throw new Error('Ошибка при загрузке категорий');
            }
            const data = await response.json();

            const formattedCategories: Record<string, Category[]> = {};
            for (const exchangeId in data) {
                formattedCategories[exchangeId] = data[exchangeId].map((category: any) => ({
                    name: category.name,
                    id: category.id,
                    subcategories: category.children.map((sub: any) => ({id: sub.id, name: sub.name})), // Save IDs
                }));
            }

            setCategoriesByExchange(formattedCategories);
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error);
        }
    };

    const fetchUserData = async () => {
        try {
            const response = await fetch(url_user_data);
            if (!response.ok) {
                throw new Error('Ошибка при загрузке данных пользователя');
            }
            const data = await response.json();
            setUserCategories(data.categories);
            const userActiveExchanges: Record<string, boolean> = {};
            data.freelance_exchanges.forEach((exchangeId: string) => {
                userActiveExchanges[exchangeId] = true; // Set to true for active exchanges
            });
            setActiveExchanges(userActiveExchanges);// Установка категорий пользователя в состояние
            setExcludeWords(data.stopwords || []); // Initialize stopwords
            setKeywords(data.keywords || []);
            setBudget(data.minimal_budget || []);
            setSendByAgreement(data.negotiable_budget || []);
            console.log(data.negotiable_budget)
            setExcludeWords(data.stopwords || [])
            setKeywords(data.keywords || [])

            console.log("User Categories:", data.freelance_exchanges); // Вывод категорий пользователя в консоль
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
        }
    };
    const sendingData = async (payload: {}) => {
        console.log("Отправляемые данные:", payload);
        try {
            const response = await fetch(url_user_data, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Ошибка при отправке слов');
            }

            const responseData = await response.json();
            console.log("Ответ сервера на слова:", responseData);
        } catch (error) {
            console.error("Ошибка при отправке слов:", error);
        }
    }




    // Указываем тип параметра exchange
    const toggleExchange = async (exchange: Exchange) => {

        await fetchUserData();
        // Загрузка данных пользователя при выборе обмена
        const newStatus = !activeExchanges[exchange.id];
        const newActiveExchanges = {
            ...activeExchanges,
            [exchange.id]: newStatus
        };

        setActiveExchanges(newActiveExchanges);
        const activeExchangesList = Object.entries(newActiveExchanges)
            .filter(([_, isActive]) => isActive) // Фильтруем только активные биржи
            .map(([id, _]) => id); // Берем только ID активных бирж Берем только ID активных бирж
        const payload = {
            user: userId, // Замените на нужный user ID

            freelance_exchanges: activeExchangesList,
        };
        sendingData(payload)


    };

    const selectExchange = async (exchange: Exchange) => {
        if (!activeExchanges[exchange.id]) {
            return;
        }
        setSelectedExchange(exchange);

    };

    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev => ({...prev, [categoryName]: !prev[categoryName]}));
    };


    const handleKeywordInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && keywordInput.trim()) {
            setKeywords(prev => [...prev, keywordInput.trim()]);
            setKeywordInput('');
            startSendingData();
        }
    };

    const handleExcludeWordInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && excludeWordInput.trim()) {
            setExcludeWords(prev => [...prev, excludeWordInput.trim()]);
            setExcludeWordInput('');
            startSendingData();
        }
    };
    const startSendingData = () => {
        // Clear any existing interval and timeout
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Start sending data every 3 seconds
        console.log('Start sending')
        intervalRef.current = setInterval(() => {
            console.log('send')
            const payload = {
                stopwords: ['asdf', 'asdfqwe'],
            };
            sendingData(payload); // Send current stopwords and keywords to the server
        }, 3000);

        // Set timeout to stop the interval after 5 seconds of inactivity
        timeoutRef.current = setTimeout(() => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current); // Stop sending data
                intervalRef.current = null; // Clear the reference
            }
        }, 5000);
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

    const applySelectedCategories = () => {
        const combined = [
            ...userCategories, // Преобразуем числа в строки
            ...combinedCategories
        ];


        setCombinedCategories([]);
        const categories = Object.values(combined)
            .flat()
            // .map(subcategory => getCategoryIdByName(subcategory)) // Преобразуем в ID
            .filter(id => id !== null) // Убираем null, если они есть
        // .filter(cat => cat !== "Все специальности");
        // Создаем payload для запроса
        const payload = {
            user: userId, // Замените на нужный user ID

            categories: categories,
        };
        sendingData(payload);// Сбрасываем выбранные категории
        setSelectedExchange(null); // Возвращаемся к выбору биржи
    };

    const handleCheckboxChange = (subcategoryId: string, categoryName: string) => {


        const id = Number(subcategoryId);
        if (id === -1) {

            // Все подкатегории для выбранной категории
            const allSubcategories =
                categoriesByExchange[selectedExchange?.id || '']
                    ?.find(cat => cat.name === categoryName)
                    ?.subcategories || [];

            // Получаем ID всех подкатегорий без -1
            const allSubcategoryIds = allSubcategories.map(sub => Number(sub.id));

            // Проверяем, все ли подкатегории уже выбраны
            const allSelected = allSubcategoryIds.every(id =>
                combinedCategories.includes(id) || userCategories.includes(id)
            );

            if (allSelected) {
                // Если все уже выбраны - убираем все
                const newCategories = combinedCategories.filter(id =>
                    !allSubcategoryIds.includes(id)
                );
                setCombinedCategories(newCategories);
                setUserCategories(prev => prev.filter(id => !allSubcategoryIds.includes(id)));
                console.log('Removing all subcategories:', newCategories);
            } else {
                // Если не все выбраны - добавляем все
                const existingIds = new Set([...combinedCategories, ...userCategories]);
                const newIds = allSubcategoryIds.filter(id => !existingIds.has(id));
                const newCategories = [...combinedCategories, ...newIds];
                setCombinedCategories(newCategories);
                setUserCategories(prev => [...prev, ...newIds]);
                console.log('Adding all subcategories:', newCategories);
            }
            return;
        }

        // Обработка выбора отдельных категорий
        if (combinedCategories.includes(id) || userCategories.includes(id)) {
            setCombinedCategories(prev => prev.filter(categoryId => categoryId !== id));
            setUserCategories(prev => prev.filter(categoryId => categoryId !== id));
        } else {
            setCombinedCategories(prev => [...prev, id]);
            setUserCategories(prev => [...prev, id]);
        }
        if (userCategories.includes(id)) {
            // Удаляем категорию, если она уже есть в userCategories
            setUserCategories(prev => prev.filter(categoryId => categoryId !== id));
        } else {
            // Добавляем категорию в userCategories
            setUserCategories(prev => [...prev, id]);
        }


    };

    const renderCategoriesList = () => {
        if (!selectedExchange) return null;

        const categories = categoriesByExchange[selectedExchange.id] || [];

        return (
            <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
                <div className="flex items-center mb-4">
                    <ChevronLeft className="cursor-pointer hover:text-green-500" onClick={applySelectedCategories}/>
                    <span
                        className={`w-8 h-8 flex items-center justify-center ${selectedExchange.color} text-white rounded-md mx-2`}>
                {selectedExchange.logo}
            </span>
                    <span>{selectedExchange.name}</span>
                </div>
                <h2 className="text-xl font-semibold">Выбери категории</h2>
                <ul className="space-y-2">
                    {categories.map(category => (
                        <li key={category.id} className="border-b">
                            <div
                                className="flex items-center justify-between py-2 cursor-pointer hover:bg-green-100 rounded-lg px-2"
                                onClick={() => toggleCategory(category.name)}
                            >
                                <span>{category.name}</span>
                                {expandedCategories[category.name] ? <ChevronUp/> : <ChevronDown/>}
                            </div>
                            {expandedCategories[category.name] && (
                                <ul className="pl-4 pb-2 space-y-2">
                                    <li className="flex items-center p-2 hover:bg-green-100 rounded-lg" onClick={() => {
                                        const id_sub = -1;
                                        handleCheckboxChange(id_sub.toString(), category.name);

                                    }}>
                                        <div className="flex items-center space-x-3 w-full">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 cursor-pointer"
                                                checked={
                                                    category.subcategories.every(sub =>
                                                        combinedCategories.includes(Number(sub.id)) ||
                                                        userCategories.includes(Number(sub.id))
                                                    )
                                                }
                                                onChange={e => {
                                                    const id_sub = -1;
                                                    handleCheckboxChange(id_sub.toString(), category.name);
                                                    // ChooseAllCategories(category.name, "Все специальности")
                                                }}
                                            />
                                            <label className="text-sm text-gray-600 cursor-pointer flex-grow">
                                                Все специальности
                                            </label>
                                        </div>
                                    </li>

                                    {/* Render each subcategory */}
                                    {category.subcategories.map(subcategory => (
                                        <li key={subcategory.id}
                                            className="flex items-center p-2 hover:bg-green-100 rounded-lg cursor-pointer"
                                            onClick={() => {
                                                const id_sub = subcategory.id;
                                                handleCheckboxChange(id_sub.toString(), category.name);
                                                console.log(combinedCategories);
                                            }}>
                                            <div className="flex items-center space-x-3 w-full">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 cursor-pointer"
                                                    checked={combinedCategories.includes(Number(subcategory.id)) || userCategories.includes(Number(subcategory.id))}
                                                    onChange={(e) => {
                                                        e.stopPropagation(); // Prevent triggering the parent's onClick
                                                        const id_sub = subcategory.id;
                                                        handleCheckboxChange(id_sub.toString(), category.name);
                                                    }}
                                                />
                                                <label className="text-sm text-gray-600 flex-grow">
                                                    {subcategory.name}
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
                    onClick={() => {
                        applySelectedCategories();
                    }}
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
                <input
                    type="number"
                    min="0" // Restricts the input to non-negative numbers
                    value={budget > 0 ? budget.toString() : ''} // Ensure value is a string, but display empty if budget is non-positive
                    onChange={e => {
                        const value = e.target.value;
                        // Проверяем, является ли значение положительным числом или пустым
                        if (value.trim() === "") {
                            setBudget(0); // Устанавливаем 0, если поле пустое
                        } else {
                            const parsedValue = Number(value); // Преобразуем строку в число
                            if (!isNaN(parsedValue) && parsedValue >= 0) { // Проверяем на NaN и положительность
                                setBudget(parsedValue);
                                const payload = {
                                    minimal_budget: parsedValue,
                                };
                                sendingData(payload)
                                // Устанавливаем только если это положительное число
                            }
                        }

                    }}
                    className="w-full p-1.5 border rounded"
                    placeholder="Введите бюджет"
                    style={{height: '40px', resize: 'none'}} // Ограничение по высоте
                />
            </div>
            <div className="flex items-center">
                <Switch
                    checked={!sendByAgreement} // Ensure this is a boolean
                    onChange={() => {

                        const newAgreement = !sendByAgreement; // Toggle the state
                         console.log("Toggling sendByAgreement to:", newAgreement);
                        setSendByAgreement(newAgreement); // Update local state
                        const payload = {
                            negotiable_budget: !newAgreement,
                        };
                        sendingData(payload); // Send the new state to the server
                        // console.log("sendByAgreement:", sendByAgreement, "Type:", typeof sendByAgreement);
                    }}
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
                        <h1 className="text-2xl font-bold text-blue-500">Привет, {userNickname}</h1>
                        <h2 className="text-xl font-semibold">Настрой под себя</h2>
                    </div>
                    {renderExchangesList()}
                    {renderMainSettings()}
                </>
            )}
        </div>
    );
};

export {SettingsMenu, tg};
export default SettingsMenu;
