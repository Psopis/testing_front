import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react'; // Импорт иконки

interface Category {
    id: number;
    name: string;
    children: SubCategory[];
  }
  
  interface SubCategory {
    id: number;
    name: string;
  }
  const mockCategories = [
    {
      id: 1,
      name: 'IT и программирование',
      subcategories: [
        { id: 101, name: 'Веб-разработка' },
        { id: 102, name: 'Мобильные приложения' },
        { id: 103, name: 'Тестирование' },
      ],
    },
    {
      id: 2,
      name: 'Дизайн',
      subcategories: [
        { id: 201, name: 'Логотипы' },
        { id: 202, name: 'UI/UX дизайн' },
        { id: 203, name: 'Иллюстрации' },
      ],
    },
  ];
const NewOrderPage = () => {
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [deadline, setDeadline] = useState('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(null);
    
  const navigate = useNavigate();

  
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://your-api-url.com/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategorySelect = (categoryId: number, subCategoryId: number) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subCategoryId);
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      category: {
        id: selectedCategory,
        subCategoryId: selectedSubCategory,
        name: categories.find(c => c.id === selectedCategory)?.name || '',
        subName: categories
          .find(c => c.id === selectedCategory)
          ?.children.find(s => s.id === selectedSubCategory)?.name || ''
      },
      shortDescription,
      description,
      price,
      deadline
    };

    console.log('%c=== Данные заказа ===', 'color: #2ecc71; font-weight: bold;');
    console.table(orderData);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-600">Новый заказ</h2>
        <button
          className="text-gray-500 hover:text-gray-700"
          onClick={() => navigate(-1)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Поле краткого описания */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Краткое описание
            <span className="text-gray-400 text-shadow ml-1">(максимум 50 символов)</span>
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 
              focus:border-green-500 shadow-sm"
            maxLength={50}
            required
          />
        </div>

        {/* Поле полного описания */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Подробное описание
            <span className="text-gray-400 text-shadow ml-1">(необязательно)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-green-500 
              focus:border-green-500 shadow-sm resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Поле цены */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Бюджет
              <span className="text-gray-400 text-shadow ml-1">(₽)</span>
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 
                focus:border-green-500 shadow-sm"
              min="0"
              required
            />
          </div>

          {/* Поле срока выполнения */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Срок выполнения
              <span className="text-gray-400 text-shadow ml-1">(дней)</span>
            </label>
            <input
              type="number"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 
                focus:border-green-500 shadow-sm"
              min="1"
              required
            />
          </div>
        </div>
        <div className="space-y-4">
    <h3 className="text-sm font-medium text-gray-700">Категория работы</h3>
    <div className="border rounded-lg p-3 space-y-4">
      {mockCategories.map(category => (
        <div key={category.id} className="space-y-2">
          <div className="font-medium text-gray-600">{category.name}</div>
          <div className="flex flex-wrap gap-2">
            {category.subcategories.map(sub => (
              <button
                key={sub.id}
                type="button"
                onClick={() => handleCategorySelect(category.id, sub.id)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedSubCategory === sub.id
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-3 px-6 rounded-lg 
            hover:bg-green-600 transition-colors shadow-md font-medium"
        >
          Опубликовать заказ
        </button>
      </form>
    </div>
  );
};

export default NewOrderPage;