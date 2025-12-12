
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Style the canvas
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  // Remove the forced background and handle it in draw loop
  // canvas.style.background = ...; 
  document.body.appendChild(canvas);

  // Remove forced dark theme and transparent background
  // document.body.style.backgroundColor = 'transparent';
  // document.documentElement.setAttribute('data-theme', 'dark');


  let width, height;
  let particles = [];
  const particleCount = 400; // Number of particles

  // Theme state
  let isDarkMode = true;

  function checkTheme() {
    const theme = document.body.getAttribute('data-theme');
    isDarkMode = theme === 'dark' || !theme; // Default to dark if null
  }

  // Observer for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        checkTheme();
      }
    });
  });

  observer.observe(document.body, { attributes: true });

  // Initial check
  // Wait slightly for main script to set initial theme
  setTimeout(checkTheme, 100);

  // Mouse state for parallax
  let mouse = { x: 0, y: 0 };
  let targetMouse = { x: 0, y: 0 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', (e) => {
    // Normalize mouse position -1 to 1
    targetMouse.x = (e.clientX / width) * 2 - 1;
    targetMouse.y = (e.clientY / height) * 2 - 1;
  });

  class Particle {
    constructor() {
      this.init();
    }

    init() {
      // Random position in 3D space
      this.x = (Math.random() - 0.5) * width * 2;
      this.y = (Math.random() - 0.5) * height * 2;
      this.z = Math.random() * width; // Depth

      // Random size and color opacity
      this.size = Math.random() * 2;
      this.opacity = Math.random() * 0.5 + 0.1;

      // Movement speed (closer = faster perception)
      this.vz = Math.random() * 2 + 0.5; // Moving towards screen
    }

    update() {
      // Move particle forward (decrease Z)
      this.z -= this.vz;

      // Reset if behind camera
      if (this.z <= 0) {
        this.z = width;
        this.x = (Math.random() - 0.5) * width * 2;
        this.y = (Math.random() - 0.5) * height * 2;
      }
    }

    draw() {
      // Perspective projection
      // Basic formula: screen_x = x / z * fov
      const fov = width / 2;
      const scale = fov / (fov + this.z); // Scale factor based on depth

      // Apply parallax based on mouse
      // Shift x and y slightly based on mouse position and depth
      // Closer particles shift more (or less, depending on desired effect), here we shift opposite to mouse for depth
      const shiftX = mouse.x * (width * 0.05) * scale;
      const shiftY = mouse.y * (height * 0.05) * scale;

      const x2d = (this.x) * scale + width / 2 + shiftX;
      const y2d = (this.y) * scale + height / 2 + shiftY;

      // Draw based on theme
      const depthAlpha = 1 - (this.z / width);
      const finalAlpha = this.opacity * depthAlpha;

      if (finalAlpha > 0) {
        if (isDarkMode) {
          ctx.fillStyle = `rgba(100, 150, 255, ${finalAlpha})`; // Blueish white for dark
        } else {
          ctx.fillStyle = `rgba(37, 99, 235, ${finalAlpha})`; // Darker blue for light
        }

        ctx.beginPath();
        ctx.arc(x2d, y2d, this.size * scale * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Initialize particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    // Clear logic based on theme
    if (isDarkMode) {
      // Dark premium gradient reconstruction
      const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#000000');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      // Light theme background
      ctx.fillStyle = '#f8fafc'; // light-grey
      ctx.fillRect(0, 0, width, height);
    }

    // Smooth mouse movement
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    // Draw gradients or "nebula" effects if desired (optional)

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
});
