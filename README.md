# 🔍 Accessibility Checker Pro

> **A comprehensive web accessibility analysis tool that helps you create inclusive digital experiences**

![Accessibility Checker Hero](accessibly.jpg)

[![Built with Lovable](https://img.shields.io/badge/Built%20with-Lovable-ff69b4)](https://lovable.dev)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-38B2AC)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)

**Made by [Arisha Mumtaz](https://github.com/Arisha004/ai-accessible-ai)**

## ✨ Features

### 📝 **Content Analysis**
- **Readability Assessment**: Calculate Flesch Reading Ease scores and grade levels
- **Complex Sentence Detection**: Identify overly complex sentences (24+ words)
- **Long Word Analysis**: Highlight difficult vocabulary (13+ characters)
- **Reading Time Estimation**: Automatic reading time calculation
- **Target Grade Customization**: Set specific readability targets (Grade 1-12)

### 🌈 **Color Contrast Analysis**
- **WCAG Compliance Checking**: Automated contrast ratio testing
- **Live DOM Analysis**: Real-time analysis of your website's color combinations
- **Color Suggestions**: Get recommended accessible colors when ratios fail
- **Visual Contrast Simulation**: Toggle color blindness simulation
- **Multi-element Testing**: Analyze multiple text/background combinations

### 🤝 **Inclusive Language Detection**
- **Bias Detection**: Identify potentially exclusionary language
- **Alternative Suggestions**: Get inclusive alternatives for flagged terms
- **Context Awareness**: See exactly where issues occur in your content
- **Comprehensive Database**: Covers gendered, ableist, and other problematic language

### 🔄 **AI-Powered Rewriting**
- **Local Rewriting**: Built-in text simplification (no API keys required)
- **Grade-Level Targeting**: Rewrite content to specific reading levels
- **Side-by-Side Comparison**: Visual diff showing original vs. rewritten text
- **Highlighted Changes**: See exactly what was modified

### 🌐 **Website Analysis**
- **URL Fetching**: Analyze any public website directly
- **Text Extraction**: Smart content extraction from web pages
- **Full Site Analysis**: Complete accessibility assessment of live sites
- **Anti-Bot Protection**: Robust fetching with proper user agent headers

### 📊 **Reporting & Export**
- **PDF Reports**: Professional accessibility reports with visual examples
- **History Tracking**: Save and revisit previous analyses (local storage)
- **Print-Friendly**: Optimized layouts for sharing and documentation
- **Multi-page Support**: Handle large reports across multiple PDF pages

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/accessibility-checker.git
   cd accessibility-checker
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📖 How to Use

### 1. **Text Analysis**
- Navigate to the main interface
- Switch to the "Paste Text" tab
- Paste your content into the textarea
- Adjust the target grade level (1-12)
- Click "Analyze" to get comprehensive results

### 2. **Website Analysis**
- Switch to the "Website URL" tab
- Enter any public website URL
- Click "Fetch & Analyze" to extract and analyze content
- Review readability, contrast, and language results

### 3. **AI Rewriting**
- After analysis, use the "Rewrite" button
- Set your target grade level
- Review the side-by-side comparison
- Edit the rewritten text as needed

### 4. **Export Results**
- Click "Export PDF" to generate a professional report
- Use "Save" to store results locally for later reference
- Access your recent analyses in the History panel

## 🎯 Use Cases

### **Content Creators & Writers**
- Ensure blog posts meet readability standards
- Check for inclusive language before publishing
- Optimize content for specific audience reading levels

### **Web Developers**
- Validate color contrast ratios during development
- Test accessibility before deployment
- Generate compliance reports for clients

### **UX/UI Designers**
- Verify design accessibility early in the process
- Test color schemes against WCAG guidelines
- Create accessible design systems

### **Marketing Teams**
- Ensure campaigns use inclusive language
- Optimize content readability for target audiences
- Generate accessibility reports for stakeholders

### **Educators & Students**
- Learn about web accessibility principles
- Practice creating inclusive content
- Understand WCAG compliance requirements

## 🛠️ Technical Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI + shadcn/ui
- **Backend**: Supabase Edge Functions
- **Build Tool**: Vite
- **PDF Generation**: jsPDF + html2canvas
- **Text Analysis**: Custom algorithms for readability and language detection
- **Deployment**: Lovable.dev platform

## 🔧 Configuration

### Environment Variables
The application works out of the box with no configuration required. For advanced features:

- **Supabase Integration**: Pre-configured for website fetching
- **Local Storage**: Automatic history saving (no setup needed)
- **Responsive Design**: Works on all device sizes

## 📚 WCAG Guidelines

This tool helps you comply with:
- **WCAG 2.1 AA Standards**
- **Color Contrast Requirements** (4.5:1 for normal text, 3:1 for large text)
- **Readability Best Practices**
- **Inclusive Language Guidelines**

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WCAG Guidelines** - Web Content Accessibility Guidelines
- **Lovable.dev** - Development platform
- **Supabase** - Backend infrastructure
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework

## 📞 Support

- **Documentation**: [WCAG Guide](./docs/wcag-guide.md)
- **Contact**: Made by [Arisha Mumtaz](mailto:arishamumtaz340@gmail.com)

---

**✨ Make the web accessible for everyone - one analysis at a time!**


## 💻 Development with Lovable

**Project URL**: https://preview--ai-accessible-ai.lovable.app/

Requirements: Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm i

# Start development server
npm run dev
```

### Deployment
Simply open [Lovable](https://lovable.dev/projects/3a4360a2-c709-4c5f-a855-f6932db9f183) and click on Share → Publish.

### Custom Domain
To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.
Read more: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
