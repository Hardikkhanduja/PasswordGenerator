# 🔒 Advanced Password Generator

<div align="center">

![Password Generator](https://img.shields.io/badge/Password-Generator-blue)
![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-teal)
![License](https://img.shields.io/badge/License-MIT-green)

A modern, secure, and feature-rich password generator built with React and Tailwind CSS. Generate cryptographically secure passwords with advanced customization options.

[Live Demo](#) • [Features](#features) • [Installation](#installation) • [Documentation](#documentation)

</div>

---

## ✨ Features

### 🔐 Enhanced Password Generation
- **Multiple Generation Modes**: Standard, Pronounceable, PIN, and Passphrase
- **Customizable Character Sets**: Uppercase, lowercase, numbers, and special characters
- **Advanced Options**:
  - Exclude ambiguous characters (0, O, l, 1, I)
  - Avoid repeating characters
  - Adjustable length (8-128 characters)
- **Cryptographically Secure**: Uses Web Crypto API for true randomness

### 📊 Password Strength Analysis
- **Visual Strength Meter**: Color-coded strength indicator (Weak to Perfect)
- **Entropy Calculation**: Shows password entropy in bits
- **Crack Time Estimation**: Estimates time to crack password (online/offline)
- **Real-time Updates**: Strength updates as you change settings

### 🎨 Modern UI/UX
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Smooth Animations**: Subtle transitions and micro-interactions
- **Accessibility**: Full ARIA labels and keyboard navigation support
- **Toast Notifications**: Visual feedback for all actions

### 💾 Advanced Features
- **Password History**: View last 5 generated passwords
- **Favorites System**: Save frequently used passwords
- **Export Functionality**: Export passwords as text file
- **Show/Hide Toggle**: Reveal or hide password visibility
- **One-Click Copy**: Copy password to clipboard instantly
- **Local Storage**: Persists history and favorites

### 🔒 Security Best Practices
- **No Server Storage**: All processing happens client-side
- **Web Crypto API**: Cryptographically secure random generation
- **No External Dependencies**: No tracking or analytics
- **HTTPS Ready**: Production-ready security configuration

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/password-generator.git
cd password-generator
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📖 Usage Guide

### Generating Passwords

1. **Select Generation Mode**
   - **Standard**: Traditional random password with customizable character sets
   - **Pronounceable**: Easy-to-read passwords using consonant-vowel patterns
   - **PIN**: Numeric-only passwords (4-12 digits)
   - **Passphrase**: Word-based passwords using a word list

2. **Customize Settings**
   - Adjust length using the slider or number input
   - Toggle character types (uppercase, lowercase, numbers, symbols)
   - Enable advanced options (exclude ambiguous, avoid repeating)

3. **Generate & Copy**
   - Click the regenerate button (🔄) to generate a new password
   - Click "Copy" to copy password to clipboard
   - Toggle visibility with the eye icon

### Password Strength

The strength indicator shows:
- **Strength Level**: Visual rating from Very Weak to Perfect
- **Entropy**: Password complexity in bits (higher is better)
- **Crack Time**: Estimated time to brute-force the password

### Managing Passwords

- **History**: Automatically saves last 5 generated passwords
- **Favorites**: Click the star icon (☆/★) to save passwords
- **Export**: Export all saved passwords as a text file
- **Clear**: Remove password history when needed

---

## 🛠️ Technology Stack

- **React 19.2** - UI library
- **Vite 7.2** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Web Crypto API** - Secure random number generation

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

---

## 📁 Project Structure

```
password-generator/
├── src/
│   ├── components/        # React components
│   ├── context/          # React Context (Theme)
│   ├── hooks/            # Custom React hooks
│   │   └── usePasswordGenerator.js
│   ├── utils/            # Utility functions
│   │   └── passwordStrength.js
│   ├── App.jsx           # Main application component
│   ├── App.css           # Component styles
│   ├── main.jsx          # Application entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── README.md             # Documentation
```

---

## 🎯 Key Features Explained

### Cryptographic Security

The app uses the Web Crypto API (`window.crypto.getRandomValues()`) for generating cryptographically secure random numbers. This ensures that passwords are generated using a cryptographically strong random number generator suitable for security-sensitive applications.

### Entropy Calculation

Password entropy measures the randomness and unpredictability of a password. It's calculated using the formula:

```
Entropy = log₂(charset_size ^ password_length)
```

Higher entropy means a stronger, more secure password.

### Crack Time Estimation

Based on entropy, the app estimates how long it would take to crack a password using:
- **Online attacks**: ~10¹⁰ guesses/second (typical web service)
- **Offline attacks**: ~10¹⁴ guesses/second (local brute force)

---

## 🌐 Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/password-generator)

1. Push code to GitHub
2. Import project in Vercel
3. Deploy automatically

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Manual Deployment

1. Build for production:
```bash
npm run build
```

2. The `dist` folder contains the production build
3. Deploy `dist` contents to your hosting provider

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow React best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Your Name**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Portfolio: [Your Website](https://yourwebsite.com)

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Build tool
- Web Crypto API documentation

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/password-generator?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/password-generator?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/password-generator)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/password-generator)

---

<div align="center">

Made with ❤️ using React and Tailwind CSS

⭐ Star this repo if you find it helpful!

</div>
