import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
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
  Alert,
} from '@heroui/react';
import {
  Users,
  Search,
  Filter,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AdminTableCell from '../components/admin/AdminTableCell';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const renderCell = useCallback((user, columnKey) => {
    const value = user[columnKey];
    return AdminTableCell(columnKey, value, handleEditUser, handleDeleteUser);
  }, []);
  const {
    adminUsers,
    loadUsers,
    updateUserRole,
    error,
    clearError,
    deleteUser
  } = useAuth();

  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
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

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  }) || [];

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id'
    },
    {
      header: 'Email',
      accessorKey: 'email'
    },
    {
      header: 'Role',
      accessorKey: 'role'
    },
    {
      header: '2FA',
      accessorKey: 'has2FA'
    },
    {
      header: 'Actions',
      accessorKey: 'actions'
    }
  ];

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
                Manage Users
              </h1>
            </div>
          </div>
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
                {(item) => (
                  <TableRow key={item.id}>
                    {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                  </TableRow>
                )}
              </TableBody>
            </Table>

          </CardBody>
        </Card>
      </motion.div>

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
