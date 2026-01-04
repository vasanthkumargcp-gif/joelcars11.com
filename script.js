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
  container.innerHTML = '';
  
  // Show loading indicator
  const loading = document.getElementById(`loading-${isForSale ? 'cars' : 'sold'}`);
  if (loading) loading.style.display = 'block';

  const items = await fetchFolderContents(basePath);

  if (items.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding: 40px; color: #888;">No items found.</p>';
    if (loading) loading.style.display = 'none';
    return;
  }

  // For Sale section
  if (isForSale) {
    for (const item of items) {
      if (item.type === 'dir') {
        const carDiv = document.createElement('div');
        carDiv.className = 'car-card';
        
        // Car name from folder name
        const carName = item.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        carDiv.innerHTML = `<h3>${carName}</h3>`;

        // Create gallery
        const galleryDiv = document.createElement('div');
        galleryDiv.className = 'gallery';

        const thumbDiv = document.createElement('div');
        thumbDiv.className = 'thumbnails';

        const mainDiv = document.createElement('div');
        mainDiv.className = 'main-image';
        const mainImg = document.createElement('img');
        mainImg.alt = carName;
        mainImg.loading = 'lazy';
        mainDiv.appendChild(mainImg);

        galleryDiv.appendChild(thumbDiv);
        galleryDiv.appendChild(mainDiv);
        carDiv.appendChild(galleryDiv);

        // Fetch car images
        const subItems = await fetchFolderContents(item.path);
        const images = subItems
          .filter(sub => sub.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(sub.name))
          .map(sub => ({
            url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${sub.path}`,
            name: sub.name
          }));

        if (images.length === 0) {
          carDiv.innerHTML += '<p style="padding: 20px; color: #888; text-align: center;">No images</p>';
        } else {
          // Set initial main image
          mainImg.src = images[0].url;
          
          // Create thumbnails
          images.forEach((image, index) => {
            const thumbImg = document.createElement('img');
            thumbImg.src = image.url;
            thumbImg.alt = `View ${carName} image ${index + 1}`;
            
            if (index === 0) {
              thumbImg.classList.add('active');
            }
            
            thumbImg.addEventListener('click', () => {
              mainImg.src = image.url;
              thumbDiv.querySelectorAll('img').forEach(img => img.classList.remove('active'));
              thumbImg.classList.add('active');
              currentIndex = index;
            });
            
            thumbDiv.appendChild(thumbImg);
          });

          // Auto carousel
          if (images.length > 1) {
            let currentIndex = 0;
            const interval = setInterval(() => {
              currentIndex = (currentIndex + 1) % images.length;
              mainImg.src = images[currentIndex].url;
              thumbDiv.querySelectorAll('img').forEach((img, idx) => {
                img.classList.toggle('active', idx === currentIndex);
              });
            }, 3000);
          }
        }

        container.appendChild(carDiv);
      }
    }
  } 
  // Sold section
  else {
    const imageItems = items.filter(item => 
      item.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)
    );
    
    imageItems.forEach(item => {
      const soldDiv = document.createElement('div');
      soldDiv.className = 'sold-card';
      
      const img = document.createElement('img');
      img.src = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
      img.alt = 'Sold car';
      img.loading = 'lazy';
      
      soldDiv.appendChild(img);
      container.appendChild(soldDiv);
    });
  }

  // Hide loading indicator
  if (loading) loading.style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCars('for-sale-container', 'car-for-sale', true);
  loadCars('sold-container', 'car-sold', false);
  
  // Hamburger menu
  const hamburger = document.getElementById('hamburger-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }
  
  // Close modal when clicking outside
  const modal = document.getElementById('image-modal');
  const closeModal = document.querySelector('.close-modal');
  
  if (modal && closeModal) {
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
});
