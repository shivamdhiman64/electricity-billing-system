// api.js - Centralized API calls
const BASE_URL = 'https://electricity-backend-1fp7.onrender.com/api';

// Helper for fetch with error handling
const request = async (url, options = {}) => {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

// Auth
export const login = (username, password) =>
  request('/login', { method: 'POST', body: JSON.stringify({ username, password }) });

// Customers
export const getCustomers = () => request('/customers');
export const addCustomer = (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) });
export const updateCustomer = (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCustomer = (id) => request(`/customers/${id}`, { method: 'DELETE' });

// Bills
export const getBills = () => request('/bills');
export const generateBill = (data) => request('/bills', { method: 'POST', body: JSON.stringify(data) });
export const markAsPaid = (id) => request(`/bills/${id}/pay`, { method: 'PUT' });
export const deleteBill = (id) => request(`/bills/${id}`, { method: 'DELETE' });

// Dashboard
export const getDashboardStats = () => request('/dashboard/stats');

// Customer Portal
export const customerLogin = (meter_no, phone) =>
  request('/customers/login', { method: 'POST', body: JSON.stringify({ meter_no, phone }) });

export const getCustomerBills = (id) => request(`/customers/${id}/bills`);

// Smart Meter APIs
export const getSmartMeters = () => request('/smartmeter/meters');
export const simulateReadings = () => request('/smartmeter/simulate', { method: 'POST' });
export const generateAllBills = () => request('/smartmeter/generate-all', { method: 'POST' });
export const getNotifications = (customerId) => request(`/smartmeter/notifications/${customerId}`);
export const markNotifRead = (id) => request(`/smartmeter/notifications/${id}/read`, { method: 'PUT' });
export const getBillCharges = (billId) => request(`/smartmeter/charges/${billId}`);
