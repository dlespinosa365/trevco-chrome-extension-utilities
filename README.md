# NetSuite JSON Formatter - Chrome Extension

This extension automatically detects and formats JSON in NetSuite text fields for better readability.

## Features

- Automatically detects text fields containing JSON in NetSuite
- Formats JSON with proper indentation
- Works with dynamic content (detects newly added elements)
- **Syntax highlighting** with VS Code Dark theme colors:
  - Keys in light blue (#9cdcfe)
  - Braces `{ }` in gold (#ffd700)
  - Strings (values) in orange (#ce9178)
  - Numbers in green (#b5cea8)
  - Booleans and null in blue (#569cd6)
- **Copy to clipboard** button in the top-right corner
- **Image preview modal** - Hover over image URLs to see a preview
  - Small 300x300px modal
  - Shows image dimensions when loaded
  - Displays placeholder and error message if image fails to load
  - Click on image URL to open in a new tab
- Clean and readable interface
- Container respects width and wraps long keys to next line

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked"
5. Select the folder containing the extension files

## Usage

Once installed, the extension will automatically work on NetSuite pages. When it detects a text field containing JSON, it will automatically format it for better readability.

### Image URLs

- **Hover** over any image URL in the JSON to see a preview in a small modal
- The cursor changes to "wait" while the image is loading
- **Click** on an image URL to open it in a new browser tab

### Copy JSON

- Click the "📋 Copiar" button in the top-right corner of any formatted JSON container
- The button will show "✓ Copiado!" when the JSON has been copied to your clipboard

## Files

- `manifest.json` - Extension configuration
- `content.js` - Main script that detects and formats JSON
- `styles.css` - Styles for formatted JSON
- `icon16.png`, `icon48.png`, `icon128.png` - Extension icons

## Notes

- The extension only works on NetSuite domains (`*.netsuite.com` and `*.app.netsuite.com`)
- JSON is formatted with 2-space indentation
- If the content is not valid JSON, the original format is maintained
- Image URLs are detected by checking for HTTP/HTTPS URLs ending with image extensions (.jpg, .jpeg, .png, .gif, .bmp, .webp, .svg, .ico, .tiff, .tif)
- The container width is respected and long keys will wrap to the next line

## License

Free to use and modify.
