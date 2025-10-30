import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Switch
} from '@heroui/react';
import {
  User,
  Settings,
  LogOut,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../hooks/useTheme';

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { name: 'Profile', path: '/profile', icon: User },
    ...(isAdmin() ? [{ name: 'Admin', path: '/admin/users', icon: Shield }] : []),
  ];

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Navbar
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
        className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      >
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                Heimdall
              </span>
            </div>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {menuItems.map((item) => (
            <NavbarItem key={item.path} isActive={isActivePath(item.path)}>
              <Button
                variant={isActivePath(item.path) ? "solid" : "light"}
                color={isActivePath(item.path) ? "primary" : "default"}
                onPress={() => navigate(item.path)}
                startContent={<item.icon className="w-4 h-4" />}
              >
                {item.name}
              </Button>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end">
          <NavbarItem>
            <Switch
              defaultSelected={theme === 'dark'}
              onChange={toggleTheme}
              size="sm"
              color="primary"
              thumbIcon={({ isSelected, className }) =>
                isSelected ? (
                  <Moon className={className} />
                ) : (
                  <Sun className={className} />
                )
              }
            />
          </NavbarItem>
          
          <NavbarItem>
            <Dropdown>
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform"
                  color="primary"
                  name={user?.email || 'User'}
                  size="sm"
                  src={user?.avatar}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">Signed in as</p>
                  <p className="font-semibold">{user?.email}</p>
                </DropdownItem>
                <DropdownItem
                  key="settings"
                  startContent={<Settings className="w-4 h-4" />}
                  onPress={() => navigate('/profile')}
                >
                  Profile Settings
                </DropdownItem>
                {isAdmin() && (
                  <DropdownItem
                    key="admin"
                    startContent={<Shield className="w-4 h-4" />}
                    onPress={() => navigate('/admin/users')}
                  >
                    Admin Dashboard
                  </DropdownItem>
                )}
                <DropdownItem
                  key="logout"
                  color="danger"
                  startContent={<LogOut className="w-4 h-4" />}
                  onPress={handleLogout}
                >
                  Log Out
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>

        <NavbarMenu>
          {menuItems.map((item) => (
            <NavbarMenuItem key={item.path}>
              <Button
                className="w-full justify-start"
                variant={isActivePath(item.path) ? "solid" : "light"}
                color={isActivePath(item.path) ? "primary" : "default"}
                onPress={() => {
                  navigate(item.path);
                  setIsMenuOpen(false);
                }}
                startContent={<item.icon className="w-4 h-4" />}
              >
                {item.name}
              </Button>
            </NavbarMenuItem>
          ))}
          <NavbarMenuItem>
            <Button
              className="w-full justify-start"
              color="danger"
              variant="light"
              onPress={handleLogout}
              startContent={<LogOut className="w-4 h-4" />}
            >
              Log Out
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
