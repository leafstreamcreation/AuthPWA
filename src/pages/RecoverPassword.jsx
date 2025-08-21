import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Alert
} from '@heroui/react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const RecoverPassword = () => {
  const [step, setStep] = useState('request'); // 'request' or 'reset'
  const [email, setEmail] = useState('');
  const [resetData, setResetData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { resetPassword, confirmPasswordReset } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we have a reset token in the URL
  React.useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setStep('reset');
      setResetData(prev => ({ ...prev, token }));
    }
  }, [searchParams]);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await resetPassword(email);
      setMessage('Password reset instructions have been sent to your email.');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!resetData.newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (resetData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await confirmPasswordReset(resetData.token, resetData.newPassword);
      setMessage('Your password has been reset successfully!');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successful. Please log in with your new password.' }
        });
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setResetData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (error) {
      setError('');
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
              {step === 'request' ? 'Reset Password' : 'Set New Password'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {step === 'request' 
                ? 'Enter your email to receive reset instructions'
                : 'Enter your new password below'
              }
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
                  title="Error"
                  description={error}
                />
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-4"
              >
                <Alert
                  color="success"
                  variant="faded"
                  title="Success"
                  description={message}
                />
              </motion.div>
            )}

            {step === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  startContent={<Mail className="w-4 h-4 text-gray-500" />}
                  variant="bordered"
                  autoComplete="email"
                  isRequired
                />

                <Button
                  type="submit"
                  color="primary"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  disabled={isLoading || !!message}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  label="New Password"
                  placeholder="Enter your new password"
                  value={resetData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
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
                  variant="bordered"
                  autoComplete="new-password"
                  isRequired
                />

                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  value={resetData.confirmPassword}
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
                  disabled={isLoading || !!message}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default RecoverPassword;
