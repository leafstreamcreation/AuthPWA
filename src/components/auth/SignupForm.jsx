import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Divider,
  Alert,
  Progress
} from '@heroui/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  User,
  Check,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const { signup, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(formData.password));
  }, [formData.password]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return 'danger';
    if (passwordStrength < 60) return 'warning';
    if (passwordStrength < 80) return 'success';
    return 'primary';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 30) return 'Weak';
    if (passwordStrength < 60) return 'Fair';
    if (passwordStrength < 80) return 'Good';
    return 'Strong';
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 50) {
      newErrors.password = 'Password is too weak';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      await signup({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      
      // Redirect to login with success message
      navigate('/login', {
        state: { 
          message: 'Account created successfully! Please check your email to verify your account.' 
        }
      });
    } catch (error) {
      console.error('Signup failed:', error);
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

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[a-z]/.test(formData.password), text: 'Lowercase letter' },
    { met: /[A-Z]/.test(formData.password), text: 'Uppercase letter' },
    { met: /\d/.test(formData.password), text: 'Number' },
    { met: /[^A-Za-z0-9]/.test(formData.password), text: 'Special character' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
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
                Heimdall
              </span>
            </div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Join us and secure your digital identity
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
                  title="Signup Failed"
                  description={error}
                />
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  startContent={<User className="w-4 h-4 text-gray-500" />}
                  isInvalid={!!errors.firstName}
                  errorMessage={errors.firstName}
                  variant="bordered"
                  autoComplete="given-name"
                  isRequired
                />

                <Input
                  type="text"
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  isInvalid={!!errors.lastName}
                  errorMessage={errors.lastName}
                  variant="bordered"
                  autoComplete="family-name"
                  isRequired
                />
              </div>

              <Input
                type="email"
                label="Email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                startContent={<Mail className="w-4 h-4 text-gray-500" />}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                variant="bordered"
                autoComplete="email"
                isRequired
              />

              <div className="space-y-2">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Create a strong password"
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
                  autoComplete="new-password"
                  isRequired
                />

                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Password strength:
                      </span>
                      <span className={`font-medium text-${getPasswordStrengthColor()}`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <Progress
                      value={passwordStrength}
                      color={getPasswordStrengthColor()}
                      size="sm"
                    />
                    
                    <div className="space-y-1">
                      {passwordRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          {req.met ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <X className="w-3 h-3 text-gray-400" />
                          )}
                          <span className={req.met ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}>
                            {req.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                startContent={<Lock className="w-4 h-4 text-gray-500" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                }
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword}
                variant="bordered"
                autoComplete="new-password"
                isRequired
              />

              <Button
                type="submit"
                color="primary"
                className="w-full"
                size="lg"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <Divider className="my-6" />

            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupForm;
