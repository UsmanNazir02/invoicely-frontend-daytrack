# Invoicely Frontend

A React frontend for the Invoicely solar products management system.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **React Router** for navigation
- **TanStack Query (React Query)** for server state management
- **React Hook Form + Zod** for form handling and validation
- **Axios** for API calls
- **Lucide React** for icons

## Features

- 🔐 JWT Authentication with HTTP-only cookies
- 📊 Dashboard with product statistics
- 🏷️ Brand management (CRUD)
- ☀️ Solar Panel management (CRUD)
- ⚡ Inverter management (CRUD)
- 🏗️ Structure management (CRUD)
- 📦 Misc Items management (CRUD)
- 📱 Responsive design with mobile sidebar

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (invoicely-backend)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── layout/      # Layout components (Sidebar)
│   └── ui/          # UI primitives (Button, Input, etc.)
├── contexts/        # React contexts (Auth)
├── pages/           # Page components
│   ├── auth/        # Login page
│   ├── dashboard/   # Dashboard
│   ├── brands/      # Brands management
│   ├── solar-panels/# Solar panels management
│   ├── inverters/   # Inverters management
│   ├── structures/  # Structures management
│   └── misc-items/  # Misc items management
├── routes/          # Routing configuration
├── services/        # API services
├── types/           # TypeScript types
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## API Compatibility

This frontend is designed to work with the `invoicely-backend` NestJS API:

- Uses HTTP-only cookies for authentication
- Matches backend DTOs and entity types
- Supports CORS with credentials
- Default API prefix: `/api`

## Backend API Endpoints

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/users/profile` | GET | Get user profile |
| `/api/brands` | GET, POST, PATCH, DELETE | Brand CRUD |
| `/api/solar-panels` | GET, POST, PATCH, DELETE | Solar Panel CRUD |
| `/api/inverters` | GET, POST, PATCH, DELETE | Inverter CRUD |
| `/api/structures` | GET, POST, PATCH, DELETE | Structure CRUD |
| `/api/misc-items` | GET, POST, PATCH, DELETE | Misc Item CRUD |
