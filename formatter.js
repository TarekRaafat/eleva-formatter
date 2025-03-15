const prettier = require('prettier');

/**
 * Formats an Eleva.js component
 * @param {string} text - The text content to format
 * @param {Object} config - Formatter configuration
 * @returns {string} - Formatted text
 */
function formatElevaComponent(text, config) {
  // First, apply general JavaScript formatting with Prettier
  const prettierFormatted = formatWithPrettier(text, config);
  
  // Then apply Eleva-specific formatting
  return formatElevaSpecific(prettierFormatted, config);
}

/**
 * Format JavaScript with Prettier
 * @param {string} text - The text to format
 * @param {Object} config - Formatter configuration
 * @returns {string} - Formatted text
 */
function formatWithPrettier(text, config) {
  try {
    return prettier.format(text, {
      parser: 'babel',
      singleQuote: config.templateStyle === 'singleQuotes',
      tabWidth: config.indentSize,
      printWidth: 80,
      trailingComma: 'es5',
      bracketSpacing: true,
      semi: true,
    });
  } catch (error) {
    console.error('Prettier formatting error:', error);
    return text; // Return original text if prettier fails
  }
}

/**
 * Apply Eleva-specific formatting rules
 * @param {string} text - The text to format
 * @param {Object} config - Formatter configuration
 * @returns {string} - Formatted text
 */
