/**
 * VEDAVITAL AYURVEDA - LUXURY CLINIC APPLICATION
 * DYNAMIC MOTION SYSTEM & INTERACTION ENGINE (GSAP + ScrollTrigger + Lenis)
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // Dynamic Typography Line-Mask Splitting & Revealer (Preserves HTML spans/classes/br tags recursively)
    function initTypographyReveals() {
        const headings = document.querySelectorAll('.hero-title, .section-title');
        headings.forEach(heading => {
            function processNode(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    // Split text content by spaces
                    const tokens = text.split(/(\s+)/);
                    const fragment = document.createDocumentFragment();

                    tokens.forEach(token => {
                        if (token.trim() === '') {
                            fragment.appendChild(document.createTextNode(token));
                        } else {
                            const outer = document.createElement('span');
                            outer.style.display = 'inline-block';
                            outer.style.overflow = 'hidden';
                            outer.style.verticalAlign = 'bottom';

                            const inner = document.createElement('span');
                            inner.className = 'char-mask-inner';
                            inner.style.display = 'inline-block';
                            inner.style.transform = 'translateY(105%)';
                            inner.textContent = token;

                            outer.appendChild(inner);
                            fragment.appendChild(outer);
                        }
                    });
                    return fragment;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    // Clone the element tag (e.g. span, br) preserving attributes
                    const clone = node.cloneNode(false);
                    // Process its child nodes recursively
                    Array.from(node.childNodes).forEach(child => {
                        const processed = processNode(child);
                        if (processed) {
                            clone.appendChild(processed);
                        }
                    });
                    return clone;
                }
                return null;
            }

            const childNodes = Array.from(heading.childNodes);
            heading.innerHTML = '';
            childNodes.forEach(child => {
                const processed = processNode(child);
                if (processed) {
                    heading.appendChild(processed);
                }
            });
        });
    }
    initTypographyReveals();
    
    // ==========================================================================
    // Three.js INTERACTIVE 3D PARTICLE WAVE BACKGROUND
    // ==========================================================================
    const canvas3D = document.getElementById('hero-canvas');
    if (canvas3D) {
        let width3D = canvas3D.clientWidth;
        let height3D = canvas3D.clientHeight;

        const scene3D = new THREE.Scene();
        const camera3D = new THREE.PerspectiveCamera(75, width3D / height3D, 0.1, 1000);
        camera3D.position.z = 240;
        camera3D.position.y = 90;
        camera3D.rotation.x = -0.35;

        const renderer3D = new THREE.WebGLRenderer({ canvas: canvas3D, alpha: true, antialias: true });
        renderer3D.setSize(width3D, height3D);
        renderer3D.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const gap3D = 14;
        const countX = 45;
        const countY = 45;
        const particleCount = countX * countY;

        const positions = new Float32Array(particleCount * 3);
        const scales = new Float32Array(particleCount);

        let idxPositions = 0;
        let idxScales = 0;
        for (let ix = 0; ix < countX; ix++) {
            for (let iy = 0; iy < countY; iy++) {
                positions[idxPositions] = ix * gap3D - (countX * gap3D) / 2; // x
                positions[idxPositions + 1] = 0; // y
                positions[idxPositions + 2] = iy * gap3D - (countY * gap3D) / 2; // z

                scales[idxScales] = 1;
                
                idxPositions += 3;
                idxScales++;
            }
        }

        const geometry3D = new THREE.BufferGeometry();
        geometry3D.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry3D.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

        const material3D = new THREE.PointsMaterial({
            color: 0xd4af37, // gold glow
            size: 2.5,
            transparent: true,
            opacity: 0.4,
            sizeAttenuation: true
        });

        const particles3D = new THREE.Points(geometry3D, material3D);
        scene3D.add(particles3D);

        let mouseX = 0;
        let mouseY = 0;
        let targetX = 0;
        let targetY = 0;

        window.addEventListener('mousemove', (e) => {
            targetX = (e.clientX - window.innerWidth / 2) * 0.1;
            targetY = (e.clientY - window.innerHeight / 2) * 0.1;
        });

        window.addEventListener('resize', () => {
            if (!canvas3D.clientWidth) return;
            width3D = canvas3D.clientWidth;
            height3D = canvas3D.clientHeight;
            camera3D.aspect = width3D / height3D;
            camera3D.updateProjectionMatrix();
            renderer3D.setSize(width3D, height3D);
        });

        let count3D = 0;
        let is3DVisible = true;

        const observer3D = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                is3DVisible = entry.isIntersecting;
            });
        }, { threshold: 0.05 });
        
        const heroSection = document.getElementById('hero');
        if (heroSection) observer3D.observe(heroSection);

        function animate3D() {
            if (is3DVisible) {
                count3D += 0.025;

                const positionAttr = geometry3D.attributes.position;
                const scaleAttr = geometry3D.attributes.scale;

                let index = 0;
                let scaleIndex = 0;
                for (let ix = 0; ix < countX; ix++) {
                    for (let iy = 0; iy < countY; iy++) {
                        const yHeight = Math.sin((ix + count3D) * 0.3) * 14 + Math.sin((iy + count3D) * 0.5) * 14;
                        positionAttr.setY(scaleIndex, yHeight);
                        
                        const newScale = (Math.sin((ix + count3D) * 0.3) + 1) * 1.2 + (Math.sin((iy + count3D) * 0.5) + 1) * 1.2;
                        scaleAttr.setX(scaleIndex, newScale);

                        index += 3;
                        scaleIndex++;
                    }
                }

                positionAttr.needsUpdate = true;
                scaleAttr.needsUpdate = true;

                mouseX += (targetX - mouseX) * 0.05;
                mouseY += (targetY - mouseY) * 0.05;

                particles3D.rotation.y = mouseX * 0.003;
                particles3D.rotation.x = -0.35 + (mouseY * 0.002);

                renderer3D.render(scene3D, camera3D);
            }
            requestAnimationFrame(animate3D);
        }
        animate3D();
    }
    
    // ==========================================================================
    // 1. LENIS SMOOTH MOMENTUM SCROLLING
    // ==========================================================================
    const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Premium exponential deceleration curve
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false
    });

    // Synchronize ScrollTrigger scrolling updates with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // Keep GSAP ticker in sync with Lenis animation frames
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    
    // Disable lag smoothing to prevent visual jumps
    gsap.ticker.lagSmoothing(0);

    // Connect page anchor clicks to Lenis smooth scroll transitions
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, {
                    offset: -80, // Header height offset
                    duration: 1.5
                });
            }
        });
    });

    // ==========================================================================
    // 2. DUAL-ELEMENT LUXURY CUSTOM CURSOR & BUTTON RIPPLES
    // ==========================================================================
    // Check if pointer device supports custom cursor
    if (window.matchMedia('(pointer: fine)').matches) {
        const cursorDot = document.createElement('div');
        const cursorRing = document.createElement('div');
        const cursorText = document.createElement('span');
        
        cursorDot.className = 'custom-cursor-dot';
        cursorRing.className = 'custom-cursor-ring';
        cursorText.className = 'custom-cursor-text';
        
        cursorRing.appendChild(cursorText);
        document.body.appendChild(cursorDot);
        document.body.appendChild(cursorRing);

        // High-performance quick setters using GSAP quickTo
        const setDotX = gsap.quickTo(cursorDot, "x", { duration: 0.08, ease: "power3.out" });
        const setDotY = gsap.quickTo(cursorDot, "y", { duration: 0.08, ease: "power3.out" });
        const setRingX = gsap.quickTo(cursorRing, "x", { duration: 0.35, ease: "power3.out" });
        const setRingY = gsap.quickTo(cursorRing, "y", { duration: 0.35, ease: "power3.out" });

        window.addEventListener("mousemove", (e) => {
            setDotX(e.clientX);
            setDotY(e.clientY);
            setRingX(e.clientX);
            setRingY(e.clientY);
        });

        // Hide/Show custom cursor when mouse leaves browser window
        document.addEventListener("mouseleave", () => {
            gsap.to([cursorDot, cursorRing], { opacity: 0, duration: 0.3 });
        });
        document.addEventListener("mouseenter", () => {
            gsap.to([cursorDot, cursorRing], { opacity: 1, duration: 0.3 });
        });

        // Context morphing triggers
        const hoverInteractives = document.querySelectorAll('a, button, select, input, textarea, .nav-link, .floating-btn, .carousel-btn, .accordion-header');
        hoverInteractives.forEach(item => {
            item.addEventListener('mouseenter', () => {
                cursorRing.classList.add('hover-active');
                cursorDot.classList.add('hover-active');
            });
            item.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('hover-active');
                cursorDot.classList.remove('hover-active');
            });
        });

        // Image/Card Hovers (➔ View)
        const hoverImages = document.querySelectorAll('.doctor-portrait-img, .amenity-card, .treatment-card');
        hoverImages.forEach(img => {
            img.addEventListener('mouseenter', () => {
                cursorRing.classList.add('cursor-view');
                cursorText.innerText = 'View';
            });
            img.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('cursor-view');
                cursorText.innerText = '';
            });
        });

        // Drag Carousel Hovers (➔ Drag)
        const hoverDraggables = document.querySelectorAll('.carousel-container, #testimonial-track');
        hoverDraggables.forEach(drag => {
            drag.addEventListener('mouseenter', () => {
                cursorRing.classList.add('cursor-drag');
                cursorText.innerText = 'Drag';
            });
            drag.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('cursor-drag');
                cursorText.innerText = '';
            });
        });
    }

    // Button click ripple generators
    const rippleButtons = document.querySelectorAll('.btn, .carousel-btn, .floating-btn');
    rippleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.className = 'btn-ripple';
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            
            btn.appendChild(ripple);
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // ==========================================================================
    // 3. CINEMATIC LOADING TIMER & HERO ENTRANCE STAGGER
    // ==========================================================================
    const preloader = document.getElementById('loader');
    const progressFill = document.querySelector('.loader-progress-fill');
    
    // De-activate scroll control during initial page load
    lenis.stop();

    const loaderTimeline = gsap.timeline({
        onComplete: () => {
            // Re-activate smooth scrolling once load ends
            lenis.start();
            preloader.classList.add('loaded');
            
            // Trigger Hero Section Cinematic entrance sequence
            heroEntranceTimeline.play();
        }
    });

    // Fill loading progress bar smoothly
    loaderTimeline.to(progressFill, {
        width: "100%",
        duration: 1.8,
        ease: "power2.inOut"
    });

    // Fade logo & lift preloader pane
    loaderTimeline.to(preloader, {
        yPercent: -100,
        duration: 0.8,
        ease: "power3.inOut"
    });

    // Hero entrance animations (paused initially, triggered by loader onComplete)
    const heroEntranceTimeline = gsap.timeline({ paused: true });

    heroEntranceTimeline.fromTo('.main-navbar', 
        { yPercent: -100, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );

    heroEntranceTimeline.fromTo('.badge-trust-premium',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.4"
    );

    heroEntranceTimeline.to('.hero-title .char-mask-inner', {
        y: 0,
        duration: 0.9,
        stagger: 0.05,
        ease: "power4.out"
    }, "-=0.4");

    heroEntranceTimeline.fromTo('.hero-description',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
        "-=0.5"
    );

    heroEntranceTimeline.fromTo('.hero-actions .btn, .hero-actions .watch-video-btn',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: "power2.out" },
        "-=0.4"
    );

    heroEntranceTimeline.fromTo('.hero-trust-bar',
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        "-=0.3"
    );

    heroEntranceTimeline.fromTo('.doctor-portrait-img',
        { scale: 0.85, opacity: 0, filter: "blur(10px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power4.out" },
        "-=1.0"
    );

    heroEntranceTimeline.fromTo('.glass-float-card',
        { scale: 0.8, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "back.out(1.5)" },
        "-=0.8"
    );

    // ==========================================================================
    // 4. MAGNETIC MICRO-INTERACTIONS ON CTA BUTTONS
    // ==========================================================================
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-outline, .floating-btn, .carousel-btn');
    
    if (window.matchMedia('(pointer: fine)').matches) {
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                // Find cursor coordinates relative to button center
                const x = e.clientX - rect.left - (rect.width / 2);
                const y = e.clientY - rect.top - (rect.height / 2);
                
                // Pull button coordinates towards cursor position slightly
                gsap.to(btn, {
                    x: x * 0.35,
                    y: y * 0.35,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            btn.addEventListener('mouseleave', () => {
                // Spring back to original position
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.8,
                    ease: "elastic.out(1, 0.3)"
                });
            });
        });
    }

    // ==========================================================================
    // 5. 3D HOVER TILT EFFECTS ON TREATMENT CARDS
    // ==========================================================================
    const tiltCards = document.querySelectorAll('.treatment-card, .amenity-card, .remedy-card');

    if (window.matchMedia('(pointer: fine)').matches) {
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xc = rect.width / 2;
                const yc = rect.height / 2;
                const dx = x - xc;
                const dy = y - yc;

                // Max 8 degrees rotation
                const tiltX = -(dy / yc) * 8;
                const tiltY = (dx / xc) * 8;

                gsap.to(card, {
                    transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
                    boxShadow: `0 30px 60px rgba(8, 28, 21, 0.12), 0 0 30px rgba(212, 175, 55, ${Math.abs(dx/xc) * 0.25})`,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
                    boxShadow: "0 20px 40px rgba(8, 28, 21, 0.08)",
                    duration: 0.6,
                    ease: "power3.out"
                });
            });
        });
    }

    // ==========================================================================
    // 6. SCROLLTRIGGER SECTION REVEALS
    // ==========================================================================
    const reveals = document.querySelectorAll('.reveal-on-scroll');

    reveals.forEach(element => {
        let startTransform = { y: 40, opacity: 0 };
        
        // Stagger list checks
        if (element.classList.contains('slide-left-reveal')) {
            startTransform = { x: -40, opacity: 0 };
        } else if (element.classList.contains('slide-right-reveal')) {
            startTransform = { x: 40, opacity: 0 };
        }

        gsap.fromTo(element, 
            { 
                ...startTransform,
                visibility: "hidden"
            },
            {
                y: 0,
                x: 0,
                opacity: 1,
                visibility: "visible",
                duration: 1.0,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: element,
                    start: "top 88%",
                    toggleActions: "play none none none"
                }
            }
        );
    });

    // Stagger grid loading effects (Treatments, Amenities, Remedies)
    const grids = ['.grid-treatments', '.grid-amenities', '.remedies-list'];
    grids.forEach(gridSel => {
        const grid = document.querySelector(gridSel);
        if (grid) {
            const children = grid.children;
            gsap.fromTo(children,
                { y: 50, opacity: 0, visibility: "hidden" },
                {
                    y: 0,
                    opacity: 1,
                    visibility: "visible",
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: grid,
                        start: "top 85%"
                    }
                }
            );
        }
    });

    // ==========================================================================
    // 6b. TYPOGRAPHY MASK SLIDE-UPS & PARALLAX DEPTHS
    // ==========================================================================
    // Dynamic slide-up reveals for all section titles
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        const inners = title.querySelectorAll('.char-mask-inner');
        if (inners.length > 0) {
            gsap.to(inners, {
                y: 0,
                duration: 0.8,
                stagger: 0.04,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: title,
                    start: "top 88%",
                    toggleActions: "play none none none"
                }
            });
        }
    });

    // Scroll parallax translations on key medical and therapy imagery
    const parallaxImgs = document.querySelectorAll('.amenity-img, .doctor-portrait-img');
    parallaxImgs.forEach(img => {
        gsap.fromTo(img, 
            { yPercent: -10 },
            { 
                yPercent: 10,
                ease: "none",
                scrollTrigger: {
                    trigger: img.parentElement,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }
        );
    });

    // Floating leaf depth scrolls
    const leaves = document.querySelectorAll('.floating-leaf');
    leaves.forEach((leaf, idx) => {
        const depthSpeed = (idx + 1) * 25;
        gsap.to(leaf, {
            y: depthSpeed,
            ease: "none",
            scrollTrigger: {
                trigger: '#hero',
                start: "top top",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // ==========================================================================
    // 7. STATS DYNAMIC COUNTERS (SCROLLTRIGGER)
    // ==========================================================================
    const stats = document.querySelectorAll('.stat-number');

    stats.forEach(stat => {
        const target = parseFloat(stat.getAttribute('data-target'));
        const isDecimal = stat.getAttribute('data-decimal') === 'true';
        const counterObj = { value: 0 };

        gsap.to(counterObj, {
            value: target,
            duration: 2.2,
            ease: "power2.out",
            scrollTrigger: {
                trigger: stat,
                start: "top 90%",
                toggleActions: "play none none none"
            },
            onUpdate: () => {
                stat.innerText = isDecimal ? counterObj.value.toFixed(1) : Math.round(counterObj.value).toLocaleString();
            }
        });
    });

    // ==========================================================================
    // 8. ACCORDIONS, SLIDER, MODALS, SCROLL HIGHLIGHTS
    // ==========================================================================
    
    // 8a. Scroll Navigation Highlights & Sticky Navbar
    const navbar = document.querySelector('.main-navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        
        // Sticky Header scroll classes
        if (scrollTop > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }

        // Active Navigation link updates
        let currentSectionId = '';
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 120;
            const secHeight = sec.offsetHeight;
            if (scrollTop >= secTop && scrollTop < secTop + secHeight) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });

        // Floating Back-to-Top Button trigger
        const backToTopBtn = document.getElementById('back-to-top-btn');
        if (scrollTop > 400) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    // Back to top scroll execution
    document.getElementById('back-to-top-btn').addEventListener('click', () => {
        lenis.scrollTo(0, { duration: 1.5 });
    });

    // 8b. Mobile Menu Toggle Drawer
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    function toggleMobileMenu() {
        const isActive = mobileDrawer.classList.contains('active');
        menuToggle.classList.toggle('active');
        mobileDrawer.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', !isActive);
        mobileDrawer.setAttribute('aria-hidden', isActive);
        
        if (!isActive) {
            lenis.stop(); // Prevent page scrolls behind drawer
            gsap.fromTo('.mobile-nav-link', 
                { x: 30, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.1, duration: 0.4, ease: "power2.out" }
            );
        } else {
            lenis.start();
        }
    }

    menuToggle.addEventListener('click', toggleMobileMenu);
    mobileNavLinks.forEach(link => link.addEventListener('click', toggleMobileMenu));

    // 8c. Testimonials Carousel swipe-dragging / scrolling
    const track = document.getElementById('testimonial-track');
    const slides = Array.from(track.children);
    const nextBtn = document.getElementById('btn-next-test');
    const prevBtn = document.getElementById('btn-prev-test');
    let currentSlideIndex = 0;

    function moveSlide(index) {
        if (index < 0) {
            index = slides.length - 1;
        } else if (index >= slides.length) {
            index = 0;
        }
        currentSlideIndex = index;
        
        const slideWidth = slides[0].getBoundingClientRect().width;
        // Glide slide track smoothly
        gsap.to(track, {
            x: -((slideWidth + 30) * currentSlideIndex),
            duration: 0.6,
            ease: "power3.out"
        });

        // Update progress bar indicator width smoothly
        const fill = document.querySelector('.carousel-indicator-fill');
        if (fill) {
            gsap.to(fill, {
                width: `${((currentSlideIndex + 1) / slides.length) * 100}%`,
                duration: 0.4,
                ease: "power2.out"
            });
        }
    }

    nextBtn.addEventListener('click', () => moveSlide(currentSlideIndex + 1));
    prevBtn.addEventListener('click', () => moveSlide(currentSlideIndex - 1));
    window.addEventListener('resize', () => moveSlide(currentSlideIndex));

    // Carousel Swipe listeners
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const threshold = 50;
        if (touchStartX - touchEndX > threshold) {
            moveSlide(currentSlideIndex + 1);
        } else if (touchEndX - touchStartX > threshold) {
            moveSlide(currentSlideIndex - 1);
        }
    }, { passive: true });

    // 8d. FAQ Accordions (using GSAP for height transitions)
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const body = item.querySelector('.accordion-body');
            const isActive = item.classList.contains('active');

            // Collapse other open accordion items
            document.querySelectorAll('.accordion-item').forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherBody = otherItem.querySelector('.accordion-body');
                    gsap.to(otherBody, { height: 0, duration: 0.35, ease: "power2.out" });
                    otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                    otherBody.setAttribute('aria-hidden', 'true');
                }
            });

            // Toggle selected accordion item height
            if (isActive) {
                item.classList.remove('active');
                gsap.to(body, { height: 0, duration: 0.35, ease: "power2.out" });
                header.setAttribute('aria-expanded', 'false');
                body.setAttribute('aria-hidden', 'true');
            } else {
                item.classList.add('active');
                gsap.to(body, { height: body.scrollHeight, duration: 0.35, ease: "power2.out" });
                header.setAttribute('aria-expanded', 'true');
                body.setAttribute('aria-hidden', 'false');
            }
        });
    });

    // 8e. Modal triggers and layout transitions (using GSAP for window scale)
    const modalOverlay = document.getElementById('appointment-modal');
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalForm = document.getElementById('modal-booking-form');
    const modalSuccess = document.getElementById('modal-success-state');
    const successCloseBtn = document.getElementById('success-close-btn');

    // Pre-fill date picker to block past dates
    const datePickers = [document.getElementById('modal-date'), document.getElementById('direct-date')];
    const todayStr = new Date().toISOString().split('T')[0];
    datePickers.forEach(picker => {
        if (picker) picker.setAttribute('min', todayStr);
    });

    function openModal() {
        modalOverlay.classList.add('active');
        modalOverlay.setAttribute('aria-hidden', 'false');
        lenis.stop(); // Prevent page scrolling behind modal
        
        // Scale up modal box using GSAP back easing
        gsap.fromTo('.modal-box',
            { scale: 0.9, opacity: 0, y: 30 },
            { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }
        );
        
        setTimeout(() => document.getElementById('modal-name').focus(), 150);
    }

    function closeModal() {
        gsap.to('.modal-box', {
            scale: 0.9,
            opacity: 0,
            y: 30,
            duration: 0.4,
            ease: "power2.inOut",
            onComplete: () => {
                modalOverlay.classList.remove('active');
                modalOverlay.setAttribute('aria-hidden', 'true');
                lenis.start();
                
                // Reset form visibility states
                modalForm.style.display = 'flex';
                modalSuccess.classList.remove('active');
                modalForm.reset();
                removeFormErrors(modalForm);
            }
        });
    }

    openModalBtns.forEach(btn => btn.addEventListener('click', openModal));
    closeModalBtn.addEventListener('click', closeModal);
    successCloseBtn.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
    });

    // ==========================================================================
    // 9. CLIENT SIDE FORM VALIDATION AND SUBMISSION
    // ==========================================================================
    const directForm = document.getElementById('direct-booking-form');
    const directSuccess = document.getElementById('direct-success-state');
    const newsletterForm = document.getElementById('newsletter-form');

    function validateField(input, validationFn, errorGroupClass = 'form-group') {
        const group = input.closest(`.${errorGroupClass}`);
        const isValid = validationFn(input.value.trim());
        
        if (!isValid) {
            group.classList.add('invalid');
            // GSAP Shake invalid input fields
            gsap.fromTo(input, { x: -6 }, { x: 0, duration: 0.4, clearProps: "x", ease: "bounce.out" });
        } else {
            group.classList.remove('invalid');
        }
        return isValid;
    }

    function removeFormErrors(form) {
        form.querySelectorAll('.form-group').forEach(group => group.classList.remove('invalid'));
    }

    // Validation definitions
    const nameValid = (val) => val.length >= 3;
    const phoneValid = (val) => /^[6-9]\d{9}$/.test(val);
    const selectionValid = (val) => val !== "";
    const dateValid = (val) => val !== "";
    const emailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    // 9a. Modal Form Submit
    modalForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('modal-name');
        const phoneInput = document.getElementById('modal-phone');
        const deptInput = document.getElementById('modal-department');
        const dateInput = document.getElementById('modal-date');

        const isNameOk = validateField(nameInput, nameValid);
        const isPhoneOk = validateField(phoneInput, phoneValid);
        const isDeptOk = validateField(deptInput, selectionValid);
        const isDateOk = validateField(dateInput, dateValid);

        if (isNameOk && isPhoneOk && isDeptOk && isDateOk) {
            const submitBtn = modalForm.querySelector('.btn-form-submit');
            submitBtn.classList.add('loading');
            submitBtn.setAttribute('disabled', 'true');

            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.removeAttribute('disabled');
                
                // Cross-fade form views using GSAP
                gsap.to(modalForm, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        modalForm.style.display = 'none';
                        modalForm.style.opacity = 1;
                        modalSuccess.classList.add('active');
                        gsap.fromTo(modalSuccess, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 });
                    }
                });
            }, 1500);
        }
    });

    // 9b. Direct Form Submit
    directForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('direct-name');
        const phoneInput = document.getElementById('direct-phone');
        const deptInput = document.getElementById('direct-department');
        const dateInput = document.getElementById('direct-date');

        const isNameOk = validateField(nameInput, nameValid);
        const isPhoneOk = validateField(phoneInput, phoneValid);
        const isDeptOk = validateField(deptInput, selectionValid);
        const isDateOk = validateField(dateInput, dateValid);

        if (isNameOk && isPhoneOk && isDeptOk && isDateOk) {
            const submitBtn = directForm.querySelector('.btn-form-submit');
            submitBtn.classList.add('loading');
            submitBtn.setAttribute('disabled', 'true');

            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.removeAttribute('disabled');
                
                gsap.to(directForm, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        directForm.style.display = 'none';
                        directForm.style.opacity = 1;
                        directSuccess.classList.add('active');
                        gsap.fromTo(directSuccess, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 });
                    }
                });
            }, 1500);
        }
    });

    // 9c. Newsletter Form Submit
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('news-email');
        const errSpan = document.getElementById('err-news');
        const successSpan = document.getElementById('success-news');

        const isEmailOk = emailValid(emailInput.value.trim());

        if (isEmailOk) {
            errSpan.style.display = 'none';
            successSpan.style.display = 'block';
            emailInput.value = '';
            gsap.fromTo(successSpan, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
            
            setTimeout(() => {
                gsap.to(successSpan, { opacity: 0, duration: 0.3, onComplete: () => successSpan.style.display = 'none' });
            }, 4000);
        } else {
            successSpan.style.display = 'none';
            errSpan.style.display = 'block';
            gsap.fromTo(errSpan, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
        }
    });
});
