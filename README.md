# 🎮 Bora Jogar - Event Management Platform

> A modern, full-featured event management application designed for organizing and managing football/soccer games with participant registration, role management, and waiting list functionality.

**Live Demo**: [borajogar-game-on.vercel.app](https://borajogar-game-on.vercel.app/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Core Functionality](#-core-functionality)
- [Development](#-development)
- [Production Deployment](#-production-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Bora Jogar** is a comprehensive web application that simplifies the organization and management of football/soccer games. It enables event organizers to create games, set player limits, manage participant registrations, and handle complex scenarios like waiting lists and role switching with real-time updates.

The platform is designed with a focus on:

- **User Experience**: Intuitive interfaces for both event creators and participants
- **Real-time Updates**: Live participant list updates using Supabase real-time subscriptions
- **Scalability**: Production-ready architecture with proper state management and error handling
- **Type Safety**: Full TypeScript implementation for reliability and maintainability

---

## ✨ Key Features

### Event Management

- **Create & Edit Events**: Full CRUD operations for event creation with all necessary details
- **Event Duplication**: Quickly copy existing events with all settings
- **Event Status Control**: Toggle events between open/closed states
- **Rich Event Details**:
  - Event name, date, and time
  - Location with Google Maps integration
  - Player and goalkeeper position limits
  - Custom event rules management

### Participant Management

- **Smart Registration System**:
  - Register as either Player or Goalkeeper
  - Dual position flexibility for participants
  - Automatic status assignment (Confirmed/Waiting List)
  - CPF-based profile tracking for registered users

- **Advanced Role Management**:
  - Switch roles with automatic status updates
  - Fill confirmation slots first, then waiting list
  - Position-specific limit enforcement
  - Automatic waiting list promotion when spots become available

- **Intelligent Waiting List**:
  - Automatic enrollment when positions are full
  - Priority-based promotion when confirmed participants cancel
  - Role-aware waiting list management

### Real-time Features

- **Live Participant Updates**: Supabase real-time subscriptions keep participant lists in sync
- **Instant Notifications**: Toast notifications for all user actions
- **Dynamic UI Updates**: Instant reflection of changes across all connected clients

### User Management

- **Secure Authentication**: Email-based authentication with Supabase
- **Participant Profiles**: Optional registration with CPF tracking
- **User Dashboard**: Centralized hub for managing all created events
- **Session Management**: Persistent authentication state

---

## 🛠️ Tech Stack

### Frontend Framework

- **React 18.3.1**: Modern UI library with hooks and functional components
- **TypeScript 5.8**: Full type safety for robust development
- **Vite 5.4.19**: Lightning-fast build tool with HMR support
- **React Router 6.30.1**: Client-side routing with dynamic parameters

### UI & Styling

- **shadcn/ui**: High-quality, accessible React components
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **Lucide React 0.462**: Beautiful, consistent icon library
- **Radix UI**: Unstyled, accessible primitive components

### State Management & Data

- **TanStack React Query 5.83**: Server state management and caching
- **React Hook Form 7.61.1**: Performant form validation
- **Zod 3.25.76**: TypeScript-first schema validation

### Backend Services

- **Supabase**: PostgreSQL database with real-time capabilities
- **Supabase Auth**: User authentication and session management
- **Supabase Realtime**: WebSocket-based live updates

### Development Tools

- **Vitest 3.2**: Unit testing framework with TypeScript support
- **Playwright 1.57**: E2E testing framework
- **ESLint 9.32**: Code quality and consistency
- **PostCSS 8.5.6**: CSS transformation and autoprefixing

### Deployment

- **Vercel**: Modern serverless platform for automatic deployments

---

## 🏗️ Architecture

### Component Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui components library
│   └── pages/           # Page-level components
├── pages/               # Route pages (Page components)
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useEvent.ts      # Event data management
│   └── useEvents.tsx    # Multiple events management
├── lib/
│   ├── types.ts         # TypeScript interfaces
│   └── utils.ts         # Utility functions
├── integrations/
│   └── supabase/        # Supabase client setup
└── shared/              # Shared utilities and schemas
```

### Data Flow Architecture

```
User Actions
    ↓
React Components
    ↓
Custom Hooks (useEvent, useAuth, etc.)
    ↓
Supabase Client (REST API + Real-time)
    ↓
PostgreSQL Database
    ↓
Real-time Updates (Subscriptions)
    ↓
UI Re-render
```

### Key Design Patterns

- **Custom Hooks**: Encapsulate business logic (`useEvent`, `useEvents`, `useAuth`)
- **Composition**: Build complex UIs from smaller components
- **Type Safety**: Strict TypeScript interfaces for all data models
- **Error Handling**: Toast notifications and try-catch blocks throughout
- **Loading States**: Proper UI feedback during async operations
- **Real-time Subscriptions**: PostgreSQL changes trigger immediate UI updates

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v16 or higher
- **Bun** (recommended) or npm/yarn
- **Supabase Account**: For database setup (free tier available)

### Cloning & Setup

```bash
# Clone the repository
git clone <repository-url>
cd borajogar-game-on

# Install dependencies
bun install
# or
npm install

# Create environment variables file
cp .env.example .env.local

# Fill in your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
# Start development server (with HMR)
bun run dev
# or
npm run dev

# Access the application
# Open http://localhost:5173
```

### Building

```bash
# Create optimized production build
bun run build
# or
npm run build

# Preview production build locally
bun run preview
```

### Testing

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run E2E tests with Playwright
bunx playwright test
```

### Code Quality

```bash
# Run ESLint
bun run lint

# Fix linting issues
bun run lint --fix
```

---

## 📁 Project Structure

### Core Files

| File                 | Purpose                             |
| -------------------- | ----------------------------------- |
| `src/main.tsx`       | Application entry point             |
| `src/App.tsx`        | Route configuration and main layout |
| `vite.config.ts`     | Vite build configuration            |
| `tsconfig.json`      | TypeScript compiler options         |
| `tailwind.config.ts` | Tailwind CSS theming                |
| `components.json`    | shadcn/ui component registry        |

### Pages

| Page                  | Route                           | Purpose                                   |
| --------------------- | ------------------------------- | ----------------------------------------- |
| `Index.tsx`           | `/`                             | Landing page                              |
| `Auth.tsx`            | `/auth`                         | Authentication page                       |
| `Dashboard.tsx`       | `/dashboard`                    | User's event management hub               |
| `EventForm.tsx`       | `/event/new`, `/event/:id/edit` | Create/edit events                        |
| `EventPage.tsx`       | `/event/:id`                    | Event detail and participant registration |
| `ParticipantAuth.tsx` | `/participant-auth`             | Guest participant authentication          |
| `NotFound.tsx`        | `*`                             | 404 error page                            |

### Custom Hooks

| Hook                    | Purpose                                      |
| ----------------------- | -------------------------------------------- |
| `useAuth`               | Authentication state and user management     |
| `useEvent`              | Single event data and participant management |
| `useEvents`             | Multiple events list with CRUD operations    |
| `useParticipantProfile` | Participant profile data handling            |

### Key Interfaces (from `lib/types.ts`)

```typescript
interface Event {
  id: string;
  organizer_id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  google_maps_url?: string;
  player_limit: number;
  goalkeeper_limit: number;
  is_open: boolean;
}

interface Participant {
  id: string;
  event_id: string;
  user_id?: string;
  name: string;
  role: 'PLAYER' | 'GOALKEEPER';
  status: 'CONFIRMED' | 'WAITING';
}

interface EventRule {
  id: string;
  event_id: string;
  rule_text: string;
  order_index: number;
}
```

---

## 🎮 Core Functionality

### Event Creation Flow

1. User navigates to `/event/new`
2. Fills in event details (name, date, time, location, limits)
3. Adds custom rules for the event
4. Submits form - creates entry in `events` table
5. Rules are stored in `event_rules` table with order index
6. User is redirected to event page

### Participant Registration Flow

1. Guest opens event via `/event/:id`
2. Selects role (Player or Goalkeeper)
3. Enters name
4. System checks:
   - **Position available?** → Status = `CONFIRMED`
   - **Position full?** → Status = `WAITING`, added to waiting list
5. Real-time subscription updates all connected clients
6. If position opens up, automatic promotion from waiting list

### Role Switching Logic

```typescript
// When participant switches roles:
1. Get new role availability check
2. Update participant role in database
3. If original role was CONFIRMED → Promote first from WAITING list
4. Update participant status based on new role availability
5. Real-time update triggers for all clients
```

### Waiting List Management

- Maintains chronological order by `created_at`
- Automatic promotion when confirmed participant leaves
- Role-specific waiting lists
- Toast notifications for status changes

---

## 💻 Development

### Code Style

- **TypeScript**: Strict mode enabled, no `any` types
- **React**: Functional components with hooks
- **Formatting**: ESLint configuration for consistency
- **Components**: Modular, single-responsibility components

### Adding New Components

1. Create component in `src/components/`
2. Use shadcn/ui components when possible
3. Apply Tailwind classes for styling
4. Export from component index if needed
5. Add TypeScript interfaces for props

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `src/App.tsx`
3. Implement `useAuth` for protected routes
4. Use custom hooks for data management

### Database Queries

All database operations go through Supabase client:

```typescript
import { supabase } from '@/integrations/supabase/client';

// Query example
const { data, error } = await supabase
  .from('events')
  .select('*')
  .eq('organizer_id', userId);

// Subscribe to changes
const channel = supabase
  .channel('event-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'events',
    },
    (payload) => {
      // Handle changes
    },
  )
  .subscribe();
```

---

## 🌐 Production Deployment

### Vercel (Recommended)

The application is pre-configured for Vercel deployment:

```bash
# Automatic deployment from git
# 1. Push code to GitHub/GitLab/Bitbucket
# 2. Connect repository to Vercel
# 3. Add environment variables in Vercel dashboard
# 4. Deploy automatically on push

# Manual deployment
vercel deploy --prod
```

### Environment Variables (Production)

Set these in your deployment platform:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Performance Optimizations

- Code splitting with dynamic imports
- Asset optimization by Vite
- Tailwind CSS purging in production
- React Query caching strategy
- Image optimization recommendations

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Make** your changes
4. **Test** your changes (`bun run test`)
5. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
6. **Push** to the branch (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Code Standards

- Write TypeScript with strict mode
- Use functional components and hooks
- Follow existing code style
- Add tests for new features
- Update README if needed
- Keep commits atomic and descriptive

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Vite Documentation](https://vitejs.dev)

---

## 👤 Author

Created with ❤️ for the football community

For questions or support, feel free to open an issue or contact us.

---

**Made with TypeScript • React • Supabase • Tailwind CSS**
