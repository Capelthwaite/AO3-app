# AO3 Fanfiction Tracking Application

A comprehensive web application for tracking and managing fanfiction from Archive of Our Own (AO3). Built with Next.js 15, featuring story saving, reading progress tracking, advanced search, and intelligent organization tools.

## ✨ Features

### 📚 Story Management & Organization
- **Story Fetching** - Add stories by AO3 URL or Work ID
- **Personal Library** - Save and organize your favorite fanfictions
- **Reading Progress Tracking** - Automatic chapter progress monitoring
- **Update Detection** - Get notified when stories have new chapters
- **Story Statistics** - Word count, chapters, completion status, and kudos tracking
- **Metadata Management** - Automatic extraction of fandoms, relationships, characters, and tags

### 🔍 Advanced Search & Discovery
- **AO3 Search Integration** - Search directly within the application
- **Filter System** - Filter by fandom, completion status, word count, and more
- **Saved Filter Sets** - Save and reuse your favorite search configurations
- **Single-Page Browser** - Browse AO3 results without leaving the app
- **Smart Filtering** - Reading status, completion status, and update-based sorting

### 📊 Progress & Analytics
- **Reading Statistics Dashboard** - Track your reading habits and library growth
- **Update Notifications** - Visual indicators for stories with new chapters
- **Chapter Progress** - Track which chapter you're currently reading
- **Last Read Tracking** - Remember when you last opened each story

### 🔐 Authentication & User Management
- **Better Auth v1.2.8** - Secure, modern authentication system
- **Google OAuth** - Easy sign-in with your Google account
- **Session Management** - Persistent sessions with database storage
- **User Profiles** - Personalized reading experience

### 🎨 Modern UI/UX
- **Tailwind CSS v4** - Latest utility-first styling with enhanced card designs
- **shadcn/ui** components - Accessible, customizable interface elements
- **Radix UI** primitives - WCAG-compliant accessibility features
- **Dark/Light Theme** - Seamless theme switching with system preference detection
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Loading Skeletons** - Smooth loading states for better perceived performance
- **Optimistic Updates** - Immediate UI feedback for user actions
- **Confirmation Dialogs** - Accessible modals with keyboard navigation
- **Enhanced Focus Management** - Comprehensive keyboard navigation support

### 🗄️ Database & Storage
- **Neon PostgreSQL** - Serverless database with automatic scaling
- **Drizzle ORM** - Type-safe database operations with full TypeScript support
- **Reading Progress Schema** - Sophisticated tracking of chapter progress and updates
- **Filter Sets Storage** - Save and manage complex search configurations
- **Story Metadata** - Comprehensive fanfiction metadata with JSON field support

### 🚀 Performance & Reliability
- **Server-Side Rendering** - Fast initial page loads with Next.js App Router
- **Optimistic Updates** - Instant UI feedback with error recovery
- **Error Boundaries** - Graceful error handling and recovery
- **API Rate Limiting** - Respectful interaction with AO3's servers
- **Caching Strategy** - Smart caching for improved performance

## 🚀 Tech Stack

- **Framework**: Next.js 15.3.1 with App Router and Server Components
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS v4 + shadcn/ui component library
- **Database**: Neon PostgreSQL with Drizzle ORM for type safety
- **Authentication**: Better Auth v1.2.8 with Google OAuth
- **UI Components**: Radix UI primitives with custom styling
- **Web Scraping**: Custom AO3 parsing with respectful rate limiting
- **State Management**: React Server Components with optimistic updates
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
- **Deployment**: Vercel (recommended) with automatic deployments

## 📁 Project Structure

