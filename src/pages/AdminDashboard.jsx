import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableCell,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  // Pagination,
  // Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Alert,
  Chip
} from '@heroui/react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import RoleCell from '../components/admin/RoleCell';

const AdminDashboard = () => {
  const renderCell = useCallback((user, columnKey) => {
    const value = user[columnKey];

    switch (columnKey) {
      case 'user':
        return userCell(value);
      case 'email':
        return emailCell(value);
      case 'role':
        return roleCell(value);
      case 'twoFactorEnabled':
        return twoFactorEnabledCell(value);
      case 'actions':
        return actionsCell(user);
      default:
        return value;
    }
  }, []);
  const {
    adminUsers,
    loadUsers,
    updateUserRole,
    createUser,
    error,
    clearError,
    deleteUser
  } = useAuth();

  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'USER'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();

  useEffect(() => {
    loadUsersData();
  },[]);

  const loadUsersData = async () => {
    try {
      setIsLoading(true);
      await loadUsers();
      console.log(adminUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    try {
      await createUser(newUser);
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        role: 'USER'
      });
      onCreateOpenChange(false);
      loadUsersData();
    } catch (error) {
      console.error('User creation failed:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
      if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
          await deleteUser(userId);
          loadUsersData();
        } catch (error) {
          console.error('User deletion failed:', error);
        }
      }
    };
    
    const handleEditUser = (user) => {
      setSelectedUser(user);
      onEditOpen();
    };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
    } catch (error) {
      console.error('Role update failed:', error);
    }
  };
  
  const get2FAStatus = (user) => {
      return user.twoFactorEnabled ? (
        <Chip color="success" size="sm" startContent={<ShieldCheck className="w-3 h-3" />}>
          Enabled
        </Chip>
      ) : (
        <Chip color="warning" size="sm" startContent={<Shield className="w-3 h-3" />}>
          Disabled
        </Chip>
      );
    };

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
      // user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      // user.lastName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  const columns = {
    user: {
      header: 'User',
      accessorKey: 'user'
    },
    email: {
      header: 'Email',
      accessorKey: 'email'
    },
    role: {
      header: 'Role',
      accessorKey: 'role'
    },
    twoFactorEnabled: {
      header: '2FA',
      accessorKey: 'twoFactorEnabled'
    },
    actions: {
      header: 'Actions',
      accessorKey: 'actions'
    }
  }

  const userCell = (id) => {
    return (
    <div className="flex items-center space-x-3">
      {/* <Avatar
        name={`${user.firstName} ${user.lastName}`}
        size="sm"
        src={user.avatar}
      />
      <div>
        <div className="font-medium">
          {user.firstName} {user.lastName}
        </div>
      </div> */}
        <div className="text-sm text-gray-500">
          ID: {id}
        </div>
    </div>
    );
  };

  const emailCell = (email) => {
    return (
    <div className="flex items-center space-x-3">
      <div className="text-sm text-gray-500">
        {email}
      </div>
    </div>
    );
  };

  const roleCell = (role) => {
    return (
    <div className="flex items-center space-x-3">
      <div className="text-sm text-gray-500">
        {role}
      </div>
    </div>
    );
  };

  const twoFactorEnabledCell = (user) => {
    return get2FAStatus(user)
  };

  const actionsCell = (user) => {
    return (
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
            onPress={() => handleEditUser(user)}
          >
            Edit
          </DropdownItem>
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            startContent={<Trash2 className="w-4 h-4" />}
            onPress={() => handleDeleteUser(user.id)}
          >
            Delete
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    );
  };

  // const getRoleColor = (role) => {
  //   switch (role) {
  //     case 'ADMIN':
  //       return 'danger';
  //     case 'USER':
  //       return 'primary';
  //     default:
  //       return 'default';
  //   }
  // };

  // const totalPages = Math.ceil((adminUsers.total || 0) / 10);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage users and their permissions
              </p>
            </div>
          </div>
          <Button
            color="primary"
            onPress={onCreateOpen}
            startContent={<UserPlus className="w-4 h-4" />}
          >
            Add User
          </Button>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {adminUsers.length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Users
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {adminUsers.filter(u => u.has2FA).length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                2FA Enabled
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {adminUsers.filter(u => u.role === 'ADMIN').length || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Administrators
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                startContent={<Search className="w-4 h-4 text-gray-500" />}
                className="flex-1"
              />
              <Select
                placeholder="Filter by role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                startContent={<Filter className="w-4 h-4 text-gray-500" />}
                className="w-full md:w-48"
              >
                <SelectItem key="all" value="all">All Roles</SelectItem>
                <SelectItem key="USER" value="USER">User</SelectItem>
                <SelectItem key="ADMIN" value="ADMIN">Admin</SelectItem>
              </Select>
            </div>
          </CardBody>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Users</h2>
          </CardHeader>
          <CardBody>
            <Table aria-label="Users table">
              <TableHeader columns={columns}>
                {(column) => (
                  <TableColumn key={column.accessorKey}>{column.header}</TableColumn>
                )}
              </TableHeader>
              <TableBody
                isLoading={isLoading}
                emptyContent="No users found"
                loadingContent="Loading users..."
                items={filteredUsers}
              >
                {(user) => (
                  <TableRow key={user.id}>
                    {(columnKey) => <TableCell>{renderCell(user, columnKey)}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  total={totalPages}
                  page={currentPage}
                  onChange={setCurrentPage}
                />
              </div>
            )} */}
          </CardBody>
        </Card>
      </motion.div>

      {/* Create User Modal */}
      <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Create New User</ModalHeader>
              <ModalBody>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      value={newUser.firstName}
                      onChange={(e) => setNewUser(prev => ({
                        ...prev,
                        firstName: e.target.value
                      }))}
                      isRequired
                    />
                    <Input
                      label="Last Name"
                      value={newUser.lastName}
                      onChange={(e) => setNewUser(prev => ({
                        ...prev,
                        lastName: e.target.value
                      }))}
                      isRequired
                    />
                  </div>
                  <Input
                    label="Email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                    isRequired
                  />
                  <Select
                    label="Role"
                    selectedKeys={[newUser.role]}
                    onSelectionChange={(keys) => setNewUser(prev => ({
                      ...prev,
                      role: Array.from(keys)[0]
                    }))}
                  >
                    <SelectItem key="USER" value="USER">User</SelectItem>
                    <SelectItem key="ADMIN" value="ADMIN">Admin</SelectItem>
                  </Select>
                </form>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleCreateUser}>
                  Create User
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Edit User</ModalHeader>
              <ModalBody>
                {selectedUser && (
                  <div className="space-y-4">
                    <Input
                      label="First Name"
                      value={selectedUser.firstName}
                      isReadOnly
                    />
                    <Input
                      label="Last Name"
                      value={selectedUser.lastName}
                      isReadOnly
                    />
                    <Input
                      label="Email"
                      value={selectedUser.email}
                      isReadOnly
                    />
                    <Select
                      label="Role"
                      selectedKeys={[selectedUser.role]}
                      onSelectionChange={(keys) => {
                        const newRole = Array.from(keys)[0];
                        handleRoleChange(selectedUser.id, newRole);
                        setSelectedUser(prev => ({ ...prev, role: newRole }));
                      }}
                    >
                      <SelectItem key="USER" value="USER">User</SelectItem>
                      <SelectItem key="ADMIN" value="ADMIN">Admin</SelectItem>
                    </Select>
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
