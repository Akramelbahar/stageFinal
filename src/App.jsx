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
import InterventionForm from './pages/InterventionForm';
import Diagnostics from './pages/Diagnostics';
import DiagnosticForm from './pages/DiagnosticForm';
import Planifications from './pages/Planifications';
import PlanificationForm from './pages/PlanificationForm';
import ControleQualite from './pages/ControleQualite';
import ControleQualiteForm from './pages/ControleQualiteForm';
import Rapports from './pages/Rapports';
import RapportForm from './pages/RapportForm';
import Utilisateurs from './pages/admin/Utilisateurs';
import UtilisateurForm from './pages/admin/UtilisateurForm';
import RolesPermissions from './pages/admin/RolesPermissions';
import RoleForm from './pages/admin/RoleForm';
import Sections from './pages/admin/Sections';
import SectionForm from './pages/admin/SectionForm';
import ForbiddenPage from './pages/ForbiddenPage';
import NotFoundPage from './pages/NotFoundPage';

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
            <Route 
              path="/interventions/new" 
              element={
                <ProtectedRoute requiredPermission="intervention-create">
                  <InterventionForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interventions/:id/edit" 
              element={
                <ProtectedRoute requiredPermission="intervention-edit">
                  <InterventionForm />
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
            <Route 
              path="/diagnostics/new" 
              element={
                <ProtectedRoute requiredPermission="diagnostic-create">
                  <DiagnosticForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/diagnostics/:id/edit" 
              element={
                <ProtectedRoute requiredPermission="diagnostic-edit">
                  <DiagnosticForm />
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
            <Route 
              path="/planifications/new" 
              element={
                <ProtectedRoute requiredPermission="planification-create">
                  <PlanificationForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/planifications/:id/edit" 
              element={
                <ProtectedRoute requiredPermission="planification-edit">
                  <PlanificationForm />
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
            <Route 
              path="/controles/new" 
              element={
                <ProtectedRoute requiredPermission="controle-create">
                  <ControleQualiteForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/controles/:id/edit" 
              element={
                <ProtectedRoute requiredPermission="controle-edit">
                  <ControleQualiteForm />
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
            <Route 
              path="/rapports/new" 
              element={
                <ProtectedRoute requiredPermission="rapport-create">
                  <RapportForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rapports/:id/edit" 
              element={
                <ProtectedRoute requiredPermission="rapport-edit">
                  <RapportForm />
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
              <Route 
                path="utilisateurs/new" 
                element={
                  <ProtectedRoute requiredPermission="utilisateur-create">
                    <UtilisateurForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="utilisateurs/:id/edit" 
                element={
                  <ProtectedRoute requiredPermission="utilisateur-edit">
                    <UtilisateurForm />
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
              <Route 
                path="roles/new" 
                element={
                  <ProtectedRoute requiredPermission="admin-roles">
                    <RoleForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="roles/:id/edit" 
                element={
                  <ProtectedRoute requiredPermission="admin-roles">
                    <RoleForm />
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
              <Route 
                path="sections/new" 
                element={
                  <ProtectedRoute requiredPermission="section-create">
                    <SectionForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="sections/:id/edit" 
                element={
                  <ProtectedRoute requiredPermission="section-edit">
                    <SectionForm />
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