# 🤖 CHUTES AI Chat v2.0 - Advanced AI Chat Application

> A cutting-edge, feature-rich AI chat application powered by 5 free AI models through CHUTES API with modern UI/UX, PWA support, and enterprise-grade features

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_App-blue?style=for-the-badge&logo=react)](https://chutes-ai-chat.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-mk--knight23%2Fgpt--clone--app-black?style=for-the-badge&logo=github)](https://github.com/mk-knight23/gpt-clone-app)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![PWA](https://img.shields.io/badge/PWA-Ready-green?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-blue?style=for-the-badge&logo=accessibility)](https://www.w3.org/WAI/WCAG21/quickref/)

## 🌟 What's New in v2.0

### ✨ **Major Upgrades**
- **🎨 Modern Glassmorphism UI** - Beautiful glassmorphism design with smooth animations
- **📱 Progressive Web App (PWA)** - Installable, works offline, push notifications
- **🔧 Advanced Settings Panel** - Temperature control, system prompts, model comparison
- **📁 File Upload & Processing** - Support for images, documents, code files with AI analysis
- **⚡ Real-time Streaming** - See AI responses as they're generated
- **♿ Full Accessibility** - WCAG 2.1 AA compliant with screen reader support
- **🔒 Enterprise Security** - Input sanitization, rate limiting, CSP headers
- **📊 Analytics & Monitoring** - Performance tracking, error monitoring, usage analytics
- **🧪 Comprehensive Testing** - Built-in testing suite with accessibility and security tests

### 🚀 **Enhanced Features**
- **Message Editing** - Edit your messages after sending
- **Conversation Branching** - Create branches from any point in conversations
- **Smart Search** - Search through all your conversations
- **Export/Import** - Backup and restore your chat data
- **Keyboard Shortcuts** - Power user shortcuts for everything
- **Dark/Light Themes** - Automatic theme detection
- **Mobile Optimized** - Perfect experience on all devices

## 🎯 **5 Free AI Models**

| Model | Provider | Strengths | Use Cases |
|-------|----------|-----------|-----------|
| **Gemma 3 4B It** | Google (Unsloth) | Latest instruction-following | General chat, reasoning |
| **GLM 4.5 Air** | Zai Org | High performance & reliability | Most popular choice |
| **LongCat Flash** | Meituan | Fast inference | Quick responses |
| **GPT OSS 20B** | OpenAI | OpenAI compatible | Code, analysis |
| **Tongyi DeepResearch** | Alibaba | Research-focused | Deep analysis |

## 🛠️ **Technology Stack**

### **Frontend**
- **React 18** + **TypeScript** - Modern React with full type safety
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI + Shadcn/ui** - Beautiful, accessible components
- **Lucide React** - Clean, consistent icon set

### **Advanced Features**
- **PWA** - Service Worker, Web App Manifest, offline support
- **WebRTC** - Real-time communication capabilities
- **Web Workers** - Background processing for heavy tasks
- **IndexedDB** - Client-side data storage
- **Web Share API** - Native sharing capabilities

### **Security & Performance**
- **Content Security Policy (CSP)** - XSS protection
- **Rate Limiting** - API abuse prevention
- **Input Sanitization** - XSS and injection prevention
- **Performance Monitoring** - Core Web Vitals tracking
- **Error Boundary** - Graceful error handling

### **Accessibility**
- **WCAG 2.1 AA** - Full accessibility compliance
- **Screen Reader Support** - ARIA labels and semantic HTML
- **Keyboard Navigation** - Full keyboard accessibility
- **High Contrast Mode** - Support for visual impairments
- **Reduced Motion** - Respects user motion preferences

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- CHUTES API token (free at [chutes.ai](https://chutes.ai))

### **Installation**

```bash
# Clone the repository
git clone https://github.com/mk-knight23/gpt-clone-app.git
cd gpt-clone-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your CHUTES API token to .env

# Start development server
npm run dev
```

### **Environment Variables**

```env
# Required: Your CHUTES API token
VITE_CHUTES_API_TOKEN=your_chutes_api_token_here

# Optional: Analytics endpoints
VITE_ANALYTICS_ENDPOINT=https://your-analytics-endpoint.com
VITE_ERROR_MONITORING_ENDPOINT=https://your-error-monitoring.com
```

## 📱 **PWA Installation**

The app can be installed as a native app on any device:

1. **Desktop**: Look for the install icon in your browser's address bar
2. **Mobile**: Use "Add to Home Screen" from your browser menu
3. **Manual**: Click the install button that appears automatically

### **PWA Features**
- ✅ Works offline
- ✅ Push notifications
- ✅ Home screen installation
- ✅ Native app-like experience
- ✅ Background sync
- ✅ Automatic updates

## ⌨️ **Keyboard Shortcuts**

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | New chat |
| `Cmd/Ctrl + /` | Focus search |
| `Alt + A` | Accessibility settings |
| `Alt + C` | Skip to content |
| `Tab` | Navigate elements |
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Escape` | Close panels |

## 🎨 **Customization**

### **Themes**
The app supports multiple themes:
- **Auto** - Follows system preference
- **Dark** - Dark theme (default)
- **Light** - Light theme
- **High Contrast** - For accessibility

### **Settings Panel**
Access via the settings icon in the chat header:

- **Temperature** - Control AI creativity (0.0 = focused, 2.0 = creative)
- **Max Tokens** - Response length limit
- **System Prompt** - Customize AI behavior
- **Streaming** - Real-time response generation
- **Model Selection** - Choose from 5 available models

## 🔧 **Advanced Features**

### **File Upload & Processing**
Supported file types:
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Documents**: PDF, TXT, Markdown, JSON
- **Code**: JavaScript, TypeScript, Python, HTML, CSS, SQL, Java, C++, Rust, Go

### **Analytics & Monitoring**
Built-in analytics track:
- Page load performance
- User interactions
- Error rates
- Feature usage
- API response times

### **Security Features**
- Input validation and sanitization
- Rate limiting (30 requests/minute)
- Content Security Policy
- XSS protection
- CSRF protection
- Secure file handling

## 🧪 **Testing**

The app includes a comprehensive testing suite:

```bash
# Run all tests
npm run test

# Run specific test categories
npm run test:accessibility
npm run test:security
npm run test:performance
npm run test:api

# Generate test report
npm run test:report
```

### **Test Coverage**
- ✅ Unit tests for all components
- ✅ Integration tests for API calls
- ✅ Accessibility tests (WCAG 2.1 AA)
- ✅ Security tests (XSS, CSRF, injection)
- ✅ Performance benchmarks
- ✅ PWA functionality tests

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Fork/clone this repository
2. Connect to Vercel with your GitHub account
3. Import project from repository
4. Set environment variables:
   ```
   VITE_CHUTES_API_TOKEN=your_api_token_here
   ```
5. Deploy - Your app will be live in 2-3 minutes!

### **Other Platforms**
- **Netlify**: Same process as Vercel
- **GitHub Pages**: Requires build process adjustment
- **Custom Server**: Build with `npm run build` and serve `dist/` folder

### **Docker Deployment**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📊 **Performance**

### **Core Web Vitals**
- **LCP**: < 2.5s (Largest Contentful Paint)
- **FID**: < 100ms (First Input Delay)
- **CLS**: < 0.1 (Cumulative Layout Shift)

### **Optimization Features**
- Code splitting and lazy loading
- Image optimization and WebP support
- Service Worker caching
- Bundle size optimization
- Critical CSS inlining

## ♿ **Accessibility**

### **WCAG 2.1 AA Compliance**
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast mode
- ✅ Focus indicators
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Color blind friendly palette
- ✅ Reduced motion support

### **Testing**
- Automated accessibility testing
- Manual keyboard testing
- Screen reader testing
- Color contrast validation

## 🔒 **Security**

### **Implemented Protections**
- Content Security Policy (CSP)
- XSS prevention through input sanitization
- CSRF protection
- Rate limiting (30 req/min)
- Secure file upload validation
- No sensitive data in localStorage
- HTTPS enforcement

### **Security Headers**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## 📈 **Analytics & Monitoring**

### **Tracked Metrics**
- User engagement and session duration
- Feature usage statistics
- Performance metrics (Core Web Vitals)
- Error rates and types
- API response times
- PWA installation rates

### **Privacy**
- No personal data collection
- Anonymous usage statistics only
- GDPR compliant
- User can opt-out of analytics

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Setup**
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Code Style**
- ESLint + Prettier for code formatting
- TypeScript for type safety
- Conventional commits for commit messages
- Component-driven development

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **CHUTES AI** for providing free AI model access
- **Vercel** for seamless deployment platform
- **Tailwind CSS** for the utility-first CSS framework
- **Shadcn/ui** for the beautiful component library
- **Lucide** for the clean icon set
- **Radix UI** for accessible primitives

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/mk-knight23/gpt-clone-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mk-knight23/gpt-clone-app/discussions)
- **Email**: Contact through GitHub

## 🗺️ **Roadmap**

### **Upcoming Features**
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Team collaboration features
- [ ] Plugin system
- [ ] Advanced data visualization
- [ ] Mobile app (React Native)

### **Performance Improvements**
- [ ] Edge caching
- [ ] CDN integration
- [ ] Database optimization
- [ ] Real-time synchronization

---

**Made with ❤️ by [mk-knight23](https://github.com/mk-knight23)**

[Live Demo](https://chutes-ai-chat.vercel.app) • [GitHub](https://github.com/mk-knight23/gpt-clone-app) • [Report Bug](https://github.com/mk-knight23/gpt-clone-app/issues) • [Request Feature](https://github.com/mk-knight23/gpt-clone-app/issues)

---

### **⭐ Show Your Support**

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs and issues
- 💡 Suggesting new features
- 🤝 Contributing to the codebase
- 📢 Sharing with others

**Thank you for using CHUTES AI Chat v2.0!** 🚀
