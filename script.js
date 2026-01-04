// Template JS code... (include full from tool result)

// Add this at the end for dynamic loading
const owner = 'vasanthkumargcp-gif'; // Replace with your GitHub username
const repo = 'joelcars11.com'; // Replace with your repo name
const branch = 'main'; // Or your default branch
// Keep any other template JS if you have it...

async function fetchFolderContents(path) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Fetch failed');
    return await response.json();
  } catch (error) {
    console.error('Error fetching:', path, error);
    return [];
  }
}

async function loadCars(containerId, basePath, isForSale = true) {
  const container = document.getElementById(containerId);
  container.innerHTML = '<p>Loading cars...</p>'; // Temporary message

  const items = await fetchFolderContents(basePath);

  container.innerHTML = ''; // Clear

  if (items.length === 0) {
    container.innerHTML = '<p>No cars found. Upload images to GitHub!</p>';
    return;
  }

  for (const item of items) {
    if (isForSale && item.type === 'dir') {
      // For car-for-sale: each subfolder = one car
      const carDiv = document.createElement('div');
      carDiv.className = 'car-card'; // You can style this in CSS
      carDiv.innerHTML = `<h3>${item.name.toUpperCase()}</h3>`;

      const subItems = await fetchFolderContents(item.path);
      const images = subItems.filter(sub => sub.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(sub.name));

      if (images.length === 0) {
        carDiv.innerHTML += '<p>No images</p>';
      } else {
        images.forEach(imgData => {
          const img = document.createElement('img');
          img.src = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${imgData.path}`;
          img.alt = imgData.name;
          img.loading = 'lazy';
          img.style.maxWidth = '100%';
          img.style.borderRadius = '10px';
          img.style.margin = '10px 0';
          img.style.boxShadow = '0 0 15px goldenrod'; // Glow effect
          carDiv.appendChild(img);
        });
      }
      container.appendChild(carDiv);

    } else if (!isForSale && item.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)) {
      // For car-sold: flat images
      const imgDiv = document.createElement('div');
      imgDiv.className = 'sold-card';
      const img = document.createElement('img');
      img.src = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
      img.alt = item.name;
      img.loading = 'lazy';
      img.style.maxWidth = '100%';
      img.style.borderRadius = '10px';
      img.style.margin = '10px';
      img.style.boxShadow = '0 0 15px goldenrod';
      imgDiv.appendChild(img);
      container.appendChild(imgDiv);
    }
  }
}

// Load both sections when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadCars('for-sale-container', 'car-for-sale', true);
  loadCars('sold-container', 'car-sold', false);
});
