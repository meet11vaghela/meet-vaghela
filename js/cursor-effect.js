document.addEventListener('DOMContentLoaded', () => {
  // 1. Inject CSS for cursor
  const style = document.createElement('style');
  style.innerHTML = `
        body, a, button, input, textarea, .btn, .card {
            cursor: none !important; /* Hide default cursor everywhere */
        }
        .cursor-dot,
        .cursor-ring {
            position: fixed;
            top: 0;
            left: 0;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 10000;
            border-radius: 50%;
        }
        .cursor-dot {
            width: 8px;
            height: 8px;
            background-color: var(--primary-blue, #2563eb);
            box-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
            transition: width 0.2s, height 0.2s, background-color 0.2s;
        }
        /* Dark mode adjustment if needed, but primary-blue works well */
        
        .cursor-ring {
            width: 40px;
            height: 40px;
            border: 1.5px solid rgba(37, 99, 235, 0.5);
            transition: width 0.2s, height 0.2s, border-color 0.2s, background-color 0.2s;
        }

        /* Hover states */
        body.hovering .cursor-ring {
            width: 60px;
            height: 60px;
            border-color: transparent;
            background-color: rgba(37, 99, 235, 0.1);
        }
        body.hovering .cursor-dot {
            width: 12px;
            height: 12px;
        }
        
        /* Magnetic elements transition */
        .magnetic-wrap {
            display: inline-block;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
    `;
  document.head.appendChild(style);

  // 2. Create DOM elements
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  document.body.appendChild(ring);

  // 3. State
  let mouse = { x: -100, y: -100 }; // Start off-screen
  let dotPos = { x: -100, y: -100 };
  let ringPos = { x: -100, y: -100 };

  // Config
  const LERP_FACTOR = 0.15; // Smoothness of ring

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;

    // Dot moves instantly
    dotPos.x = mouse.x;
    dotPos.y = mouse.y;
    dot.style.transform = `translate(${dotPos.x}px, ${dotPos.y}px) translate(-50%, -50%)`;
  });

  // 4. Animation Loop
  function animate() {
    // Ring follows with Lerp
    ringPos.x += (mouse.x - ringPos.x) * LERP_FACTOR;
    ringPos.y += (mouse.y - ringPos.y) * LERP_FACTOR;

    ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`;

    requestAnimationFrame(animate);
  }
  animate();

  // 5. Magnetic Effect Logic
  // Exclude .profile-card to preserve its 3D hover effect
  const magneticSelectors = 'a, button, .btn, .project-card, .stat-card, .quote-card, .experience-item, .theme-toggle, .skill-tag';
  const magnets = document.querySelectorAll(magneticSelectors);

  magnets.forEach((magnet) => {
    magnet.addEventListener('mouseenter', () => {
      document.body.classList.add('hovering');
    });

    magnet.addEventListener('mouseleave', () => {
      document.body.classList.remove('hovering');
      // Reset position
      magnet.style.transform = 'translate(0, 0)';
    });

    magnet.addEventListener('mousemove', (e) => {
      const rect = magnet.getBoundingClientRect();
      // Calculate center of element
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from mouse to center
      const dist = {
        x: mouse.x - centerX,
        y: mouse.y - centerY
      };

      // Magnetic strength (how much it moves)
      // Adjust factor (0.3) for stronger/weaker pull
      const pullStrength = 0.3;

      // Limit movement range
      const moveX = dist.x * pullStrength;
      const moveY = dist.y * pullStrength;

      magnet.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
    });
  });
});
