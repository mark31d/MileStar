// ./Components/QuotesContext.js
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QuotesCtx = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT':
      return action.payload;
    case 'ADD':
      // не добавляем дубликаты
      return state.find(q => q.id === action.payload.id)
        ? state
        : [action.payload, ...state];
    case 'REMOVE':
      return state.filter(q => q.id !== action.payload);
    default:
      return state;
  }
};

export function QuotesProvider({ children }) {
  const [quotes, dispatch] = useReducer(reducer, []);

  // инициализация из хранилища
  useEffect(() => {
    AsyncStorage.getItem('savedQuotes').then(json => {
      if (json) dispatch({ type: 'INIT', payload: JSON.parse(json) });
    });
  }, []);

  // сохраняем после каждого изменения
  useEffect(() => {
    AsyncStorage.setItem('savedQuotes', JSON.stringify(quotes));
  }, [quotes]);

  const addQuote    = quote => dispatch({ type: 'ADD',    payload: quote });
  const removeQuote = id    => dispatch({ type: 'REMOVE', payload: id });

  return (
    <QuotesCtx.Provider value={{ quotes, addQuote, removeQuote }}>
      {children}
    </QuotesCtx.Provider>
  );
}

export const useQuotes = () => useContext(QuotesCtx);
