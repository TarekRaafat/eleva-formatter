# Change Log

All notable changes to the Eleva.js Formatter extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## v0.1.1 ✨ (16-03-2025)

### ➕ Added

- _N/A_ – No additions in this release.

### 🎛️ Changed

- Enhanced logging for better debugging and error troubleshooting
- Added default values for configuration parameters to prevent undefined errors
- Improved detection of Eleva.js components with more robust regex patterns

### 🔧 Fixed

- Fixed "Cannot read properties of undefined (reading 'split')" error when formatting certain Eleva.js components
- Added comprehensive null/undefined value checks throughout the formatter
- Improved error handling to prevent crashes during formatting operations
- Fixed event directive highlighting in complex template strings
- Added robust error recovery to maintain original content when formatting fails

---

## v0.1.0 (15-03-2025)

### ➕ Added

- Initial release of Eleva.js Formatter
- Formatting for Eleva.js component template strings with proper HTML indentation
- Signal usage formatting to ensure proper `.value` access
- Style function formatting with CSS indentation and structure
- Setup function formatting with standardized structure
- Event handler formatting for consistent spacing and quotes
- Automatic component detection to only format Eleva.js files
- Format on save functionality (configurable through settings)
- Custom keybinding (Ctrl+Alt+E / Cmd+Alt+E) for manual formatting
- Right-click context menu for formatting
- Syntax highlighting for Eleva.js event directives (@click, @input, etc.)
- Signal interpolation highlighting in template strings
- Component property highlighting for eleva-prop-\* attributes
- Configuration settings for indentation, quote style, and enabling/disabling features
- Documentation with examples and configuration options

### 🎛️ Changed

- _N/A_ – No changes in this release.

### 🔧 Fixed

- _N/A_ – No bug fixes in this release.
