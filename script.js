const owner = 'vasanthkumargcp-gif';
const repo = 'joelcars11.com';
const branch = 'main';

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
  container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Loading...</p>';

  const items = await fetchFolderContents(basePath);
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">No items found. Upload to GitHub!</p>';
    return;
  }

  for (const item of items) {
    if (isForSale && item.type === 'dir') {
      // For Sale: Each subfolder = one car
      const carDiv = document.createElement('div');
      carDiv.className = 'car-card';

      carDiv.innerHTML = `<h3>${item.name.toUpperCase().replace(/-/g, ' ')}</h3>`;

      const galleryDiv = document.createElement('div');
      galleryDiv.className = 'gallery';

      const thumbDiv = document.createElement('div');
      thumbDiv.className = 'thumbnails';

      const mainDiv = document.createElement('div');
      mainDiv.className = 'main-image';
      const mainImg = document.createElement('img');
      mainImg.loading = 'lazy';
      mainDiv.appendChild(mainImg);

      galleryDiv.appendChild(thumbDiv);
      galleryDiv.appendChild(mainDiv);
      carDiv.appendChild(galleryDiv);

      const subItems = await fetchFolderContents(item.path);
      const images = subItems
        .filter(sub => sub.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(sub.name))
        .map(sub => `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${sub.path}`);

      if (images.length === 0) {
        carDiv.innerHTML += '<p>No images</p>';
      } else {
        // Set initial main
        mainImg.src = images[0];

        // Create thumbnails
        images.forEach((src, index) => {
          const thumbImg = document.createElement('img');
          thumbImg.src = src;
          thumbImg.alt = `Thumb ${index}`;
          thumbImg.addEventListener('click', () => {
            mainImg.src = src;
            currentIndex = index; // For auto-carousel sync
          });
          thumbDiv.appendChild(thumbImg);
        });

        // Auto-carousel
        let currentIndex = 0;
        const interval = setInterval(() => {
          currentIndex = (currentIndex + 1) % images.length;
          mainImg.src = images[currentIndex];
        }, 3000); // Every 3 seconds

        // Stop interval if needed (e.g., on mouseover), but simple for now
      }

      container.appendChild(carDiv);

    } else if (!isForSale && item.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)) {
      // Sold: Flat images
      const soldDiv = document.createElement('div');
      soldDiv.className = 'sold-card';

      const img = document.createElement('img');
      img.src = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
      img.alt = item.name;
      img.loading = 'lazy';
      soldDiv.appendChild(img);

      container.appendChild(soldDiv);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCars('for-sale-container', 'car-for-sale', true);
  loadCars('sold-container', 'car-sold', false);
});
