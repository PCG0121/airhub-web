/* ============================================
   PREMIUM AIRHUB - NEXT-LEVEL INTERACTION
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // === HERO BACKGROUND CAROUSEL ===
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.getElementById('prevSlide');
    const nextBtn = document.getElementById('nextSlide');
    let currentSlide = 0;
    let slideInterval;
    let isTransitioning = false;
    const pendingSlideLoads = new WeakMap();

    const heroTagline = document.querySelector('.hero-tagline');
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');

    const slideContent = [
        {
            tagline: "THE WORLD'S PUREST TRAVEL EXPERIENCE",
            title: 'Premium <span class="italic-red">Vacations</span><br>Sourced for your <span class="italic-red">Adventure.</span>',
            subtitle: "Book your next trip with ease. We find the world's most beautiful destinations and flights, curated specially for you."
        },
        {
            tagline: "UNMATCHED LUXURY AT YOUR FINGERTIPS",
            title: 'Exclusive <span class="italic-red">Escapes</span><br>Tailored for your <span class="italic-red">Comfort.</span>',
            subtitle: "Indulge in the finest accommodations and seamless travel experiences designed for the modern connoisseur."
        },
        {
            tagline: "EXPLORE THE UNKNOWN IN STYLE",
            title: 'Global <span class="italic-red">Discovery</span><br>Curated for your <span class="italic-red">Journey.</span>',
            subtitle: "Discover hidden gems and iconic landmarks with our handpicked selection of global destinations."
        }
    ];

    function activateOnKeyboard(element, handler) {
        if (!element) return;

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                handler(e);
            }
        });
    }

    function applySlideBackground(slide) {
        if (!slide || slide.dataset.bgLoaded === 'true') return;

        const bg = slide.dataset.bg;
        if (!bg) return;

        slide.style.backgroundImage = `url('${bg}')`;
        slide.dataset.bgLoaded = 'true';
    }

    function preloadSlideImage(slide) {
        if (!slide || slide.dataset.bgLoaded === 'true') {
            return Promise.resolve();
        }

        if (pendingSlideLoads.has(slide)) {
            return pendingSlideLoads.get(slide);
        }

        const bg = slide.dataset.bg;
        if (!bg) {
            return Promise.resolve();
        }

        const imageLoadPromise = new Promise(resolve => {
            const img = new Image();
            img.src = bg;

            if (img.complete) {
                applySlideBackground(slide);
                resolve();
                return;
            }

            img.onload = () => {
                applySlideBackground(slide);
                resolve();
            };

            img.onerror = () => {
                resolve();
            };
        });

        pendingSlideLoads.set(slide, imageLoadPromise);
        return imageLoadPromise;
    }

    function updateCarousel(index) {
        if (!slides.length || isTransitioning) return;

        const nextIndex = (index + slides.length) % slides.length;
        if (nextIndex === currentSlide) return;

        isTransitioning = true;

        preloadSlideImage(slides[nextIndex]).finally(() => {
            // Remove active class from current elements
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');

            // Set new index
            currentSlide = nextIndex;

            // Add active class to new elements
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');

            // Update Text Content with animation
            updateHeroText(currentSlide);

            // Reset the timer when manually interacting
            resetTimer();

            isTransitioning = false;
        });
    }

    function updateHeroText(index) {
        const content = slideContent[index];

        // Simple fade out/in effect
        [heroTagline, heroTitle, heroSubtitle].forEach(el => {
            if (el) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
            }
        });

        setTimeout(() => {
            if (heroTagline) heroTagline.textContent = content.tagline;
            if (heroTitle) heroTitle.innerHTML = content.title;
            if (heroSubtitle) heroSubtitle.textContent = content.subtitle;

            [heroTagline, heroTitle, heroSubtitle].forEach(el => {
                if (el) {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }
            });
        }, 600);
    }

    function resetTimer() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            updateCarousel(currentSlide + 1);
        }, 6000); // 6 seconds for auto-sliding
    }

    // Manual Controls
    if (nextBtn) {
        nextBtn.addEventListener('click', () => updateCarousel(currentSlide + 1));
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => updateCarousel(currentSlide - 1));
    }

    // Dots Interaction
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => updateCarousel(index));
    });

    // Start the initial timer
    if (slides.length > 0) {
        applySlideBackground(slides[currentSlide]);
        resetTimer();
    }

    // === THEME TOGGLE ===
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    if (themeToggle) {
        const syncThemeIcon = () => {
            const isLight = body.classList.contains('light-theme');
            themeToggle.textContent = isLight ? '\u{1F319}' : '\u2600\uFE0F';
        };

        const toggleTheme = () => {
            body.classList.toggle('light-theme');
            syncThemeIcon();
        };

        themeToggle.addEventListener('click', toggleTheme);
        activateOnKeyboard(themeToggle, toggleTheme);
        syncThemeIcon();
    }

    // === MOBILE MENU TOGGLE ===
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const closeMenu = document.querySelector('.mobile-close-btn');
    const overlayLinks = document.querySelectorAll('.mobile-overlay-link');

    if (mobileMenuBtn && mobileOverlay) {
        const openFunc = () => {
            mobileOverlay.classList.add('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        };

        const closeFunc = () => {
            mobileOverlay.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = ''; // Restore scrolling
        };

        mobileMenuBtn.addEventListener('click', openFunc);
        activateOnKeyboard(mobileMenuBtn, openFunc);

        if (closeMenu) {
            closeMenu.addEventListener('click', closeFunc);
            activateOnKeyboard(closeMenu, closeFunc);
        }

        overlayLinks.forEach(link => link.addEventListener('click', closeFunc));
    }

    // === HERO REVEAL ===
    const auroraBg = document.querySelector('.aurora-bg');
    setTimeout(() => {
        auroraBg.classList.add('revealed');
    }, 100);

    // === CUSTOM CURSOR ===
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    const links = document.querySelectorAll('a, button, .magnetic-btn, .magnetic-btn-small, .magnetic-card, input, .radio-label');

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let followerX = 0;
    let followerY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Smooth cursor movement
    function animateCursor() {
        const easing = 0.15;
        const followerEasing = 0.1;

        cursorX += (mouseX - cursorX) * easing;
        cursorY += (mouseY - cursorY) * easing;

        followerX += (mouseX - followerX) * followerEasing;
        followerY += (mouseY - followerY) * followerEasing;

        if (cursor) {
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
        }

        if (follower) {
            follower.style.left = `${followerX}px`;
            follower.style.top = `${followerY}px`;
        }

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor interactions
    links.forEach(link => {
        link.addEventListener('mouseenter', () => {
            cursor.classList.add('expand');
            follower.classList.add('expand');
        });
        link.addEventListener('mouseleave', () => {
            cursor.classList.remove('expand');
            follower.classList.remove('expand');
        });
    });

    // === MAGNETIC BUTTONS ===
    const magneticBtns = document.querySelectorAll('.magnetic-btn, .magnetic-btn-small, .magnetic-card');

    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Push intensity based on element type
            const intensity = btn.classList.contains('magnetic-card') ? 10 : 25;

            btn.style.transform = `translate(${x / 3}px, ${y / 3}px)`;

            // If it's a card, add a slight tilt
            if (btn.classList.contains('magnetic-card')) {
                btn.style.transform += ` rotateX(${-y / intensity}deg) rotateY(${x / intensity}deg)`;
            }
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = `translate(0px, 0px) rotateX(0deg) rotateY(0deg)`;
        });
    });

    // === SCROLL REVEAL (Intersection Observer) ===
    const revealElements = document.querySelectorAll('.reveal-element');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // If it has children to stagger, we could handle them here
                if (entry.target.classList.contains('features-grid')) {
                    const cards = entry.target.querySelectorAll('.feature-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('revealed');
                        }, index * 150);
                    });
                }
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // === LAZY LOAD BACKGROUND IMAGES ===
    const lazyBackgrounds = document.querySelectorAll('.lazy-bg[data-bg]');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    const lowBandwidth = !!(connection && (connection.saveData || /(^|-)2g/.test(connection.effectiveType || '')));
    const maxConcurrentLoads = lowBandwidth ? 1 : 3;
    const bgLoadQueue = [];
    const queuedBgElements = new WeakSet();
    let activeBgLoads = 0;

    const loadBackgroundImage = (element) => {
        if (!element || element.dataset.bgLoaded === 'true') {
            return Promise.resolve();
        }

        const src = element.dataset.bg;
        if (!src) {
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const applyBackground = () => {
                element.style.backgroundImage = `url('${src}')`;
                element.dataset.bgLoaded = 'true';
                element.classList.add('bg-loaded');
                resolve();
            };

            const img = new Image();
            img.src = src;

            if (img.complete) {
                applyBackground();
                return;
            }

            img.onload = applyBackground;
            img.onerror = applyBackground;
        });
    };

    const drainBackgroundQueue = () => {
        while (activeBgLoads < maxConcurrentLoads && bgLoadQueue.length > 0) {
            const nextElement = bgLoadQueue.shift();
            if (!nextElement || nextElement.dataset.bgLoaded === 'true') {
                continue;
            }

            activeBgLoads += 1;
            loadBackgroundImage(nextElement).finally(() => {
                activeBgLoads = Math.max(0, activeBgLoads - 1);
                drainBackgroundQueue();
            });
        }
    };

    const queueBackgroundImage = (element) => {
        if (!element || element.dataset.bgLoaded === 'true' || queuedBgElements.has(element)) {
            return;
        }
        queuedBgElements.add(element);
        bgLoadQueue.push(element);
        drainBackgroundQueue();
    };

    if ('IntersectionObserver' in window) {
        const bgObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    queueBackgroundImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '250px 0px',
            threshold: 0.01
        });

        lazyBackgrounds.forEach(el => bgObserver.observe(el));
    } else {
        lazyBackgrounds.forEach(queueBackgroundImage);
    }

    // === SEARCH SECTION ===
    const searchForm = document.getElementById('searchForm');
    const searchBtn = document.getElementById('searchFlights');
    const searchBtnLabel = document.getElementById('searchBtnLabel');
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    const swapRouteBtn = document.getElementById('swapRoute');
    const departInput = document.getElementById('departDate');
    const returnInput = document.getElementById('returnDate');
    const travellersInput = document.getElementById('travellers');
    const quickRoutes = document.querySelectorAll('.quick-route');
    const searchMessage = document.getElementById('searchMessage');
    const resultsSection = document.getElementById('results');
    const resultsSummary = document.getElementById('resultsSummary');
    const flightsGrid = document.getElementById('flightsGrid');
    const tabs = document.querySelectorAll('.search-tab');

    const flightDatabase = [
        { airline: 'SkyLuxe', logo: 'S', price: '$840', from: 'JFK', to: 'LHR', dep: '10:30 AM', arr: '10:30 PM', dur: '7h 00m', stops: 'Non-stop' },
        { airline: 'AzureJet', logo: 'A', price: '$720', from: 'JFK', to: 'LHR', dep: '08:15 AM', arr: '08:45 PM', dur: '7h 30m', stops: 'Non-stop' },
        { airline: 'GlobalAir', logo: 'G', price: '$650', from: 'JFK', to: 'LHR', dep: '01:45 PM', arr: '04:15 AM', dur: '9h 30m', stops: '1 Stop' },
        { airline: 'GulfWings', logo: 'G', price: '$590', from: 'DXB', to: 'BKK', dep: '06:10 AM', arr: '03:45 PM', dur: '6h 35m', stops: 'Non-stop' },
        { airline: 'PacificRoute', logo: 'P', price: '$510', from: 'SIN', to: 'DPS', dep: '09:20 AM', arr: '11:55 AM', dur: '2h 35m', stops: 'Non-stop' },
        { airline: 'MapleAir', logo: 'M', price: '$780', from: 'YYZ', to: 'JFK', dep: '11:15 AM', arr: '12:45 PM', dur: '1h 30m', stops: 'Non-stop' }
    ];

    let activeTab = 'flights';

    const setSearchMessage = (text, status) => {
        if (!searchMessage) {
            return;
        }
        searchMessage.className = 'search-message';
        if (status) {
            searchMessage.classList.add(status);
        }
        searchMessage.textContent = text;
    };

    const getCode = (value) => {
        if (!value) {
            return '';
        }
        const exactCode = value.match(/\(([A-Za-z]{3})\)/);
        if (exactCode) {
            return exactCode[1].toUpperCase();
        }
        const cleaned = value.replace(/[^A-Za-z]/g, '').toUpperCase();
        return cleaned.slice(0, 3);
    };

    const renderFlights = (flights) => {
        flightsGrid.innerHTML = '';
        flights.forEach((flight, index) => {
            const flightCard = document.createElement('div');
            flightCard.className = 'flight-card glass-effect';
            flightCard.style.animationDelay = `${index * 0.12}s`;

            flightCard.innerHTML = `
                <div class="flight-header">
                    <div class="airline">
                        <div class="airline-logo">${flight.logo}</div>
                        <span class="airline-name">${flight.airline}</span>
                    </div>
                    <div class="flight-price">${flight.price}</div>
                </div>
                <div class="flight-details">
                    <div class="flight-time">
                        <div class="time">${flight.dep}</div>
                        <div class="airport">${flight.from}</div>
                    </div>
                    <div class="flight-duration">
                        <div class="duration">${flight.dur}</div>
                        <div class="flight-line"></div>
                        <div class="stops">${flight.stops}</div>
                    </div>
                    <div class="flight-time">
                        <div class="time">${flight.arr}</div>
                        <div class="airport">${flight.to}</div>
                    </div>
                </div>
                <div class="flight-footer">
                    <div class="flight-class">Economy Class • 1 Carry-on included</div>
                    <button class="btn-primary magnetic-btn" style="padding: 0.5rem 1.5rem; font-size: 0.8rem;">Select</button>
                </div>
            `;
            flightsGrid.appendChild(flightCard);
        });
    };

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeTab = tab.dataset.tab;

            if (activeTab === 'flights') {
                if (searchBtnLabel) {
                    searchBtnLabel.textContent = 'Search Flights';
                }
                setSearchMessage('Enter route and dates, then search flights.', '');
                return;
            }

            if (activeTab === 'hotels') {
                if (searchBtnLabel) {
                    searchBtnLabel.textContent = 'Search Hotels';
                }
                setSearchMessage('Hotel search is coming soon. Use Flights for now.', '');
                return;
            }

            if (searchBtnLabel) {
                searchBtnLabel.textContent = 'Search Packages';
            }
            setSearchMessage('Package search is coming soon. Use Flights for now.', '');
        });
    });

    if (swapRouteBtn && fromInput && toInput) {
        swapRouteBtn.addEventListener('click', () => {
            const currentFrom = fromInput.value;
            fromInput.value = toInput.value;
            toInput.value = currentFrom;
        });
    }

    quickRoutes.forEach(routeBtn => {
        routeBtn.addEventListener('click', () => {
            const routeFrom = routeBtn.dataset.from || '';
            const routeTo = routeBtn.dataset.to || '';
            if (fromInput) {
                fromInput.value = routeFrom;
            }
            if (toInput) {
                toInput.value = routeTo;
            }
            setSearchMessage('Route applied. Press Search Flights to continue.', 'success');
        });
    });

    if (searchForm && searchBtn && flightsGrid && resultsSection) {
        setSearchMessage('Enter route and dates, then search flights.', '');

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (activeTab !== 'flights') {
                setSearchMessage('Only flight search is active right now.', 'error');
                return;
            }

            const fromCode = getCode(fromInput.value);
            const toCode = getCode(toInput.value);
            const departDate = departInput.value;
            const returnDate = returnInput.value;
            const travellers = travellersInput.value;

            if (!fromCode || !toCode) {
                setSearchMessage('Please enter valid From and To locations.', 'error');
                return;
            }

            if (fromCode === toCode) {
                setSearchMessage('From and To cannot be the same.', 'error');
                return;
            }

            if (departDate && returnDate && returnDate < departDate) {
                setSearchMessage('Return date must be after departure date.', 'error');
                return;
            }

            const originalLabel = searchBtnLabel ? searchBtnLabel.textContent : 'Search Flights';
            if (searchBtnLabel) {
                searchBtnLabel.textContent = 'Searching...';
            }
            searchBtn.style.opacity = '0.7';
            searchBtn.disabled = true;

            setTimeout(() => {
                const matchedFlights = flightDatabase.filter(
                    flight => flight.from === fromCode && flight.to === toCode
                );
                const fallbackFlights = flightDatabase.filter(
                    flight => flight.from === fromCode || flight.to === toCode
                );
                const flightsToRender = matchedFlights.length > 0
                    ? matchedFlights
                    : (fallbackFlights.length > 0 ? fallbackFlights.slice(0, 3) : flightDatabase.slice(0, 3));

                renderFlights(flightsToRender);
                resultsSection.style.display = 'block';

                if (resultsSummary) {
                    const dateInfo = departDate ? ` • Depart: ${departDate}` : '';
                    const returnInfo = returnDate ? ` • Return: ${returnDate}` : '';
                    resultsSummary.textContent = `${fromCode} -> ${toCode} • ${flightsToRender.length} options • ${travellers} traveller(s)${dateInfo}${returnInfo}`;
                }

                resultsSection.scrollIntoView({ behavior: 'smooth' });
                setSearchMessage('Results updated successfully.', 'success');

                if (searchBtnLabel) {
                    searchBtnLabel.textContent = originalLabel;
                }
                searchBtn.style.opacity = '1';
                searchBtn.disabled = false;
            }, 800);
        });
    }

    // === NAVBAR SCROLL EFFECT ===
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            nav.style.background = 'var(--glass-bg)';
            nav.style.backdropFilter = 'blur(20px)';
            nav.style.border = '1px solid var(--glass-border)';
            nav.style.boxShadow = 'var(--glass-shadow)';
        } else {
            nav.style.background = 'var(--glass-bg)';
            nav.style.border = '1px solid var(--glass-border)';
        }
    });

    // === PARALLAX EFFECT FOR AURORA BLOBS ===
    window.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        const blobs = document.querySelectorAll('.aurora-blob');
        blobs.forEach((blob, index) => {
            const speed = (index + 1) * 20;
            blob.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
        });
    });
});

