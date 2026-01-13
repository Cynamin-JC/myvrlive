// Fetch links from video-links.json
async function fetchLinks() {
  try {
    const response = await fetch('./video-links.json');
    const videoLinks = await response.json();
    return videoLinks;
  } catch (error) {
    console.error('Error fetching video-links.json:', error);
    return [];
  }
}

// Check the online/offline status of a link
async function checkStatus(url) {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    return response && response.ok;
  } catch {
    return false;
  }
}

// Dynamically update the list in the DOM
async function updateVideoList() {
  const videoList = document.getElementById('video-list');
  const links = await fetchLinks();

  links.forEach(async ({ name, url }) => {
    const isOnline = await checkStatus(url);

    const listItem = document.createElement('li');
    const statusIndicator = document.createElement('span');
    const linkElement = document.createElement('a');

    statusIndicator.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
    linkElement.href = url;
    linkElement.textContent = name;
    linkElement.target = '_blank';

    listItem.appendChild(statusIndicator);
    listItem.appendChild(linkElement);
    videoList.appendChild(listItem);
  });
}

// Call the function to populate the list
updateVideoList();
