import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE = '@mileStar_tasks';

/** Структура задачи */
export const BLANK_TASK = () => ({
  id:        Date.now().toString(),
  title:     '',
  desc:      '',
  dateISO:   new Date().toISOString(),
  milestones: [],          // ['text', …]
  done:      false,
});

/*────────────────── context */
const Ctx = createContext();
export const useTasks = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useTasks must be inside <TasksProvider>');
  return c;
};

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);

  /* load */
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE);
      if (raw) setTasks(JSON.parse(raw));
    })();
  }, []);

  const persist = (arr) =>
    AsyncStorage.setItem(STORAGE, JSON.stringify(arr)).catch(() => {});

  /* helpers */
  const addTask = (t) => setTasks((old) => { const next=[...old,t]; persist(next); return next; });
  const updateTask = (t) =>
    setTasks((old) => { const next = old.map(o=>o.id===t.id? t:o); persist(next); return next; });
  const removeTask = (id) =>
    setTasks((old) => { const next = old.filter(o=>o.id!==id); persist(next); return next; });
  const toggleDone = (id, flag=true) =>
    setTasks((old) => {
      const next = old.map(o => o.id===id ? {...o, done:flag} : o);
      persist(next);
      return next;
    });

  return (
    <Ctx.Provider value={{ tasks, addTask, updateTask, removeTask, toggleDone }}>
      {children}
    </Ctx.Provider>
  );
}
