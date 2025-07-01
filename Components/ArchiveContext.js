import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** ключ для AsyncStorage */
const STORAGE_KEY = '@mileStar_archive';

/** ---------- CONTEXT ---------- */
const ArchiveContext = createContext(null);

/** кастомный хук */
export const useArchive = () => {
  const ctx = useContext(ArchiveContext);
  if (!ctx) {
    throw new Error('useArchive must be used inside <ArchiveProvider>');
  }
  return ctx;
};

/* ------------------------------------------------------------------ */
/** PROVIDER */
export function ArchiveProvider({ children }) {
  /** archived = [{ id, title, desc, total }] */
  const [archived, setArchived] = useState([]);

  /* --- загрузка из хранилища при старте --- */
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setArchived(JSON.parse(raw));
      } catch (err) {
        console.warn('[Archive] load error:', err);
      }
    })();
  }, []);

  /* helper: сохранить текущий массив в AsyncStorage */
  const persist = async (arr) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (err) {
      console.warn('[Archive] persist error:', err);
    }
  };

  /* ---------- PUBLIC METHODS ---------- */

  /** поместить задачу в архив */
  const archiveTask = (task) => {
    setArchived((old) => {
      const next = [...old, task];
      persist(next);
      return next;
    });
  };

  /** восстановить задачу и вернуть её объект */
  const restoreTask = (id) => {
    let restored;
    setArchived((old) => {
      const next = old.filter((t) => {
        if (t.id === id) {
          restored = t;
          return false;
        }
        return true;
      });
      persist(next);
      return next;
    });
    return restored;
  };

  /** очистить архив */
  const clearArchive = () => {
    setArchived([]);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  /* ---------- VALUE ---------- */
  const value = { archived, archiveTask, restoreTask, clearArchive };

  return (
    <ArchiveContext.Provider value={value}>
      {children}
    </ArchiveContext.Provider>
  );
}
