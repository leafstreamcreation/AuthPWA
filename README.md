# AuthPWA - Progressive Web Authentication App

A comprehensive React-based Progressive Web Application (PWA) for authentication with advanced security features.

## 🚀 Features

### Core Authentication
- **JWT Token Management** - Automatic refresh with 5-minute buffer
- **Two-Factor Authentication (2FA)** - TOTP with QR code generation
- **Role-Based Access Control** - USER/ADMIN permissions
- **Password Recovery** - Secure reset flow with email verification
- **Remember Me** - Encrypted persistent sessions

### Security
- **Web Crypto API** - AES-GCM encryption for credentials
- **Client-Side Encryption** - PBKDF2 key derivation
- **Secure Storage** - Encrypted session/local storage
- **API Key Injection** - Automatic X-API-Key headers
- **Rate Limiting** - Built-in request throttling
- **CORS Compliance** - Secure cross-origin requests

### Progressive Web App
- **Offline Support** - Service worker caching
- **Install Prompt** - Native app-like installation
- **Responsive Design** - Works on all device sizes
- **Push Notifications** - Real-time updates (backend dependent)

### User Interface
- **HeroUI Components** - Modern React component library
- **TailwindCSS** - Utility-first styling
- **Dark/Light Mode** - Automatic theme switching
- **Framer Motion** - Smooth animations and transitions
- **Loading States** - Comprehensive loading indicators
- **Error Handling** - User-friendly error messages

## 🛠 Tech Stack

- **Frontend Framework**: React 18 (Functional Components + Hooks)
- **Build Tool**: Vite with PWA plugin
- **UI Library**: HeroUI (NextUI v2)
- **Styling**: TailwindCSS v3
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Authentication**: JWT with automatic refresh
- **Encryption**: Web Crypto API (AES-GCM)
- **2FA**: QRCode.react for TOTP generation
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AuthPWA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:3000
   - The app will hot-reload on changes

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Open http://localhost:3000

## 🏗 Project Structure

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

## 🔒 Security Features

### Encryption
- **AES-GCM encryption** for client-side data
- **PBKDF2 key derivation** with 100,000 iterations
- **Secure random salt/IV generation**
- **Memory-safe credential handling**

### Authentication
- **JWT tokens** with automatic refresh
- **Role-based authorization** (USER/ADMIN)
- **2FA TOTP** with QR code setup
- **Session management** with encryption
- **Password strength validation**

### API Security
- **Automatic API key injection**
- **Request/response interceptors**
- **Exponential backoff retry**
- **401 response handling**
- **CORS configuration**

## 📱 PWA Features

### Service Worker
- **Automatic updates** with user notification
- **Offline caching** for static assets
- **API response caching** with TTL
- **Background sync** for failed requests

### Manifest
- **Install prompts** for native-like experience
- **Custom app icons** and splash screens
- **Standalone display mode**
- **Theme color configuration**

## 🎨 UI Components

### Authentication Forms
- **Login** with email/password and 2FA
- **Signup** with password strength indicator
- **Password recovery** with token validation
- **Profile management** with 2FA setup

### Admin Dashboard
- **User management table** with pagination
- **Role modification** with instant updates
- **User creation modal** with validation
- **Statistics cards** for overview

### Common Components
- **Protected routes** with role checking
- **Loading states** with spinners
- **Error boundaries** for fault tolerance
- **Toast notifications** for feedback

## ⚙️ Configuration

### Environment Variables

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_KEY=your-api-key-here

# App Configuration
VITE_APP_NAME=AuthPWA
VITE_APP_VERSION=1.0.0

# Security
VITE_ENCRYPTION_KEY=your-encryption-key-here
```

### API Endpoints

The application expects the following backend endpoints:

```
POST /auth/login          # User login
POST /auth/signup         # User registration
POST /auth/logout         # User logout
POST /auth/refresh        # Token refresh
POST /auth/reset-password # Password reset request
POST /auth/reset-password/confirm # Password reset confirmation

GET  /user/profile        # Get user profile
PUT  /user/profile        # Update user profile
PUT  /user/password       # Change password

POST /auth/2fa/setup      # Setup 2FA
POST /auth/2fa/verify     # Verify 2FA
DELETE /auth/2fa          # Disable 2FA

GET  /user/credentials    # Get service credentials
POST /user/credentials    # Add service credential
PUT  /user/credentials/:id # Update service credential
DELETE /user/credentials/:id # Delete service credential

GET  /admin/users         # Get users (admin)
POST /admin/users         # Create user (admin)
PUT  /admin/users/:id/role # Update user role (admin)
DELETE /admin/users/:id   # Delete user (admin)
```

## 🔧 Development

### Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

### Code Style
- **ESLint** configuration for React
- **Prettier** for code formatting
- **Functional components** with hooks
- **Modern JavaScript** (ES2022+)

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker Production
```bash
docker build -t auth-pwa .
docker run -p 3000:80 auth-pwa
```

### Environment Setup
1. Configure environment variables
2. Set up SSL certificates
3. Configure reverse proxy (nginx)
4. Enable rate limiting
5. Set up monitoring

## 📊 Performance

### Optimization Features
- **Code splitting** with dynamic imports
- **Tree shaking** for minimal bundle size
- **Image optimization** with modern formats
- **Lazy loading** for components
- **Service worker caching**

### Bundle Analysis
```bash
npm run build -- --analyze
```

## 🧪 Testing

### Testing Strategy
- **Unit tests** for utility functions
- **Integration tests** for components
- **E2E tests** for user flows
- **Security tests** for encryption

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [Backend API](https://github.com/your-org/auth-api) - Authentication microservice
- [Mobile App](https://github.com/your-org/auth-mobile) - React Native companion app

## 📞 Support

For support, please open an issue or contact the development team.

---

**Built with ❤️ using React, TailwindCSS, and modern web technologies.**
