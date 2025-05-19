import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Contexts
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import Layout from './components/layout/Layout';

// Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import MachineDetail from './pages/MachineDetail';
import MachineForm from './pages/MachineForm';
import ForbiddenPage from './pages/ForbiddenPage';
import NotFoundPage from './pages/NotFoundPage';

// Other pages to be implemented later
const Interventions = () => <div>Interventions Page (Coming Soon)</div>;
const Diagnostics = () => <div>Diagnostics Page (Coming Soon)</div>;
const Planifications = () => <div>Planifications Page (Coming Soon)</div>;
const Controles = () => <div>Contrôles Qualité Page (Coming Soon)</div>;
const Rapports = () => <div>Rapports Page (Coming Soon)</div>;
const Admin = () => <div>Admin Page (Coming Soon)</div>;

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          
          {/* Protected routes with layout */}
          <Route element={<Layout />}>
            {/* Dashboard */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Machines */}
            <Route 
              path="/machines" 
              element={
                <ProtectedRoute requiredPermission="machine-list">
                  <Machines />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/machines/new" 
              element={
                <ProtectedRoute requiredPermission="machine-create">
                  <MachineForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/machines/:id" 
              element={
                <ProtectedRoute requiredPermission="machine-view">
                  <MachineDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/machines/:id/edit" 
              element={
                <ProtectedRoute requiredPermission="machine-edit">
                  <MachineForm />
                </ProtectedRoute>
              } 
            />
            
            {/* Interventions */}
            <Route 
              path="/interventions/*" 
              element={
                <ProtectedRoute requiredPermission="intervention-list">
                  <Interventions />
                </ProtectedRoute>
              } 
            />
            
            {/* Diagnostics */}
            <Route 
              path="/diagnostics/*" 
              element={
                <ProtectedRoute requiredPermission="diagnostic-list">
                  <Diagnostics />
                </ProtectedRoute>
              } 
            />
            
            {/* Planifications */}
            <Route 
              path="/planifications/*" 
              element={
                <ProtectedRoute requiredPermission="planification-list">
                  <Planifications />
                </ProtectedRoute>
              } 
            />
            
            {/* Contrôles Qualité */}
            <Route 
              path="/controles/*" 
              element={
                <ProtectedRoute requiredPermission="controle-list">
                  <Controles />
                </ProtectedRoute>
              } 
            />
            
            {/* Rapports */}
            <Route 
              path="/rapports/*" 
              element={
                <ProtectedRoute requiredPermission="rapport-list">
                  <Rapports />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredPermission="admin-roles">
                  <Admin />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
