import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ebs_user')); } catch { return null; }
  });

  const loginUser = (userData) => {
    setUser(userData);
    sessionStorage.setItem('ebs_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setUser(null);
    sessionStorage.removeItem('ebs_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
