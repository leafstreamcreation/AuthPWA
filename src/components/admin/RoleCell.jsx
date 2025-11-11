
import { TableRow, TableCell, Select, SelectItem, Chip } from '@heroui/react';

const RoleCell = ({ user, handleRoleChange }) => {
    
    
     
    
    return (
<TableRow key={user.id}>
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
                    
                    <TableCell>
                    </TableCell>
                  </TableRow>
                );
};
                  export default RoleCell;