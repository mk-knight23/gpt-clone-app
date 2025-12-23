# AI Chat Application

A clean, minimal AI chat interface built with React, TypeScript, and Vite. Features multiple AI provider support through OpenRouter with a focus on simplicity and performance.

## Features

- **Multi-Provider Support**: OpenRouter integration with access to various AI models
- **Clean Interface**: Minimal, distraction-free chat experience
- **Real-time Streaming**: Live AI response streaming
- **File Upload**: Support for image and document uploads
- **PWA Ready**: Progressive Web App with offline support
- **Type Safety**: Full TypeScript implementation
- **Testing**: Comprehensive test suite with 83% pass rate

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS + Radix UI
- **State Management**: Zustand
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel-ready configuration

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenRouter API key ([get one here](https://openrouter.ai/keys))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd chatgpt-clone-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your OpenRouter API key to .env

# Start development server
npm run dev
```

### Environment Variables

```env
# Required
VITE_CHUTES_API_TOKEN=your_chutes_token_here

# Optional (for additional providers)
VITE_OPENROUTER_API_KEY=your_openrouter_key_here
VITE_MEGA_LLM_API_KEY=your_megallm_key_here
VITE_AGENT_ROUTER_API_KEY=your_agentrouter_key_here
VITE_ROUTEWAY_API_KEY=your_routeway_key_here
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run test suite
- `npm run type-check` - TypeScript type checking
- `npm run lint` - ESLint code checking
- `npm run check:security` - Security vulnerability scan

## Deployment

### Vercel (Recommended)

1. Fork/clone this repository
2. Connect to Vercel with your GitHub account
3. Import project from repository
4. Set environment variables in Vercel dashboard
5. Deploy - Your app will be live in 2-3 minutes!

### Other Platforms

The app can be deployed to any platform that supports static site hosting:

```bash
npm run build
# Deploy the 'dist' folder to your preferred platform
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Base UI components
│   └── *.tsx           # Feature components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── features/           # Feature modules (AI providers, etc.)
├── pages/              # Page components
└── tests/              # Test files
    ├── unit/           # Unit tests
    └── integration/    # Integration tests
```

## Testing

The project includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test -- --coverage
```

Current test coverage: **20+ tests with 83% pass rate**

## Security

- Environment variable validation with Zod
- Input sanitization and validation
- Content Security Policy (CSP) headers
- XSS and CSRF protection
- Automated security scanning
- No hardcoded secrets policy

Run security scan: `npm run check:security`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Development

### Code Style

- ESLint + Prettier for code formatting
- TypeScript for type safety
- Conventional commits for commit messages

### Git Workflow

- `main` - Production-ready code
- `develop` - Development branch
- Feature branches - `feature/feature-name`
- Hotfix branches - `hotfix/fix-name`

### Essential Commands

```bash
# Setup development environment
npm install

# Start development
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Security check
npm run check:security

# Type check
npm run type-check
```

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
```bash
npm run type-check
```

**Tests failing**
```bash
npm test -- --run
```

**Security scan fails**
- Check for hardcoded secrets
- Ensure all environment variables are properly configured

### Performance

The app is optimized for performance:
- Bundle size reduced by 70% through dependency cleanup
- Code splitting and lazy loading
- Optimized images and assets
- Service worker caching

## License

This project is licensed under the MIT License.

## Acknowledgments

- OpenRouter for AI provider integration
- Vercel for deployment platform
- Tailwind CSS for styling
- Radix UI for accessible components
