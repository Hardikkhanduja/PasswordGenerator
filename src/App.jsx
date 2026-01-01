import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useTheme } from './context/ThemeContext'
import { usePasswordGenerator } from './hooks/usePasswordGenerator'
import { calculatePasswordStrength, estimateCrackTime, getCharsetSize } from './utils/passwordStrength'
import './App.css'

// Password generation modes
const MODES = {
  STANDARD: 'standard',
  PRONOUNCEABLE: 'pronounceable',
  PIN: 'pin',
  PASSPHRASE: 'passphrase'
}

function App() {
  const { theme, toggleTheme } = useTheme()
  const { generatePassword } = usePasswordGenerator()
  
  // Password settings
  const [length, setLength] = useState(16)
  const [mode, setMode] = useState(MODES.STANDARD)
  const [numberAllowed, setNumberAllowed] = useState(true)
  const [charAllowed, setCharAllowed] = useState(true)
  const [uppercaseAllowed, setUppercaseAllowed] = useState(true)
  const [lowercaseAllowed, setLowercaseAllowed] = useState(true)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [avoidRepeating, setAvoidRepeating] = useState(false)
  
  // Password state
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordHistory, setPasswordHistory] = useState([])
  const [favorites, setFavorites] = useState([])
  
  // UI state
  const [toast, setToast] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const [regenerateAnimation, setRegenerateAnimation] = useState(false)

  const passwordRef = useRef(null)
  const toastTimeoutRef = useRef(null)

  // Calculate password strength with entropy
  const strengthData = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: 'Very Weak',
        color: 'bg-red-500',
        textColor: 'text-red-500',
        entropy: '0.00'
      }
    }
    
    const strength = calculatePasswordStrength(password)
    const charsetSize = getCharsetSize(password)
    const entropy = Math.log2(Math.pow(charsetSize, password.length))
    const crackTime = estimateCrackTime(entropy)
    
    return {
      ...strength,
      entropy: entropy.toFixed(2),
      crackTime
    }
  }, [password])

  // Password generator function
  const passwordGenerator = useCallback(() => {
    setIsGenerating(true)
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      try {
        const newPassword = generatePassword({
          length,
          includeUppercase: uppercaseAllowed,
          includeLowercase: lowercaseAllowed,
          includeNumbers: numberAllowed,
          includeSpecial: charAllowed,
          excludeAmbiguous,
          avoidRepeating,
          mode
        })
        
        setPassword(newPassword)
        
        // Add to history (max 5)
        setPasswordHistory(prev => {
          const newHistory = [newPassword, ...prev.filter(p => p !== newPassword)].slice(0, 5)
          localStorage.setItem('passwordHistory', JSON.stringify(newHistory))
          return newHistory
        })
      } catch (error) {
        console.error('Error generating password:', error)
        setToast('Error generating password. Please try again.')
        setTimeout(() => setToast(''), 3000)
      } finally {
        setIsGenerating(false)
      }
    }, 100)
  }, [length, mode, numberAllowed, charAllowed, uppercaseAllowed, lowercaseAllowed, excludeAmbiguous, avoidRepeating, generatePassword])

  const copyPasswordToClipboard = useCallback(() => {
    if (!password) return

    setCopySuccess(true)
    passwordRef.current?.select()
    passwordRef.current?.setSelectionRange(0, 9999)
    window.navigator.clipboard.writeText(password).then(() => {
      setToast('✓ Password copied to clipboard!')
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => {
        setToast('')
        setCopySuccess(false)
      }, 3000)
    }).catch(() => {
      setToast('Failed to copy password')
      setTimeout(() => setToast(''), 3000)
    })
  }, [password])

  const regeneratePassword = useCallback(() => {
    setRegenerateAnimation(true)
    setTimeout(() => setRegenerateAnimation(false), 500)
    passwordGenerator()
  }, [passwordGenerator])

  const copyFromHistory = useCallback((pass) => {
    window.navigator.clipboard.writeText(pass).then(() => {
      setToast('Password copied to clipboard!')
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => setToast(''), 3000)
    })
  }, [])

  const clearHistory = useCallback(() => {
    setPasswordHistory([])
    localStorage.removeItem('passwordHistory')
    setToast('History cleared!')
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    toastTimeoutRef.current = setTimeout(() => setToast(''), 3000)
  }, [])

  const toggleFavorite = useCallback((pass) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(pass)
      const newFavorites = isFavorite
        ? prev.filter(p => p !== pass)
        : [...prev, pass].slice(0, 10)
      localStorage.setItem('favoritePasswords', JSON.stringify(newFavorites))
      return newFavorites
    })
  }, [])

  const exportPasswords = useCallback(() => {
    const allPasswords = [...new Set([...passwordHistory, ...favorites])]
    if (allPasswords.length === 0) {
      setToast('No passwords to export')
      setTimeout(() => setToast(''), 3000)
      return
    }
    
    const content = allPasswords.map((pass, idx) => `${idx + 1}. ${pass}`).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `passwords-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setToast('Passwords exported successfully!')
    setTimeout(() => setToast(''), 3000)
  }, [passwordHistory, favorites])

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('passwordHistory')
      if (savedHistory) {
        setPasswordHistory(JSON.parse(savedHistory))
      }
      const savedFavorites = localStorage.getItem('favoritePasswords')
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    } catch (e) {
      console.error('Failed to load saved data', e)
    }
  }, [])

  // Generate password on mount and when dependencies change
  useEffect(() => {
    passwordGenerator()
  }, [passwordGenerator])

  // Cleanup toast timeout
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${
      isDark 
        ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in flex items-center gap-2 ${
          isDark 
            ? 'bg-emerald-500 text-white shadow-emerald-500/50' 
            : 'bg-emerald-600 text-white shadow-emerald-600/50'
        }`}>
          <span>✓</span>
          <span>{toast.replace('✓ ', '')}</span>
        </div>
      )}

      {/* Main Card */}
      <div className={`rounded-2xl shadow-2xl p-6 w-full max-w-2xl border transition-colors ${
        isDark 
          ? 'bg-slate-800/90 backdrop-blur-sm border-slate-700/50' 
          : 'bg-white/90 backdrop-blur-sm border-slate-200/50'
      }`}>
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-center mb-5">
          <h1 className={`text-2xl font-bold bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent`}>
            🔒 Password Generator
          </h1>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            aria-label="Toggle theme"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Password Display */}
        <div className="mb-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={isGenerating ? 'Generating...' : password}
                className={`outline-none w-full py-3 px-4 pr-12 rounded-lg text-base font-mono border-2 transition-colors ${
                  isDark
                    ? 'bg-slate-900/50 text-slate-100 border-slate-600 focus:border-indigo-500'
                    : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-indigo-500'
                } ${isGenerating ? 'opacity-50' : ''} ${copySuccess ? 'border-emerald-500' : ''}`}
                placeholder="Your password will appear here"
                readOnly
                ref={passwordRef}
                aria-label="Generated password"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                  isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                }`}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                type="button"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            <button
              className={`px-5 py-3 rounded-lg font-semibold shrink-0 transition-colors shadow-lg ${
                copySuccess 
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/50' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/50'
              }`}
              onClick={copyPasswordToClipboard}
              aria-label="Copy password to clipboard"
            >
              {copySuccess ? '✓ Copied' : 'Copy'}
            </button>
            <button
              className={`px-4 py-3 rounded-lg font-semibold shrink-0 transition-all ${
                isDark
                  ? 'bg-slate-700 hover:bg-slate-600 text-white'
                  : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
              } ${regenerateAnimation ? 'animate-rotate' : ''}`}
              onClick={regeneratePassword}
              title="Regenerate password"
              aria-label="Regenerate password"
            >
              🔄
            </button>
          </div>
        </div>

        {/* Password Strength Indicator */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Strength: <span className={`font-semibold ${strengthData.textColor}`}>{strengthData.label}</span>
            </span>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Entropy: {strengthData.entropy} bits
            </div>
          </div>
          <div className={`w-full rounded-full h-2.5 overflow-hidden ${
            isDark ? 'bg-slate-700/50' : 'bg-slate-200'
          }`}>
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${strengthData.color}`}
              style={{ width: `${(strengthData.score / 10) * 100}%` }}
              role="progressbar"
              aria-valuenow={strengthData.score}
              aria-valuemin="0"
              aria-valuemax="10"
            />
          </div>
          {strengthData.crackTime && (
            <div className={`mt-1 text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
              Estimated crack time: {strengthData.crackTime.online} (online), {strengthData.crackTime.offline} (offline)
            </div>
          )}
        </div>

        {/* Generation Mode */}
        <div className="mb-4">
          <label className={`block mb-2 text-sm font-semibold ${
            isDark ? 'text-slate-200' : 'text-slate-700'
          }`}>
            Generation Mode:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(MODES).map(([key, value]) => (
              <button
                key={value}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  mode === value
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/50'
                    : isDark
                      ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Length Slider */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className={`text-sm font-semibold ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}>
              Length: <span className="text-cyan-400 font-bold">{length}</span>
            </label>
            <input
              type="number"
              min={mode === MODES.PIN ? 4 : mode === MODES.PASSPHRASE ? 8 : 4}
              max={mode === MODES.PIN ? 12 : mode === MODES.PASSPHRASE ? 50 : 128}
              value={length}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 8
                const min = mode === MODES.PIN ? 4 : mode === MODES.PASSPHRASE ? 8 : 4
                const max = mode === MODES.PIN ? 12 : mode === MODES.PASSPHRASE ? 50 : 128
                setLength(Math.max(min, Math.min(max, val)))
              }}
              className={`w-20 px-2 py-1 rounded border transition-colors text-sm ${
                isDark
                  ? 'bg-slate-900/50 text-slate-100 border-slate-600 focus:border-indigo-500'
                  : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-indigo-500'
              }`}
              aria-label="Password length"
            />
          </div>
          <input
            type="range"
            min={mode === MODES.PIN ? 4 : mode === MODES.PASSPHRASE ? 8 : 4}
            max={mode === MODES.PIN ? 12 : mode === MODES.PASSPHRASE ? 50 : 128}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            aria-label="Password length slider"
          />
        </div>

        {/* Options - Only show for standard mode */}
        {mode === MODES.STANDARD && (
          <div className="mb-4 space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={uppercaseAllowed}
                  onChange={(e) => setUppercaseAllowed(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                  aria-label="Include uppercase letters"
                />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Uppercase</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowercaseAllowed}
                  onChange={(e) => setLowercaseAllowed(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                  aria-label="Include lowercase letters"
                />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Lowercase</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={numberAllowed}
                  onChange={(e) => setNumberAllowed(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                  aria-label="Include numbers"
                />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Numbers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={charAllowed}
                  onChange={(e) => setCharAllowed(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                  aria-label="Include special characters"
                />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Symbols</span>
              </label>
            </div>
            
            {/* Advanced Options */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                  aria-label="Exclude ambiguous characters"
                />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Exclude ambiguous (0, O, l, 1, I)
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidRepeating}
                  onChange={(e) => setAvoidRepeating(e.target.checked)}
                  className="w-5 h-5 accent-indigo-500 cursor-pointer"
                  aria-label="Avoid repeating characters"
                />
                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Avoid repeating chars
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Password History */}
        {(passwordHistory.length > 0 || favorites.length > 0) && (
          <div className={`mt-5 pt-4 border-t ${
            isDark ? 'border-slate-700/50' : 'border-slate-200'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <h2 className={`text-base font-bold ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}>
                Recent Passwords
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={exportPasswords}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    isDark
                      ? 'text-cyan-400 hover:text-cyan-300 bg-slate-700/50 hover:bg-slate-700'
                      : 'text-cyan-600 hover:text-cyan-700 bg-slate-100 hover:bg-slate-200'
                  }`}
                  aria-label="Export passwords"
                >
                  Export
                </button>
                <button
                  onClick={clearHistory}
                  className={`text-xs px-3 py-1 rounded transition-colors ${
                    isDark
                      ? 'text-red-400 hover:text-red-300 bg-slate-700/50 hover:bg-slate-700'
                      : 'text-red-600 hover:text-red-700 bg-slate-100 hover:bg-slate-200'
                  }`}
                  aria-label="Clear history"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className={`space-y-2 max-h-32 overflow-y-auto ${
              isDark ? '' : ''
            }`}>
              {passwordHistory.map((pass, index) => {
                const isFavorite = favorites.includes(pass)
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors border ${
                      isDark
                        ? 'bg-slate-900/50 hover:bg-slate-900 border-slate-700/30'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <code className={`flex-1 font-mono text-sm truncate ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      {pass}
                    </code>
                    <button
                      onClick={() => toggleFavorite(pass)}
                      className={`text-sm transition-colors ${
                        isFavorite ? 'text-yellow-400' : isDark ? 'text-slate-500' : 'text-slate-400'
                      }`}
                      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {isFavorite ? '★' : '☆'}
                    </button>
                    <button
                      onClick={() => copyFromHistory(pass)}
                      className={`text-sm font-medium shrink-0 transition-colors ${
                        isDark
                          ? 'text-cyan-400 hover:text-cyan-300'
                          : 'text-cyan-600 hover:text-cyan-700'
                      }`}
                      aria-label="Copy password"
                    >
                      Copy
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
