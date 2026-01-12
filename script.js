document.addEventListener('DOMContentLoaded', function() {
    const videoUrlInput = document.getElementById('videoUrl');
    const checkBtn = document.getElementById('checkBtn');
    const indicator = document.getElementById('indicator');
    const indicatorText = indicator.querySelector('.indicator-text');
    const videoPreview = document.getElementById('videoPreview');
    const videoPlayer = document.getElementById('videoPlayer');
    const videoList = document.getElementById('videoList');

    // Configuration constants
    const CHECK_TIMEOUT_MS = 10000;
    const SUPPORTED_FORMATS = ['.mp4'];
    const RECHECK_INTERVAL_MS = 30000; // Recheck every 30 seconds

    // Premade list of video links
    let videoLinks = [
        'https://stream.vrcdn.live/live/cynamin.live.mp4'
    ];

    // Initialize the video list
    initializeVideoList();
    
    // Start periodic checks
    setInterval(recheckAllLinks, RECHECK_INTERVAL_MS);

    // Check link when button is clicked
    checkBtn.addEventListener('click', function() {
        const url = videoUrlInput.value.trim();
        if (url) {
            addVideoToList(url);
            videoUrlInput.value = '';
        } else {
            showIndicator('offline', 'Please enter a video URL');
        }
    });

    // Check link when Enter is pressed
    videoUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const url = videoUrlInput.value.trim();
            if (url) {
                addVideoToList(url);
                videoUrlInput.value = '';
            }
        }
    });

    function addVideoToList(url) {
        // Validate URL format
        const urlObj = isValidUrl(url);
        if (!urlObj) {
            showIndicator('offline', 'Invalid URL format');
            return;
        }

        // Check if URL ends with supported format
        const pathname = urlObj.pathname.toLowerCase();
        const hasValidFormat = SUPPORTED_FORMATS.some(format => 
            pathname.endsWith(format)
        );
        if (!hasValidFormat) {
            showIndicator('offline', 'URL must point to an .mp4 file');
            return;
        }

        // Check if URL already exists
        if (videoLinks.includes(url)) {
            showIndicator('checking', 'Link already in list, rechecking...');
            checkVideoInList(url);
            return;
        }

        // Add to list
        videoLinks.push(url);
        showIndicator('checking', 'Added to list, checking status...');
        
        // Create list item and check status
        createVideoListItem(url);
        checkVideoInList(url);
    }

    function initializeVideoList() {
        videoList.innerHTML = '';
        videoLinks.forEach(url => {
            createVideoListItem(url);
            checkVideoInList(url);
        });
    }

    function createVideoListItem(url) {
        const existingItem = document.querySelector(`[data-url="${url}"]`);
        if (existingItem) return;

        const item = document.createElement('div');
        item.className = 'video-item';
        item.setAttribute('data-url', url);
        
        item.innerHTML = `
            <div class="video-item-indicator checking"></div>
            <div class="video-item-content">
                <a href="#" class="video-item-url" title="${url}">${url}</a>
                <div class="video-item-status">Checking...</div>
            </div>
        `;

        // Add click event to play video
        const urlLink = item.querySelector('.video-item-url');
        urlLink.addEventListener('click', function(e) {
            e.preventDefault();
            loadVideoPreview(url);
        });

        videoList.appendChild(item);
    }

    function checkVideoInList(url) {
        const item = document.querySelector(`[data-url="${url}"]`);
        if (!item) return;

        const indicator = item.querySelector('.video-item-indicator');
        const status = item.querySelector('.video-item-status');

        // Set checking state
        indicator.className = 'video-item-indicator checking';
        status.textContent = 'Checking...';
        status.className = 'video-item-status';

        // Try to load the video
        const testVideo = document.createElement('video');
        
        let loaded = false;
        let errored = false;

        // Set a timeout for the check
        const timeout = setTimeout(() => {
            if (!loaded && !errored) {
                indicator.className = 'video-item-indicator offline';
                status.textContent = 'Offline';
                status.className = 'video-item-status offline';
                cleanupVideo(testVideo);
            }
        }, CHECK_TIMEOUT_MS);

        testVideo.addEventListener('loadedmetadata', function() {
            loaded = true;
            clearTimeout(timeout);
            indicator.className = 'video-item-indicator online';
            status.textContent = 'Online';
            status.className = 'video-item-status online';
            cleanupVideo(testVideo);
        });

        testVideo.addEventListener('error', function() {
            errored = true;
            clearTimeout(timeout);
            indicator.className = 'video-item-indicator offline';
            status.textContent = 'Offline';
            status.className = 'video-item-status offline';
            cleanupVideo(testVideo);
        });

        // Start loading the video
        testVideo.src = url;
        testVideo.load();
    }

    function recheckAllLinks() {
        videoLinks.forEach(url => {
            checkVideoInList(url);
        });
    }

    function cleanupVideo(videoElement) {
        // Clean up video element to prevent memory leaks
        try {
            videoElement.src = '';
            videoElement.load();
            if (videoElement.parentNode) {
                videoElement.remove();
            }
        } catch (e) {
            // Safely ignore cleanup errors
        }
    }

    function showIndicator(status, message) {
        indicator.classList.remove('hidden', 'live', 'offline', 'checking');
        indicator.classList.add(status);
        indicatorText.textContent = message;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            indicator.classList.add('hidden');
        }, 3000);
    }

    function loadVideoPreview(url) {
        videoPlayer.src = url;
        videoPreview.classList.remove('hidden');
        // Scroll to video preview
        videoPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function isValidUrl(string) {
        try {
            const url = new URL(string);
            // Only allow http and https protocols for security
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                return null;
            }
            return url;
        } catch (_) {
            return null;
        }
    }
});
