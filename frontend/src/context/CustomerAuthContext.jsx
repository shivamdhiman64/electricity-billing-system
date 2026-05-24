import React, { createContext, useContext, useState } from 'react';

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('ebs_customer')); } catch { return null; }
  });

  const loginCustomer = (data) => {
    setCustomer(data);
    sessionStorage.setItem('ebs_customer', JSON.stringify(data));
  };

  const logoutCustomer = () => {
    setCustomer(null);
    sessionStorage.removeItem('ebs_customer');
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, loginCustomer, logoutCustomer }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => useContext(CustomerAuthContext);
