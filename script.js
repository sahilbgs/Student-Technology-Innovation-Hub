// === DOM ELEMENTS ===
const navbar = document.getElementById('navbar');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-links a');

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
            const id = section.getAttribute('id');
            if (id) current = id;
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (current && item.getAttribute('href') && item.getAttribute('href').includes(current)) {
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



// === 3D NEURAL NETWORK BACKGROUND (Three.js) ===
const initNeuralNetwork = () => {
    const container = document.getElementById('network-bg');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    
    // Add a foggy effect to fade out distant nodes to dark blue (matching CSS background)
    scene.fog = new THREE.FogExp2(0x0B1120, 0.002);
    
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 200;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const networkGroup = new THREE.Group();
    scene.add(networkGroup);

    // Reduce nodes heavily on mobile for better FPS and lower battery drain
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 120 : 400; 
    const maxDistance = isMobile ? 400 : 600;

    // Buffer geometries for performance
    const positions = new Float32Array(particleCount * 3);
    const particlesData = [];

    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * maxDistance;
        const y = (Math.random() - 0.5) * maxDistance;
        const z = (Math.random() - 0.5) * maxDistance;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        particlesData.push({
            velocity: new THREE.Vector3(
                -0.15 + Math.random() * 0.3,
                -0.15 + Math.random() * 0.3,
                -0.15 + Math.random() * 0.3
            ),
            numConnections: 0
        });
    }

    const pMaterial = new THREE.PointsMaterial({
        color: 0x60a5fa, // lighter blue for better visibility
        size: 6.5, // much larger neurons
        transparent: true,
        opacity: 1.0, // fully visible
        sizeAttenuation: true
    });

    const particles = new THREE.BufferGeometry();
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particleSystem = new THREE.Points(particles, pMaterial);
    networkGroup.add(particleSystem);

    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.45 // significantly increased line visibility
    });

    const linesGeometry = new THREE.BufferGeometry();
    const segments = particleCount * particleCount;
    const linePositions = new Float32Array(segments * 3); // Pre-allocate map
    
    linesGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    const linesMesh = new THREE.LineSegments(linesGeometry, lineMaterial);
    networkGroup.add(linesMesh);

    // Interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = window.scrollY;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });
    
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    const animate = () => {
        requestAnimationFrame(animate);

        // Smooth camera parallax
        targetX = mouseX * 0.02;
        targetY = mouseY * 0.02;

        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (-targetY - camera.position.y) * 0.02;
        
        // As you scroll down, move the network to create depth/traveling illusion
        networkGroup.position.y = scrollY * 0.03;
        
        // Slowly rotate the whole network
        networkGroup.rotation.y += 0.0003;
        networkGroup.rotation.x += 0.00015;

        let vertexpos = 0;
        let numConnected = 0;

        for (let i = 0; i < particleCount; i++) particlesData[i].numConnections = 0;

        const posArray = particles.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
            const particleData = particlesData[i];

            // Apply velocity drifting
            posArray[i * 3] += particleData.velocity.x;
            posArray[i * 3 + 1] += particleData.velocity.y;
            posArray[i * 3 + 2] += particleData.velocity.z;

            // Bounce back inside constraints to keep nodes grouped
            const halfBox = maxDistance / 2;
            if (posArray[i * 3] < -halfBox || posArray[i * 3] > halfBox) particleData.velocity.x = -particleData.velocity.x;
            if (posArray[i * 3 + 1] < -halfBox || posArray[i * 3 + 1] > halfBox) particleData.velocity.y = -particleData.velocity.y;
            if (posArray[i * 3 + 2] < -halfBox || posArray[i * 3 + 2] > halfBox) particleData.velocity.z = -particleData.velocity.z;

            // Compute distances & draw lines between close nodes
            for (let j = i + 1; j < particleCount; j++) {
                const particleDataB = particlesData[j];
                
                // Limit connections to maintain organic look and performance
                if (particleData.numConnections >= 5 || particleDataB.numConnections >= 5) continue;

                const dx = posArray[i * 3] - posArray[j * 3];
                const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
                const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                const minDist = 85; 
                if (dist < minDist) {
                    particleData.numConnections++;
                    particleDataB.numConnections++;

                    linePositions[vertexpos++] = posArray[i * 3];
                    linePositions[vertexpos++] = posArray[i * 3 + 1];
                    linePositions[vertexpos++] = posArray[i * 3 + 2];

                    linePositions[vertexpos++] = posArray[j * 3];
                    linePositions[vertexpos++] = posArray[j * 3 + 1];
                    linePositions[vertexpos++] = posArray[j * 3 + 2];

                    numConnected++;
                }
            }
        }

        // Only draw connected lines
        linesMesh.geometry.setDrawRange(0, numConnected * 2);
        linesMesh.geometry.attributes.position.needsUpdate = true;
        particles.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

initNeuralNetwork();