```
├── app/
│   ├── (auth)/              # Authentication pages (sign-in, sign-up)
│   ├── dashboard/           # Protected dashboard area
│   │   ├── _components/     # Core dashboard components
│   │   │   ├── ao3-fetcher.tsx          # Story fetching interface
│   │   │   ├── story-library.tsx        # Personal story library
│   │   │   ├── stats-cards.tsx          # Reading statistics
│   │   │   └── dashboard-content.tsx     # Main dashboard layout
│   │   ├── browse/          # AO3 search and discovery
│   │   ├── settings/        # User settings and preferences
│   │   └── page.tsx         # Dashboard home page
│   └── api/                 # API routes
│       ├── ao3/             # AO3 integration endpoints
│       ├── stories/         # Story management endpoints
│       ├── filter-sets/     # Saved search filter management
│       └── auth/            # Authentication endpoints
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── confirmation-dialog.tsx      # Accessible confirmation modals
│   │   ├── story-card-skeleton.tsx      # Loading state components
│   │   └── [other-ui-components]        # Various shadcn/ui components
│   └── homepage/            # Landing page sections
├── constants/
│   └── ui-config.ts         # Centralized UI configuration and constants
├── lib/
│   ├── auth/               # Authentication configuration
│   └── utils.ts            # Shared utility functions
└── db/
    ├── schema.ts           # Database schema with story and user tables
    └── drizzle.ts          # Database connection and configuration
```

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ (Node.js 20+ recommended)
- PostgreSQL database (Neon recommended for serverless deployment)
- Google OAuth credentials for authentication
- Basic understanding of fanfiction and AO3 terminology

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Capelthwaite/AO3-app.git
cd AO3-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file with:
```env
# Database Connection
DATABASE_URL="your-neon-database-url"

# Authentication Configuration
BETTER_AUTH_SECRET="your-random-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000" # Change for production

# Google OAuth (Required for authentication)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: AI Chat Integration
OPENAI_API_KEY="your-openai-api-key" # For AI chat features

# Optional: PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
```

4. **Database Setup**
```bash
# Generate and run database migrations
npx drizzle-kit generate
npx drizzle-kit push
```

5. **Google OAuth Setup**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project or select existing project
- Enable Google+ API
- Create OAuth 2.0 credentials
- Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs
- Copy Client ID and Client Secret to your `.env.local`

6. **Start Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

### 🚨 Important Development Notes
- The server must run in background for proper functionality
- If you encounter "Failed to fetch" errors, restart the server with:
```bash
pkill -f "next" && nohup npm run dev > server.log 2>&1 &
```

## 🎯 Key Features Explained

### Story Fetching & Management
- **URL/Work ID Support** - Add stories by pasting AO3 URLs or entering Work IDs
- **Automatic Metadata Extraction** - Pulls title, author, summary, tags, fandoms, and statistics
- **Bulk Operations** - Save multiple stories efficiently
- **Story Validation** - Ensures stories exist and are accessible before saving

### Reading Progress Tracking
- **Chapter-Level Tracking** - Remembers which chapter you're currently reading
- **Update Detection** - Automatically detects when stories have new chapters
- **Visual Indicators** - Clear badges and highlights for stories with updates
- **Last Read Timestamps** - Track when you last opened each story
- **Progress Statistics** - See your reading habits and completion rates

### Advanced Search & Filtering
- **AO3 Integration** - Search AO3 directly within the application
- **Smart Filters** - Filter by reading status, completion status, word count, and more
- **Saved Filter Sets** - Create and reuse complex search configurations
- **Real-time Results** - Instant filtering without page reloads
- **Bulk Actions** - Add multiple search results to your library at once

### Library Organization
- **Personal Dashboard** - Overview of your reading statistics and recent activity
- **Story Cards** - Rich display of story information with expandable summaries
- **Sorting Options** - Sort by date added, last updated, or unread status
- **Batch Management** - Select and manage multiple stories simultaneously

### Accessibility & User Experience
- **Keyboard Navigation** - Full keyboard accessibility throughout the application
- **Screen Reader Support** - ARIA labels and semantic HTML for assistive technologies
- **Confirmation Dialogs** - Accessible modals for destructive actions like story deletion
- **Loading States** - Smooth skeleton loading for better perceived performance
- **Error Recovery** - Graceful error handling with retry mechanisms

## 🔧 Development & Customization

