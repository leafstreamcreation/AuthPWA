# Development Setup

## Quick Start

1. Clone the repository
2. Copy environment file: `cp .env.example .env`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`
5. Open http://localhost:3001

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   └── RequireAuth.jsx
│   └── layout/          # Layout components
│       └── Layout.jsx
├── contexts/            # React Context providers
│   └── AuthContext.jsx # Global authentication state
├── hooks/               # Custom React hooks
│   └── useTheme.js     # Theme management
├── pages/               # Page components
│   ├── ProfilePage.jsx
│   ├── AdminDashboard.jsx
│   └── RecoverPassword.jsx
├── services/            # API and utility services
│   ├── apiClient.js    # Axios client with interceptors
│   └── cryptoService.js # Web Crypto API wrapper
├── App.jsx             # Main application component
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## Key Features Implemented

### Authentication & Security
- [x] JWT token management with automatic refresh
- [x] Two-Factor Authentication (2FA) with TOTP
- [x] Role-based access control (USER/ADMIN)
- [x] Password recovery flow
- [x] Client-side encryption with Web Crypto API
- [x] Secure credential storage

### UI Components
- [x] Login form with conditional 2FA input
- [x] Signup form with password strength indicator
- [x] Profile page with 2FA setup and credential management
- [x] Admin dashboard with user management
- [x] Password recovery page
- [x] Responsive layout with dark/light mode

### Progressive Web App
- [x] Service worker for offline support
- [x] Web app manifest for installation
- [x] Responsive design for all devices
- [x] PWA-optimized build with Vite

### API Integration
- [x] Axios client with interceptors
- [x] Automatic API key injection
- [x] Request/response error handling
- [x] Exponential backoff retry logic
- [x] Token refresh on 401 responses

## Environment Configuration

Create a `.env` file based on `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_KEY=your-api-key-here
VITE_APP_NAME=AuthPWA
VITE_APP_VERSION=1.0.0
VITE_ENCRYPTION_KEY=your-encryption-key-here
VITE_DEBUG=true
```

## Backend API Requirements

The application expects the following backend endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `POST /auth/reset-password` - Password reset request
- `POST /auth/reset-password/confirm` - Password reset confirmation

### User Management
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `PUT /user/password` - Change password

### Two-Factor Authentication
- `POST /auth/2fa/setup` - Setup 2FA (returns QR code data)
- `POST /auth/2fa/verify` - Verify 2FA token
- `DELETE /auth/2fa` - Disable 2FA

### Service Credentials
- `GET /user/credentials` - Get service credentials
- `POST /user/credentials` - Add service credential
- `PUT /user/credentials/:id` - Update service credential
- `DELETE /user/credentials/:id` - Delete service credential

### Admin (ADMIN role required)
- `GET /admin/users` - Get users with pagination
- `POST /admin/users` - Create new user
- `PUT /admin/users/:id/role` - Update user role
- `DELETE /admin/users/:id` - Delete user

## Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker build -t auth-pwa .
docker run -p 3000:80 auth-pwa
```

## Security Features

### Client-Side Encryption
- AES-GCM encryption for sensitive data
- PBKDF2 key derivation with 100,000 iterations
- Secure random salt and IV generation
- Memory-safe credential handling

### Authentication Security
- JWT tokens with automatic refresh
- 5-minute buffer before token expiration
- Encrypted session storage
- Role-based access control
- 2FA with TOTP

### API Security
- Automatic API key injection
- Request/response interceptors
- 401 response handling with redirect
- Exponential backoff for failed requests
- CORS-compliant requests

## Testing the Application

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Visit http://localhost:3001**

3. **Test the authentication flow:**
   - Try accessing protected routes (should redirect to login)
   - Test login form validation
   - Test signup form with password strength
   - Test password recovery flow

4. **Test PWA features:**
   - Try installing the app (install prompt should appear)
   - Test offline functionality
   - Check responsive design on different screen sizes

## Known Issues & Limitations

1. **Backend Integration**: The app is currently frontend-only. A compatible backend API is required for full functionality.

2. **Mock Data**: Some features use mock data until backend integration is complete.

3. **Service Worker**: Requires HTTPS in production for full PWA functionality.

4. **Browser Support**: Modern browsers only (Chrome 63+, Firefox 57+, Safari 11.1+).

## Next Steps

1. Integrate with a backend authentication service
2. Add comprehensive testing (unit, integration, e2e)
3. Add push notifications
4. Implement biometric authentication
5. Add audit logging
6. Performance optimization and bundle analysis
7. Security audit and penetration testing

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages
5. Push to your fork and submit a pull request

## Support

For issues and questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs
4. Provide system and browser information
