document.addEventListener('DOMContentLoaded', () => {
    // Listen for clicks on the 'Watch' links with class `video-link`
    const videoLinks = document.querySelectorAll('.video-link');
    videoLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default navigation

            // Get the video source from the link's data attribute
            const videoSrc = link.getAttribute('data-video-src');

            // Check if the floating video player already exists
            let videoPlayer = document.getElementById('floating-video-player');
            if (!videoPlayer) {
                // Create the floating video player
                videoPlayer = document.createElement('div');
                videoPlayer.id = 'floating-video-player';
                document.body.appendChild(videoPlayer);

                // Add close button and styling
                videoPlayer.innerHTML = `
                    <video id="floating-video" width="320" height="180" controls autoplay>
                        <source src="" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                    <button id="close-video-player">Close</button>
                `;

                videoPlayer.style.position = 'fixed';
                videoPlayer.style.bottom = '20px';
                videoPlayer.style.right = '20px';
                videoPlayer.style.zIndex = '1000';
                videoPlayer.style.backgroundColor = '#fff';
                videoPlayer.style.boxShadow = '0px 4px 6px rgba(0,0,0,0.1)';
                videoPlayer.style.padding = '10px';
                videoPlayer.style.borderRadius = '8px';

                // Close button functionality
                document.getElementById('close-video-player').addEventListener('click', () => {
                    videoPlayer.remove();
                });
            }

            // Update the video player source
            const videoElement = document.getElementById('floating-video');
            if (videoElement) {
                const sourceElement = videoElement.querySelector('source');
                sourceElement.src = videoSrc;
                videoElement.load(); // Reload the video with the new source
                videoElement.play(); // Play the video
            }
        });
    });
});
