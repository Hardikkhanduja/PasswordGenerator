import { useCallback } from 'react'

/**
 * Custom hook for generating cryptographically secure passwords
 * Uses Web Crypto API for better randomness
 */
export const usePasswordGenerator = () => {
  /**
   * Get cryptographically secure random values
   */
  const getSecureRandomValues = useCallback((length) => {
    const array = new Uint32Array(length)
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(array)
      return Array.from(array)
    }
    // Fallback for older browsers
    return Array.from({ length }, () => Math.floor(Math.random() * 4294967296))
  }, [])

  /**
   * Generate password using Web Crypto API
   */
  const generatePassword = useCallback((options) => {
    const {
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSpecial,
      excludeAmbiguous,
      avoidRepeating,
      mode
    } = options

    let charSet = ''
    let password = ''

    // Build character set based on options
    if (mode === 'standard') {
      if (includeLowercase) {
        charSet += excludeAmbiguous 
          ? 'abcdefghijkmnopqrstuvwxyz' 
          : 'abcdefghijklmnopqrstuvwxyz'
      }
      if (includeUppercase) {
        charSet += excludeAmbiguous 
          ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' 
          : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      }
      if (includeNumbers) {
        charSet += excludeAmbiguous 
          ? '23456789' 
          : '0123456789'
      }
      if (includeSpecial) {
        charSet += '!@#$%^&*()_+-=[]{}|;:,.<>?'
      }

      if (charSet.length === 0) {
        charSet = 'abcdefghijklmnopqrstuvwxyz' // fallback
      }

      // Generate password with secure randomness
      const randomValues = getSecureRandomValues(length)
      for (let i = 0; i < length; i++) {
        let char
        let attempts = 0
        do {
          const index = randomValues[i] % charSet.length
          char = charSet[index]
          attempts++
          if (attempts > 100) break // Prevent infinite loop
        } while (avoidRepeating && i > 0 && char === password[i - 1])
        
        password += char
      }
    } else if (mode === 'pin') {
      const numbers = excludeAmbiguous ? '23456789' : '0123456789'
      const randomValues = getSecureRandomValues(length)
      for (let i = 0; i < length; i++) {
        let num
        let attempts = 0
        do {
          const index = randomValues[i] % numbers.length
          num = numbers[index]
          attempts++
          if (attempts > 100) break
        } while (avoidRepeating && i > 0 && num === password[i - 1])
        
        password += num
      }
    } else if (mode === 'pronounceable') {
      const consonants = 'bcdfghjklmnpqrstvwxyz'
      const vowels = 'aeiou'
      const randomValues = getSecureRandomValues(length)
      
      for (let i = 0; i < length; i++) {
        const charset = i % 2 === 0 ? consonants : vowels
        const index = randomValues[i] % charset.length
        password += charset[index]
      }
      
      if (includeUppercase && password.length > 0) {
        password = password.charAt(0).toUpperCase() + password.slice(1)
      }
    } else if (mode === 'passphrase') {
      const words = [
        'apple', 'banana', 'cherry', 'dragon', 'eagle', 'forest', 'galaxy', 'harbor',
        'island', 'jaguar', 'knight', 'lighthouse', 'mountain', 'nebula', 'ocean', 'phoenix',
        'quantum', 'rainbow', 'sunset', 'thunder', 'universe', 'volcano', 'whisper', 'zenith',
        'adventure', 'brilliant', 'champion', 'discover', 'elephant', 'fantasy', 'grateful', 'harmony'
      ]
      const wordCount = Math.max(4, Math.floor(length / 6))
      const randomValues = getSecureRandomValues(wordCount)
      const selectedWords = []
      
      for (let i = 0; i < wordCount; i++) {
        const index = randomValues[i] % words.length
        selectedWords.push(words[index])
      }
      
      password = selectedWords.join('-')
      
      // Add numbers/special chars if enabled and needed
      if (includeNumbers && password.length < length) {
        const numRandom = getSecureRandomValues(1)[0]
        password += (numRandom % 1000).toString()
      }
      if (includeSpecial && password.length < length) {
        const specialChars = '!@#$%^&*'
        const spRandom = getSecureRandomValues(1)[0]
        password += specialChars[spRandom % specialChars.length]
      }
    }
    
    // If no password was generated, generate a fallback
    if (!password || password.length === 0) {
      const fallbackChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const fallbackRandom = getSecureRandomValues(length)
      for (let i = 0; i < length; i++) {
        password += fallbackChars[fallbackRandom[i] % fallbackChars.length]
      }
    }

    return password
  }, [getSecureRandomValues])

  return { generatePassword }
}

