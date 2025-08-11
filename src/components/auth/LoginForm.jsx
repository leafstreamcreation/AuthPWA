import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Checkbox,
  Divider,
  Alert
} from '@heroui/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Key
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    totpToken: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTOTP, setShowTOTP] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/profile';

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (showTOTP && !formData.totpToken) {
      newErrors.totpToken = 'TOTP token is required';
    } else if (showTOTP && !/^\d{6}$/.test(formData.totpToken)) {
      newErrors.totpToken = 'TOTP token must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await login(formData, formData.rememberMe);
      navigate(from, { replace: true });
    } catch (error) {
      // Check if 2FA is required
      if (error.response?.status === 422 && error.response?.data?.requires2FA) {
        setShowTOTP(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white dark:bg-gray-800 shadow-xl">
          <CardHeader className="flex flex-col items-center pb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                AuthPWA
              </span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Welcome Back
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Sign in to your account to continue
            </p>
          </CardHeader>

          <CardBody className="px-8 pb-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4"
              >
                <Alert
                  color="danger"
                  variant="faded"
                  title="Login Failed"
                  description={error}
                />
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                startContent={<Mail className="w-4 h-4 text-gray-500" />}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                variant="bordered"
                autoComplete="email"
                isRequired
              />

              <Input
                type={showPassword ? 'text' : 'password'}
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                startContent={<Lock className="w-4 h-4 text-gray-500" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                }
                isInvalid={!!errors.password}
                errorMessage={errors.password}
                variant="bordered"
                autoComplete="current-password"
                isRequired
              />

              {showTOTP && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Input
                    type="text"
                    label="TOTP Code"
                    placeholder="Enter 6-digit code"
                    value={formData.totpToken}
                    onChange={(e) => handleInputChange('totpToken', e.target.value)}
                    startContent={<Key className="w-4 h-4 text-gray-500" />}
                    isInvalid={!!errors.totpToken}
                    errorMessage={errors.totpToken}
                    variant="bordered"
                    maxLength={6}
                    isRequired
                  />
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <Checkbox
                  size="sm"
                  isSelected={formData.rememberMe}
                  onValueChange={(checked) => handleInputChange('rememberMe', checked)}
                >
                  Remember me
                </Checkbox>
                
                <Link
                  to="/recover-password"
                  className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                color="primary"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Divider className="my-6" />

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginForm;
