# Eleva.js Formatter for VS Code

<p align="center">
  <img src="images/eleva-logo.png" alt="Eleva Formatter Logo" width="200">
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=TarekRaafat.eleva-formatter">
    <img src="https://img.shields.io/visual-studio-marketplace/v/TarekRaafat.eleva-formatter.svg?style=flat-square&label=VS%20Marketplace&logo=visual-studio-code" alt="Visual Studio Marketplace Version">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=TarekRaafat.eleva-formatter">
    <img src="https://img.shields.io/visual-studio-marketplace/i/TarekRaafat.eleva-formatter.svg?style=flat-square" alt="Visual Studio Marketplace Installs">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=TarekRaafat.eleva-formatter">
    <img src="https://img.shields.io/visual-studio-marketplace/r/TarekRaafat.eleva-formatter.svg?style=flat-square" alt="Visual Studio Marketplace Rating">
  </a>
  <a href="https://github.com/TarekRaafat/eleva-formatter/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/TarekRaafat/eleva-formatter.svg?style=flat-square" alt="License">
  </a>
</p>

A VS Code extension that provides intelligent code formatting and syntax highlighting for [Eleva.js](https://github.com/TarekRaafat/eleva) - the minimalist, lightweight, pure vanilla JavaScript frontend runtime framework.

## Features

- **Automatic Component Detection** - Detects Eleva.js components in your JavaScript files
- **Template String Formatting** - Properly formats HTML in template strings
- **Signal Usage Formatting** - Ensures proper `.value` access for signals
- **Style Function Formatting** - Formats CSS in style functions
- **Setup Function Formatting** - Standardizes setup function structure
- **Format On Save** - Optional automatic formatting when saving files
- **Custom Keybinding** - Format with `Ctrl+Alt+E` / `Cmd+Alt+E`
- **Right-Click Format** - Format directly from the context menu
- **Syntax Highlighting** - Highlights Eleva.js event directives (@click, @input, etc.)
- **Signal Highlighting** - Colorizes signal interpolations in template strings

<p align="center">
  <img src="images/eleva-formatter-demo.gif" alt="Eleva Formatter Demo" width="600">
</p>

## Installation

1. Open VS Code
2. Go to Extensions (or press `Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Eleva.js Formatter"
4. Click Install

Or install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=TarekRaafat.eleva-formatter).

## Usage

### Manual Formatting

- **Keyboard Shortcut**: Press `Ctrl+Alt+E` / `Cmd+Alt+E` when editing a JavaScript file
- **Command Palette**: Press `Ctrl+Shift+P` / `Cmd+Shift+P` and search for "Format with Eleva.js Formatter"
- **Context Menu**: Right-click in the editor and select "Format with Eleva.js Formatter"

### Automatic Formatting

Enable "Format on Save" in the extension settings to automatically format Eleva.js files when saving.

## Extension Settings

This extension contributes the following settings:

* `elevaFormatter.enable`: Enable/disable the extension
* `elevaFormatter.formatOnSave`: Format files automatically on save
* `elevaFormatter.templateStyle`: Preferred quote style for template strings (backticks, singleQuotes, doubleQuotes)
* `elevaFormatter.indentSize`: Number of spaces for indentation
* `elevaFormatter.enableHighlighting`: Enable/disable syntax highlighting for Eleva.js events and signals

You can modify these settings in VS Code's settings:

1. Go to File > Preferences > Settings (or press `Ctrl+,` / `Cmd+,`)
2. Search for "Eleva" to find all formatter settings
3. Adjust the settings to your preference

## Formatting Rules

The Eleva.js Formatter applies these key formatting rules:

1. **Template Functions**
   - Consistently uses backticks for template strings
   - Properly indents HTML content
   - Formats interpolation expressions for readability

2. **Signal Access**
   - Ensures consistent `.value` access for Signal objects
   - Formats signal usage in template interpolation

3. **Style Functions**
   - Consistently uses backticks for CSS strings
   - Properly indents and formats CSS content

4. **Setup Functions**
   - Standardizes destructuring pattern
   - Ensures consistent return structure
   - Formats signal declarations

## Syntax Highlighting

The extension provides enhanced syntax highlighting for Eleva.js specific syntax:

- **Event Directives**: `@click`, `@input`, `@keyup`, etc. are highlighted in a distinct color (pink/red by default)
- **Signal Interpolations**: `{{ count.value }}` expressions are highlighted to make them stand out (blue by default)
- **Component Properties**: `eleva-prop-*` attributes are highlighted as component properties (green by default)

This makes it easier to visually identify different parts of your Eleva.js templates and catch potential errors.

<p align="center">
  <img src="images/eleva-highlighting-demo.png" alt="Eleva Syntax Highlighting Demo" width="600">
</p>

## Example

Before formatting:

```javascript
app.component("counter", {
setup: ({signal}) => {
const count = signal(0);
function increment() { count.value++; }
return {count, increment}
},
template: (ctx) => "<div><h1>Count: {{count}}</h1><button @click='increment'>+</button></div>",
style: (ctx) => "div { padding: 1rem; } h1 { color: blue; }"
});
```

After formatting:

```javascript
app.component("counter", {
  setup: ({ signal }) => {
    const count = signal(0);
    function increment() {
      count.value++;
    }
    return { count, increment };
  },
  template: (ctx) => `
    <div>
      <h1>Count: {{ count.value }}</h1>
      <button @click="increment">+</button>
    </div>
  `,
  style: (ctx) => `
    div {
      padding: 1rem;
    }
    h1 {
      color: blue;
    }
  `
});
```

## Compatibility

This extension works with:

- Eleva.js v1.0.0 and above
- JavaScript files (.js)
- TypeScript files (.ts) containing Eleva.js components

## Known Issues & Limitations

- Complex nested signal expressions may need manual adjustments
- Deep HTML structure formatting is limited by the simplified HTML parser
- Only file-level formatting is supported (no selection-specific formatting yet)

## Roadmap

- [ ] Support for formatting selected code regions
- [ ] Advanced HTML parser for better template formatting
- [ ] Snippets for common Eleva.js patterns
- [ ] Integration with ESLint rules specific to Eleva.js
- [ ] TypeScript declarations formatting
- [ ] IntelliSense for Eleva.js APIs

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## License

This extension is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [Eleva.js](https://github.com/TarekRaafat/eleva) - The minimalist JavaScript framework that inspired this extension
- [Prettier](https://prettier.io/) - Used for base JavaScript formatting

---

<p align="center">
  <b>Made with ❤️ by <a href="https://github.com/TarekRaafat">Tarek Raafat</a></b>
</p>