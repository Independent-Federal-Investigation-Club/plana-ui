# Project Plana UI

A modern, responsive web interface for configuring the Project Plana Discord bot. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Modern Landing Page**: Clean, Apple-inspired design showcasing Project Plana's features
- **Discord OAuth Integration**: Secure authentication with Discord
- **Server Management**: Select and configure bot settings for your Discord servers
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Toggle between themes with system preference support
- **Real-time Configuration**: Live updates to bot settings through API integration

## Tech Stack

- **Frontend**: Next.js 16.11 (App Router)
- **Runtime**: Bun
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Discord OAuth2
- **Theme**: next-themes for dark/light mode
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed
- Project Plana backend API running (see api_doc.md)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd plana-ui
```

2. Install dependencies:
```bash
bun install
```

3. Create environment variables:
```bash
# Create .env.local file
PLANA_API_URL=http://localhost:3001
PLANA_SITE_URL=http://localhost:3000
```

4. Start the development server:
```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Server selection and configuration
│   ├── wiki/              # Documentation pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # Global header with navigation
│   ├── footer.tsx        # Global footer
│   └── theme-toggle.tsx  # Dark/light theme toggle
├── contexts/             # React contexts
│   └── auth-context.tsx  # Authentication state management
└── lib/                  # Utility functions
    └── auth.ts           # Authentication service and types
```

## Key Features

### Authentication
- **Popup OAuth**: Secure popup window authentication (primary method)
- **Fallback Redirect**: Automatic fallback to redirect flow if popups are blocked
- **Discord OAuth2**: Full integration with Discord's OAuth2 system
- **JWT Management**: Secure token storage and automatic refresh
- **Protected Routes**: Authentication guards for sensitive pages
- **Cross-window Communication**: Secure message passing between popup and main window

### Server Management
- List Discord servers with admin permissions
- Visual server cards with icons and badges
- Real-time server configuration
- Tabbed settings interface (General, Appearance, Localization, Permissions)

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Touch-friendly interactions
- Optimized navigation for mobile

### Theme Support
- System preference detection
- Manual theme switching
- Persistent theme selection
- Seamless transitions

## API Integration

The frontend integrates with the Project Plana backend API for:
- Discord OAuth authentication
- Guild (server) management
- Bot configuration settings
- User permissions validation

See `api_doc.md` for complete API documentation.

### OAuth Implementation

The authentication system uses a secure popup-based OAuth flow:

1. **Popup Window**: Opens a small, secure popup window for Discord authentication
2. **Callback Handling**: Dedicated `/auth/callback` route processes OAuth responses
3. **Message Passing**: Secure communication between popup and main window using `postMessage`
4. **Fallback Support**: Automatic fallback to redirect flow if popups are blocked
5. **Security**: Origin verification and message validation for cross-window communication
6. **Error Handling**: Comprehensive error handling with user-friendly messages

## Development

### Scripts

```bash
# Development server
bun dev

# Build for production
bun build

# Start production server
bun start

# Lint code
bun lint
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for consistent formatting
- Tailwind CSS for styling

## Deployment

### Environment Variables

Set the following environment variables in your deployment:

```bash
PLANA_API_URL=https://your-api-domain.com
NEXT_PUBLIC_DISCORD_BOT_ID=your_bot_id
PLANA_SITE_URL=https://your-site-domain.com
```

### Build and Deploy

```bash
# Build the application
bun build

# Deploy to your preferred platform
# (Vercel, Netlify, etc.)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of Project Plana - a free and open-source Discord bot.
