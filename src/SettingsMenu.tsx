import React, {useState, useEffect, useRef} from 'react';
import Switch from '@mui/material/Switch';
import {ChevronLeft, ChevronDown, ChevronUp, X} from 'lucide-react';
import './App.css';

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


const baseurl = "https://c17f-85-143-145-216.ngrok-free.app"
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
    const [userId, setUserId] = useState<number>();
    const [loading, setLoading] = useState(true);
    const [isInterfaceAvailable, setIsInterfaceAvailable] = useState(true);


    const intervalRef = useRef<NodeJS.Timeout | null>(null); // Ref to hold the interval ID
    const timeoutRef = useRef<NodeJS.Timeout | null>(null); // Re
    const typingTimer = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        const readyTimeout = setTimeout(() => {
            if (userId) {
                fetchCategories();
                fetchUserData();
            }
        }, 500);

        if (tg) {
            tg.ready()


            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {

                const user = tg.initDataUnsafe.user;
                setUserNickname(user.first_name || null);
                setUserId(user.id)
            }

        }



       const handleScroll = (e:UIEvent) => {
            if (!isInterfaceAvailable) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };
if (!isInterfaceAvailable) {
            // Блокируем скролл на body
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            document.body.style.touchAction = 'none';
            // Добавляем обработчики для предотвращения скролла
            document.addEventListener('wheel', handleScroll, { passive: false });
            document.addEventListener('touchmove', handleScroll, { passive: false });
        } else {
            // Возвращаем скролл
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.body.style.touchAction = '';
        }
        return () => {

            clearTimeout(readyTimeout);
            if (intervalRef.current) {
                clearInterval(intervalRef.current); // Очистка интервала при размонтировании
                // Clear interval on unmount
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current); // Очистка таймера при размонтировании
                // Clear timeout on unmount
            }
        };
    }, [userId, isInterfaceAvailable]);




    // const userId = 7544895563

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
            setSendByAgreement(!(data.negotiable_budget));
            console.log(data.negotiable_budget)
            setExcludeWords(data.stopwords || [])
            setKeywords(data.keywords || [])
            setIsInterfaceAvailable(data.has_active_subscription)
            console.log("User Categories:", data.freelance_exchanges); // Вывод категорий пользователя в консоль
        } catch (error) {
            console.error('Ошибка при получении данных:', error);
        } finally {
            setLoading(false); // Update loading state after data is fetched
        }
    };
    const url_words = baseurl + "/api/users/settings/" + userId?.toString() + '/'
    const url_user_data = baseurl + "/api/users/project_settings/" + userId?.toString() + '/'

    const DisabledOverlay = () => (
        <div
            className="fixed inset-0 flex items-center justify-center overflow-hidden"
            style={{
                position: 'fixed',
                top: -40,
                left: 0,
                right: 0,
                bottom: 0,
                minHeight: '90vh',
                backgroundColor: 'rgb(185,185,185)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(55%)',
                // Предотвращает скролл внутри оверлея
            }}
            onClick={(e) => e.preventDefault()} // Предотвращает всплытие событий
        >
            <div
                className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-auto text-center"
                style={{
                    width: '90%',
                    maxWidth: '400px'
                }}
                onClick={(e) => e.stopPropagation()} // Предотвращает всплытие событий
            >
                <h2 className="text-xl font-bold mb-4">Интерфейс недоступен</h2>
                <p className="text-gray-600">
                    В данный момент интерфейс недоступен. Пожалуйста, попробуйте позже.
                </p>
            </div>
        </div>
    );


    const sendingData = async (payload: {}, url: string) => {
        console.log("Отправляемые данные:", payload);
        try {
            const response = await fetch(url, {
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
        sendingData(payload, url_user_data)


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


    // Таймер для отложенной отправки данных на сервер
    // Таймер для отложенной отправки данных на сервер


    // Функция для отправки данных на сервер
    const triggerServerUpdate = () => {
        console.log("Отправляем данные на сервер...");

        const payload = {
            user: userId,
            stopwords: excludeWords.length > 0 ? excludeWords : [], // Заменяем на "default" если массив пуст
            keywords: keywords.length > 0 ? keywords : [], // Заменяем на "default" если массив пуст
        };

        sendingData(payload, url_words); // Ваш метод отправки данных
    };

    // Сбрасывание таймера и установка нового
    const resetTypingTimer = () => {
        if (typingTimer.current) {
            clearTimeout(typingTimer.current); // Очищаем старый таймер
        }

        // Устанавливаем новый таймер на 4 секунды
        typingTimer.current = setTimeout(() => {
            triggerServerUpdate(); // Отправляем данные на сервер
        }, 1000);
    };

    // Используем `useEffect` для отслеживания изменений в `keywords` и `excludeWords`
    useEffect(() => {
        resetTypingTimer(); // Сбрасываем таймер при каждом изменении ключевых слов или исключений
    }, [keywords, excludeWords]);

    // Добавление ключевого слова
    const handleAddKeyword = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && keywordInput.trim()) {
            setKeywords((prev) => [...prev, keywordInput.trim()]); // Корректно обновляем состояние
            setKeywordInput(''); // Очищаем поле ввода
        }
    };

    // Добавление исключаемого слова
    const handleAddExcludeWord = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && excludeWordInput.trim()) {
            setExcludeWords((prev) => [...prev, excludeWordInput.trim()]); // Корректно обновляем состояние
            setExcludeWordInput(''); // Очищаем поле ввода
        }
    };

    // Удаление ключевого слова
    const deleteKeyword = (word: string) => {
        setKeywords((prev) => {
            const updatedKeywords = prev.filter(keyword => keyword !== word);
            return updatedKeywords;
        });
        resetTypingTimer(); // Обновляем таймер после удаления
    };

