import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomerAuthProvider, useCustomerAuth } from './context/CustomerAuthContext';

import Login from './pages/Login';
import CustomerLogin from './pages/CustomerLogin';
import CustomerDashboard from './pages/CustomerDashboard';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import GenerateBill from './pages/GenerateBill';
import BillHistory from './pages/BillHistory';
import Reports from './pages/Reports';
import SmartMeter from './pages/SmartMeter';
import Layout from './components/Layout';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const CustomerRoute = ({ children }) => {
  const { customer } = useCustomerAuth();
  return customer ? children : <Navigate to="/customer/login" replace />;
};

const HomeRedirect = () => {
  const { user } = useAuth();
  const { customer } = useCustomerAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  if (customer) return <Navigate to="/customer/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route element={<AdminRoute><Layout /></AdminRoute>}>
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/customers"     element={<Customers />} />
        <Route path="/generate-bill" element={<GenerateBill />} />
        <Route path="/bill-history"  element={<BillHistory />} />
        <Route path="/reports"       element={<Reports />} />
        <Route path="/smart-meter"   element={<SmartMeter />} />
      </Route>

      <Route path="/customer/login"     element={<CustomerLogin />} />
      <Route path="/customer/dashboard" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CustomerAuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CustomerAuthProvider>
    </AuthProvider>
  );
}
