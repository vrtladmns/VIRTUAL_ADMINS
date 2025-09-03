# HR Onboarding Bot Frontend

A modern, production-ready React frontend for the HR Onboarding Chatbot system. Built with React + Vite, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **Modern UI/UX**: Clean, 2025-style SaaS interface with dark mode support
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Real-time Chat**: AI-powered chat interface for onboarding questions
- **Progress Tracking**: Visual progress indicators and step-by-step navigation
- **Policy Management**: Browse and search through HR policies
- **Analytics Dashboard**: Comprehensive onboarding metrics and insights
- **Form Validation**: Robust form handling with Zod validation
- **State Management**: Centralized state with Zustand
- **API Integration**: Seamless integration with FastAPI backend

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS with dark mode support
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Layout.jsx      # Main layout wrapper
│   ├── Header.jsx      # Application header
│   └── Sidebar.jsx     # Navigation sidebar
├── pages/              # Page components
│   ├── OnboardingPage.jsx
│   ├── PoliciesPage.jsx
│   ├── ChatPage.jsx
│   ├── AnalyticsPage.jsx
│   └── SettingsPage.jsx
├── store/              # State management
│   └── useStore.js     # Zustand store
├── lib/                # Utilities and configurations
│   ├── api.js          # API client
│   ├── validations.js  # Zod schemas
│   └── utils.js        # Helper functions
└── App.jsx             # Main application component
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- FastAPI backend running on `http://localhost:8000`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hr-onboarding-bot/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_TITLE=HR Onboarding Bot
```

### API Configuration

The API client is configured in `src/lib/api.js`. Update the `baseURL` to match your backend:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  // ... other config
})
```

## 🎨 Customization

### Themes

The application supports light and dark themes. Theme switching is handled automatically and persisted in localStorage.

### Colors

Customize the color scheme by modifying the CSS variables in `src/index.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  /* ... other colors */
}
```

### Components

All UI components are built using shadcn/ui and can be customized by modifying their respective files in `src/components/ui/`.

## 📱 Responsive Design

The application is fully responsive and works on:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1280px+)

## 🔌 API Integration

The frontend integrates with the following backend endpoints:

- **Employee Management**: `/api/onboard`
- **Policy Management**: `/api/policies/*`
- **Onboarding**: `/api/onboarding/*`
- **AI Chat**: `/api/ask-policy`, `/api/onboarding/ask`

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Build & Deployment

### Development Build

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

### Docker Deployment

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

Stay updated with the latest changes:
- Watch the repository for updates
- Check the changelog
- Follow the development blog

---

**Built with ❤️ using modern web technologies**
