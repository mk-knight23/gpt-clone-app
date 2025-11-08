# 🤖 CHUTES AI Chat

> A modern, responsive AI chat application powered by 5 free AI models through CHUTES API

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_App-blue?style=for-the-badge&logo=react)](https://chutes-ai-chat.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-mk--knight23%2Fgpt--clone--app-black?style=for-the-badge&logo=github)](https://github.com/mk-knight23/gpt-clone-app)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

## 🌟 Features

### 🎛️ **5 Free AI Models**
- **Gemma 3 4B It** (Unsloth) - Google's latest instruction-following model
- **GLM 4.5 Air** (Zai Org) - Most popular, high performance and reliability
- **LongCat Flash Chat FP8** (Meituan) - Fast inference with excellent performance
- **GPT OSS 20B** (OpenAI) - OpenAI compatible model
- **Tongyi DeepResearch 30B A3B** (Alibaba) - Research-focused deep analysis

### 💬 **Chat Interface**
- Real-time AI responses
- Model selection dropdown
- Chat history management
- Delete individual chats
- Typing indicators
- Mobile responsive design

### 🎨 **Modern UI/UX**
- Clean, professional interface
- Dark/light theme support
- Mobile-first responsive design
- Smooth animations and transitions
- Accessible design patterns

### 🔒 **Secure & Private**
- Environment variable configuration
- No API keys exposed in code
- Client-side only (no server required)
- Safe for public deployment

## 🚀 Quick Demo

### Live Application
[**👉 Try it now: CHUTES AI Chat**](https://chutes-ai-chat.vercel.app)

### Local Development
```bash
# Clone the repository
git clone https://github.com/mk-knight23/gpt-clone-app.git
cd gpt-clone-app

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your CHUTES API token to .env

# Start development server
npm run dev
```

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Shadcn/ui
- **Icons**: Lucide React
- **AI Integration**: CHUTES API
- **Deployment**: Vercel
- **Version Control**: Git + GitHub

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── ChatSidebar.tsx  # Sidebar with model selection
│   ├── ChatInput.tsx    # Message input component
│   ├── ChatMessage.tsx  # Individual message display
│   ├── ModelSelector.tsx# Model selection dropdown
│   └── TypingIndicator.tsx
├── hooks/
│   ├── useChat.ts       # Main chat logic & API integration
│   ├── useToast.ts      # Toast notifications
│   └── use-mobile.tsx   # Mobile detection hook
├── lib/
│   └── utils.ts         # Utility functions
└── pages/
    └── Index.tsx        # Main application page
```

## 🎯 How to Use

1. **Select Model**: Click the "Model" button in the sidebar
2. **Start Chatting**: Type your message in the chat input
3. **Get Responses**: AI will respond using the selected model
4. **Switch Models**: Try different models for various response styles
5. **Manage Chats**: Delete old conversations to keep things clean

## 🚀 Deployment

### Vercel (Recommended)
1. **Fork/Clone** this repository
2. **Connect to Vercel** with your GitHub account
3. **Import Project** from your repository
4. **Set Environment Variable**:
   ```
   VITE_CHUTES_API_TOKEN=your_chutes_api_token_here
   ```
5. **Deploy** - Your app will be live in 2-3 minutes!

### Other Platforms
- **Netlify**: Same process as Vercel
- **GitHub Pages**: Requires build process adjustment
- **Custom Server**: Build with `npm run build` and serve `dist/` folder

## 🔑 API Configuration

### Getting Your CHUTES API Token
1. Visit [chutes.ai](https://chutes.ai)
2. Create a free account
3. Generate an API token from your dashboard
4. Use the token in environment variables

### Environment Variables
```env
# Required: Your CHUTES API token
VITE_CHUTES_API_TOKEN=your_api_token_here
```

## 🎨 Screenshots

### Main Chat Interface
![Chat Interface](https://via.placeholder.com/800x400?text=CHUTES+AI+Chat+Interface)

### Model Selection
![Model Selection](https://via.placeholder.com/400x300?text=Model+Selection+Dropdown)

### Mobile View
![Mobile View](https://via.placeholder.com/300x600?text=Mobile+Responsive+Design)

## 🌟 Key Highlights

- **✅ 100% Free**: All 5 AI models are completely free to use
- **✅ No Registration**: Works immediately with API token
- **✅ Modern Tech**: Built with latest React + TypeScript
- **✅ Production Ready**: Optimized for deployment
- **✅ Open Source**: MIT License, feel free to fork and modify
- **✅ Mobile Friendly**: Responsive design for all devices

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CHUTES AI** for providing free AI model access
- **Vercel** for seamless deployment platform
- **Tailwind CSS** for the utility-first CSS framework
- **Shadcn/ui** for the beautiful component library
- **Lucide** for the clean icon set

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mk-knight23/gpt-clone-app/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mk-knight23/gpt-clone-app/discussions)
- **Email**: Contact through GitHub

---

**Made with ❤️ by [mk-knight23](https://github.com/mk-knight23)**

[Live Demo](https://chutes-ai-chat.vercel.app) • [GitHub](https://github.com/mk-knight23/gpt-clone-app) • [Report Bug](https://github.com/mk-knight23/gpt-clone-app/issues) • [Request Feature](https://github.com/mk-knight23/gpt-clone-app/issues)
