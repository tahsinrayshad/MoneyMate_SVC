# Money Mate Frontend

A modern React.js frontend for the Money Mate personal finance application, built with Vite, Tailwind CSS, and React Router.

## Features

- **Authentication**: User registration, login, and profile management
- **Dashboard**: Financial overview with income/expense summaries
- **Blog System**: Create, read, and manage financial blogs
- **Transaction Management**: Track income and expenses (ready for integration)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional interface with Heroicons

## Tech Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Heroicons** - Beautiful SVG icons
- **Headless UI** - Unstyled, accessible UI components

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.jsx      # Navigation bar
│   ├── Footer.jsx      # Footer component
│   └── LoadingSpinner.jsx
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Login.jsx       # Login page
│   ├── Register.jsx    # Registration page
│   ├── Dashboard.jsx   # User dashboard
│   ├── BlogList.jsx    # Blog listing page
│   ├── BlogDetail.jsx  # Individual blog view
│   ├── CreateBlog.jsx  # Blog creation form
│   ├── Profile.jsx     # User profile page
│   └── Transactions.jsx # Transaction management
├── services/           # API service layer
│   └── api.js         # API client configuration
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── App.jsx            # Main application component
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## API Integration

The frontend is configured to communicate with your microservices:

- **Blog Service**: `http://localhost:8001/api`
- **Identity Service**: `http://localhost:8002/api`
- **Transaction Service**: `http://localhost:8003/api`

Update the URLs in `src/services/api.js` to match your actual service endpoints.

## Environment Configuration

Create a `.env` file in the frontend directory:

```env
VITE_API_GATEWAY_URL=http://localhost:8000
VITE_BLOG_SERVICE_URL=http://localhost:8001
VITE_IDENTITY_SERVICE_URL=http://localhost:8002
VITE_TRANSACTION_SERVICE_URL=http://localhost:8003
```

## Features Overview

### Authentication
- User registration and login
- JWT token management
- Protected routes
- Profile management

### Dashboard
- Financial overview cards
- Recent blogs and transactions
- Quick action buttons
- Responsive layout

### Blog System
- Create, read, update, delete blogs
- Category-based filtering
- Search functionality
- User attribution

### Transaction Management
- Income and expense tracking
- Category management
- Search and filtering
- Summary statistics

## Styling

The application uses Tailwind CSS with a custom color palette:

- **Primary**: Blue shades for main actions
- **Secondary**: Gray shades for text and backgrounds
- **Success**: Green for positive actions
- **Error**: Red for negative actions

## Responsive Design

The frontend is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Money Mate application suite.