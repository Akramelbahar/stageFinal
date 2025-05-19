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
import Interventions from './pages/Interventions';
import Diagnostics from './pages/Diagnostics';
import Planifications from './pages/Planifications';
import ControleQualite from './pages/ControleQualite';
import Rapports from './pages/Rapports';
import Utilisateurs from './pages/admin/Utilisateurs';
import RolesPermissions from './pages/admin/RolesPermissions';
import Sections from './pages/admin/Sections';
import ForbiddenPage from './pages/ForbiddenPage';
import NotFoundPage from './pages/NotFoundPage';

// Create a simple Sections component as placeholder until implemented
const SectionsPlaceholder = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold mb-4">Gestion des Sections</h1>
    <p>Cette fonctionnalité sera implémentée prochainement.</p>
  </div>
);

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
              path="/interventions" 
              element={
                <ProtectedRoute requiredPermission="intervention-list">
                  <Interventions />
                </ProtectedRoute>
              } 
            />
            
            {/* Diagnostics */}
            <Route 
              path="/diagnostics" 
              element={
                <ProtectedRoute requiredPermission="diagnostic-list">
                  <Diagnostics />
                </ProtectedRoute>
              } 
            />
            
            {/* Planifications */}
            <Route 
              path="/planifications" 
              element={
                <ProtectedRoute requiredPermission="planification-list">
                  <Planifications />
                </ProtectedRoute>
              } 
            />
            
            {/* Contrôles Qualité */}
            <Route 
              path="/controles" 
              element={
                <ProtectedRoute requiredPermission="controle-list">
                  <ControleQualite />
                </ProtectedRoute>
              } 
            />
            
            {/* Rapports */}
            <Route 
              path="/rapports" 
              element={
                <ProtectedRoute requiredPermission="rapport-list">
                  <Rapports />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route path="/admin">
              {/* Utilisateurs */}
              <Route 
                path="utilisateurs" 
                element={
                  <ProtectedRoute requiredPermission="utilisateur-list">
                    <Utilisateurs />
                  </ProtectedRoute>
                } 
              />
              
              {/* Roles & Permissions */}
              <Route 
                path="roles" 
                element={
                  <ProtectedRoute requiredPermission="admin-roles">
                    <RolesPermissions />
                  </ProtectedRoute>
                } 
              />
              
              {/* Sections */}
              <Route 
                path="sections" 
                element={
                  <ProtectedRoute requiredPermission="section-list">
                    <Sections />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin root - redirect to Utilisateurs */}
              <Route 
                path="" 
                element={<Navigate to="/admin/utilisateurs" replace />} 
              />
            </Route>
            
            {/* 404 catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;