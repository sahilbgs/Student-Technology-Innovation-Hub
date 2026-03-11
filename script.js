// === DOM ELEMENTS ===
const navbar = document.getElementById('navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');
const counters = document.querySelectorAll('.counter');

// === NAVBAR SCROLL EFFECT & ACTIVE STATE ===
window.addEventListener('scroll', () => {
    // Navbar styling on scroll
    if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Active link highlight
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href').includes(current)) {
            item.classList.add('active');
        }
    });
});

// === MOBILE MENU TOGGLE ===
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    
    // Animate hamburger to X
    if (navLinks.classList.contains('active')) {
        hamburger.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    } else {
        hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
});

// Close mobile menu when a link is clicked
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        hamburger.innerHTML = '<i class="fa-solid fa-bars"></i>';
    });
});

// === NUMBER COUNTER ANIMATION ===
const animateCounters = () => {
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps approx
        
        // Reset counter
        counter.innerText = '0';
        
        let current = 0;
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current);
                // Call recursively with requestAnimationFrame for smooth animation
                requestAnimationFrame(updateCounter);
            } else {
                counter.innerText = target + (target > 100 ? '+' : ''); // Add + for large numbers
            }
        };
        
        updateCounter();
    });
};

// Intersection Observer to trigger counter animation when in view
const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            observer.unobserve(entry.target); // Run once
        }
    });
}, { threshold: 0.5 });

const aboutSection = document.querySelector('#about');
if (aboutSection) {
    counterObserver.observe(aboutSection);
}

// === PARTICLE BACKGROUND (Clean Light Theme Version) ===
const canvas = document.getElementById('particles-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let particles = [];
    
    // Init canvas size
    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    
    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.speedY = (Math.random() - 0.5) * 0.4;
            // Clean professional colors (light blues, greys)
            const colors = ['rgba(37, 99, 235, 0.2)', 'rgba(59, 130, 246, 0.15)', 'rgba(148, 163, 184, 0.2)'];
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Wrap around edges
            if (this.x > width) this.x = 0;
            if (this.x < 0) this.x = width;
            if (this.y > height) this.y = 0;
            if (this.y < 0) this.y = height;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Create particle network
    const initParticles = () => {
        particles = [];
        let particleCount = (width * height) / 12000; // Lighter density for clean look
        if(particleCount > 100) particleCount = 100; // Max limit
        
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    };
    
    initParticles();
    
    // Connect close particles with lines
    const connectParticles = () => {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 140) {
                    // Line opacity based on distance
                    const opacity = 1 - (distance / 140);
                    ctx.strokeStyle = `rgba(148, 163, 184, ${opacity * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    };
    
    // Animation loop
    const animateParticles = () => {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        
        connectParticles();
        requestAnimationFrame(animateParticles);
    };
    
    animateParticles();
}
