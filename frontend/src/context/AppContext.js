import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [usdotData, setUsdotData] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('trc_token');
    const user = localStorage.getItem('trc_user');
    return { token: token || null, user: user ? JSON.parse(user) : null };
  });

  const login = (token, user) => {
    localStorage.setItem('trc_token', token);
    localStorage.setItem('trc_user', JSON.stringify(user));
    setAuth({ token, user });
  };

  const logout = () => {
    localStorage.removeItem('trc_token');
    localStorage.removeItem('trc_user');
    setAuth({ token: null, user: null });
  };

  return (
    <AppContext.Provider value={{ usdotData, setUsdotData, selectedTier, setSelectedTier, auth, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
