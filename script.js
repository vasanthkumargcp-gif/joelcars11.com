const owner = 'vasanthkumargcp-gif';
const repo = 'joelcars11.com';
const branch = 'main';

async function fetchFolderContents(path) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching folder:', path, error);
    return [];
  }
}

async function loadCars(containerId, basePath, isForSale = true) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const loadingId = isForSale ? 'loading-cars' : 'loading-sold';
  const loading = document.getElementById(loadingId);
  if (loading) loading.style.display = 'block';

  const items = await fetchFolderContents(basePath);

  if (items.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding: 60px; color: #888;">No items found.</p>';
    if (loading) loading.style.display = 'none';
    return;
  }

  if (isForSale) {
    // === AVAILABLE CARS FOR SALE ===
    for (const item of items) {
      if (item.type !== 'dir') continue;

      const carDiv = document.createElement('div');
      carDiv.className = 'car-card';

      const carName = item.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      carDiv.innerHTML = `<h3>${carName}</h3>`;

      const galleryDiv = document.createElement('div');
      galleryDiv.className = 'gallery';

      const thumbDiv = document.createElement('div');
      thumbDiv.className = 'thumbnails';

      const mainDiv = document.createElement('div');
      mainDiv.className = 'main-image';

      const mainImg = document.createElement('img');
      mainImg.alt = carName;
      mainImg.loading = 'lazy';
      mainImg.style.cursor = 'pointer'; // Indicate clickable
      mainDiv.appendChild(mainImg);

      galleryDiv.appendChild(thumbDiv);
      galleryDiv.appendChild(mainDiv);
      carDiv.appendChild(galleryDiv);
      container.appendChild(carDiv);

      // Fetch images from car folder
      const subItems = await fetchFolderContents(item.path);
      const images = subItems
        .filter(sub => sub.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(sub.name))
        .map(sub => ({
          url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${sub.path}`,
          name: sub.name
        }));

      if (images.length === 0) {
        mainDiv.innerHTML = '<p style="color:#888; text-align:center; padding:20px;">No images available</p>';
      } else {
        let currentIndex = 0;

        // Set first image
        mainImg.src = images[0].url;

        // Create thumbnails
        images.forEach((image, index) => {
          const thumbImg = document.createElement('img');
          thumbImg.src = image.url;
          thumbImg.alt = `${carName} - Image ${index + 1}`;
          thumbImg.loading = 'lazy';
          thumbImg.style.cursor = 'pointer';

          if (index === 0) thumbImg.classList.add('active');

          thumbImg.addEventListener('click', () => {
            currentIndex = index;
            mainImg.src = image.url;
            thumbDiv.querySelectorAll('img').forEach(t => t.classList.remove('active'));
            thumbImg.classList.add('active');
          });

          thumbDiv.appendChild(thumbImg);
        });

        // Auto-play carousel every 3 seconds
        if (images.length > 1) {
          setInterval(() => {
            currentIndex = (currentIndex + 1) % images.length;
            mainImg.src = images[currentIndex].url;
            thumbDiv.querySelectorAll('img').forEach((t, i) => {
              t.classList.toggle('active', i === currentIndex);
            });
          }, 3000);
        }

        // Click main image → open modal
        mainImg.addEventListener('click', () => {
          openModal(images[currentIndex].url);
        });

        // Click thumbnails → open modal too
        thumbDiv.querySelectorAll('img').forEach((thumb, idx) => {
          thumb.addEventListener('click', () => {
            openModal(images[idx].url);
          });
        });
      }
    }
  } else {
    // === RECENTLY SOLD CARS ===
    const imageItems = items.filter(item =>
      item.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)
    );

    imageItems.forEach(item => {
      const soldDiv = document.createElement('div');
      soldDiv.className = 'sold-card';

      const img = document.createElement('img');
      img.src = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`;
      img.alt = 'Recently Sold Car';
      img.loading = 'lazy';
      img.style.cursor = 'pointer';

      img.addEventListener('click', () => {
        openModal(img.src);
      });

      soldDiv.appendChild(img);
      container.appendChild(soldDiv);
    });

    // === INFINITE HORIZONTAL AUTO-SCROLL ===
    // Duplicate content for seamless loop
    if (imageItems.length > 0) {
      const originalContent = container.innerHTML;
      container.innerHTML += originalContent; // Double it
    }
  }

  if (loading) loading.style.display = 'none';
}

// Modal function
function openModal(imageSrc) {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-image');
  if (modal && modalImg) {
    modalImg.src = imageSrc;
    modal.style.display = 'flex';
  }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  loadCars('for-sale-container', 'car-for-sale', true);
  loadCars('sold-container', 'car-sold', false);

  // Hamburger Menu
  const hamburger = document.getElementById('hamburger-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
  }

  // Modal Close
  const modal = document.getElementById('image-modal');
  const closeModal = document.querySelector('.close-modal');

  if (closeModal) {
    closeModal.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  // Optional: Click any sold card image to open modal (already handled inside loadCars)
});
