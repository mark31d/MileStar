import React, { createContext, useContext, useState } from 'react';

const MilestonesContext = createContext({
  count: 0,
  add:    () => {},
  remove: () => {},
});

export const useMilestones = () => {
  const ctx = useContext(MilestonesContext);
  if (!ctx) throw new Error('useMilestones must be used within MilestonesProvider');
  return ctx;
};

export function MilestonesProvider({ children }) {
  const [count, setCount] = useState(0);

  const add    = () => setCount(c => c + 1);
  const remove = () => setCount(c => Math.max(0, c - 1));

  return (
    <MilestonesContext.Provider value={{ count, add, remove }}>
      {children}
    </MilestonesContext.Provider>
  );
}
