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
  container.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding: 40px;">Loading cars...</p>';

  const items = await fetchFolderContents(basePath);
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding: 40px; color: #999;">No items found. Upload cars to GitHub!</p>';
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

        // Create gallery structure
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

        // Fetch car images from subfolder
        const subItems = await fetchFolderContents(item.path);
        const images = subItems
          .filter(sub => sub.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(sub.name))
          .map(sub => ({
            url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${sub.path}`,
            name: sub.name
          }));

        if (images.length === 0) {
          carDiv.innerHTML += '<p style="color: #999; padding: 20px;">No images available</p>';
        } else {
          // Set initial main image
          mainImg.src = images[0].url;
          
          // Create thumbnails
          images.forEach((image, index) => {
            const thumbImg = document.createElement('img');
            thumbImg.src = image.url;
            thumbImg.alt = `Thumbnail ${index + 1}`;
            thumbImg.title = `Click to view`;
            
            // Add active class to first thumbnail
            if (index === 0) {
              thumbImg.classList.add('active');
            }
            
            // Click event to change main image
            thumbImg.addEventListener('click', () => {
              // Update main image
              mainImg.src = image.url;
              
              // Remove active class from all thumbnails
              thumbDiv.querySelectorAll('img').forEach(img => img.classList.remove('active'));
              
              // Add active class to clicked thumbnail
              thumbImg.classList.add('active');
              
              // Restart auto carousel from this image
              currentIndex = index;
              clearInterval(interval);
              startCarousel();
            });
            
            thumbDiv.appendChild(thumbImg);
          });

          // Auto-carousel functionality
          let currentIndex = 0;
          let interval;
          
          const startCarousel = () => {
            interval = setInterval(() => {
              // Update current index
              currentIndex = (currentIndex + 1) % images.length;
              
              // Update main image
              mainImg.src = images[currentIndex].url;
              
              // Update active thumbnail
              thumbDiv.querySelectorAll('img').forEach((img, idx) => {
                img.classList.toggle('active', idx === currentIndex);
              });
            }, 3000); // Change every 3 seconds
          };
          
          // Pause carousel on hover
          carDiv.addEventListener('mouseenter', () => {
            if (interval) clearInterval(interval);
          });
          
          // Resume carousel when mouse leaves
          carDiv.addEventListener('mouseleave', () => {
            if (images.length > 1) startCarousel();
          });
          
          // Start the carousel
          if (images.length > 1) {
            startCarousel();
          }
        }

        container.appendChild(carDiv);
      }
    }
  } 
  // Sold section
  else {
    // Filter only image files
    const imageItems = items.filter(item => 
      item.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)
    );
    
    if (imageItems.length === 0) {
      container.innerHTML = '<p style="text-align:center; grid-column:1/-1; padding: 40px; color: #999;">No sold cars images found.</p>';
      return;
    }
    
    // Create sold cards
    imageItems.forEach(item => {
      const soldDiv = document.createElement('div');
      soldDiv.className = 'sold-card';
      
      const img = document.createElement('img');
      img.src = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
      img.alt = 'Sold Car';
      img.title = 'Sold Car';
      img.loading = 'lazy';
      
      soldDiv.appendChild(img);
      container.appendChild(soldDiv);
    });
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadCars('for-sale-container', 'car-for-sale', true);
  loadCars('sold-container', 'car-sold', false);
  
  // Add loading state styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .car-card, .sold-card {
      animation: fadeIn 0.5s ease;
    }
  `;
  document.head.appendChild(style);
});
