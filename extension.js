const vscode = require("vscode");
const { formatElevaComponent } = require("./formatter");
const { detectElevaComponents } = require("./detector");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  console.log("Eleva.js Formatter is now active");

  // Register the formatter command
  let disposable = vscode.commands.registerCommand(
    "elevaFormatter.format",
    function () {
      try {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
          vscode.window.showInformationMessage("No active editor found.");
          return;
        }

        const document = editor.document;
        const text = document.getText();

        // Check if file contains Eleva components
        if (!detectElevaComponents(text)) {
          vscode.window.showInformationMessage(
            "No Eleva.js components detected in this file."
          );
          return;
        }

        // Format the entire document
        const formatted = formatElevaComponent(text, getFormatterConfig());

        // Replace the entire document content
        const fullRange = new vscode.Range(
          document.positionAt(0),
          document.positionAt(text.length)
        );

        editor
          .edit((editBuilder) => {
            editBuilder.replace(fullRange, formatted);
          })
          .then((success) => {
            if (success) {
              vscode.window.showInformationMessage(
                "Eleva.js code formatted successfully."
              );
            } else {
              vscode.window.showErrorMessage("Failed to format Eleva.js code.");
            }
          });
      } catch (error) {
        console.error("Error in formatter command:", error);
        vscode.window.showErrorMessage(`Formatting error: ${error.message}`);
      }
    }
  );

  // Register document formatter
  let documentFormatter =
    vscode.languages.registerDocumentFormattingEditProvider(
      { language: "javascript" },
      {
        provideDocumentFormattingEdits(document) {
          try {
            // Get formatter config
            const config = getFormatterConfig();

            // Get document text
            const text = document.getText();

            // Check if file contains Eleva components
            if (!detectElevaComponents(text)) {
              return [];
            }

            // Format the document
            const formatted = formatElevaComponent(text, config);

            // Return formatting edits
            return [
              vscode.TextEdit.replace(
                new vscode.Range(
                  document.positionAt(0),
                  document.positionAt(text.length)
                ),
                formatted
              ),
            ];
          } catch (error) {
            console.error("Error in document formatter:", error);
            vscode.window.showErrorMessage(
              `Document formatting error: ${error.message}`
            );
            return [];
          }
        },
      }
    );

  // Format on save
  let formatOnSaveDisposable = vscode.workspace.onWillSaveTextDocument(
    (event) => {
      try {
        const config = vscode.workspace.getConfiguration("elevaFormatter");

        if (
          config.get("enable") &&
          config.get("formatOnSave") &&
          event.document.languageId === "javascript"
        ) {
          const text = event.document.getText();

          // Check if file contains Eleva components
          if (!detectElevaComponents(text)) {
            return;
          }

          // Add formatting to list of operations to perform on save
          event.waitUntil(
            Promise.resolve([
              vscode.TextEdit.replace(
                new vscode.Range(
                  event.document.positionAt(0),
                  event.document.positionAt(text.length)
                ),
                formatElevaComponent(text, getFormatterConfig())
              ),
            ])
          );
        }
      } catch (error) {
        console.error("Error in format on save:", error);
        // Don't show error message during save to avoid interfering with the save operation
      }
    }
  );

  // Register semantic token provider for better event highlighting if enabled
  if (
    vscode.workspace
      .getConfiguration("elevaFormatter")
      .get("enableHighlighting")
  ) {
    try {
      const semanticTokensProvider = getSemanticTokensProvider();
      const semanticTokensLegend = new vscode.SemanticTokensLegend(
        ["event", "signal", "property"],
        ["declaration", "readonly", "documentation"]
      );

      let semanticTokensRegistration =
        vscode.languages.registerDocumentSemanticTokensProvider(
          { language: "javascript" },
          semanticTokensProvider,
          semanticTokensLegend
        );

      context.subscriptions.push(semanticTokensRegistration);
    } catch (error) {
      console.error("Error registering semantic tokens provider:", error);
      // Continue without semantic highlighting if it fails
    }
  }

  // Register all disposables
  context.subscriptions.push(disposable);
  context.subscriptions.push(documentFormatter);
  context.subscriptions.push(formatOnSaveDisposable);
}

