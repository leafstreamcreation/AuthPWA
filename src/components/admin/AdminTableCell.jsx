
import { Button, Chip } from '@heroui/react';

import {
    Edit,
    Lock,
    ShieldOff,
    ShieldCheck,
    UserCircle,
    User,
} from 'lucide-react';

const AdminTableCell = (columnKey, value, handleEdit, handleDisable) => {

  const userCell = (id) => {
    return (
    <div className="flex justify-center space-x-3">
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
          {id}
        </div>
    </div>
    );
  };

  const emailCell = (email) => {
    return (
    <div className="flex justify-center space-x-3">
      <div className="text-sm text-gray-500">
        {email}
      </div>
    </div>
    );
  };

  const roleCell = (role) => {
    return (
    <div className="flex justify-center space-x-3">
        {role === 'ADMIN' ? (
            <Chip size="sm" startContent={<UserCircle className="w-3 h-3" />} />
          ) : (
            <Chip size="sm" startContent={<User className="w-3 h-3" />} />
          )}
    </div>
    );
  };

  const twoFactorEnabledCell = (has2FA) => {
      return (
        <div className="flex justify-center">
          {has2FA ? (
            <Chip color="success" size="sm" startContent={<ShieldCheck className="w-3 h-3" />} />
          ) : (
            <Chip color="warning" size="sm" startContent={<ShieldOff className="w-3 h-3" />} />
          )}
        </div>
      );
  };

  const actionsCell = (user) => {
    return (
      <div className="flex justify-center space-x-3">
        <Button
          color="primary"
          onPress={() => handleEdit(user)}
          isIconOnly
        >
          <Edit className="w-3 h-3" />
        </Button>
        <Button
          color="danger"
          onPress={() => handleDisable(user.id)}
          isIconOnly
        >
          <Lock className="w-3 h-3" />
        </Button>
      </div>
    );
  };

    switch (columnKey) {
        case 'id':
            return userCell(value);
        case 'email':
            return emailCell(value);
        case 'role':
            return roleCell(value);
        case 'has2FA':
            return twoFactorEnabledCell(value);
        case 'actions':
            return actionsCell(value);
        default:
            return (<div>{value}</div>);
    }   
};

export default AdminTableCell;
