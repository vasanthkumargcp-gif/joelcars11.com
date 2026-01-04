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
  container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Loading cars...</p>';

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

      const subItems = await fetchFolderContents(item.path);
      const images = subItems
        .filter(sub => sub.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(sub.name))
        .sort((a, b) => a.name.localeCompare(b.name)); // Optional: sort by name

      if (images.length === 0) {
        carDiv.innerHTML += '<p>No images</p>';
      } else {
        // First image = Main photo
        const mainImg = document.createElement('img');
        mainImg.src = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${images[0].path}`;
        mainImg.alt = 'Main';
        mainImg.className = 'car-main-img';
        mainImg.loading = 'lazy';
        carDiv.appendChild(mainImg);

        // Rest = Thumbnails
        if (images.length > 1) {
          const thumbDiv = document.createElement('div');
          thumbDiv.className = 'car-thumbnails';
          for (let i = 1; i < images.length; i++) {
            const img = document.createElement('img');
            img.src = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${images[i].path}`;
            img.alt = images[i].name;
            img.loading = 'lazy';
            thumbDiv.appendChild(img);
          }
          carDiv.appendChild(thumbDiv);
        }
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
