import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Switch,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Alert
} from '@heroui/react';
import {
  User,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Lock
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const {
    user,
    updateProfile,
    changePassword,
    setup2FA,
    verify2FA,
    disable2FA,
    serviceCredentials,
    addServiceCredential,
    updateServiceCredential,
    deleteServiceCredential,
    error,
    clearError
  } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [twoFactorData, setTwoFactorData] = useState({
    qrCode: '',
    secret: '',
    token: ''
  });

  const [credentialForm, setCredentialForm] = useState({
    id: null,
    serviceName: '',
    username: '',
    password: '',
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { isOpen: is2FAOpen, onOpen: on2FAOpen, onOpenChange: on2FAOpenChange } = useDisclosure();
  const { isOpen: isCredentialOpen, onOpen: onCredentialOpen, onOpenChange: onCredentialOpenChange } = useDisclosure();

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await updateProfile(profileData);
    } catch (error) {
      console.error('Profile update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    setIsLoading(true);
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await setup2FA();
      setTwoFactorData({
        qrCode: response.qrCode,
        secret: response.secret,
        token: ''
      });
      on2FAOpen();
    } catch (error) {
      console.error('2FA setup failed:', error);
    }
  };

  const handleVerify2FA = async () => {
    try {
      await verify2FA(twoFactorData.token);
      on2FAOpenChange(false);
      setTwoFactorData({ qrCode: '', secret: '', token: '' });
    } catch (error) {
      console.error('2FA verification failed:', error);
    }
  };

  const handleDisable2FA = async () => {
    const token = prompt('Enter your TOTP code to disable 2FA:');
    if (token) {
      try {
        await disable2FA(token);
      } catch (error) {
        console.error('2FA disable failed:', error);
      }
    }
  };

  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (credentialForm.id) {
        await updateServiceCredential(credentialForm.id, credentialForm);
      } else {
        await addServiceCredential(credentialForm);
      }
      
      setCredentialForm({
        id: null,
        serviceName: '',
        username: '',
        password: '',
        notes: ''
      });
      onCredentialOpenChange(false);
    } catch (error) {
      console.error('Credential operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCredential = (credential) => {
    setCredentialForm(credential);
    onCredentialOpen();
  };

  const handleDeleteCredential = async (credentialId) => {
    if (confirm('Are you sure you want to delete this credential?')) {
      try {
        await deleteServiceCredential(credentialId);
      } catch (error) {
        console.error('Credential deletion failed:', error);
      }
    }
  };

  const generateOtpAuthUrl = () => {
    const issuer = 'AuthPWA';
    const accountName = user?.email;
    return `otpauth://totp/${issuer}:${accountName}?secret=${twoFactorData.secret}&issuer=${issuer}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <User className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Profile Settings
          </h1>
        </div>

        {error && (
          <Alert
            color="danger"
            variant="faded"
            title="Error"
            description={error}
            className="mb-6"
            onClose={clearError}
          />
        )}

        {/* Profile Information */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    firstName: e.target.value
                  }))}
                  variant="bordered"
                />
                <Input
                  label="Last Name"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    lastName: e.target.value
                  }))}
                  variant="bordered"
                />
              </div>
              <Input
                label="Email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                variant="bordered"
              />
              <Button
                type="submit"
                color="primary"
                isLoading={isLoading}
                startContent={<Save className="w-4 h-4" />}
              >
                Update Profile
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Security Settings */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-semibold">Security Settings</h2>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                isSelected={user?.twoFactorEnabled}
                onValueChange={user?.twoFactorEnabled ? handleDisable2FA : handleEnable2FA}
                color="primary"
              />
            </div>

            <Divider />

            {/* Change Password */}
            <div>
              <h3 className="font-medium mb-4">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <Input
                  label="Current Password"
                  type={showPasswords.current ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    currentPassword: e.target.value
                  }))}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        current: !prev.current
                      }))}
                    >
                      {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  variant="bordered"
                />
                <Input
                  label="New Password"
                  type={showPasswords.new ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    newPassword: e.target.value
                  }))}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        new: !prev.new
                      }))}
                    >
                      {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  variant="bordered"
                />
                <Input
                  label="Confirm New Password"
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({
                    ...prev,
                    confirmPassword: e.target.value
                  }))}
                  endContent={
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({
                        ...prev,
                        confirm: !prev.confirm
                      }))}
                    >
                      {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  variant="bordered"
                  isInvalid={!!errors.confirmPassword}
                  errorMessage={errors.confirmPassword}
                />
                <Button
                  type="submit"
                  color="primary"
                  isLoading={isLoading}
                  startContent={<Lock className="w-4 h-4" />}
                >
                  Change Password
                </Button>
              </form>
            </div>
          </CardBody>
        </Card>

        {/* Service Credentials */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Service Credentials</h2>
            <Button
              color="primary"
              onPress={() => {
                setCredentialForm({
                  id: null,
                  serviceName: '',
                  username: '',
                  password: '',
                  notes: ''
                });
                onCredentialOpen();
              }}
              startContent={<Plus className="w-4 h-4" />}
            >
              Add Credential
            </Button>
          </CardHeader>
          <CardBody>
            <Table aria-label="Service credentials table">
              <TableHeader>
                <TableColumn>SERVICE</TableColumn>
                <TableColumn>USERNAME</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No credentials found">
                {serviceCredentials.map((credential) => (
                  <TableRow key={credential.id}>
                    <TableCell>{credential.serviceName}</TableCell>
                    <TableCell>{credential.username}</TableCell>
                    <TableCell>
                      <Chip color="success" size="sm">
                        Active
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Dropdown>
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Actions">
                          <DropdownItem
                            key="edit"
                            startContent={<Edit className="w-4 h-4" />}
                            onPress={() => handleEditCredential(credential)}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem
                            key="delete"
                            className="text-danger"
                            color="danger"
                            startContent={<Trash2 className="w-4 h-4" />}
                            onPress={() => handleDeleteCredential(credential.id)}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </motion.div>

      {/* 2FA Setup Modal */}
      <Modal isOpen={is2FAOpen} onOpenChange={on2FAOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Setup Two-Factor Authentication
              </ModalHeader>
              <ModalBody>
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scan this QR code with your authenticator app
                  </p>
                  {twoFactorData.qrCode && (
                    <div className="flex justify-center">
                      <QRCodeSVG
                        value={generateOtpAuthUrl()}
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#000000"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Or enter this secret manually: {twoFactorData.secret}
                  </p>
                  <Input
                    label="Verification Code"
                    placeholder="Enter 6-digit code"
                    value={twoFactorData.token}
                    onChange={(e) => setTwoFactorData(prev => ({
                      ...prev,
                      token: e.target.value
                    }))}
                    maxLength={6}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleVerify2FA}
                  isDisabled={twoFactorData.token.length !== 6}
                >
                  Verify & Enable
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Credential Modal */}
      <Modal isOpen={isCredentialOpen} onOpenChange={onCredentialOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>
                {credentialForm.id ? 'Edit' : 'Add'} Service Credential
              </ModalHeader>
              <ModalBody>
                <form onSubmit={handleCredentialSubmit} className="space-y-4">
                  <Input
                    label="Service Name"
                    value={credentialForm.serviceName}
                    onChange={(e) => setCredentialForm(prev => ({
                      ...prev,
                      serviceName: e.target.value
                    }))}
                    isRequired
                  />
                  <Input
                    label="Username"
                    value={credentialForm.username}
                    onChange={(e) => setCredentialForm(prev => ({
                      ...prev,
                      username: e.target.value
                    }))}
                    isRequired
                  />
                  <Input
                    label="Password"
                    type="password"
                    value={credentialForm.password}
                    onChange={(e) => setCredentialForm(prev => ({
                      ...prev,
                      password: e.target.value
                    }))}
                    isRequired
                  />
                  <Input
                    label="Notes (Optional)"
                    value={credentialForm.notes}
                    onChange={(e) => setCredentialForm(prev => ({
                      ...prev,
                      notes: e.target.value
                    }))}
                  />
                </form>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  onPress={handleCredentialSubmit}
                  isLoading={isLoading}
                >
                  {credentialForm.id ? 'Update' : 'Add'} Credential
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default ProfilePage;
