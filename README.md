# Video Link Indicator

A Google-style web application that displays a list of video links with live online/offline indicators. Fully compatible with Google Sites.

## Features

- 🎨 Clean Google-inspired design
- 📋 **Video link list** with status indicators for each link
- 🔴/🟢 **Live indicators** next to each link (online/offline)
- ➕ **Add links** via input field
- 🗑️ **Delete links** from the list
- 🔃 **Manual refresh** for individual links
- ⚡ **Auto-refresh** - rechecks all links every 30 seconds
- 📹 **Video preview** - click any link to play the video
- 🌐 **Google Sites compatible** - single HTML file with inline CSS/JS
- 🔒 Secure URL validation (only http/https protocols)

## How to Use

### For Regular Web Hosting:
1. Open `index.html` in a web browser
2. The premade link (cynamin.live.mp4) will automatically be checked
3. Add more links by entering URLs in the input field and clicking "Add Link"
4. Watch the indicators update automatically

### For Google Sites:
1. Copy the entire contents of `index.html`
2. In Google Sites, add an "Embed" element
3. Paste the HTML code
4. The application will work directly in your Google Site

## Status Indicators

- 🔵 **Blue (Checking)**: Currently checking the link status
- 🟢 **Green (Online)**: Video link is accessible and live
- 🔴 **Red (Offline)**: Video link is not accessible

## Example

The application comes with a premade link:
```
https://stream.vrcdn.live/live/cynamin.live.mp4
```

You can add more similar links using the input field.

## Technical Details

- **Video Detection**: Uses JavaScript's Video API to check if a video URL is accessible by attempting to load its metadata
- **Auto-Refresh**: Automatically rechecks all links every 30 seconds to keep status current
- **Timeout**: 10-second timeout per check to prevent hanging
- **CORS Support**: Includes crossOrigin attribute for cross-domain video checking
- **Memory Safe**: Properly cleans up video elements to prevent memory leaks

### Google Sites Compatibility
- All CSS and JavaScript are inline (no external files needed)
- No localStorage or external dependencies
- Works in restricted iframe environments
- ES5-compatible JavaScript for broad browser support

## Browser Compatibility

Works with all modern browsers that support:
- HTML5 Video API
- JavaScript ES5+
- CSS3

## Files

- `index.html` - Complete standalone application (use this for Google Sites)
- `style.css` - Separate CSS file (optional, not needed if using inline version)
- `script.js` - Separate JS file (optional, not needed if using inline version)

**Note**: For Google Sites, only `index.html` is needed as it contains everything inline.
