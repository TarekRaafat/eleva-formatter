/**
 * Detects if the file contains Eleva.js components
 * @param {string} text - The text content to check
 * @returns {boolean} - True if Eleva components are detected
 */
function detectElevaComponents(text) {
    // Check for common Eleva.js signatures
    const elevaPatterns = [
      // Check for Eleva constructor
      /new\s+Eleva\s*\(/,
      
      // Check for component registration
      /\.component\s*\(\s*['"`][^'"`]+['"`]\s*,/,
      
      // Check for mount method
      /\.mount\s*\(\s*document\.(?:get|query)/,
      
      // Check for signal usage in setup function
      /setup\s*:\s*\(\s*\{\s*signal\s*\}/,
      
      // Check for template function
      /template\s*:\s*\(\s*(?:ctx|context|\w+)\s*\)\s*=>/,
      
      // Check for signal declaration
      /const\s+\w+\s*=\s*signal\s*\(/
    ];
    
    // Return true if any Eleva pattern is found
    return elevaPatterns.some(pattern => pattern.test(text));
  }
  
  module.exports = {
    detectElevaComponents
  };