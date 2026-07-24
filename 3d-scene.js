import * as THREE from './vendor/three.module.min.js';

const canvas = document.getElementById('flightCanvas');
const stage = document.getElementById('hero3dStage');
const hero = document.querySelector('.hero-section');

if (canvas && stage && hero) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(max-width: 768px)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 100);
    camera.position.set(0, 0.55, 9.2);

    let renderer;

    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: !mobile,
            powerPreference: 'high-performance'
        });
    } catch (error) {
        stage.classList.add('webgl-unavailable');
        console.warn('AirHub 3D scene could not start:', error);
    }

    if (renderer) {
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.6));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.18;

        const sceneRoot = new THREE.Group();
        const aircraftRig = new THREE.Group();
        const aircraft = new THREE.Group();
        scene.add(sceneRoot);
        sceneRoot.add(aircraftRig);
        aircraftRig.add(aircraft);

        const white = new THREE.MeshStandardMaterial({
            color: 0xf7f8fb,
            metalness: 0.55,
            roughness: 0.24
        });
        const silver = new THREE.MeshStandardMaterial({
            color: 0x9aa4b1,
            metalness: 0.75,
            roughness: 0.22
        });
        const red = new THREE.MeshStandardMaterial({
            color: 0xd90429,
            emissive: 0x48000c,
            emissiveIntensity: 0.35,
            metalness: 0.42,
            roughness: 0.25
        });
        const darkGlass = new THREE.MeshStandardMaterial({
            color: 0x09101c,
            metalness: 0.5,
            roughness: 0.08
        });

        const addMesh = (geometry, material, position, rotation = [0, 0, 0]) => {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...position);
            mesh.rotation.set(...rotation);
            aircraft.add(mesh);
            return mesh;
        };

        // Fuselage and nose, aligned along the X axis.
        addMesh(
            new THREE.CylinderGeometry(0.2, 0.3, 4.45, 32),
            white,
            [0, 0, 0],
            [0, 0, -Math.PI / 2]
        );
        addMesh(
            new THREE.ConeGeometry(0.2, 0.85, 32),
            white,
            [2.55, 0, 0],
            [0, 0, -Math.PI / 2]
        );
        addMesh(
            new THREE.ConeGeometry(0.29, 0.72, 32),
            silver,
            [-2.55, 0, 0],
            [0, 0, Math.PI / 2]
        );

        // Main wing, rear stabilizer and vertical tail.
        addMesh(new THREE.BoxGeometry(1.8, 0.075, 5.4), white, [-0.2, -0.02, 0], [0, 0, -0.07]);
        addMesh(new THREE.BoxGeometry(0.82, 0.055, 2.25), silver, [-1.85, 0.05, 0]);
        addMesh(new THREE.BoxGeometry(0.75, 1.15, 0.075), red, [-1.95, 0.54, 0], [0, 0, -0.13]);

        // Airline stripe and cockpit.
        addMesh(new THREE.BoxGeometry(2.8, 0.055, 0.315), red, [-0.35, 0.24, 0]);
        addMesh(new THREE.SphereGeometry(0.22, 24, 16), darkGlass, [2.25, 0.12, 0], [0, 0, 0]);

        // Engines.
        [-1.16, 1.16].forEach((z) => {
            addMesh(
                new THREE.CylinderGeometry(0.2, 0.25, 0.92, 24),
                silver,
                [-0.1, -0.36, z],
                [0, 0, -Math.PI / 2]
            );
            addMesh(
                new THREE.TorusGeometry(0.205, 0.035, 12, 28),
                red,
                [0.38, -0.36, z],
                [0, Math.PI / 2, 0]
            );
        });

        // Window line gives the simple procedural aircraft more scale.
        for (let index = 0; index < 10; index += 1) {
            addMesh(
                new THREE.BoxGeometry(0.09, 0.075, 0.32),
                darkGlass,
                [1.25 - index * 0.28, 0.15, 0]
            );
        }

        aircraft.scale.setScalar(mobile ? 0.64 : 0.88);
        aircraft.rotation.set(0.13, -0.36, 0.045);
        aircraftRig.position.set(mobile ? 0.55 : 1.75, mobile ? 0.55 : 0.2, 0);

        // Wireframe globe and orbital path.
        const globe = new THREE.Mesh(
            new THREE.SphereGeometry(1.72, 26, 18),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.075,
                wireframe: true
            })
        );
        globe.position.set(mobile ? 1.35 : 3.65, mobile ? -1.05 : -1.55, -3.8);
        sceneRoot.add(globe);

        const orbit = new THREE.Mesh(
            new THREE.TorusGeometry(2.06, 0.012, 8, 160, Math.PI * 1.54),
            new THREE.MeshBasicMaterial({
                color: 0xd90429,
                transparent: true,
                opacity: 0.75
            })
        );
        orbit.position.copy(globe.position);
        orbit.rotation.set(1.13, 0.2, -0.45);
        sceneRoot.add(orbit);

        // Lightweight depth particles.
        const particleCount = mobile ? 220 : 620;
        const particlePositions = new Float32Array(particleCount * 3);
        for (let index = 0; index < particleCount; index += 1) {
            const offset = index * 3;
            particlePositions[offset] = (Math.random() - 0.5) * 18;
            particlePositions[offset + 1] = (Math.random() - 0.5) * 10;
            particlePositions[offset + 2] = -2 - Math.random() * 18;
        }
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
        const particles = new THREE.Points(
            particleGeometry,
            new THREE.PointsMaterial({
                color: 0xffffff,
                size: mobile ? 0.025 : 0.035,
                transparent: true,
                opacity: 0.55,
                sizeAttenuation: true
            })
        );
        sceneRoot.add(particles);

        scene.add(new THREE.HemisphereLight(0xffffff, 0x111827, 2.4));
        const keyLight = new THREE.DirectionalLight(0xffffff, 5.2);
        keyLight.position.set(5, 6, 6);
        scene.add(keyLight);
        const redLight = new THREE.PointLight(0xd90429, 18, 12);
        redLight.position.set(-3, -1, 4);
        scene.add(redLight);

        const pointer = new THREE.Vector2();
        let scrollProgress = 0;
        let targetScrollProgress = 0;
        let sceneVisible = true;
        const clock = new THREE.Clock();

        const resize = () => {
            const rect = stage.getBoundingClientRect();
            const width = Math.max(1, rect.width);
            const height = Math.max(1, rect.height);
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        const updatePointer = (event) => {
            pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
            pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
        };

        const updateScroll = () => {
            const heroRect = hero.getBoundingClientRect();
            targetScrollProgress = THREE.MathUtils.clamp(-heroRect.top / Math.max(heroRect.height, 1), 0, 1);
        };

        const render = () => {
            if (!sceneVisible) return;

            const elapsed = clock.getElapsedTime();
            scrollProgress += (targetScrollProgress - scrollProgress) * 0.055;

            if (!reduceMotion) {
                aircraftRig.position.y = (mobile ? 0.55 : 0.2) + Math.sin(elapsed * 0.72) * 0.12 + scrollProgress * 0.5;
                aircraftRig.position.x = (mobile ? 0.55 : 1.75) + pointer.x * 0.2 - scrollProgress * (mobile ? 0.8 : 1.7);
                aircraft.rotation.y += ((-0.36 + pointer.x * 0.11) - aircraft.rotation.y) * 0.035;
                aircraft.rotation.x += ((0.13 + pointer.y * 0.07) - aircraft.rotation.x) * 0.035;
                aircraft.rotation.z = 0.045 + Math.sin(elapsed * 0.55) * 0.025 - scrollProgress * 0.08;
                globe.rotation.y = elapsed * 0.055;
                globe.rotation.x = Math.sin(elapsed * 0.17) * 0.08;
                orbit.rotation.z = -0.45 + elapsed * 0.018;
                particles.rotation.y = elapsed * 0.006;
            }

            sceneRoot.position.z = scrollProgress * 0.9;
            renderer.render(scene, camera);
        };

        const visibilityObserver = new IntersectionObserver((entries) => {
            sceneVisible = entries[0]?.isIntersecting ?? true;
            if (sceneVisible) renderer.setAnimationLoop(render);
            else renderer.setAnimationLoop(null);
        }, { threshold: 0.01 });

        visibilityObserver.observe(hero);
        window.addEventListener('resize', resize, { passive: true });
        window.addEventListener('pointermove', updatePointer, { passive: true });
        window.addEventListener('scroll', updateScroll, { passive: true });

        resize();
        updateScroll();
        renderer.setAnimationLoop(render);
        stage.classList.add('is-ready');
    }
}
