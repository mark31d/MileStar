// ./Components/StoriesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mileStar_stories';

// Тип контекста
// {
//   readCount: number,
//   markRead: () => void
// }

const StoriesContext = createContext({ readCount: 0, markRead: () => {} });

export const useStories = () => {
  const ctx = useContext(StoriesContext);
  if (!ctx) throw new Error('useStories must be used within a <StoriesProvider>');
  return ctx;
};

export function StoriesProvider({ children }) {
  const [readCount, setReadCount] = useState(0);

  // При монтировании подгружаем из AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      const n = parseInt(raw ?? '0', 10);
      if (!isNaN(n)) setReadCount(n);
    });
  }, []);

  // Функция, вызываемая при прочтении истории
  const markRead = () => {
    setReadCount((prev) => {
      const next = prev + 1;
      AsyncStorage.setItem(STORAGE_KEY, String(next)).catch(() => {});
      return next;
    });
  };

  return (
    <StoriesContext.Provider value={{ readCount, markRead }}>
      {children}
    </StoriesContext.Provider>
  );
}
