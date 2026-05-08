<script>
// GitHub Config
const owner = 'vasanthkumargcp-gif';
const repo = 'joelcars11.com';
const branch = 'main';

let currentImages = [];
let currentIndex = 0;

// Fetch folder contents
async function fetchFolderContents(path) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed');
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Load Cars
async function loadCars(containerId, basePath, isForSale = true) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  const loading = document.getElementById(isForSale ? 'loading-cars' : 'loading-sold');
  if (loading) loading.style.display = 'block';

  const items = await fetchFolderContents(basePath);

  if (isForSale) {
    // === AVAILABLE CARS - HORIZONTAL SCROLL ===
    container.classList.add('horizontal');

    for (const item of items) {
      if (item.type !== 'dir') continue;

      const carName = item.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

      const carDiv = document.createElement('div');
      carDiv.className = 'car-card';

      carDiv.innerHTML = `
        <h3>${carName}</h3>
        <div class="gallery">
          <div class="thumbnails"></div>
          <div class="main-image">
            <img src="" alt="${carName}" loading="lazy">
          </div>
        </div>
      `;

      container.appendChild(carDiv);

      const thumbnailsDiv = carDiv.querySelector('.thumbnails');
      const mainImg = carDiv.querySelector('.main-image img');

      // Fetch images
      const subItems = await fetchFolderContents(item.path);
      const images = subItems
        .filter(sub => sub.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(sub.name))
        .map(sub => ({
          url: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${sub.path}`,
          name: sub.name
        }));

      if (images.length === 0) continue;

      // Set first image
      mainImg.src = images[0].url;

      // Thumbnails
      images.forEach((img, idx) => {
        const thumb = document.createElement('img');
        thumb.src = img.url;
        thumb.loading = 'lazy';
        if (idx === 0) thumb.classList.add('active');

        thumb.addEventListener('click', () => {
          mainImg.src = img.url;
          thumbnailsDiv.querySelectorAll('img').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        });

        thumbnailsDiv.appendChild(thumb);
      });

      // Click main image → Open Modal with navigation
      mainImg.addEventListener('click', () => {
        openImageModal(images, 0);
      });
    }
  } else {
    // Sold Cars (existing horizontal auto-scroll)
    container.classList.add('sold-carousel');
    // ... (your existing sold cars logic)
    const imageItems = items.filter(item => 
      item.type === 'file' && /\.(jpg|jpeg|png|gif|webp)$/i.test(item.name)
    );

    imageItems.forEach(item => {
      const soldDiv = document.createElement('div');
      soldDiv.className = 'sold-card';
      soldDiv.innerHTML = `<img src="https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}" alt="Sold Car" loading="lazy">`;
      soldDiv.querySelector('img').addEventListener('click', () => {
        openImageModal([{url: soldDiv.querySelector('img').src}], 0);
      });
      container.appendChild(soldDiv);
    });

    if (imageItems.length > 0) {
      container.innerHTML += container.innerHTML; // duplicate for seamless loop
    }
  }

  if (loading) loading.style.display = 'none';
}

// ==================== PROFESSIONAL MODAL WITH NAVIGATION ====================
function openImageModal(images, startIndex) {
  currentImages = images;
  currentIndex = startIndex;

  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-image');

  modalImg.src = currentImages[currentIndex].url;
  modal.style.display = 'flex';

  // Update navigation buttons
  updateModalNav();
}

function updateModalNav() {
  const prevBtn = document.getElementById('modal-prev');
  const nextBtn = document.getElementById('modal-next');

  if (prevBtn) prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
  if (nextBtn) nextBtn.style.opacity = currentIndex === currentImages.length - 1 ? '0.3' : '1';
}

// Close modal
function closeModal() {
  document.getElementById('image-modal').style.display = 'none';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadCars('for-sale-container', 'car-for-sale', true);
  loadCars('sold-container', 'car-sold', false);

  // Hamburger
  const hamburger = document.getElementById('hamburger-menu');
  const mobileMenu = document.getElementById('mobile-menu');
  if (hamburger) hamburger.addEventListener('click', () => mobileMenu.classList.toggle('active'));

  // Modal setup
  const modal = document.getElementById('image-modal');
  const closeBtn = document.querySelector('.close-modal');

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // Navigation Arrows
  const prevBtn = document.createElement('div');
  prevBtn.id = 'modal-prev';
  prevBtn.className = 'modal-nav';
  prevBtn.innerHTML = '‹';
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      document.getElementById('modal-image').src = currentImages[currentIndex].url;
      updateModalNav();
    }
  });

  const nextBtn = document.createElement('div');
  nextBtn.id = 'modal-next';
  nextBtn.className = 'modal-nav';
  nextBtn.innerHTML = '›';
  nextBtn.addEventListener('click', () => {
    if (currentIndex < currentImages.length - 1) {
      currentIndex++;
      document.getElementById('modal-image').src = currentImages[currentIndex].url;
      updateModalNav();
    }
  });

  const modalContent = document.querySelector('.modal-content');
  modalContent.appendChild(prevBtn);
  modalContent.appendChild(nextBtn);
});
</script>