// Удаление исключаемого слова
    const deleteExcludeWord = (word: string) => {
        setExcludeWords((prev) => {
            const updatedExcludeWords = prev.filter(excludeWord => excludeWord !== word);
            return updatedExcludeWords;
        });
        resetTypingTimer(); // Обновляем таймер после удаления
    };
    const renderTagInput = (
        title: string,
        tags: string[],
        setTags: React.Dispatch<React.SetStateAction<string[]>>,
        inputValue: string,
        setInputValue: React.Dispatch<React.SetStateAction<string>>,
        onAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void,
        onDeleteTag: (tag: string) => void
    ) => {
        return (
            <div>
                <h3 className="text-lg font-medium mb-2">{title}</h3>
                {/* Tag Display Area */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-gray-200 rounded-full flex items-center gap-1"
                        >
                        {tag}
                            {/* Remove Tag Button */}
                            <X
                                className="w-4 h-4 cursor-pointer hover:text-red-500"
                                onClick={() => {

                                    onDeleteTag(tag)
                                }
                                }
                            />
                    </span>
                    ))}
                </div>
                {/* Tag Input Area */}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={onAddTag}
                    className="w-full p-2 border rounded"
                    placeholder="Нажмите Enter для добавления"
                />
            </div>
        );
    };
    if (loading) {
        return <div>ЗАГРУЗКА ПОЛНЫМ ХОДОМ</div>; // Loading indicator

    }
    const renderExchangesList = () => {


        return (
            <div>
                <h3 className="text-lg font-medium mb-2">Биржи</h3>
                <ul className="space-y-2">
                    {exchanges.map(exchange => {
                        // Логируем путь к изображению, чтобы убедиться, что оно корректное


                        return (
                            <li key={exchange.id}
                                className="flex items-center justify-between rounded-lg overflow-hidden">
                                <div
                                    className={`flex items-center flex-grow cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-green-100
                    ${activeExchanges[exchange.id] ? '' : 'opacity-50 cursor-not-allowed'}
                    ${selectedExchange?.id === exchange.id ? 'bg-green-100' : ''}`}
                                    onClick={() => {

                                        selectExchange(exchange);
                                        fetchCategories()
                                    }}
                                >
                                    <img
                                        src={exchange.logo}  // Используем путь как есть, без baseurl
                                        alt={`${exchange.name} logo`}
                                        className="w-8 h-8 rounded-md mr-2"
                                    />
                                    <span className="flex-grow">{exchange.name}</span>
                                    <div onClick={e => {
                                        e.stopPropagation(); // Останавливаем всплытие события

                                    }}>
                                        <Switch
                                            checked={activeExchanges[exchange.id] || false}
                                            onChange={() => {

                                                toggleExchange(exchange);
                                            }}
                                        />
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };


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
        sendingData(payload, url_user_data);// Сбрасываем выбранные категории
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
                    <img
                        src={selectedExchange.logo}  // Используем путь как есть, без baseurl
                        alt={`${selectedExchange.name} logo`}
                        className="w-8 h-8 rounded-md mr-2"
                    />
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
                                    <li className="flex items-center p-2 hover:bg-green-100 rounded-lg"
                                        onClick={() => {
                                            const id_sub = -1;
                                            handleCheckboxChange(id_sub.toString(), category.name);

                                        }}>
                                        <div className="flex items-center space-x-3 w-full">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 cursor-pointer accent-color:#3a9f21"
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
                                            className="flex items-center p-2 hover:bg-green-100 rounded-lg cursor-pointer "
                                            onClick={() => {
                                                const id_sub = subcategory.id;
                                                handleCheckboxChange(id_sub.toString(), category.name);
                                                console.log(combinedCategories);
                                            }}>
                                            <div className="flex items-center space-x-3 w-full">
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 cursor-pointer accent-color:#3a9f21"
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
            {renderTagInput(
                "Ключевые слова",         // title
                keywords,                 // tags array
                setKeywords,              // setTags function
                keywordInput,             // inputValue
                setKeywordInput,          // setInputValue function
                handleAddKeyword,      // onAddTag function for adding a tag
                deleteKeyword
            )}

            {renderTagInput(
                "Исключенные слова",      // title
                excludeWords,             // tags array
                setExcludeWords,          // setTags function
                excludeWordInput,         // inputValue
                setExcludeWordInput,      // setInputValue function
                handleAddExcludeWord,
                deleteExcludeWord
                // onAddTag function for adding an excluded word
            )}

            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                <label className="text-lg font-medium mb-2"
                       style={{marginBottom: '5px', fontSize: '16px'}}>Бюджет</label>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={budget > 0 ? budget.toString() : ''}
                        onChange={e => {
                            const value = e.target.value;
                            if (value.trim() === "") {
                                setBudget(0); // Устанавливаем 0, если поле пустое
                            } else {
                                const parsedValue = Number(value);
                                if (!isNaN(parsedValue) && parsedValue >= 0) {
                                    setBudget(parsedValue);
                                }
                            }
                        }}

                        onBlur={() => {
                            const payload = {
                                minimal_budget: budget,
                            };
                            sendingData(payload, url_user_data);
                        }}
                        className="p-1.5 border rounded"
                        placeholder="Введите бюджет"
                        style={{
                            height: '40px',
                            width: '150px', // Уменьшаем ширину инпута
                            resize: 'none',
                            marginRight: '5px', // Отступ между инпутом и символом рубля
                        }}
                    />
                    <span style={{fontSize: '16px'}}>₽</span> {/* Символ рубля */}
                </div>
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
                        sendingData(payload, url_user_data); // Send the new state to the server
                        // console.log("sendByAgreement:", sendByAgreement, "Type:", typeof sendByAgreement);
                    }}
                />
                <span className="ml-2">Отправлять по соглашению</span>
            </div>
        </>
    );

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
            {!isInterfaceAvailable && <DisabledOverlay/>}
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
