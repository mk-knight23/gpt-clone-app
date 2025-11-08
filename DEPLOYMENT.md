# CHUTES AI Chat - GitHub & Vercel Deployment Guide

## 🚀 Quick Start

### Local Development
1. **Clone Repository**
   ```bash
   git clone <your-repo-url>
   cd gpt-clone-app
   npm install
   ```

2. **Set Up Environment**
   ```bash
   # Copy example file
   cp .env.example .env
   
   # Edit .env with your CHUTES API token
   VITE_CHUTES_API_TOKEN=your_actual_chutes_api_token_here
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

### GitHub Upload
1. **Initialize Git** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit: CHUTES AI Chat with model selection"
   ```

2. **Push to GitHub**
   ```bash
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **Important Notes**
   - **✅ Safe**: `.env` is gitignored, your API token won't be uploaded
   - **✅ Template**: `.env.example` shows the required format
   - **✅ Public**: Repository can be public without exposing API keys

### Vercel Deployment

#### Method 1: Vercel Dashboard (Recommended)
1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

2. **Set Environment Variable**
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add: `VITE_CHUTES_API_TOKEN` = `your_chutes_api_token_here`
   - Set environment: Production, Preview, Development

3. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at `https://your-app.vercel.app`

#### Method 2: Vercel CLI
1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   # Follow prompts to set up and deploy
   ```

3. **Set Environment Variable**
   ```bash
   vercel env add VITE_CHUTES_API_TOKEN
   # Enter your CHUTES API token
   ```

## 🔑 API Configuration

### Environment Variables
```env
# Required: Your CHUTES API token
VITE_CHUTES_API_TOKEN=your_chutes_api_token_here
```

### Getting Your CHUTES API Token
1. Visit [chutes.ai](https://chutes.ai)
2. Create a free account
3. Get your API token from dashboard
4. Add it to environment variables

## 🤖 Model Selection

### Available Free Models
1. **"unsloth/gemma-3-4b-it"** (Unsloth) - Google's latest
2. **"zai-org/GLM-4.5-Air"** (Zai Org) - Most popular
3. **"meituan-longcat/LongCat-Flash-Chat-FP8"** (Meituan) - Fast inference
4. **"openai/gpt-oss-20b"** (OpenAI) - OpenAI compatible
5. **"alibaba-nlp/Tongyi-DeepResearch-30B-A3B"** (Alibaba) - Research focused

### Using Models
- **Select Model**: Click "Model" button in sidebar
- **Switch Models**: Choose from dropdown in settings
- **Auto-Save**: Model selection saved in localStorage
- **Page Reload**: Page reloads after selection to apply changes

## 🛠 Build Commands

```bash
# Development (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🔒 Security & Best Practices

### Environment Variables
- **Local**: Use `.env` file (gitignored)
- **Vercel**: Set in dashboard environment variables
- **Never commit**: Real API tokens to GitHub

### Git Security
- **✅ .gitignore**: Protects `.env` files
- **✅ .env.example**: Safe template for others
- **✅ Public repo**: Safe to make public

## 🚨 Troubleshooting

### "Configuration Required" Error
1. **Check Environment Variable**: Ensure `VITE_CHUTES_API_TOKEN` is set
2. **Local Development**: Verify `.env` file exists and has valid token
3. **Vercel**: Check environment variables in dashboard
4. **Token Format**: Ensure token matches format: `cpk_...`

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Vercel Deployment Issues
1. Check build logs in Vercel dashboard
2. Ensure environment variables are set
3. Verify repository structure is correct
4. Check for any build errors in console

## 📱 Current Status

✅ **Local Development**: Ready with environment variables
✅ **GitHub Upload**: Safe with .gitignore protection
✅ **Vercel Deployment**: Environment variable support
✅ **Model Selection**: 5 free CHUTES models working
✅ **API Integration**: CHUTES API fully functional
✅ **Security**: No exposed API keys in public repo

## 🎯 Ready for Production!

Your CHUTES AI Chat is now ready for:
- **Local development** with `.env` file
- **GitHub upload** with security protection
- **Vercel deployment** with environment variables
- **Public sharing** without exposing API keys

The application will work seamlessly in all environments! 🎉