### Adding New Features
1. **Database Changes**: Update schema in `db/schema.ts`
2. **Generate Migrations**: Run `npx drizzle-kit generate`
3. **Apply Changes**: Run `npx drizzle-kit push`
4. **API Routes**: Add new endpoints in `app/api/`
5. **UI Components**: Create components in `components/ui/`
6. **Dashboard Integration**: Add to `app/dashboard/_components/`

### Styling & Theming
- **Global Styles**: Modify `app/globals.css` for application-wide styles
- **Component Styling**: Use Tailwind CSS classes with shadcn/ui components
- **Theme Configuration**: Customize colors and themes in `tailwind.config.ts`
- **Accessibility**: Ensure new components follow WCAG 2.1 AA guidelines
- **UI Constants**: Add new UI constants to `constants/ui-config.ts`

### Extending AO3 Integration
- **New Metadata Fields**: Add fields to `userStories` table in schema
- **Custom Parsers**: Extend AO3 parsing logic in `/api/ao3/` routes
- **Search Enhancements**: Modify filter logic in filter components
- **Progress Tracking**: Extend reading progress features in story management

## 📚 Learn More

### Project Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs) - Learn about the React framework
- [Better Auth Documentation](https://better-auth.com) - Modern authentication system
- [Drizzle ORM Documentation](https://orm.drizzle.team) - Type-safe database toolkit
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs) - Utility-first CSS framework
- [shadcn/ui Documentation](https://ui.shadcn.com) - Accessible component library

### AO3 & Fanfiction Resources
- [Archive of Our Own](https://archiveofourown.org) - The fanfiction archive this app integrates with
- [AO3 FAQ](https://archiveofourown.org/faq) - Understanding AO3's features and terminology
- [Fanfiction Community Guidelines](https://archiveofourown.org/tos) - Responsible use and community standards

## 🚀 Deployment

### Vercel (Recommended)
1. Fork/clone the repository to your GitHub account
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - Random secret key for sessions
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth credentials
   - `BETTER_AUTH_URL` - Your production domain (e.g., `https://your-app.vercel.app`)
4. Deploy automatically on every push to main branch

### Manual Deployment
```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🌟 Roadmap

### Upcoming Features
- **Mobile App** - React Native companion app for on-the-go reading
- **Reading Lists** - Organize stories into custom collections and reading lists  
- **Social Features** - Share favorite stories and reading recommendations
- **Reading Statistics** - Detailed analytics about your reading patterns
- **Offline Reading** - Download stories for offline access
- **Browser Extension** - Quick-add stories directly from AO3
- **API Integration** - REST API for third-party applications

### Technical Improvements
- **Performance Optimization** - Enhanced caching and virtualization
- **Advanced Filtering** - Machine learning-powered story recommendations
- **Export Features** - Export your library to various formats (JSON, CSV, EPUB)
- **Backup & Sync** - Cloud synchronization across devices

## 🤝 Contributing

We welcome contributions from the fanfiction and developer communities! Here's how you can help:

### Ways to Contribute
- 🐛 **Report Bugs** - Found an issue? [Create a bug report](https://github.com/Capelthwaite/AO3-app/issues)
- 💡 **Request Features** - Have ideas? [Submit a feature request](https://github.com/Capelthwaite/AO3-app/issues)
- 🔧 **Code Contributions** - Submit pull requests for bug fixes or new features
- 📚 **Documentation** - Help improve documentation and guides
- 🎨 **Design** - Contribute UI/UX improvements and accessibility enhancements

### Development Guidelines
1. Fork the repository and create a feature branch
2. Follow existing code style and conventions
3. Add tests for new functionality
4. Ensure accessibility standards are maintained
5. Update documentation as needed
6. Submit a pull request with clear description

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is an independent project and is not affiliated with or endorsed by Archive of Our Own (AO3) or the Organization for Transformative Works (OTW). Please respect AO3's Terms of Service and use this application responsibly.

---

Built with ❤️ for the fanfiction community using Next.js and modern web technologies.
