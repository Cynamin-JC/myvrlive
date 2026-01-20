const https = require('https');
const http = require('http');
const fs = require('fs');
const { URL } = require('url');

// Constants
const TWITCH_LIVE_INDICATOR = '"isLiveBroadcast":true';

// Read video-links.json
const videoLinksPath = './video-links.json';
const videoLinks = JSON.parse(fs.readFileSync(videoLinksPath, 'utf8'));

// Helper function to make HTTP/HTTPS requests with timeout
function makeRequest(url, timeout = 5000) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'HEAD',
      timeout: timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = protocol.request(options, (res) => {
      // For video files, accept 200 or 206 (partial content)
      resolve(res.statusCode === 200 || res.statusCode === 206);
      req.destroy();
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Check if a video link is accessible via HEAD request
 * @param {string} url - The video URL to check
 * @returns {Promise<boolean>} True if the video is accessible (status 200 or 206), false otherwise
 */
async function checkVideoLink(url) {
  try {
    return await makeRequest(url);
  } catch (error) {
    console.error(`Error checking video link ${url}:`, error.message);
    return false;
  }
}

/**
 * Check if a Twitch stream is live by parsing the channel page HTML
 * @param {string} username - The Twitch username to check
 * @returns {Promise<boolean>} True if the stream is live, false otherwise
 */
async function checkTwitchStatus(username) {
  try {
    const url = `https://www.twitch.tv/${username}`;
    return new Promise((resolve) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      }, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
          // Early exit if we find the indicator
          if (data.includes(TWITCH_LIVE_INDICATOR)) {
            res.destroy();
            resolve(true);
          }
        });
        
        res.on('end', () => {
          resolve(data.includes(TWITCH_LIVE_INDICATOR));
        });
      }).on('error', () => {
        resolve(false);
      }).on('timeout', () => {
        resolve(false);
      });
    });
  } catch (error) {
    console.error(`Error checking Twitch status for ${username}:`, error.message);
    return false;
  }
}

/**
 * Check if a Kick stream is live via the Kick API
 * @param {string} username - The Kick username to check
 * @returns {Promise<boolean>} True if the stream is live, false otherwise
 */
async function checkKickStatus(username) {
  try {
    const url = `https://kick.com/api/v2/channels/${username}`;
    return new Promise((resolve) => {
      https.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000
      }, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json?.livestream?.is_live === true);
          } catch {
            resolve(false);
          }
        });
      }).on('error', () => {
        resolve(false);
      }).on('timeout', () => {
        resolve(false);
      });
    });
  } catch (error) {
    console.error(`Error checking Kick status for ${username}:`, error.message);
    return false;
  }
}

// Determine status for a video link
async function getStreamStatus(video) {
  const url = video.url;
  
  try {
    if (url.includes('twitch.tv')) {
      const parts = url.split('twitch.tv/');
      if (parts.length < 2 || !parts[1]) {
        console.error(`Invalid Twitch URL format: ${url}`);
        return 'offline';
      }
      // Extract username only (before any additional path or query params)
      const username = parts[1].split('/')[0].split('?')[0];
      if (!username) {
        console.error(`Could not extract Twitch username from: ${url}`);
        return 'offline';
      }
      const isLive = await checkTwitchStatus(username);
      return isLive ? 'online' : 'offline';
    } else if (url.includes('kick.com')) {
      const parts = url.split('kick.com/');
      if (parts.length < 2 || !parts[1]) {
        console.error(`Invalid Kick URL format: ${url}`);
        return 'offline';
      }
      // Extract username only (before any additional path or query params)
      const username = parts[1].split('/')[0].split('?')[0];
      if (!username) {
        console.error(`Could not extract Kick username from: ${url}`);
        return 'offline';
      }
      const isLive = await checkKickStatus(username);
      return isLive ? 'online' : 'offline';
    } else {
      const isOnline = await checkVideoLink(url);
      return isOnline ? 'online' : 'offline';
    }
  } catch (error) {
    console.error(`Error getting status for ${video.name}:`, error.message);
    return 'offline';
  }
}

// Process streams in batches to avoid overwhelming servers
async function processInBatches(items, batchSize = 10) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}...`);
    const batchResults = await Promise.all(
      batch.map(item => getStreamStatus(item))
    );
    results.push(...batchResults);
    
    // Delay between batches to be respectful to servers and avoid rate limiting
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  return results;
}

// Main function
async function main() {
  console.log(`Checking status for ${videoLinks.length} streams...`);
  
  const statuses = await processInBatches(videoLinks, 10);
  
  // Update video links with statuses
  for (let i = 0; i < videoLinks.length; i++) {
    videoLinks[i].status = statuses[i];
  }
  
  // Count online streams
  const onlineCount = statuses.filter(s => s === 'online').length;
  console.log(`Status check complete: ${onlineCount} online, ${statuses.length - onlineCount} offline`);
  
  // Write updated JSON back to file
  fs.writeFileSync(videoLinksPath, JSON.stringify(videoLinks, null, 2));
  console.log('Updated video-links.json');
}

main().catch(error => {
  console.error('Error in main:', error);
  process.exit(1);
});