/**
 * Gets the formatter configuration from VS Code settings
 * @returns {Object} Formatter configuration object
 */
function getFormatterConfig() {
  try {
    const config = vscode.workspace.getConfiguration("elevaFormatter");
    return {
      templateStyle: config.get("templateStyle") || "backticks",
      indentSize: config.get("indentSize") || 2,
    };
  } catch (error) {
    console.error("Error getting formatter config:", error);
    // Return defaults if config retrieval fails
    return { templateStyle: "backticks", indentSize: 2 };
  }
}

/**
 * Creates a semantic tokens provider for Eleva.js template events
 * @returns {vscode.DocumentSemanticTokensProvider} Semantic tokens provider
 */
function getSemanticTokensProvider() {
  return {
    provideDocumentSemanticTokens(document) {
      try {
        const tokenTypes = ["event", "signal", "property"];
        const tokenModifiers = ["declaration", "readonly", "documentation"];
        const builder = new vscode.SemanticTokensBuilder();

        const text = document.getText();
        if (!text) return builder.build();

        // Find template functions
        const templateRegex =
          /template\s*:\s*\(\s*(?:ctx|context|\w+)\s*\)\s*=>\s*(['"`])([\s\S]*?)\1/g;
        let templateMatch;

        while ((templateMatch = templateRegex.exec(text)) !== null) {
          if (!templateMatch[2]) continue; // Skip if template content is undefined

          const templateContent = templateMatch[2];
          const startQuote = templateMatch[1];
          const templateStart =
            templateMatch.index + templateMatch[0].indexOf(templateContent);

          // Find event attributes (@click, @input, etc.)
          const eventRegex = /@([a-zA-Z][a-zA-Z0-9:-]*)\s*=\s*(['"`])(.*?)\2/g;
          let eventMatch;

          while ((eventMatch = eventRegex.exec(templateContent)) !== null) {
            if (!eventMatch[1]) continue; // Skip if event name is undefined

            const eventName = eventMatch[1];
            const attrStart = templateStart + eventMatch.index;

            try {
              // Add token for event attribute
              const line = document.positionAt(attrStart).line;
              const char = document.positionAt(attrStart).character;
              const length = 1 + eventName.length; // Include the @ symbol

              builder.push(line, char, length, 0, 0); // 0 = 'event' type
            } catch (e) {
              console.error("Error highlighting event:", e);
              // Continue to the next event
            }
          }

          // Find signal interpolations
          const signalRegex =
            /\{\{\s*([a-zA-Z][a-zA-Z0-9_\.]*(?:\.value)?)\s*\}\}/g;
          let signalMatch;

          while ((signalMatch = signalRegex.exec(templateContent)) !== null) {
            if (!signalMatch[1]) continue; // Skip if signal name is undefined

            const signalName = signalMatch[1];
            const signalStart = templateStart + signalMatch.index + 2; // Skip {{

            try {
              // Add token for signal
              const line = document.positionAt(signalStart).line;
              const char = document.positionAt(signalStart).character;
              const length = signalName.length;

              builder.push(line, char, length, 1, 0); // 1 = 'signal' type
            } catch (e) {
              console.error("Error highlighting signal:", e);
              // Continue to the next signal
            }
          }
        }

        // Find eleva-prop attributes
        const propRegex = /eleva-prop-([a-zA-Z][a-zA-Z0-9_-]*)/g;
        let propMatch;

        while ((propMatch = propRegex.exec(text)) !== null) {
          if (!propMatch[1]) continue; // Skip if prop name is undefined

          const propName = propMatch[1];
          const propStart = propMatch.index + "eleva-prop-".length;

          try {
            // Add token for property
            const line = document.positionAt(propStart).line;
            const char = document.positionAt(propStart).character;
            const length = propName.length;

            builder.push(line, char, length, 2, 0); // 2 = 'property' type
          } catch (e) {
            console.error("Error highlighting property:", e);
            // Continue to the next property
          }
        }

        return builder.build();
      } catch (error) {
        console.error("Error in semantic token provider:", error);
        return new vscode.SemanticTokensBuilder().build(); // Return empty tokens on error
      }
    },
  };
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