function formatElevaSpecific(text, config) {
  // Format Eleva component template strings to use backticks
  // and ensure proper indentation of HTML in template strings
  let formattedText = text;
  
  // Regular expression to find Eleva template functions
  const templateRegex = /(template\s*:\s*)\(\s*(?:ctx|context|\w+)\s*\)\s*=>\s*(['"`])([\s\S]*?)(\2)/g;
  
  formattedText = formattedText.replace(templateRegex, (match, templateDecl, quote, content, endQuote) => {
    // Convert to backticks for template strings
    if (quote !== '`') {
      // Format the HTML content with proper indentation
      const formattedContent = formatTemplateHTML(content, config.indentSize);
      
      return `${templateDecl}(ctx) => \`${formattedContent}\``;
    }
    
    // Already backticks, just format the HTML content
    const formattedContent = formatTemplateHTML(content, config.indentSize);
    
    return `${templateDecl}(ctx) => \`${formattedContent}\``;
  });
  
  // Format signal usage to ensure .value access
  formattedText = formatSignalUsage(formattedText);
  
  // Format style functions to use backticks
  const styleRegex = /(style\s*:\s*)\(\s*(?:ctx|context|\w+)\s*\)\s*=>\s*(['"`])([\s\S]*?)(\2)/g;
  
  formattedText = formattedText.replace(styleRegex, (match, styleDecl, quote, content, endQuote) => {
    if (quote !== '`') {
      // Format the CSS content with proper indentation
      const formattedContent = formatCSS(content, config.indentSize);
      
      return `${styleDecl}(ctx) => \`${formattedContent}\``;
    }
    
    // Already backticks, just format the CSS
    const formattedContent = formatCSS(content, config.indentSize);
    
    return `${styleDecl}(ctx) => \`${formattedContent}\``;
  });
  
  // Format setup function spacing and structure
  formattedText = formatSetupFunction(formattedText, config.indentSize);
  
  // Format event handlers to ensure proper spacing
  formattedText = formatEventHandlers(formattedText);
  
  return formattedText;
}

/**
 * Format template HTML content with proper indentation
 * @param {string} html - HTML content to format
 * @param {number} indentSize - Size of indentation
 * @returns {string} - Formatted HTML
 */
function formatTemplateHTML(html, indentSize) {
  // Simple HTML formatting for template strings
  // This is a basic implementation; a real formatter would use a proper HTML parser
  
  // Clean up excess whitespace
  let cleaned = html.trim()
    .replace(/\s+/g, ' ')
    .replace(/> </g, '>\n<')
    .replace(/<\/([a-z0-9]+)><([a-z0-9]+)>/gi, '</$1>\n<$2>');
  
  // Apply indentation
  let depth = 0;
  let indent = ' '.repeat(indentSize);
  let lines = cleaned.split('\n');
  let formatted = [];
  
  for (let line of lines) {
    let trimmed = line.trim();
    
    // Check for closing tags to decrease indent level
    if (trimmed.match(/^<\//) && depth > 0) {
      depth--;
    }
    
    // Add the line with proper indentation
    formatted.push(indent.repeat(depth) + trimmed);
    
    // Check for opening tags to increase indent level
    if (trimmed.match(/<[^/][^>]*>/) && !trimmed.match(/<[^/][^>]*\/>/)) {
      depth++;
    }
  }
  
  return formatted.join('\n');
}

/**
 * Format CSS content with proper indentation
 * @param {string} css - CSS content to format
 * @param {number} indentSize - Size of indentation
 * @returns {string} - Formatted CSS
 */
function formatCSS(css, indentSize) {
  // Simple CSS formatting
  // Again, a real formatter would use a proper CSS parser
  let cleaned = css.trim();
  
  // Format rule blocks
  cleaned = cleaned.replace(/\s*{\s*/g, ' {\n')
    .replace(/;\s*/g, ';\n')
    .replace(/\s*}\s*/g, '\n}\n');
  
  // Apply indentation
  let depth = 0;
  let indent = ' '.repeat(indentSize);
  let lines = cleaned.split('\n');
  let formatted = [];
  
  for (let line of lines) {
    let trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check for closing braces to decrease indent
    if (trimmed === '}' && depth > 0) {
      depth--;
    }
    
    // Add the line with proper indentation
    formatted.push(indent.repeat(depth) + trimmed);
    
    // Check for opening braces to increase indent
    if (trimmed.includes('{')) {
      depth++;
    }
  }
  
  return formatted.join('\n');
}

/**
 * Format signal usage to ensure .value is properly accessed
 * @param {string} text - Text to format
 * @returns {string} - Formatted text
 */
function formatSignalUsage(text) {
  // This is a simplistic approach - a real implementation would use AST parsing
  
  // Replace {{signal}} with {{signal.value}}
  const interpolationRegex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  let formatted = text.replace(interpolationRegex, (match, signalName) => {
    // Skip replacement if it's already using .value or it's a method call or not a signal
    if (match.includes('.value') || match.includes('(') || 
        !text.includes(`const ${signalName} = signal(`)) {
      return match;
    }
    
    return `{{ ${signalName}.value }}`;
  });
  
  // Format inline signal access in event handlers and other places
  const signalAccessRegex = /\b([a-zA-Z0-9_]+)(?!\s*\(|\.)(?=\s*(?:[+=\-*/]|$))/g;
  
  // This regex will need contextual awareness to only target signals
  // A full solution would need to parse the JavaScript AST
  
  return formatted;
}

/**
 * Format Eleva setup function for consistency
 * @param {string} text - Text to format
 * @param {number} indentSize - Size of indentation
 * @returns {string} - Formatted text
 */
function formatSetupFunction(text, indentSize) {
  // Find setup function block
  const setupRegex = /(setup\s*:\s*\(\{\s*(?:signal|props|emitter|on\w+|[^}]+)\s*\}\)\s*(?:=>|\{))([\s\S]*?)(\}|(?:=>|,)\s*\{)/g;
  
  return text.replace(setupRegex, (match, setupStart, setupBody, setupEnd) => {
    // Check if using arrow function or regular function syntax
    const isArrowFn = setupStart.includes('=>');
    
    // Format the structure based on function style
    if (isArrowFn) {
      // For arrow functions, ensure clean destructuring and return
      const formattedStart = setupStart.replace(/\(\{\s*([^}]+)\s*\}\)/, ({ $1 }) => {
        const params = $1.split(',').map(p => p.trim()).join(', ');
        return `({ ${params} })`;
      });
      
      return `${formattedStart} ${setupBody} ${setupEnd}`;
    } else {
      // For standard functions, format the setup body
      const indent = ' '.repeat(indentSize);
      const formattedBody = setupBody.trim()
        .split('\n')
        .map(line => `${indent}${line.trim()}`)
        .join('\n');
      
      return `${setupStart}\n${formattedBody}\n${setupEnd}`;
    }
  });
}

/**
 * Format event handlers for consistent spacing and quotes
 * @param {string} text - Text to format
 * @returns {string} - Formatted text
 */
function formatEventHandlers(text) {
  // Format @event="handler" attributes to ensure consistent spacing and quotes
  const eventHandlerRegex = /(@[a-zA-Z][a-zA-Z0-9:-]*)\s*=\s*(['"`])(.*?)\2/g;
  
  return text.replace(eventHandlerRegex, (match, eventName, quote, handlerCode) => {
    // Clean up handler code - remove extra spaces
    const cleanHandler = handlerCode.trim();
    
    // Use single quotes for event handler attributes
    return `${eventName}="${cleanHandler}"`;
  });
}

module.exports = {
  formatElevaComponent
};