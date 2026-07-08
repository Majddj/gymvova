# 💪 Gym VOVA - Fitness Tracking App

Современное мобильное приложение для отслеживания тренировок и достижения фитнес-целей, разработанное на React Native с Expo.

## 📋 Особенности

- 📊 **Дашборд** - Визуализация прогресса тренировок с графиками за неделю/месяц/год
- 🏋️ **Управление упражнениями** - Логирование рeps/sets с заметками
- 🎯 **Системе целей** - Установка и отслеживание целей с периодичностью
- 📅 **История тренировок** - Календарь и детальная история всех тренировок
- 💾 **Синхронизация данных** - Локальное хранилище с Redux Persist

## 🛠 Технологический стек

- **React Native** 0.81.4
- **Expo** 54.0.0
- **React Navigation** (Expo Router 6.0.0)
- **Redux Toolkit** 2.2.5 + Redux Persist
- **TypeScript** 5.9.2
- **Chart Libraries** - react-native-gifted-charts, react-native-chart-kit
- **Storage** - AsyncStorage

## 📁 Структура проекта

```
gym-vova/
├── app/                          # Expo Router страницы
│   ├── _layout.tsx              # Root layout
│   └── (tabs)/                  # Tab-based navigation
│       ├── _layout.tsx
│       ├── index.tsx            # Dashboard
│       ├── exercises.tsx        # Exercises screen
│       ├── goals.tsx            # Goals screen
│       └── history.tsx          # History screen
│
├── src/
│   ├── features/                # Feature-based architecture
│   │   ├── dashboard/           # Dashboard feature
│   │   │   └── screens/
│   │   ├── exercises/           # Exercises management
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   └── types.ts
│   │   ├── goals/               # Goals management
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── store/
│   │   │   └── types.ts
│   │   └── history/             # History feature
│   │       └── screens/
│   │
│   ├── shared/                  # Shared across features
│   │   ├── components/          # Reusable UI components
│   │   │   ├── layout/
│   │   │   └── ui/
│   │   ├── constants/           # App constants
│   │   │   ├── theme.ts
│   │   │   └── exercises.ts
│   │   └── utils/               # Utility functions
│   │       ├── dateUtils.ts
│   │       └── idUtils.ts
│   │
│   └── store/                   # Redux store configuration
│       ├── index.ts
│       └── rootReducer.ts
│
├── docs/                        # Documentation
├── assets/                      # Static assets
├── app.json                     # Expo configuration
├── package.json
├── tsconfig.json
└── babel.config.js
```

## 🚀 Быстрый старт

### Требования
- Node.js 16+
- npm или yarn
- Expo CLI: `npm install -g expo-cli`

### Установка

```bash
# Клонировать репозиторий
git clone https://github.com/YOUR_USERNAME/gym-vova.git
cd gym-vova

# Установить зависимости
npm install

# Запустить приложение
npm start
```

### Доступные команды

```bash
# Запустить на Android
npm run android

# Запустить на iOS
npm run ios

# Запустить на Web
npm run web
```

## 🏗 Архитектура

### Feature-Based Organization
Проект организован на основе функций (features) для лучшей масштабируемости:

- **Каждая feature** содержит свои компоненты, хуки, типы и store
- **Shared** содержит переиспользуемые компоненты и утилиты
- **Clear separation of concerns** между различными функциональностями

### State Management
- **Redux Toolkit** для управления глобальным состоянием
- **Redux Persist** для сохранения данных между сессиями
- **Custom hooks** (`useExercises`, `useGoals`) для удобного доступа к состоянию

### Типизация
- Полная типизация на **TypeScript**
- Отдельные файлы для типов в каждой feature (`types.ts`)

## 📖 Основные фичи

### Dashboard
Главный экран с:
- Статистикой за день (total reps, sets)
- Графиком активности (недела/месяц/год)
- Быстрым доступом к активным целям
- Кнопкой быстрого логирования тренировки

### Exercises
Полное управление упражнениями:
- Список всех упражнений с итоговыми данными за день
- Модальное окно для логирования reps/sets/notes
- Редактирование и удаление записей
- Фильтрация и сортировка

### Goals
Система целей:
- Создание целей с выбором периода (день/неделя/месяц)
- Отслеживание прогресса в процентах
- Редактирование и удаление целей
- Визуализация достижений

### History
Полная история тренировок:
- Календарный просмотр
- Детальный список упражнений по дате
- Быстрое редактирование/удаление записей
- Фильтрация по датам

## 🎨 Дизайн

- **Современный UI** с использованием Expo Vector Icons
- **Темная тема** по умолчанию (легко переключить на светлую)
- **Адаптивный дизайн** для разных размеров экранов
- **Плавные анимации** с React Native Reanimated

## 🔧 Конфигурация

### Theme (src/shared/constants/theme.ts)
```typescript
- Цвета (primary, secondary, background, etc.)
- Размеры шрифтов
- Отступы (spacing)
- Радиус границ
```

### Exercises (src/shared/constants/exercises.ts)
Предустановленный список упражнений с иконками и группами мышц

## 📦 Зависимости

### Runtime
- `expo` - Фреймворк React Native
- `@reduxjs/toolkit` - State management
- `redux-persist` - Данные между сессиями
- `react-native-gifted-charts` - Графики
- `date-fns` - Работа с датами
- `uuid` - Генерация ID

### Dev
- `typescript` - Типизация
- `@types/react`, `@types/uuid` - Type definitions
- `babel-plugin-module-resolver` - Alias imports

## 🐛 Troubleshooting

### Проблема: "Module not found"
```bash
# Очистить кеш и переустановить
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Проблема: "Ошибка при подключении устройства"
```bash
# Перезапустить Expo сервер
npm start --clear
```

## 📝 Лицензия

MIT License - смотрите LICENSE файл

## 👤 Автор

Создано с ❤️ для фитнес-энтузиастов

---

**Хотите помочь?** Приветствуются pull requests! 🙏
