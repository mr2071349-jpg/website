/**
 * LIFE ROOT AYURVEDA - LUXURY CLINIC APPLICATION
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
    // 9. CLIENT SIDE FORM VALIDATION, SECURITY, REDIRECTION, AND DATABASE
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

    // Input sanitization to prevent XSS / Script injection
    function sanitizeInput(val) {
        return val.replace(/&/g, "&amp;")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;")
                  .replace(/"/g, "&quot;")
                  .replace(/'/g, "&#039;");
    }

    // Validation definitions
    const nameValid = (val) => val.length >= 3;
    const phoneValid = (val) => /^[6-9]\d{9}$/.test(val);
    const selectionValid = (val) => val !== "";
    const dateValid = (val) => val !== "";
    const emailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

    // Math Captcha Logic
    let directCaptchaAnswer = 0;
    let modalCaptchaAnswer = 0;

    function generateCaptchas() {
        const num1 = Math.floor(Math.random() * 9) + 1;
        const num2 = Math.floor(Math.random() * 9) + 1;
        directCaptchaAnswer = num1 + num2;
        const directQuestEl = document.getElementById('direct-captcha-quest');
        if (directQuestEl) directQuestEl.innerText = `${num1} + ${num2}`;

        const num3 = Math.floor(Math.random() * 9) + 1;
        const num4 = Math.floor(Math.random() * 9) + 1;
        modalCaptchaAnswer = num3 + num4;
        const modalQuestEl = document.getElementById('modal-captcha-quest');
        if (modalQuestEl) modalQuestEl.innerText = `${num3} + ${num4}`;
    }
    generateCaptchas();

    // Security Honeypot check
    function isSpamBot(form) {
        const honeypot = form.querySelector('input[name="website_url"]');
        return honeypot && honeypot.value.trim() !== "";
    }

    // Rate Limiting (Max 3 submissions in 5 minutes per browser)
    function isRateLimited() {
        const now = Date.now();
        const submissions = JSON.parse(localStorage.getItem('lr_submission_times') || '[]');
        
        // Filter submissions older than 5 minutes (300,000 ms)
        const recentSubmissions = submissions.filter(time => now - time < 300000);
        
        if (recentSubmissions.length >= 3) {
            return true;
        }
        
        recentSubmissions.push(now);
        localStorage.setItem('lr_submission_times', JSON.stringify(recentSubmissions));
        return false;
    }

    // Local Database functions
    function saveLeadToDb(name, phone, concern, date) {
        try {
            const leads = JSON.parse(localStorage.getItem('lr_leads') || '[]');
            const newLead = {
                id: 'LR-' + Math.floor(1000 + Math.random() * 9000),
                name: sanitizeInput(name),
                phone: sanitizeInput(phone),
                concern: sanitizeInput(concern),
                date: sanitizeInput(date),
                timestamp: new Date().toLocaleString(),
                status: 'pending'
            };
            leads.push(newLead);
            localStorage.setItem('lr_leads', JSON.stringify(leads));
            refreshAdminData(); // Refresh panel tables if open
            return newLead.id;
        } catch (e) {
            console.error("Local database error", e);
            return 'LR-' + Math.floor(1000 + Math.random() * 9000);
        }
    }

    function saveSubscriberToDb(email) {
        try {
            const subscribers = JSON.parse(localStorage.getItem('lr_subscribers') || '[]');
            if (!subscribers.some(sub => sub.email === email)) {
                subscribers.push({
                    email: sanitizeInput(email),
                    timestamp: new Date().toLocaleString()
                });
                localStorage.setItem('lr_subscribers', JSON.stringify(subscribers));
                refreshAdminData();
            }
        } catch (e) {
            console.error("Local database error", e);
        }
    }

    // Form Redirection to WhatsApp
    function redirectToWhatsApp(name, phone, department, date) {
        const waNumber = "916387742417";
        const message = `Hello Life Root Ayurveda,\nI would like to book a private consultation.\n\n*Name:* ${name}\n*WhatsApp:* ${phone}\n*Concern:* ${department}\n*Preferred Date:* ${date}`;
        const encodedMsg = encodeURIComponent(message);
        const waUrl = `https://wa.me/${waNumber}?text=${encodedMsg}`;
        
        // Open WhatsApp redirect in current tab for quick communication
        window.location.href = waUrl;
    }

    // 9a. Modal Form Submit
    modalForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (isSpamBot(modalForm)) {
            // Silently ignore spam bots
            closeModal();
            return;
        }

        if (isRateLimited()) {
            alert("Security Alert: Too many submissions. Please wait 5 minutes before trying again.");
            return;
        }

        const nameInput = document.getElementById('modal-name');
        const phoneInput = document.getElementById('modal-phone');
        const deptInput = document.getElementById('modal-department');
        const dateInput = document.getElementById('modal-date');
        const captchaInput = document.getElementById('modal-captcha');

        const isNameOk = validateField(nameInput, nameValid);
        const isPhoneOk = validateField(phoneInput, phoneValid);
        const isDeptOk = validateField(deptInput, selectionValid);
        const isDateOk = validateField(dateInput, dateValid);
        const isCaptchaOk = validateField(captchaInput, (val) => parseInt(val) === modalCaptchaAnswer);

        if (isNameOk && isPhoneOk && isDeptOk && isDateOk && isCaptchaOk) {
            const submitBtn = modalForm.querySelector('.btn-form-submit');
            submitBtn.classList.add('loading');
            submitBtn.setAttribute('disabled', 'true');

            // Save to database
            const bookingKey = saveLeadToDb(nameInput.value, phoneInput.value, deptInput.value, dateInput.value);

            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.removeAttribute('disabled');
                
                // Show booking key in success popup
                const modalSuccessText = modalSuccess.querySelector('p');
                if (modalSuccessText) {
                    modalSuccessText.innerHTML = `Your booking confirmation key is <strong>${bookingKey}</strong>. You are now being redirected directly to WhatsApp to complete your consultation.`;
                }

                // Cross-fade form views using GSAP
                gsap.to(modalForm, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        modalForm.style.display = 'none';
                        modalForm.style.opacity = 1;
                        modalSuccess.classList.add('active');
                        gsap.fromTo(modalSuccess, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 });
                        
                        // WhatsApp Redirection after 1.5 seconds
                        setTimeout(() => {
                            redirectToWhatsApp(nameInput.value, phoneInput.value, deptInput.value, dateInput.value);
                        }, 1500);
                    }
                });
            }, 1000);
        } else {
            generateCaptchas(); // Reset captcha on failure
        }
    });

    // 9b. Direct Form Submit
    directForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (isSpamBot(directForm)) {
            directForm.reset();
            return;
        }

        if (isRateLimited()) {
            alert("Security Alert: Too many submissions. Please wait 5 minutes before trying again.");
            return;
        }

        const nameInput = document.getElementById('direct-name');
        const phoneInput = document.getElementById('direct-phone');
        const deptInput = document.getElementById('direct-department');
        const dateInput = document.getElementById('direct-date');
        const captchaInput = document.getElementById('direct-captcha');

        const isNameOk = validateField(nameInput, nameValid);
        const isPhoneOk = validateField(phoneInput, phoneValid);
        const isDeptOk = validateField(deptInput, selectionValid);
        const isDateOk = validateField(dateInput, dateValid);
        const isCaptchaOk = validateField(captchaInput, (val) => parseInt(val) === directCaptchaAnswer);

        if (isNameOk && isPhoneOk && isDeptOk && isDateOk && isCaptchaOk) {
            const submitBtn = directForm.querySelector('.btn-form-submit');
            submitBtn.classList.add('loading');
            submitBtn.setAttribute('disabled', 'true');

            // Save to database
            const bookingKey = saveLeadToDb(nameInput.value, phoneInput.value, deptInput.value, dateInput.value);

            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.removeAttribute('disabled');
                
                const directSuccessText = directSuccess.querySelector('p');
                if (directSuccessText) {
                    directSuccessText.innerHTML = `Your booking key is <strong>${bookingKey}</strong>. You are now being redirected directly to WhatsApp to complete your consultation.`;
                }

                gsap.to(directForm, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        directForm.style.display = 'none';
                        directForm.style.opacity = 1;
                        directSuccess.classList.add('active');
                        gsap.fromTo(directSuccess, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 });
                        
                        // WhatsApp Redirection
                        setTimeout(() => {
                            redirectToWhatsApp(nameInput.value, phoneInput.value, deptInput.value, dateInput.value);
                        }, 1500);
                    }
                });
            }, 1000);
        } else {
            generateCaptchas(); // Reset captcha on failure
        }
    });

    // 9c. Newsletter Form Submit
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (isRateLimited()) {
            alert("Security Alert: Too many requests.");
            return;
        }

        const emailInput = document.getElementById('news-email');
        const errSpan = document.getElementById('err-news');
        const successSpan = document.getElementById('success-news');

        const isEmailOk = emailValid(emailInput.value.trim());

        if (isEmailOk) {
            errSpan.style.display = 'none';
            successSpan.style.display = 'block';
            
            // Save email subscriber to database
            saveSubscriberToDb(emailInput.value);
            
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

    // ==========================================================================
    // 10. PREMIUM DYNAMIC ADMIN PANEL LAYOUT & LOGIC
    // ==========================================================================
    function injectAdminPanel() {
        const adminHtml = `
        <div class="admin-panel-overlay" id="admin-panel">
            <div class="admin-box">
                <div class="admin-header">
                    <h3>Life Root Ayurveda — Lead Console</h3>
                    <button class="admin-close-btn" id="admin-close-btn">&times;</button>
                </div>
                
                <div class="admin-login-view" id="admin-login-view">
                    <div class="admin-login-card">
                        <h4>Administrator Access</h4>
                        <p>Enter clinic security passcode to access leads database.</p>
                        <input type="password" id="admin-passcode-input" placeholder="••••••••" maxlength="16">
                        <div class="err-admin-login" id="err-admin-login">Incorrect Passcode. Try again.</div>
                        <button class="btn btn-primary w-full" id="admin-login-btn">Verify Access</button>
                    </div>
                </div>
                
                <div class="admin-dashboard-view" id="admin-dashboard-view">
                    <div class="admin-stats-row">
                        <div class="admin-stat-card">
                            <span>Total Leads</span>
                            <h4 id="stat-total-leads">0</h4>
                        </div>
                        <div class="admin-stat-card">
                            <span>Pending Consults</span>
                            <h4 id="stat-pending-leads">0</h4>
                        </div>
                        <div class="admin-stat-card">
                            <span>Newsletter Subscribers</span>
                            <h4 id="stat-newsletter-subs">0</h4>
                        </div>
                    </div>
                    
                    <div class="admin-controls-bar">
                        <div class="admin-search-wrapper">
                            <input type="text" class="admin-search-input" id="admin-search-input" placeholder="Search by name, phone, or department...">
                        </div>
                        <div class="admin-actions-group">
                            <button class="btn-admin-action btn-export" id="admin-export-leads-btn">Export Leads (CSV)</button>
                            <button class="btn-admin-action btn-export" id="admin-export-news-btn">Export Subscribers (CSV)</button>
                            <button class="btn-admin-action btn-reset" id="admin-reset-btn">Wipe Database</button>
                        </div>
                    </div>
                    
                    <div class="admin-tab-bar">
                        <button class="admin-tab-btn active" id="tab-leads-btn">Consultation Bookings</button>
                        <button class="admin-tab-btn" id="tab-news-btn">Newsletter Subscriptions</button>
                    </div>
                    
                    <div class="admin-table-wrapper">
                        <table class="admin-table" id="admin-leads-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Patient Name</th>
                                    <th>WhatsApp Phone</th>
                                    <th>Concern</th>
                                    <th>Date Requested</th>
                                    <th>Lead Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="admin-leads-tbody">
                                <!-- Rendered dynamically -->
                            </tbody>
                        </table>
                        
                        <table class="admin-table" id="admin-news-table" style="display:none;">
                            <thead>
                                <tr>
                                    <th>Subscriber Email</th>
                                    <th>Date Subscribed</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="admin-news-tbody">
                                <!-- Rendered dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        const container = document.createElement('div');
        container.innerHTML = adminHtml;
        document.body.appendChild(container.firstElementChild);
    }
    injectAdminPanel();

    const adminPanel = document.getElementById('admin-panel');
    const loginView = document.getElementById('admin-login-view');
    const dashboardView = document.getElementById('admin-dashboard-view');
    const passcodeFileInput = document.getElementById('admin-passcode-input');
    const loginBtn = document.getElementById('admin-login-btn');
    const errLoginEl = document.getElementById('err-admin-login');
    const closeAdminBtn = document.getElementById('admin-close-btn');

    // Show/Hide tables
    const leadsTable = document.getElementById('admin-leads-table');
    const newsTable = document.getElementById('admin-news-table');
    const tabLeadsBtn = document.getElementById('tab-leads-btn');
    const tabNewsBtn = document.getElementById('tab-news-btn');

    // Controls
    const searchInput = document.getElementById('admin-search-input');
    const exportLeadsBtn = document.getElementById('admin-export-leads-btn');
    const exportNewsBtn = document.getElementById('admin-export-news-btn');
    const resetBtn = document.getElementById('admin-reset-btn');

    function openAdminPanel() {
        adminPanel.classList.add('active');
        lenis.stop();
        
        // Auto check login session status
        if (sessionStorage.getItem('lr_admin_logged_in') === 'true') {
            adminPanel.classList.add('logged-in');
            refreshAdminData();
        } else {
            adminPanel.classList.remove('logged-in');
            passcodeFileInput.value = '';
            errLoginEl.style.display = 'none';
            setTimeout(() => passcodeFileInput.focus(), 150);
        }

        gsap.fromTo('.admin-box',
            { scale: 0.9, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" }
        );
    }

    function closeAdminPanel() {
        gsap.to('.admin-box', {
            scale: 0.9,
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                adminPanel.classList.remove('active');
                lenis.start();
            }
        });
    }

    // Trigger on clicking Footer Logo 5 times
    const footerLogo = document.querySelector('.footer-logo');
    if (footerLogo) {
        let logoClicks = 0;
        let logoTimer;
        footerLogo.addEventListener('click', (e) => {
            e.preventDefault();
            logoClicks++;
            clearTimeout(logoTimer);
            logoTimer = setTimeout(() => logoClicks = 0, 3000);
            
            if (logoClicks >= 5) {
                logoClicks = 0;
                openAdminPanel();
            }
        });
    }

    // Key shortcut Ctrl + Alt + A
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            openAdminPanel();
        }
    });

    closeAdminBtn.addEventListener('click', closeAdminPanel);

    // Secure stateless SHA-256 hashing (pure Javascript, works in any browser context)
    function sha256(ascii) {
        function rightRotate(value, amount) {
            return (value >>> amount) | (value << (32 - amount));
        }
        
        var mathPow = Math.pow;
        var maxWord = mathPow(2, 32);
        var lengthProperty = 'length';
        var i, j; 

        var result = '';
        var words = [];
        var asciiLength = ascii[lengthProperty];
        
        var hash = [
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
        ];

        var k = [
            0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
            0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
            0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
            0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
            0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
            0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
            0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
            0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
        ];
        
        ascii += '\x80'; 
        while (ascii[lengthProperty] % 64 - 56) ascii += '\x00'; 
        for (i = 0; i < ascii[lengthProperty]; i++) {
            var charCode = ascii.charCodeAt(i);
            if (charCode >> 8) return; 
            words[i >> 2] |= charCode << (24 - i % 4 * 8);
        }
        words[words[lengthProperty]] = ((asciiLength / 8) / maxWord) | 0;
        words[words[lengthProperty]] = (asciiLength * 8) | 0;
        
        var h0 = hash[0], h1 = hash[1], h2 = hash[2], h3 = hash[3], h4 = hash[4], h5 = hash[5], h6 = hash[6], h7 = hash[7];
        for (i = 0; i < words[lengthProperty]; i += 16) {
            var w = [];
            for (j = 0; j < 16; j++) w[j] = words[i + j];
            for (j = 16; j < 64; j++) {
                var s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
                var s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
                w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
            }
            
            var a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
            for (j = 0; j < 64; j++) {
                var S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
                var ch = (e & f) ^ (~e & g);
                var temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
                var S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
                var maj = (a & b) ^ (a & c) ^ (b & c);
                var temp2 = (S0 + maj) | 0;
                
                h = g;
                g = f;
                f = e;
                e = (d + temp1) | 0;
                d = c;
                c = b;
                b = a;
                a = (temp1 + temp2) | 0;
            }
            h0 = (h0 + a) | 0;
            h1 = (h1 + b) | 0;
            h2 = (h2 + c) | 0;
            h3 = (h3 + d) | 0;
            h4 = (h4 + e) | 0;
            h5 = (h5 + f) | 0;
            h6 = (h6 + g) | 0;
            h7 = (h7 + h) | 0;
        }
        
        var hWords = [h0, h1, h2, h3, h4, h5, h6, h7];
        for (i = 0; i < 8; i++) {
            var word = hWords[i];
            if (word < 0) word += maxWord;
            var wordHex = word.toString(16).padStart(8, '0');
            result += wordHex;
        }
        return result;
    }

    // Passcode validation via secure SHA-256 hash comparison
    function handleAdminLogin() {
        const passVal = passcodeFileInput.value.trim();
        const hashedInput = sha256(passVal);
        if (hashedInput === "e14cb9e5c0eeee0ea313a4e04fbd10aa17ac17aa33a3cad4bdfe74b87ca18ef8") {
            errLoginEl.style.display = 'none';
            sessionStorage.setItem('lr_admin_logged_in', 'true');
            adminPanel.classList.add('logged-in');
            refreshAdminData();
        } else {
            errLoginEl.style.display = 'block';
            passcodeFileInput.value = '';
            gsap.fromTo(passcodeFileInput, { x: -6 }, { x: 0, duration: 0.4, clearProps: "x", ease: "bounce.out" });
        }
    }

    loginBtn.addEventListener('click', handleAdminLogin);
    passcodeFileInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAdminLogin();
    });

    // Tab Switching
    tabLeadsBtn.addEventListener('click', () => {
        tabLeadsBtn.classList.add('active');
        tabNewsBtn.classList.remove('active');
        leadsTable.style.display = 'table';
        newsTable.style.display = 'none';
    });

    tabNewsBtn.addEventListener('click', () => {
        tabNewsBtn.classList.add('active');
        tabLeadsBtn.classList.remove('active');
        leadsTable.style.display = 'none';
        newsTable.style.display = 'table';
    });

    // Database rendering
    function refreshAdminData() {
        const leads = JSON.parse(localStorage.getItem('lr_leads') || '[]');
        const subscribers = JSON.parse(localStorage.getItem('lr_subscribers') || '[]');
        
        // Stats
        document.getElementById('stat-total-leads').innerText = leads.length;
        document.getElementById('stat-pending-leads').innerText = leads.filter(l => l.status === 'pending').length;
        document.getElementById('stat-newsletter-subs').innerText = subscribers.length;

        renderLeads(leads);
        renderNewsletters(subscribers);
    }

    function renderLeads(leads) {
        const tbody = document.getElementById('admin-leads-tbody');
        tbody.innerHTML = '';
        
        const filterText = searchInput.value.toLowerCase().trim();
        const filteredLeads = leads.filter(l => 
            l.name.toLowerCase().includes(filterText) ||
            l.phone.toLowerCase().includes(filterText) ||
            l.concern.toLowerCase().includes(filterText) ||
            l.id.toLowerCase().includes(filterText)
        );

        if (filteredLeads.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="admin-empty-state">No consultation leads found.</td></tr>`;
            return;
        }

        // Render rows (newest first)
        filteredLeads.reverse().forEach(lead => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${lead.id}</strong></td>
                <td>${lead.name}</td>
                <td><a href="tel:${lead.phone}" style="color:var(--color-primary-light);text-decoration:none;">${lead.phone}</a></td>
                <td style="text-transform: capitalize;">${lead.concern}</td>
                <td>${lead.date} <br><small style="color:var(--color-text-muted);font-size:0.75rem;">at ${lead.timestamp.split(', ')[1] || lead.timestamp}</small></td>
                <td>
                    <span class="status-badge status-${lead.status}">${lead.status}</span>
                </td>
                <td>
                    <button class="btn-table-action btn-toggle-status" data-id="${lead.id}">
                        ${lead.status === 'pending' ? 'Mark Contacted' : 'Mark Pending'}
                    </button>
                    <button class="btn-table-action btn-delete-lead" data-id="${lead.id}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Attach event listeners to table buttons
        tbody.querySelectorAll('.btn-toggle-status').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                toggleLeadStatus(id);
            });
        });

        tbody.querySelectorAll('.btn-delete-lead').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm(`Delete lead ${id}?`)) {
                    deleteLead(id);
                }
            });
        });
    }

    function renderNewsletters(subscribers) {
        const tbody = document.getElementById('admin-news-tbody');
        tbody.innerHTML = '';

        const filterText = searchInput.value.toLowerCase().trim();
        const filteredSubs = subscribers.filter(s => s.email.toLowerCase().includes(filterText));

        if (filteredSubs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="admin-empty-state">No newsletter subscriptions found.</td></tr>`;
            return;
        }

        filteredSubs.reverse().forEach(sub => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sub.email}</td>
                <td>${sub.timestamp}</td>
                <td>
                    <button class="btn-table-action btn-delete-lead btn-delete-sub" data-email="${sub.email}">Unsubscribe</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        tbody.querySelectorAll('.btn-delete-sub').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const email = e.target.getAttribute('data-email');
                if (confirm(`Delete subscription for ${email}?`)) {
                    deleteSubscriber(email);
                }
            });
        });
    }

    // Lead operations
    function toggleLeadStatus(id) {
        let leads = JSON.parse(localStorage.getItem('lr_leads') || '[]');
        leads = leads.map(lead => {
            if (lead.id === id) {
                lead.status = (lead.status === 'pending' ? 'contacted' : 'pending');
            }
            return lead;
        });
        localStorage.setItem('lr_leads', JSON.stringify(leads));
        refreshAdminData();
    }

    function deleteLead(id) {
        let leads = JSON.parse(localStorage.getItem('lr_leads') || '[]');
        leads = leads.filter(lead => lead.id !== id);
        localStorage.setItem('lr_leads', JSON.stringify(leads));
        refreshAdminData();
    }

    function deleteSubscriber(email) {
        let subscribers = JSON.parse(localStorage.getItem('lr_subscribers') || '[]');
        subscribers = subscribers.filter(sub => sub.email !== email);
        localStorage.setItem('lr_subscribers', JSON.stringify(subscribers));
        refreshAdminData();
    }

    // Search filter trigger
    searchInput.addEventListener('input', () => {
        refreshAdminData();
    });

    // Reset database
    resetBtn.addEventListener('click', () => {
        if (confirm("WARNING: Are you sure you want to completely erase the leads and newsletter subscribers database? This action is permanent!")) {
            localStorage.removeItem('lr_leads');
            localStorage.removeItem('lr_subscribers');
            refreshAdminData();
            alert("Database successfully wiped.");
        }
    });

    // CSV Exports
    function exportToCSV(filename, rows) {
        if (rows.length === 0) {
            alert("No data available to export.");
            return;
        }
        
        const processRow = function (row) {
            let finalVal = '';
            for (let j = 0; j < row.length; j++) {
                let innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                }
                let result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        let csvFile = '';
        for (let i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            const link = document.createElement("a");
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

    exportLeadsBtn.addEventListener('click', () => {
        const leads = JSON.parse(localStorage.getItem('lr_leads') || '[]');
        const headers = ["Lead ID", "Patient Name", "WhatsApp Number", "Concern", "Preferred Date", "Sub Date", "Status"];
        const rows = leads.map(l => [l.id, l.name, l.phone, l.concern, l.date, l.timestamp, l.status]);
        rows.unshift(headers);
        exportToCSV("LifeRoot_Consultation_Leads.csv", rows);
    });

    exportNewsBtn.addEventListener('click', () => {
        const subs = JSON.parse(localStorage.getItem('lr_subscribers') || '[]');
        const headers = ["Subscriber Email", "Subscribed Timestamp"];
        const rows = subs.map(s => [s.email, s.timestamp]);
        rows.unshift(headers);
        exportToCSV("LifeRoot_Newsletter_Subscribers.csv", rows);
    });

    // Global Anti-Crash Protection
    window.addEventListener('error', (event) => {
        console.warn("Recovered from unhandled runtime error to prevent app crash:", event.error);
        event.preventDefault(); // Suppress crash display
    });
});
