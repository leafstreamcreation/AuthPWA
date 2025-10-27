import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
// import { jwtDecode } from 'jwt-decode';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
        loading: false
      };
    
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        serviceCredentials: [],
        loading: false,
        error: null
      };
    
    case 'SET_SERVICE_CREDENTIALS':
      return { ...state, serviceCredentials: action.payload };
    
    case 'ADD_SERVICE_CREDENTIAL':
      return {
        ...state,
        serviceCredentials: [...state.serviceCredentials, action.payload]
      };
    
    case 'UPDATE_SERVICE_CREDENTIAL':
      return {
        ...state,
        serviceCredentials: state.serviceCredentials.map(cred =>
          cred.id === action.payload.id ? action.payload : cred
        )
      };
    
    case 'DELETE_SERVICE_CREDENTIAL':
      return {
        ...state,
        serviceCredentials: state.serviceCredentials.filter(
          cred => cred.id !== action.payload
        )
      };
    
    case 'SET_ADMIN_USERS':
      return { ...state, adminUsers: action.payload };
    
    case 'UPDATE_ADMIN_USER':
      return {
        ...state,
        adminUsers: {
          ...state.adminUsers,
          users: state.adminUsers.users.map(user =>
            user.id === action.payload.id ? action.payload : user
          )
        }
      };
    
    case 'ADD_ADMIN_USER':
      return {
        ...state,
        adminUsers: {
          ...state.adminUsers,
          users: [...state.adminUsers.users, action.payload]
        }
      };
    
    case 'DELETE_ADMIN_USER':
      return {
        ...state,
        adminUsers: {
          ...state.adminUsers,
          users: state.adminUsers.users.filter(user => user.id !== action.payload)
        }
      };
    
    default:
      return state;
  }
};

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  serviceCredentials: [],
  adminUsers: { users: [], total: 0, page: 1 }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Check for stored token
      const token = await apiClient.getToken();
      
      if (token && !apiClient.isTokenExpired(token)) {
        dispatch({ type: 'SET_TOKEN', payload: token });
        
        // Fetch user profile
        const profile = await apiClient.getProfile();
        dispatch({ type: 'SET_USER', payload: profile });
        
        // Schedule token refresh
        apiClient.scheduleTokenRefresh(token);
      } else if (token) {
        // Token expired, try to refresh
        try {
          await apiClient.refreshToken();
          const profile = await apiClient.getProfile();
          dispatch({ type: 'SET_USER', payload: profile });
        } catch (error) {
          await apiClient.clearAuth();
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize authentication' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials, rememberMe = false) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiClient.login(credentials);
      const { token } = response;
      await apiClient.setToken(token, rememberMe);
      const user = await apiClient.getProfile();
      dispatch({ type: 'SET_TOKEN', payload: token });
      dispatch({ type: 'SET_USER', payload: user });

      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const signup = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await apiClient.signup(userData);
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedUser = await apiClient.updateProfile(profileData);
      dispatch({ type: 'SET_USER', payload: updatedUser });
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const changePassword = async (passwordData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await apiClient.changePassword(passwordData);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password change failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setup2FA = async () => {
    try {
      const response = await apiClient.setup2FA();
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || '2FA setup failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const verify2FA = async (token) => {
    try {
      const response = await apiClient.verify2FA(token);
      const updatedUser = { ...state.user, twoFactorEnabled: true };
      dispatch({ type: 'SET_USER', payload: updatedUser });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || '2FA verification failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const disable2FA = async (token) => {
    try {
      await apiClient.disable2FA(token);
      const updatedUser = { ...state.user, twoFactorEnabled: false };
      dispatch({ type: 'SET_USER', payload: updatedUser });
    } catch (error) {
      const errorMessage = error.response?.data?.message || '2FA disable failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await apiClient.resetPassword(email);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const confirmPasswordReset = async (token, newPassword) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await apiClient.confirmPasswordReset(token, newPassword);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Password reset confirmation failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Service Credentials Management
  const loadServiceCredentials = async () => {
    try {
      const credentials = await apiClient.getServiceCredentials();
      dispatch({ type: 'SET_SERVICE_CREDENTIALS', payload: credentials });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load service credentials';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const addServiceCredential = async (credentialData) => {
    try {
      const credential = await apiClient.addServiceCredential(credentialData);
      dispatch({ type: 'ADD_SERVICE_CREDENTIAL', payload: credential });
      return credential;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add service credential';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateServiceCredential = async (credentialId, credentialData) => {
    try {
      const credential = await apiClient.updateServiceCredential(credentialId, credentialData);
      dispatch({ type: 'UPDATE_SERVICE_CREDENTIAL', payload: credential });
      return credential;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update service credential';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteServiceCredential = async (credentialId) => {
    try {
      await apiClient.deleteServiceCredential(credentialId);
      dispatch({ type: 'DELETE_SERVICE_CREDENTIAL', payload: credentialId });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete service credential';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  // Admin functions
  const loadUsers = async (page = 1, limit = 10) => {
    try {
      const usersData = await apiClient.getUsers(page, limit);
      dispatch({ type: 'SET_ADMIN_USERS', payload: usersData });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load users';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const updatedUser = await apiClient.updateUserRole(userId, role);
      dispatch({ type: 'UPDATE_ADMIN_USER', payload: updatedUser });
      return updatedUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update user role';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const createUser = async (userData) => {
    try {
      const newUser = await apiClient.createUser(userData);
      dispatch({ type: 'ADD_ADMIN_USER', payload: newUser });
      return newUser;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const deleteUser = async (userId) => {
    try {
      await apiClient.deleteUser(userId);
      dispatch({ type: 'DELETE_ADMIN_USER', payload: userId });
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  };

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const isAdmin = useCallback(() => {
    return state.user?.role === 'ADMIN';
  }, [state.user]);

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    setup2FA,
    verify2FA,
    disable2FA,
    resetPassword,
    confirmPasswordReset,
    loadServiceCredentials,
    addServiceCredential,
    updateServiceCredential,
    deleteServiceCredential,
    loadUsers,
    updateUserRole,
    createUser,
    deleteUser,
    clearError,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
