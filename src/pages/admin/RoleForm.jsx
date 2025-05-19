import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RiSaveLine, RiCloseLine } from 'react-icons/ri';

// API calls
import { getRoleById, createRole, updateRole, assignPermissionsToRole } from '../api/roles';
import { getAllPermissions, getAllPermissionModules } from '../api/roles';

// Components
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';

const RoleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const isEditMode = Boolean(id);
  
  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    permissions: []
  });
  
  const [permissions, setPermissions] = useState([]);
  const [permissionModules, setPermissionModules] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Load role data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch permissions list
        const [permissionsResponse, modulesResponse] = await Promise.all([
          getAllPermissions(),
          getAllPermissionModules()
        ]);
        
        setPermissions(permissionsResponse.data || []);
        setPermissionModules(modulesResponse.data || {});
        
        // If edit mode, fetch role data
        if (isEditMode) {
          const response = await getRoleById(id);
          const roleData = response.data;
          
          setFormData({
            ...roleData,
            permissions: roleData.permissions ? roleData.permissions.map(perm => perm.id) : []
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

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle permission checkbox changes
  const handlePermissionChange = (permissionId) => {
    setFormData(prev => {
      const currentPermissions = [...prev.permissions];
      
      if (currentPermissions.includes(permissionId)) {
        return { ...prev, permissions: currentPermissions.filter(id => id !== permissionId) };
      } else {
        return { ...prev, permissions: [...currentPermissions, permissionId] };
      }
    });
  };

  // Select all permissions in a module
  const selectAllInModule = (module) => {
    const modulePermissions = permissionModules[module] || [];
    const modulePermissionIds = modulePermissions.map(perm => perm.id);
    
    // Get current permissions excluding this module's ones
    const currentPermissionsWithoutModule = formData.permissions.filter(
      id => !modulePermissionIds.includes(id)
    );
    
    // Add all module permissions
    setFormData(prev => ({
      ...prev,
      permissions: [...currentPermissionsWithoutModule, ...modulePermissionIds]
    }));
  };

  // Deselect all permissions in a module
  const deselectAllInModule = (module) => {
    const modulePermissions = permissionModules[module] || [];
    const modulePermissionIds = modulePermissions.map(perm => perm.id);
    
    // Remove all module permissions
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter(id => !modulePermissionIds.includes(id))
    }));
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom.trim()) {
      errors.nom = 'Le nom est requis';
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
        nom: formData.nom,
        description: formData.description
      };
      
      // Save role data
      let roleData;
      if (isEditMode) {
        roleData = await updateRole(id, dataToSubmit);
      } else {
        roleData = await createRole(dataToSubmit); // This is the ADD operation
      }
      
      // Assign permissions separately
      if (formData.permissions.length > 0) {
        const roleId = isEditMode ? id : roleData.data.id;
        await assignPermissionsToRole(roleId, { permissions: formData.permissions });
      }
      
      // Redirect after successful save
      navigate('/admin/roles');
    } catch (err) {
      console.error('Error saving role:', err);
      setError('Erreur lors de l\'enregistrement du rôle');
    } finally {
      setSaving(false);
    }
  };

  // Check permissions
  useEffect(() => {
    if (!hasPermission('admin-roles')) {
      navigate('/forbidden');
    }
  }, [hasPermission, navigate]);

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
          {isEditMode ? 'Modifier le rôle' : 'Nouveau rôle'}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <Card>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            {/* Role Name */}
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
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            
            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Permissions
              </label>
              
              <div className="space-y-6">
                {Object.entries(permissionModules).map(([module, modulePermissions]) => {
                  const allChecked = modulePermissions.every(perm => 
                    formData.permissions.includes(perm.id)
                  );
                  const someChecked = modulePermissions.some(perm => 
                    formData.permissions.includes(perm.id)
                  );
                  
                  return (
                    <div key={module} className="border rounded-md overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                        <h3 className="font-medium text-gray-800 capitalize">{module}</h3>
                        
                        <div className="space-x-2">
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => selectAllInModule(module)}
                          >
                            Tout sélectionner
                          </Button>
                          
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={() => deselectAllInModule(module)}
                          >
                            Tout désélectionner
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {modulePermissions.map(permission => (
                          <div key={permission.id} className="flex items-start">
                            <input
                              type="checkbox"
                              id={`permission-${permission.id}`}
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionChange(permission.id)}
                              className="h-4 w-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`permission-${permission.id}`} className="ml-2 block">
                              <span className="text-sm font-medium text-gray-700 capitalize">{permission.action}</span>
                              {permission.description && (
                                <p className="text-xs text-gray-500">{permission.description}</p>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Button 
              type="button" 
              variant="outline"
              icon={<RiCloseLine />}
              onClick={() => navigate('/admin/roles')}
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

export default RoleForm;