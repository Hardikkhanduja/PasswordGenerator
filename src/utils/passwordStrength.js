/**
 * Calculate password entropy
 * Entropy = log2(charset_size^length)
 */
export const calculateEntropy = (password, charsetSize) => {
  if (!password || charsetSize <= 0) return 0
  return Math.log2(Math.pow(charsetSize, password.length))
}

/**
 * Get charset size based on password content
 */
export const getCharsetSize = (password) => {
  let size = 0
  if (/[a-z]/.test(password)) size += 26
  if (/[A-Z]/.test(password)) size += 26
  if (/[0-9]/.test(password)) size += 10
  if (/[^A-Za-z0-9]/.test(password)) size += 32 // Common special chars
  return size || 26 // Fallback to lowercase
}

/**
 * Estimate time to crack password
 * Based on entropy and assumptions about brute force speed
 */
export const estimateCrackTime = (entropy) => {
  // Assumptions:
  // - 10^10 guesses per second (typical for online brute force)
  // - For offline: 10^14 guesses per second
  const onlineGuessesPerSecond = Math.pow(10, 10)
  const offlineGuessesPerSecond = Math.pow(10, 14)
  
  const totalPossibleCombinations = Math.pow(2, entropy)
  
  const onlineSeconds = totalPossibleCombinations / onlineGuessesPerSecond
  const offlineSeconds = totalPossibleCombinations / offlineGuessesPerSecond

  return {
    online: formatTime(onlineSeconds),
    offline: formatTime(offlineSeconds),
    entropy: entropy.toFixed(2)
  }
}

/**
 * Format time in human-readable format
 */
const formatTime = (seconds) => {
  if (seconds < 1) return 'Instant'
  if (seconds < 60) return `${seconds.toFixed(0)} second${seconds !== 1 ? 's' : ''}`
  
  const minutes = seconds / 60
  if (minutes < 60) return `${minutes.toFixed(1)} minute${minutes !== 1 ? 's' : ''}`
  
  const hours = minutes / 60
  if (hours < 24) return `${hours.toFixed(1)} hour${hours !== 1 ? 's' : ''}`
  
  const days = hours / 24
  if (days < 365) return `${days.toFixed(1)} day${days !== 1 ? 's' : ''}`
  
  const years = days / 365
  if (years < 1000000) return `${years.toFixed(1)} year${years !== 1 ? 's' : ''}`
  
  return 'Centuries'
}

/**
 * Calculate password strength score and label
 */
export const calculatePasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'bg-red-500',
      textColor: 'text-red-500'
    }
  }

  let score = 0
  const length = password.length

  // Length scoring
  if (length >= 8) score += 1
  if (length >= 12) score += 1
  if (length >= 16) score += 1
  if (length >= 20) score += 1
  if (length >= 24) score += 1

  // Character variety
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  // Entropy bonus
  const charsetSize = getCharsetSize(password)
  const entropy = calculateEntropy(password, charsetSize)
  if (entropy >= 128) score += 2
  else if (entropy >= 100) score += 1.5
  else if (entropy >= 80) score += 1
  else if (entropy >= 60) score += 0.5

  score = Math.min(score, 10)

  const labels = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
    'Very Strong',
    'Excellent',
    'Outstanding',
    'Exceptional',
    'Perfect'
  ]

  const colors = [
    { bg: 'bg-red-500', text: 'text-red-500' },
    { bg: 'bg-orange-500', text: 'text-orange-500' },
    { bg: 'bg-amber-400', text: 'text-amber-400' },
    { bg: 'bg-yellow-400', text: 'text-yellow-400' },
    { bg: 'bg-emerald-500', text: 'text-emerald-500' },
    { bg: 'bg-teal-500', text: 'text-teal-500' },
    { bg: 'bg-cyan-500', text: 'text-cyan-500' },
    { bg: 'bg-blue-500', text: 'text-blue-500' },
    { bg: 'bg-indigo-500', text: 'text-indigo-500' },
    { bg: 'bg-purple-500', text: 'text-purple-500' }
  ]

  const index = Math.min(Math.floor(score), 9)
  
  return {
    score: Math.round(score * 10) / 10,
    label: labels[index],
    color: colors[index].bg,
    textColor: colors[index].text,
    entropy: entropy.toFixed(2)
  }
}

