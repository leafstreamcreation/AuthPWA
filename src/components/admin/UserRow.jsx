
import { TableRow, TableCell, Select, SelectItem, Chip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from '@heroui/react';
import { MoreVertical, Edit, Trash2, Shield, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const UserRow = ({ user, handleRoleChange, onEditOpen, setSelectedUser }) => {
    const { deleteUser, loadUsersData } = useAuth();
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
    
    return (
<TableRow key={user.id}>
                    <TableCell>
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
                            ID: {user.id}
                          </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        selectedKeys={[user.role]}
                        onSelectionChange={(keys) => {
                          const newRole = Array.from(keys)[0];
                          if (newRole !== user.role) {
                            handleRoleChange(user.id, newRole);
                          }
                        }}
                        size="sm"
                        variant="bordered"
                        className="w-24"
                      >
                        <SelectItem key="USER" value="USER">
                          <Chip color="primary" size="sm">User</Chip>
                        </SelectItem>
                        <SelectItem key="ADMIN" value="ADMIN">
                          <Chip color="danger" size="sm">Admin</Chip>
                        </SelectItem>
                      </Select>
                    </TableCell>
                    <TableCell>{get2FAStatus(user)}</TableCell>
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
                    </TableCell>
                  </TableRow>
                );
};
                  export default UserRow;