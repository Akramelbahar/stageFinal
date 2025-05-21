/**
 * Application configuration
 */

// API base URL
export const API_URL = 'http://127.0.0.1:8000/api';

// Authentication
export const AUTH = {
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  PERMISSIONS_KEY: 'permissions',
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 10,
  PER_PAGE_OPTIONS: [10, 25, 50, 100],
};

// Machine statuses
export const MACHINE_STATUSES = {
  OPERATIONNEL: {
    label: 'Opérationnel',
    color: 'green',
  },
  EN_MAINTENANCE: {
    label: 'En maintenance',
    color: 'orange',
  },
  HORS_SERVICE: {
    label: 'Hors service',
    color: 'red',
  },
};

// Intervention statuses
export const INTERVENTION_STATUSES = {
  PENDING: {
    label: 'En attente',
    color: 'yellow',
  },
  PLANNED: {
    label: 'Planifiée',
    color: 'blue',
  },
  IN_PROGRESS: {
    label: 'En cours',
    color: 'orange',
  },
  COMPLETED: {
    label: 'Terminée',
    color: 'green',
  },
  CANCELLED: {
    label: 'Annulée',
    color: 'red',
  },
};

// Intervention types
export const INTERVENTION_TYPES = {
  MAINTENANCE: 'Maintenance',
  RENOVATION: 'Rénovation',
  DIAGNOSTIC: 'Diagnostic',
  URGENT: 'Urgente',
  PREVENTIVE: 'Préventive',
};

// Maintenance types
export const MAINTENANCE_TYPES = {
  PREVENTIVE: 'Préventive',
  CORRECTIVE: 'Corrective',
  PREDICTIVE: 'Prédictive',
};

// Rapport types
export const RAPPORT_TYPES = {
  RENOVATION: 'Rénovation',
  MAINTENANCE: 'Maintenance',
  PRESTATAIRE: 'Prestataire',
};

// File types
export const FILE_TYPES = {
  PDF: 'application/pdf',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  WORD: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  IMAGE: 'image/*',
  CSV: 'text/csv',
};

// Error messages
export const ERROR_MESSAGES = {
  DEFAULT: 'Une erreur est survenue. Veuillez réessayer plus tard.',
  NETWORK: 'Erreur de connexion au serveur. Veuillez vérifier votre connexion internet.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  NOT_FOUND: 'La ressource demandée n\'a pas été trouvée.',
  VALIDATION: 'Veuillez corriger les erreurs dans le formulaire.',
  SERVER: 'Erreur serveur. Veuillez contacter l\'administrateur.',
  TIMEOUT: 'La requête a expiré. Veuillez réessayer plus tard.',
};

// Date formats
export const DATE_FORMATS = {
  DEFAULT: 'DD/MM/YYYY',
  WITH_TIME: 'DD/MM/YYYY HH:mm',
  INPUT: 'YYYY-MM-DD',
  FRIENDLY: 'D MMMM YYYY',
};

// User roles
export const USER_ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  TECHNICIAN: 'Technicien',
  USER: 'Utilisateur',
};

// User permissions
export const USER_PERMISSIONS = {
  // Machines
  MACHINE_LIST: 'machine-list',
  MACHINE_CREATE: 'machine-create',
  MACHINE_EDIT: 'machine-edit',
  MACHINE_VIEW: 'machine-view',
  MACHINE_DELETE: 'machine-delete',
  
  // Interventions
  INTERVENTION_LIST: 'intervention-list',
  INTERVENTION_CREATE: 'intervention-create',
  INTERVENTION_EDIT: 'intervention-edit',
  INTERVENTION_VIEW: 'intervention-view',
  INTERVENTION_DELETE: 'intervention-delete',
  
  // Diagnostics
  DIAGNOSTIC_LIST: 'diagnostic-list',
  DIAGNOSTIC_CREATE: 'diagnostic-create',
  DIAGNOSTIC_EDIT: 'diagnostic-edit',
  DIAGNOSTIC_VIEW: 'diagnostic-view',
  DIAGNOSTIC_DELETE: 'diagnostic-delete',
  
  // Planifications
  PLANIFICATION_LIST: 'planification-list',
  PLANIFICATION_CREATE: 'planification-create',
  PLANIFICATION_EDIT: 'planification-edit',
  PLANIFICATION_VIEW: 'planification-view',
  PLANIFICATION_DELETE: 'planification-delete',
  
  // Contrôles qualité
  CONTROLE_LIST: 'controle-list',
  CONTROLE_CREATE: 'controle-create',
  CONTROLE_EDIT: 'controle-edit',
  CONTROLE_VIEW: 'controle-view',
  CONTROLE_DELETE: 'controle-delete',
  
  // Rapports
  RAPPORT_LIST: 'rapport-list',
  RAPPORT_CREATE: 'rapport-create',
  RAPPORT_EDIT: 'rapport-edit',
  RAPPORT_VIEW: 'rapport-view',
  RAPPORT_DELETE: 'rapport-delete',
  RAPPORT_VALIDATE: 'rapport-validate',
  
  // Admin
  ADMIN_ROLES: 'admin-roles',
  ADMIN_PERMISSIONS: 'admin-permissions',
  
  // Utilisateurs
  UTILISATEUR_LIST: 'utilisateur-list',
  UTILISATEUR_CREATE: 'utilisateur-create',
  UTILISATEUR_EDIT: 'utilisateur-edit',
  UTILISATEUR_VIEW: 'utilisateur-view',
  UTILISATEUR_DELETE: 'utilisateur-delete',
  UTILISATEUR_MANAGE_ROLES: 'utilisateur-manage-roles',
  
  // Sections
  SECTION_LIST: 'section-list',
  SECTION_CREATE: 'section-create',
  SECTION_EDIT: 'section-edit',
  SECTION_VIEW: 'section-view',
  SECTION_DELETE: 'section-delete',
};
