const prettier = require("prettier");

/**
 * Formats an Eleva.js component
 * @param {string} text - The text content to format
 * @param {Object} config - Formatter configuration
 * @returns {string} - Formatted text
 */
function formatElevaComponent(text, config) {
  try {
    // First, apply general JavaScript formatting with Prettier
    const prettierFormatted = formatWithPrettier(text, config);

    // Then apply Eleva-specific formatting
    return formatElevaSpecific(prettierFormatted, config);
  } catch (error) {
    console.error("Error in formatElevaComponent:", error);
    // Return original text if formatting fails to avoid data loss
    return text;
  }
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
      parser: "babel",
      singleQuote: config.templateStyle === "singleQuotes",
      tabWidth: config.indentSize || 2, // Default to 2 if undefined
      printWidth: 80,
      trailingComma: "es5",
      bracketSpacing: true,
      semi: true,
    });
  } catch (error) {
    console.error("Prettier formatting error:", error);
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
  try {
    // Initialize with the input text
    let formattedText = text;

    // Regular expression to find Eleva template functions
    const templateRegex =
      /(template\s*:\s*)\(\s*(?:ctx|context|\w+)\s*\)\s*=>\s*(['"`])([\s\S]*?)(\2)/g;

    formattedText = formattedText.replace(
      templateRegex,
      (match, templateDecl, quote, content, endQuote) => {
        try {
          // Ensure content is not undefined
          const templateContent = content || "";

          // Convert to backticks for template strings
          if (quote !== "`") {
            // Format the HTML content with proper indentation
            const formattedContent = formatTemplateHTML(
              templateContent,
              config.indentSize || 2
            );

            return `${templateDecl}(ctx) => \`${formattedContent}\``;
          }

          // Already backticks, just format the HTML content
          const formattedContent = formatTemplateHTML(
            templateContent,
            config.indentSize || 2
          );

          return `${templateDecl}(ctx) => \`${formattedContent}\``;
        } catch (error) {
          console.error("Error formatting template:", error);
          return match; // Return unchanged if error occurs
        }
      }
    );

    // Format signal usage to ensure .value access
    formattedText = formatSignalUsage(formattedText);

    // Format style functions to use backticks
    const styleRegex =
      /(style\s*:\s*)\(\s*(?:ctx|context|\w+)\s*\)\s*=>\s*(['"`])([\s\S]*?)(\2)/g;

    formattedText = formattedText.replace(
      styleRegex,
      (match, styleDecl, quote, content, endQuote) => {
        try {
          // Ensure content is not undefined
          const styleContent = content || "";

          if (quote !== "`") {
            // Format the CSS content with proper indentation
            const formattedContent = formatCSS(
              styleContent,
              config.indentSize || 2
            );

            return `${styleDecl}(ctx) => \`${formattedContent}\``;
          }

          // Already backticks, just format the CSS
          const formattedContent = formatCSS(
            styleContent,
            config.indentSize || 2
          );

          return `${styleDecl}(ctx) => \`${formattedContent}\``;
        } catch (error) {
          console.error("Error formatting style:", error);
          return match; // Return unchanged if error occurs
        }
      }
    );

    // Format setup function spacing and structure
    formattedText = formatSetupFunction(formattedText, config.indentSize || 2);

    // Format event handlers to ensure proper spacing
    formattedText = formatEventHandlers(formattedText);

    return formattedText;
  } catch (error) {
    console.error("Error in formatElevaSpecific:", error);
    return text; // Return original text if formatting fails
  }
}

/**
 * Format template HTML content with proper indentation
 * @param {string} html - HTML content to format
 * @param {number} indentSize - Size of indentation
 * @returns {string} - Formatted HTML
 */
function formatTemplateHTML(html, indentSize) {
  try {
    // Handle undefined or null HTML
    if (!html) return "";

    // Clean up excess whitespace
    let cleaned = html
      .trim()
      .replace(/\s+/g, " ")
      .replace(/> </g, ">\n<")
      .replace(/<\/([a-z0-9]+)><([a-z0-9]+)>/gi, "</$1>\n<$2>");

    // Apply indentation
    let depth = 0;
    let indent = " ".repeat(indentSize);
    let lines = cleaned.split("\n");
    let formatted = [];

    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) continue;

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

    return formatted.join("\n");
  } catch (error) {
    console.error("Error in formatTemplateHTML:", error);
    return html || ""; // Return original HTML if formatting fails
  }
}

/**
 * Format CSS content with proper indentation
 * @param {string} css - CSS content to format
 * @param {number} indentSize - Size of indentation
 * @returns {string} - Formatted CSS
 */
function formatCSS(css, indentSize) {
  try {
    // Handle undefined or null CSS
    if (!css) return "";

    let cleaned = css.trim();

    // Format rule blocks
    cleaned = cleaned
      .replace(/\s*{\s*/g, " {\n")
      .replace(/;\s*/g, ";\n")
      .replace(/\s*}\s*/g, "\n}\n");

    // Apply indentation
    let depth = 0;
    let indent = " ".repeat(indentSize);
    let lines = cleaned.split("\n");
    let formatted = [];

    for (let line of lines) {
      let trimmed = line.trim();
      if (!trimmed) continue;

      // Check for closing braces to decrease indent
      if (trimmed === "}" && depth > 0) {
        depth--;
      }

      // Add the line with proper indentation
      formatted.push(indent.repeat(depth) + trimmed);

      // Check for opening braces to increase indent
      if (trimmed.includes("{")) {
        depth++;
      }
    }

    return formatted.join("\n");
  } catch (error) {
    console.error("Error in formatCSS:", error);
    return css || ""; // Return original CSS if formatting fails
  }
}

/**
 * Format signal usage to ensure .value is properly accessed
 * @param {string} text - Text to format
 * @returns {string} - Formatted text
 */
function formatSignalUsage(text) {
  try {
    // This is a simplistic approach - a real implementation would use AST parsing

    // Replace {{signal}} with {{signal.value}}
    const interpolationRegex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    let formatted = text.replace(interpolationRegex, (match, signalName) => {
      // Skip replacement if it's already using .value or it's a method call or not a signal
      if (
        match.includes(".value") ||
        match.includes("(") ||
        !text.includes(`const ${signalName} = signal(`)
      ) {
        return match;
      }

      return `{{ ${signalName}.value }}`;
    });

    return formatted;
  } catch (error) {
    console.error("Error in formatSignalUsage:", error);
    return text; // Return original text if formatting fails
  }
}

/**
 * Format Eleva setup function for consistency
 * @param {string} text - Text to format
 * @param {number} indentSize - Size of indentation
 * @returns {string} - Formatted text
 */
function formatSetupFunction(text, indentSize) {
  try {
    // Find setup function block
    const setupRegex =
      /(setup\s*:\s*\(\{\s*(?:signal|props|emitter|on\w+|[^}]+)\s*\}\)\s*(?:=>|\{))([\s\S]*?)(\}|(?:=>|,)\s*\{)/g;

    return text.replace(
      setupRegex,
      (match, setupStart, setupBody, setupEnd) => {
        try {
          // Check if using arrow function or regular function syntax
          const isArrowFn = setupStart.includes("=>");

          // Format the structure based on function style
          if (isArrowFn) {
            // For arrow functions, ensure clean destructuring and return
            const formattedStart = setupStart.replace(
              /\(\{\s*([^}]+)\s*\}\)/,
              (_, $1) => {
                // Handle undefined params
                if (!$1) return "({})";

                const params = $1
                  .split(",")
                  .filter((p) => p && p.trim()) // Filter out empty entries
                  .map((p) => p.trim())
                  .join(", ");

                return `({ ${params} })`;
              }
            );

            return `${formattedStart} ${setupBody || ""} ${setupEnd}`;
          } else {
            // For standard functions, format the setup body
            const indent = " ".repeat(indentSize);

            // Handle undefined body
            const formattedBody = (setupBody || "")
              .trim()
              .split("\n")
              .map((line) => `${indent}${line.trim()}`)
              .join("\n");

            return `${setupStart}\n${formattedBody}\n${setupEnd}`;
          }
        } catch (error) {
          console.error("Error formatting setup function:", error);
          return match; // Return unchanged if error occurs
        }
      }
    );
  } catch (error) {
    console.error("Error in formatSetupFunction:", error);
    return text; // Return original text if formatting fails
  }
}

/**
 * Format event handlers for consistent spacing and quotes
 * @param {string} text - Text to format
 * @returns {string} - Formatted text
 */
function formatEventHandlers(text) {
  try {
    // Format @event="handler" attributes to ensure consistent spacing and quotes
    const eventHandlerRegex = /(@[a-zA-Z][a-zA-Z0-9:-]*)\s*=\s*(['"`])(.*?)\2/g;

    return text.replace(
      eventHandlerRegex,
      (match, eventName, quote, handlerCode) => {
        try {
          // Clean up handler code - remove extra spaces
          const cleanHandler = (handlerCode || "").trim();

          // Use double quotes for event handler attributes
          return `${eventName}="${cleanHandler}"`;
        } catch (error) {
          console.error("Error formatting event handler:", error);
          return match; // Return unchanged if error occurs
        }
      }
    );
  } catch (error) {
    console.error("Error in formatEventHandlers:", error);
    return text; // Return original text if formatting fails
  }
}

module.exports = {
  formatElevaComponent,
};
