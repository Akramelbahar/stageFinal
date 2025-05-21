import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RiSaveLine, RiCloseLine, RiShieldUserLine } from 'react-icons/ri';

// API calls - Fixed import paths
import { getUserById, createUser, updateUser, assignRolesToUser } from '../../api/utilisateurs';
import { getAllSections } from '../../api/sections';
import { getAllRoles } from '../../api/roles';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';

const UtilisateurForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission, isAdmin } = useAuth();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    section: '', // Added section field to match backend expectation
    section_id: '',
    password: '',
    password_confirmation: '',
    roles: []
  });
  
  const [sections, setSections] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load user data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch sections list
        const sectionsResponse = await getAllSections();
        setSections(sectionsResponse.data || []);
        
        // Fetch roles list
        const rolesResponse = await getAllRoles();
        setRoles(rolesResponse.data || []);
        
        // If edit mode, fetch user data
        if (isEditMode) {
          const response = await getUserById(id);
          const userData = response.data;
          
          setFormData({
            ...userData,
            section_id: userData.sectionRelation ? userData.sectionRelation.id : '',
            section: userData.section || '', // Make sure to get the section field
            email: userData.email || '', // Keep email field for UI
            roles: userData.roles ? userData.roles.map(role => role.id) : [],
            password: '', // Don't fill password fields in edit mode
            password_confirmation: ''
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Update section field when section_id changes
  useEffect(() => {
    if (formData.section_id && sections.length > 0) {
      const selectedSection = sections.find(s => s.id === parseInt(formData.section_id));
      if (selectedSection) {
        setFormData(prev => ({
          ...prev,
          section: selectedSection.nom
        }));
      }
    }
  }, [formData.section_id, sections]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle role checkbox changes
  const handleRoleChange = (roleId) => {
    setFormData(prev => {
      const currentRoles = [...prev.roles];
      
      if (currentRoles.includes(roleId)) {
        return { ...prev, roles: currentRoles.filter(id => id !== roleId) };
      } else {
        return { ...prev, roles: [...currentRoles, roleId] };
      }
    });
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom.trim()) {
      errors.nom = 'Le nom est requis';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }
    
    if (!formData.section.trim()) {
      errors.section = 'La section est requise';
    }
    
    if (!isEditMode) {
      if (!formData.password) {
        errors.password = 'Le mot de passe est requis';
      } else if (formData.password.length < 6) {
        errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
      }
      
      if (formData.password !== formData.password_confirmation) {
        errors.password_confirmation = 'Les mots de passe ne correspondent pas';
      }
    } else {
      // In edit mode, if password is provided, validate it
      if (formData.password) {
        if (formData.password.length < 6) {
          errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
        }
        
        if (formData.password !== formData.password_confirmation) {
          errors.password_confirmation = 'Les mots de passe ne correspondent pas';
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const dataToSubmit = { 
        ...formData,
        // Map password to credentials as expected by backend
        credentials: formData.password,
      };
      
      // Convert section_id to integer if present
      if (dataToSubmit.section_id) {
        dataToSubmit.section_id = parseInt(dataToSubmit.section_id);
      }
      
      // Don't send empty password/credentials in edit mode
      if (isEditMode && !dataToSubmit.credentials) {
        delete dataToSubmit.credentials;
        delete dataToSubmit.password;
        delete dataToSubmit.password_confirmation;
      }
      
      // Save user data
      let userData;
      if (isEditMode) {
        userData = await updateUser(id, dataToSubmit);
      } else {
        userData = await createUser(dataToSubmit);
      }
      
      // Assign roles separately
      if (dataToSubmit.roles.length > 0) {
        const userId = isEditMode ? id : userData.data.id;
        await assignRolesToUser(userId, { roles: dataToSubmit.roles });
      }
      
      // Redirect after successful save
      navigate('/admin/utilisateurs');
    } catch (err) {
      console.error('Error saving user:', err);
      setError('Erreur lors de l\'enregistrement de l\'utilisateur');
      
      // Check for validation errors from server
      if (err.response && err.response.data && err.response.data.errors) {
        setFormErrors(err.response.data.errors);
      }
    } finally {
      setSaving(false);
    }
  };

  // Check permissions
  useEffect(() => {
    const requiredPermission = isEditMode ? 'utilisateur-edit' : 'utilisateur-create';
    if (!hasPermission(requiredPermission)) {
      navigate('/forbidden');
    }
  }, [hasPermission, isEditMode, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User Name */}
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.nom ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.nom && (
                <p className="mt-1 text-sm text-red-600">{formErrors.nom}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
              )}
            </div>
            
            {/* Section */}
            <div>
              <label htmlFor="section_id" className="block text-sm font-medium text-gray-700 mb-1">
                Section *
              </label>
              <select
                id="section_id"
                name="section_id"
                value={formData.section_id}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.section ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionnez une section</option>
                {sections.map(section => (
                  <option key={section.id} value={section.id}>
                    {section.nom} ({section.type})
                  </option>
                ))}
              </select>
              {formErrors.section && (
                <p className="mt-1 text-sm text-red-600">{formErrors.section}</p>
              )}
            </div>
            
            {/* Manual Section Input (Hidden but needed for backend) */}
            <input
              type="hidden"
              name="section"
              value={formData.section}
            />
            
            {/* Password - required for new users, optional for edit */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe {!isEditMode && '*'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditMode}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.password || formErrors.credentials ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder={isEditMode ? "Laisser vide pour ne pas modifier" : ""}
              />
              {formErrors.password && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
              )}
              {formErrors.credentials && (
                <p className="mt-1 text-sm text-red-600">{formErrors.credentials}</p>
              )}
            </div>
            
            {/* Password Confirmation */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe {!isEditMode && '*'}
              </label>
              <input
                type="password"
                id="password_confirmation"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required={!isEditMode}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formErrors.password_confirmation ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {formErrors.password_confirmation && (
                <p className="mt-1 text-sm text-red-600">{formErrors.password_confirmation}</p>
              )}
            </div>
            
            {/* Roles */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rôles
              </label>
              
              <div className="border rounded-md p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roles.map(role => (
                  <div key={role.id} className="flex items-start">
                    <input
                      type="checkbox"
                      id={`role-${role.id}`}
                      checked={formData.roles.includes(role.id)}
                      onChange={() => handleRoleChange(role.id)}
                      className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={role.nom === 'Admin' && !isAdmin()}
                    />
                    <label htmlFor={`role-${role.id}`} className="ml-2 block">
                      <span className="text-sm font-medium text-gray-700">{role.nom}</span>
                      {role.description && (
                        <p className="text-xs text-gray-500">{role.description}</p>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              icon={<RiCloseLine />}
              onClick={() => navigate('/admin/utilisateurs')}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              icon={<RiSaveLine />}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UtilisateurForm;