// Initialize scene, camera, and renderer
let selectedPlanet = "all";
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Add lighting (Sun)
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 2, 2000);
pointLight.position.set(0, 0, 0); // Sun's position
scene.add(pointLight);

// Texture loader for the Sun
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('textures/sun_texture.jpg');

// Create the Sun
const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshPhongMaterial({ map: sunTexture, emissive: 0xffff00, emissiveIntensity: 0.4 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Create celestial background (starry sky)
const starTexture = textureLoader.load('textures/star_texture.jpg');
const starGeometry = new THREE.SphereGeometry(100, 64, 64);
const starMaterial = new THREE.MeshBasicMaterial({
    map: starTexture,
    side: THREE.BackSide // Ensure the texture is applied to the inside of the sphere
});
const starSphere = new THREE.Mesh(starGeometry, starMaterial);
scene.add(starSphere);

// Planet data (Adding all 8 planets)
const planetsData = [
    { name: "Mercury", size: 0.5, color: 0xaaaaaa, distance: 8, details: "Closest planet to the Sun.", asteroids: ["Asteroid 1", "Asteroid 2"] },
    { name: "Venus", size: 0.9, color: 0xffcc00, distance: 11, details: "Second planet from the Sun.", asteroids: ["Asteroid 3"] },
    { name: "Earth", size: 1, color: 0x0000ff, distance: 14, details: "Home to life.", asteroids: ["Asteroid 4", "Asteroid 5"] },
    { name: "Mars", size: 0.7, color: 0xff4500, distance: 18, details: "The Red Planet.", asteroids: ["Asteroid 6"] },
    { name: "Jupiter", size: 2, color: 0xffa500, distance: 24, details: "Largest planet in the Solar System.", asteroids: ["Asteroid 7", "Asteroid 8"] },
    { name: "Saturn", size: 1.8, color: 0xffd700, distance: 30, details: "Has prominent rings.", asteroids: ["Asteroid 9"] },
    { name: "Uranus", size: 1.5, color: 0x00ffff, distance: 35, details: "Rotates on its side.", asteroids: ["Asteroid 10"] },
    { name: "Neptune", size: 1.4, color: 0x0000ff, distance: 40, details: "Farthest planet from the Sun.", asteroids: ["Asteroid 11"] }
];

// Create planets and their orbits
const planets = [];
const orbits = [];
const planetLabels = []; // Array to hold planet labels
let saturnRing; // Declare a variable for Saturn's ring

planetsData.forEach((data, index) => {
    // Create planet
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: data.color });
    const planet = new THREE.Mesh(geometry, material);
    planet.position.set(data.distance, 0, 0);
    scene.add(planet);
    planets.push(planet);

    // Create orbit (single line)
    const orbitPoints = [];
    const orbitSegments = 100; // Number of points in the orbit line
    for (let i = 0; i <= orbitSegments; i++) {
        const angle = (i / orbitSegments) * Math.PI * 2; // Full circle
        orbitPoints.push(new THREE.Vector3(Math.cos(angle) * data.distance, 0, Math.sin(angle) * data.distance));
    }
    
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa, opacity: 0.5 });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);
    orbits.push(orbitLine);

    // Create label for planet
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = '32px Arial';
    context.fillStyle = 'white';
    context.fillText(data.name, 0, 40);
    const texture = new THREE.CanvasTexture(canvas);
    const labelMaterial = new THREE.SpriteMaterial({ map: texture });
    const label = new THREE.Sprite(labelMaterial);
    label.scale.set(3, 1.5, 1); // Adjust size of the label
    scene.add(label);
    planetLabels.push(label);

    // Create Saturn ring after creating Saturn
    if (data.name === "Saturn") {
        const ringGeometry = new THREE.TorusGeometry(2.5, 0.2, 16, 100); // Major radius and minor radius
        const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xd2b48c, side: THREE.DoubleSide });
        saturnRing = new THREE.Mesh(ringGeometry, ringMaterial); // Store the ring in a variable
        saturnRing.rotation.x = Math.PI / 2; // Rotate the ring to lie flat
        saturnRing.position.set(data.distance, 0, 0); // Position around Saturn
        scene.add(saturnRing);
    }
});

// Camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
camera.position.z = 60;

// Orbit and animation logic
let animationPaused = false;
let time = 0;
let orbitSpeed = 0.01;

function animate() {
    requestAnimationFrame(animate);

    if (!animationPaused) {
        time += orbitSpeed;

        planets.forEach((planet, index) => {
            const distance = planetsData[index].distance;
            planet.position.x = Math.cos(time * (index + 1)) * distance;
            planet.position.z = Math.sin(time * (index + 1)) * distance;

            // Update label position
            planetLabels[index].position.x = planet.position.x;
            planetLabels[index].position.z = planet.position.z + 1; // Position above the planet
            planetLabels[index].lookAt(camera.position);

            // Update Saturn's ring position and rotation
            if (planetsData[index].name === "Saturn") {
                saturnRing.position.x = planet.position.x;
                saturnRing.position.y = planet.position.y;
                saturnRing.position.z = planet.position.z;

                // Only rotate the ring if it is visible
                if (saturnRing.visible) {
                    saturnRing.rotation.y += 0.01; // Rotate the ring
                }
            }
        });
    }

    renderer.render(scene, camera);
}




// Event listeners for speed, planet selection, and pause/resume
document.getElementById('speed-slider').addEventListener('input', (event) => {
    orbitSpeed = parseFloat(event.target.value);
});

document.getElementById('planet-select').addEventListener('change', (event) => {
    selectedPlanet = event.target.value;
    planets.forEach((planet, index) => {
        const isSelected = selectedPlanet === "all" || planetsData[index].name === selectedPlanet;
        planet.visible = isSelected;
        planetLabels[index].visible = isSelected;
        orbits[index].visible = selectedPlanet === "all";
    });

    // Update Saturn's ring visibility
    if (selectedPlanet === "Saturn" || selectedPlanet === "all") {
        saturnRing.visible = true;
    } else {
        saturnRing.visible = false;
    }
});

// Variable to track orbit visibility
let orbitsVisible = true;

// Event listener for toggling orbit visibility
document.getElementById('toggle-trajectories').addEventListener('click', () => {
    orbitsVisible = !orbitsVisible; // Toggle the boolean value
    orbits.forEach(orbit => {
        orbit.visible = orbitsVisible; // Show or hide each orbit
    });
});

document.getElementById('pause-button').addEventListener('click', () => {
    animationPaused = true;
    document.getElementById('pause-button').style.display = 'none';
    document.getElementById('resume-button').style.display = 'inline';
});

document.getElementById('resume-button').addEventListener('click', () => {
    animationPaused = false;
    document.getElementById('resume-button').style.display = 'none';
    document.getElementById('pause-button').style.display = 'inline';
});

// Start animation
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});// Event listeners for speed, planet selection, and pause/resume
document.getElementById('planet-select').addEventListener('change', (event) => {
    selectedPlanet = event.target.value;

    planets.forEach((planet, index) => {
        const isSelected = selectedPlanet === "all" || planetsData[index].name === selectedPlanet;
        planet.visible = isSelected;
        planetLabels[index].visible = isSelected;
        orbits[index].visible = selectedPlanet === "all";
    });

    // Update Saturn's ring visibility
    if (selectedPlanet === "Saturn" || selectedPlanet === "all") {
        saturnRing.visible = true;
    } else {
        saturnRing.visible = false;
    }

    // Update planet details display
    const detailsDiv = document.getElementById('details');
    if (selectedPlanet === "all") {
        detailsDiv.innerHTML = "Select a planet to see details.";
    } else {
        const selectedPlanetData = planetsData.find(planet => planet.name === selectedPlanet);
        if (selectedPlanetData) {
            detailsDiv.innerHTML = `
                <strong>${selectedPlanetData.name}</strong><br>
                Size: ${selectedPlanetData.size} units<br>
                Distance from Sun: ${selectedPlanetData.distance} units<br>
                Details: ${selectedPlanetData.details}<br>
                Asteroids: ${selectedPlanetData.asteroids.join(', ')}
            `;
        }
    }
});

