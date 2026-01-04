// Template JS code... (include full from tool result)

// Add this at the end for dynamic loading
const owner = 'vasanthkumargcp-gif'; // Replace with your GitHub username
const repo = 'joelcars11.com'; // Replace with your repo name
const branch = 'main'; // Or your default branch

async function fetchFolderContents(path) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

async function listImagesInSubfolders(containerId, basePath) {
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear
  const items = await fetchFolderContents(basePath);
  for (const item of items) {
    if (item.type === 'dir') { // Subfolder (for car-for-sale)
      const carDiv = document.createElement('div');
      carDiv.className = 'section-3-product-div-1 hidden';
      carDiv.innerHTML = `<h4>${item.name}</h4>`;
      const subItems = await fetchFolderContents(item.path);
      subItems.filter(sub => sub.type === 'file' && /\.(jpg|jpeg|png|gif)$/i.test(sub.name))
        .forEach(sub => {
          const img = document.createElement('img');
          img.src = `/${sub.path}`; // Relative path on GitHub Pages
          img.alt = sub.name;
          carDiv.appendChild(img);
        });
      container.appendChild(carDiv);
    } else if (item.type === 'file' && /\.(jpg|jpeg|png|gif)$/i.test(item.name)) { // Flat images (for car-sold)
      const imgDiv = document.createElement('div');
      imgDiv.className = 'section-3-product-div-1 hidden';
      const img = document.createElement('img');
      img.src = `/${item.path}`;
      img.alt = item.name;
      imgDiv.appendChild(img);
      container.appendChild(imgDiv);
    }
  }
}

// Load on page ready
document.addEventListener('DOMContentLoaded', () => {
  listImagesInSubfolders('for-sale-container', 'car-for-sale');
  listImagesInSubfolders('sold-container', 'car-sold');
});
