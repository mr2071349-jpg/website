/**
 * LIFE ROOT AYURVEDA - LUXURY CLINIC APPLICATION
 * DYNAMIC MOTION SYSTEM & INTERACTION ENGINE (GSAP + ScrollTrigger + Lenis)
 * 
 * Architecture: Modular Self-Healing Animation System
 */

import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // ZERO-BROKEN-ANIMATION INTERCEPTOR & VALIDATOR
    // ==========================================================================
    const originalTo = gsap.to;
    const originalFromTo = gsap.fromTo;
    const originalSet = gsap.set;
    const originalTimeline = gsap.timeline;

    function validateTarget(target, method) {
        if (!target) return null;

        // If it's a string selector, query elements
        if (typeof target === 'string') {
            const elements = document.querySelectorAll(target);
            if (elements.length > 0) return target;

            // Target not found: Log detailed diagnosis
            console.log(`[SafeGSAP Debug] Animation Target Not Found:
  - Failed Selector: "${target}"
  - Method: gsap.${method}
  - Context: DOMContentLoaded Page Initializer
  - Diagnosis: The element is missing, obsolete, or has not been rendered.
  - Recommended Fix: Ensure class name or ID matches HTML element exactly, or clean up obsolete animation.`);

            return null; // Skip without throwing errors/warnings to GSAP
        }

        // If it's a NodeList or Array, check and filter
        if (target instanceof NodeList || Array.isArray(target)) {
            const validArray = Array.from(target).filter(el => el !== null && el !== undefined);
            if (validArray.length === 0) return null;
            return validArray;
        }

        // Element check
        if (target instanceof Element) return target;

        // Generic object target (e.g. counting up stats)
        return target;
    }

    // Intercept GSAP core methods
    gsap.to = function(target, vars) {
        const valid = validateTarget(target, 'to');
        if (!valid) return originalTo({}, { duration: 0 }); // safe dummy tween
        return originalTo(valid, vars);
    };

    gsap.fromTo = function(target, fromVars, toVars) {
        const valid = validateTarget(target, 'fromTo');
        if (!valid) return originalTo({}, { duration: 0 });
        return originalFromTo(valid, fromVars, toVars);
    };

    gsap.set = function(target, vars) {
        const valid = validateTarget(target, 'set');
        if (!valid) return originalTo({}, { duration: 0 });
        return originalSet(valid, vars);
    };

    gsap.timeline = function(config) {
        const tl = originalTimeline(config);
        const tlTo = tl.to;
        const tlFromTo = tl.fromTo;
        const tlSet = tl.set;

        tl.to = function(target, vars, position) {
            const valid = validateTarget(target, 'timeline.to');
            if (!valid) return tl;
            return tlTo.call(tl, valid, vars, position);
        };

        tl.fromTo = function(target, fromVars, toVars, position) {
            const valid = validateTarget(target, 'timeline.fromTo');
            if (!valid) return tl;
            return tlFromTo.call(tl, valid, fromVars, toVars, position);
        };

        tl.set = function(target, vars, position) {
            const valid = validateTarget(target, 'timeline.set');
            if (!valid) return tl;
            return tlSet.call(tl, valid, vars, position);
        };

        return tl;
    };

    // ==========================================================================
    // SELF-HEALING ARCHITECTURE: CORE LIFE-CYCLE CONTROLLER
    // ==========================================================================
    class AnimationModule {
        constructor(name) {
            this.name = name;
            this.ctx = null;
            this.initialized = false;
            this.listeners = [];
            this.mountObserver = null;
        }

        init() {
            if (this.initialized) return;

            if (!this.checkRequirements()) {
                this.watchForMount();
                return;
            }

            this.ctx = gsap.context(() => {
                this.setup();
            });

            this.initialized = true;
            console.log(`[AnimationRegistry] Module "${this.name}" initialized successfully.`);
        }

        destroy() {
            if (!this.initialized) return;

            if (this.ctx) {
                this.ctx.revert();
                this.ctx = null;
            }

            this.cleanupListeners();

            if (this.mountObserver) {
                this.mountObserver.disconnect();
                this.mountObserver = null;
            }

            this.cleanupModule();

            this.initialized = false;
            console.log(`[AnimationRegistry] Module "${this.name}" destroyed and cleaned up.`);
        }

        // Automatic helper for event listener tracking and removal
        addListener(element, event, callback, options = {}) {
            if (!element) return;
            element.addEventListener(event, callback, options);
            this.listeners.push({ element, event, callback });
        }

        cleanupListeners() {
            this.listeners.forEach(({ element, event, callback }) => {
                element.removeEventListener(event, callback);
            });
            this.listeners = [];
        }

        // MutationObserver to watch for elements mounting dynamically
        watchForMount() {
            if (this.mountObserver) return;

            this.mountObserver = new MutationObserver(() => {
                if (this.checkRequirements()) {
                    console.log(`[AnimationRegistry] Requirements met dynamically for module "${this.name}". Initializing.`);
                    this.init();
                    this.mountObserver.disconnect();
                    this.mountObserver = null;
                }
            });

            this.mountObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }

        // Stubs for override
        checkRequirements() { return true; }
        setup() {}
        cleanupModule() {}
    }

    // Central Registry for controlling life cycle
    const AnimationRegistry = {
        modules: [],

        register(moduleInstance) {
            this.modules.push(moduleInstance);
            moduleInstance.init();
        },

        destroyAll() {
            this.modules.forEach(m => m.destroy());
            this.modules = [];
        },

        refresh() {
            ScrollTrigger.refresh();
        }
    };

    // Shared Lenis Smooth Scroll Instance
    const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        infinite: false
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Anchor clicks are managed inside InteractiveWidgetsModule for dynamic offsets and modal integration


    // ==========================================================================
    // MODULE 1: TYPOGRAPHY REVEAL CONTROLLER
    // ==========================================================================
    class TypographyModule extends AnimationModule {
        checkRequirements() {
            return document.querySelectorAll('.hero-title, .section-title').length > 0;
        }

        setup() {
            const headings = document.querySelectorAll('.hero-title, .section-title');
            headings.forEach(heading => {
                function processNode(node) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent;
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
                        const clone = node.cloneNode(false);
                        Array.from(node.childNodes).forEach(child => {
                            const processed = processNode(child);
                            if (processed) clone.appendChild(processed);
                        });
                        return clone;
                    }
                    return null;
                }

                const childNodes = Array.from(heading.childNodes);
                heading.innerHTML = '';
                childNodes.forEach(child => {
                    const processed = processNode(child);
                    if (processed) heading.appendChild(processed);
                });
            });
        }
    }
    AnimationRegistry.register(new TypographyModule('TypographyMasking'));


    // ==========================================================================
    // MODULE 2: THREEJS WebGL WAVE BACKGROUND CONTROLLER
    // ==========================================================================
    class ThreeJsBackgroundModule extends AnimationModule {
        constructor() {
            super('ThreeJsBackground');
            this.renderer = null;
            this.scene = null;
            this.camera = null;
            this.particles = null;
            this.geometry = null;
            this.rafId = null;
            this.observer = null;
            this.is3DVisible = true;
            this.count = 0;
        }

        checkRequirements() {
            return document.getElementById('hero-canvas') !== null;
        }

        setup() {
            const canvas3D = document.getElementById('hero-canvas');
            let width3D = canvas3D.clientWidth;
            let height3D = canvas3D.clientHeight;

            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, width3D / height3D, 0.1, 1000);
            this.camera.position.z = 240;
            this.camera.position.y = 90;
            this.camera.rotation.x = -0.35;

            this.renderer = new THREE.WebGLRenderer({ canvas: canvas3D, alpha: true, antialias: true });
            this.renderer.setSize(width3D, height3D);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
                    positions[idxPositions] = ix * gap3D - (countX * gap3D) / 2;
                    positions[idxPositions + 1] = 0;
                    positions[idxPositions + 2] = iy * gap3D - (countY * gap3D) / 2;
                    scales[idxScales] = 1;
                    idxPositions += 3;
                    idxScales++;
                }
            }

            this.geometry = new THREE.BufferGeometry();
            this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            this.geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

            const material3D = new THREE.PointsMaterial({
                color: 0xd4af37,
                size: 2.5,
                transparent: true,
                opacity: 0.4,
                sizeAttenuation: true
            });

            this.particles = new THREE.Points(this.geometry, material3D);
            this.scene.add(this.particles);

            let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;

            this.addListener(window, 'mousemove', (e) => {
                targetX = (e.clientX - window.innerWidth / 2) * 0.1;
                targetY = (e.clientY - window.innerHeight / 2) * 0.1;
            });

            this.addListener(window, 'resize', () => {
                if (!canvas3D.clientWidth) return;
                width3D = canvas3D.clientWidth;
                height3D = canvas3D.clientHeight;
                this.camera.aspect = width3D / height3D;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(width3D, height3D);
            });

            const heroSection = document.getElementById('hero');
            if (heroSection) {
                this.observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        this.is3DVisible = entry.isIntersecting;
                    });
                }, { threshold: 0.05 });
                this.observer.observe(heroSection);
            }

            const self = this;
            function animate3D() {
                if (self.is3DVisible && self.renderer) {
                    self.count += 0.025;

                    const positionAttr = self.geometry.attributes.position;
                    const scaleAttr = self.geometry.attributes.scale;

                    let scaleIndex = 0;
                    for (let ix = 0; ix < countX; ix++) {
                        for (let iy = 0; iy < countY; iy++) {
                            const yHeight = Math.sin((ix + self.count) * 0.3) * 14 + Math.sin((iy + self.count) * 0.5) * 14;
                            positionAttr.setY(scaleIndex, yHeight);
                            
                            const newScale = (Math.sin((ix + self.count) * 0.3) + 1) * 1.2 + (Math.sin((iy + self.count) * 0.5) + 1) * 1.2;
                            scaleAttr.setX(scaleIndex, newScale);

                            scaleIndex++;
                        }
                    }

                    positionAttr.needsUpdate = true;
                    scaleAttr.needsUpdate = true;

                    mouseX += (targetX - mouseX) * 0.05;
                    mouseY += (targetY - mouseY) * 0.05;

                    self.particles.rotation.y = mouseX * 0.003;
                    self.particles.rotation.x = -0.35 + (mouseY * 0.002);

                    self.renderer.render(self.scene, self.camera);
                }
                self.rafId = requestAnimationFrame(animate3D);
            }
            animate3D();
        }

        cleanupModule() {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            if (this.observer) this.observer.disconnect();
            if (this.renderer) {
                this.renderer.dispose();
                this.renderer = null;
            }
        }
    }
    AnimationRegistry.register(new ThreeJsBackgroundModule());


    // ==========================================================================
    // MODULE 3: GOD MODE PREMIUM CURSOR SYSTEM
    // ==========================================================================
    class GodModeCursorModule extends AnimationModule {
        constructor() {
            super('GodModeCursor');
            this.rafId = null;
        }

        checkRequirements() {
            return window.matchMedia('(pointer: fine)').matches && document.getElementById('god-cursor') !== null;
        }

        setup() {
            const gc = document.getElementById('god-cursor');
            const gcLabelText = gc.querySelector('.gc-label-text');
            const gcRippleContainer = gc.querySelector('.gc-ripple-container');
            const gcLightSource = document.getElementById('gc-light-source');

            const physics = {
                mouseX: 0, mouseY: 0,
                x: 0, y: 0, vx: 0, vy: 0,
                stiffness: 0.12, damping: 0.78, mass: 0.8,
                lightX: 0, lightY: 0, lightVx: 0, lightVy: 0,
                lightStiffness: 0.06, lightDamping: 0.82
            };

            let lastMouseX = 0, lastMouseY = 0, mouseSpeed = 0;
            let currentState = '', isMouseInWindow = true;

            this.addListener(window, 'mousemove', (e) => {
                physics.mouseX = e.clientX;
                physics.mouseY = e.clientY;
                const dx = e.clientX - lastMouseX;
                const dy = e.clientY - lastMouseY;
                mouseSpeed = Math.sqrt(dx * dx + dy * dy);
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            });

            this.addListener(document, 'mouseleave', () => {
                isMouseInWindow = false;
                gc.classList.add('gc-hidden');
                if (gcLightSource) gcLightSource.style.opacity = '0';
            });
            this.addListener(document, 'mouseenter', () => {
                isMouseInWindow = true;
                gc.classList.remove('gc-hidden');
                if (gcLightSource) gcLightSource.style.opacity = '1';
            });

            const self = this;
            function updateCursorPhysics() {
                if (!isMouseInWindow) {
                    self.rafId = requestAnimationFrame(updateCursorPhysics);
                    return;
                }

                const forceX = physics.stiffness * (physics.mouseX - physics.x);
                const forceY = physics.stiffness * (physics.mouseY - physics.y);
                physics.vx = (physics.vx + forceX / physics.mass) * physics.damping;
                physics.vy = (physics.vy + forceY / physics.mass) * physics.damping;
                physics.x += physics.vx;
                physics.y += physics.vy;

                if (gcLightSource) {
                    const lightForceX = physics.lightStiffness * (physics.mouseX - physics.lightX);
                    const lightForceY = physics.lightStiffness * (physics.mouseY - physics.lightY);
                    physics.lightVx = (physics.lightVx + lightForceX) * physics.lightDamping;
                    physics.lightVy = (physics.lightVy + lightForceY) * physics.lightDamping;
                    physics.lightX += physics.lightVx;
                    physics.lightY += physics.lightVy;
                    gcLightSource.style.transform = `translate3d(${physics.lightX}px, ${physics.lightY}px, 0) translate(-50%, -50%)`;
                }

                gc.style.transform = `translate3d(${physics.x}px, ${physics.y}px, 0) translate(-50%, -50%)`;
                self.rafId = requestAnimationFrame(updateCursorPhysics);
            }
            updateCursorPhysics();

            if (gcLightSource) gcLightSource.style.opacity = '1';

            function setCursorState(state, label = '') {
                if (currentState === state) return;
                if (currentState) gc.classList.remove(`gc-state-${currentState}`);
                currentState = state;
                if (state) gc.classList.add(`gc-state-${state}`);
                if (gcLabelText) gcLabelText.textContent = label;
            }

            const contextMap = [
                { selector: '.btn-primary, .open-modal-btn, .btn-nav-cta, .pulse-glow-btn', state: 'cta', label: 'BOOK' },
                { selector: '.treatment-card, .amenity-card, .doctor-portrait-img, .remedy-card', state: 'view', label: 'VIEW' },
                { selector: '.carousel-container, #testimonial-track', state: 'drag', label: 'DRAG' },
                { selector: 'input, textarea, select', state: 'form', label: '' },
                { selector: '.dock-item-call', state: 'hover', label: 'CALL' },
                { selector: '.dock-item-chat', state: 'hover', label: 'CHAT' },
                { selector: '#dock-scroll-btn', state: 'hover', label: () => {
                    const dock = document.getElementById('brand-action-dock');
                    return (dock && dock.classList.contains('can-scroll-top')) ? 'TOP' : 'SCROLL';
                } },
                { selector: 'a, button, .nav-link, .floating-btn, .carousel-btn, .accordion-header, .mobile-menu-toggle', state: 'hover', label: '' }
            ];

            this.addListener(document, 'mouseover', (e) => {
                const target = e.target;
                for (const ctx of contextMap) {
                    const matchedEl = target.closest(ctx.selector);
                    if (matchedEl) {
                        const labelText = typeof ctx.label === 'function' ? ctx.label() : ctx.label;
                        setCursorState(ctx.state, labelText);
                        return;
                    }
                }
                setCursorState('', '');
            });

            this.addListener(document, 'mousedown', () => {
                gc.classList.add('gc-state-clicking');
                if (gcRippleContainer) {
                    const ripple = document.createElement('div');
                    ripple.className = 'gc-click-ripple';
                    gcRippleContainer.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 650);
                }
            });

            this.addListener(document, 'mouseup', () => {
                gc.classList.remove('gc-state-clicking');
            });

            let scrollTimeout, isScrolling = false;
            this.addListener(window, 'scroll', () => {
                if (!isScrolling) {
                    gc.classList.add('gc-state-scrolling');
                    isScrolling = true;
                }
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    gc.classList.remove('gc-state-scrolling');
                    isScrolling = false;
                }, 150);
            }, { passive: true });

            // Card Illumination System inside fine-pointer check
            const illuminatedCards = document.querySelectorAll('.treatment-card, .amenity-card, .stat-card, .remedy-card, .timeline-step');
            illuminatedCards.forEach(card => {
                this.addListener(card, 'mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;

                    const shine = card.querySelector('.stat-specular-shine, .treatment-specular-shine, .card-specular-shine, .timeline-specular-shine');
                    if (shine) {
                        shine.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(212, 175, 55, 0.08) 0%, transparent 60%)`;
                    }
                    card.style.setProperty('--gc-light-x', `${x}%`);
                    card.style.setProperty('--gc-light-y', `${y}%`);
                });

                this.addListener(card, 'mouseleave', () => {
                    const shine = card.querySelector('.stat-specular-shine, .treatment-specular-shine, .card-specular-shine, .timeline-specular-shine');
                    if (shine) shine.style.background = '';
                    card.style.removeProperty('--gc-light-x');
                    card.style.removeProperty('--gc-light-y');
                });
            });
        }

        cleanupModule() {
            if (this.rafId) cancelAnimationFrame(this.rafId);
        }
    }
    AnimationRegistry.register(new GodModeCursorModule());


    // ==========================================================================
    // MODULE 4: CINEMATIC PRELOADER & HERO ENTRANCE CONTROLLER
    // ==========================================================================
    class PreloaderAndHeroModule extends AnimationModule {
        checkRequirements() {
            return document.getElementById('loader') !== null;
        }

        setup() {
            const preloader = document.getElementById('loader');
            const progressFill = document.querySelector('.loader-progress-fill');

            lenis.stop();

            // Dynamic split lettering for preloader text
            const titleEl = preloader.querySelector('.loader-logo-title');
            if (titleEl) {
                const text = titleEl.textContent;
                titleEl.innerHTML = text.split('').map(char => `<span class="loader-char" style="display:inline-block; opacity:0; transform:translateY(30px)">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
            }

            const subtitleEl = preloader.querySelector('.loader-logo-subtitle');
            if (subtitleEl) {
                const text = subtitleEl.textContent;
                subtitleEl.innerHTML = text.split('').map(char => `<span class="loader-char" style="display:inline-block; opacity:0; transform:translateY(20px)">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
            }

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

            heroEntranceTimeline.fromTo('.hero-actions .btn',
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

            const loaderTimeline = gsap.timeline({
                onComplete: () => {
                    lenis.start();
                    preloader.classList.add('loaded');
                    heroEntranceTimeline.play();
                }
            });

            // Phase 1: Reveal letters stagger
            loaderTimeline.to('.loader-char', {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.04,
                ease: "power3.out"
            });

            // Phase 2: Simultaneous progress bar fill and letter spacing expansion
            loaderTimeline.to(progressFill, {
                width: "100%",
                duration: 1.8,
                ease: "power3.inOut"
            }, "-=0.4");

            if (titleEl) {
                loaderTimeline.to(titleEl, {
                    letterSpacing: "10px",
                    duration: 1.8,
                    ease: "power3.inOut"
                }, "<");
            }

            if (subtitleEl) {
                loaderTimeline.to(subtitleEl, {
                    letterSpacing: "8px",
                    duration: 1.8,
                    ease: "power3.inOut"
                }, "<");
            }

            // Phase 3: Luxury polygon sweep reveal
            loaderTimeline.to(preloader, {
                clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
                duration: 1.2,
                ease: "power4.inOut"
            }, "+=0.1");
        }
    }
    AnimationRegistry.register(new PreloaderAndHeroModule());


    // ==========================================================================
    // MODULE 5: SCROLL REVEALS & PARALLAX IMAGE CONTROLLER
    // ==========================================================================
    class ScrollRevealParallaxModule extends AnimationModule {
        setup() {
            // ScrollTrigger reveals
            const reveals = document.querySelectorAll('.reveal-on-scroll');
            reveals.forEach(element => {
                let startTransform = { y: 40, opacity: 0 };
                if (element.classList.contains('slide-left-reveal')) {
                    startTransform = { x: -40, opacity: 0 };
                } else if (element.classList.contains('slide-right-reveal')) {
                    startTransform = { x: 40, opacity: 0 };
                }

                gsap.fromTo(element, 
                    { ...startTransform, visibility: "hidden" },
                    {
                        y: 0, x: 0, opacity: 1, visibility: "visible", duration: 1.0, ease: "power3.out",
                        scrollTrigger: {
                            trigger: element,
                            start: "top 88%",
                            toggleActions: "play none none none"
                        }
                    }
                );
            });

            // Grid Reveals
            const grids = ['.grid-treatments', '.remedies-list'];
            grids.forEach(gridSel => {
                const grid = document.querySelector(gridSel);
                if (grid) {
                    gsap.fromTo(grid.children,
                        { y: 50, opacity: 0, visibility: "hidden" },
                        {
                            y: 0, opacity: 1, visibility: "visible", duration: 0.8, stagger: 0.15, ease: "power3.out",
                            scrollTrigger: {
                                trigger: grid,
                                start: "top 85%"
                            }
                        }
                    );
                }
            });

            // Section Titles
            const sectionTitles = document.querySelectorAll('.section-title');
            sectionTitles.forEach(title => {
                const inners = title.querySelectorAll('.char-mask-inner');
                if (inners.length > 0) {
                    gsap.to(inners, {
                        y: 0, duration: 0.8, stagger: 0.04, ease: "power3.out",
                        scrollTrigger: {
                            trigger: title,
                            start: "top 88%",
                            toggleActions: "play none none none"
                        }
                    });
                }
            });

            // Image Parallax
            const parallaxImgs = document.querySelectorAll('.amenity-img, .doctor-portrait-img');
            parallaxImgs.forEach(img => {
                gsap.fromTo(img, 
                    { yPercent: -10 },
                    { 
                        yPercent: 10, ease: "none",
                        scrollTrigger: {
                            trigger: img.parentElement,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: true
                        }
                    }
                );
            });

            // Leaves Parallax
            const leaves = document.querySelectorAll('.floating-leaf');
            leaves.forEach((leaf, idx) => {
                const depthSpeed = (idx + 1) * 25;
                gsap.to(leaf, {
                    y: depthSpeed, ease: "none",
                    scrollTrigger: {
                        trigger: '#hero',
                        start: "top top",
                        end: "bottom top",
                        scrub: true
                    }
                });
            });

            // Timeline line drawing
            const activePath = document.querySelector('.timeline-active-path');
            if (activePath) {
                const pathLength = activePath.getTotalLength() || 100;
                gsap.set(activePath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
                gsap.to(activePath, {
                    strokeDashoffset: 0, ease: "none",
                    scrollTrigger: {
                        trigger: '.timeline-container',
                        start: "top 65%",
                        end: "bottom 70%",
                        scrub: true
                    }
                });
            }

            // Dynamic section background morphing
            const sectionsColorMap = [
                { selector: '#hero', color: '#faf9f6' },
                { selector: '#stats', color: '#fcfbfa' },
                { selector: '#treatments', color: '#f3f1eb' },
                { selector: '#why-choose-us', color: '#eef2ee' },
                { selector: '#amenities', color: '#f6f5f0' },
                { selector: '#testimonials', color: '#faf8f4' },
                { selector: '#certifications', color: '#ffffff' },
                { selector: '#faq', color: '#ffffff' },
                { selector: '#contact', color: '#faf9f6' }
            ];

            sectionsColorMap.forEach(cfg => {
                const section = document.querySelector(cfg.selector);
                if (section) {
                    gsap.to(document.body, {
                        scrollTrigger: {
                            trigger: section,
                            start: "top 50%",
                            end: "bottom 50%",
                            toggleActions: "play reverse play reverse",
                            onEnter: () => {
                                document.body.style.setProperty('--bg-blend-color', cfg.color);
                            },
                            onEnterBack: () => {
                                document.body.style.setProperty('--bg-blend-color', cfg.color);
                            }
                        }
                    });
                }
            });
        }
    }
    AnimationRegistry.register(new ScrollRevealParallaxModule());


    // ==========================================================================
    // MODULE 6: INTERACTIVE WIDGETS & USER INTERFACE CONTROLLER
    // ==========================================================================
    class InteractiveWidgetsModule extends AnimationModule {
        setup() {
            // Ripple buttons logic
            const rippleButtons = document.querySelectorAll('.btn, .carousel-btn, .floating-btn');
            rippleButtons.forEach(btn => {
                this.addListener(btn, 'click', (e) => {
                    const rect = btn.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const ripple = document.createElement('span');
                    ripple.className = 'btn-ripple';
                    ripple.style.left = `${x}px`;
                    ripple.style.top = `${y}px`;
                    btn.appendChild(ripple);
                    setTimeout(() => ripple.remove(), 600);
                });
            });

            // Scroll sticky header & back-to-top button
            const navbar = document.querySelector('.main-navbar');
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('.nav-link');
            this.addListener(window, 'scroll', () => {
                const scrollTop = window.scrollY;

                if (navbar) {
                    if (scrollTop > 50) navbar.classList.add('navbar-scrolled');
                    else navbar.classList.remove('navbar-scrolled');
                }

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
            });

            // Premium Immersive Off-Canvas Navigation Controller
            const menuToggle = document.querySelector('.nav-menu-toggle');
            const offcanvasNav = document.getElementById('offcanvas-nav');
            const offcanvasLinks = document.querySelectorAll('.offcanvas-link');
            let offcanvasLastActive = null;

            if (menuToggle && offcanvasNav) {
                let offcanvasTimeline = null;

                const toggleOffcanvas = () => {
                    const isActive = offcanvasNav.classList.contains('active');
                    menuToggle.classList.toggle('active');
                    offcanvasNav.classList.toggle('active');
                    menuToggle.setAttribute('aria-expanded', !isActive);
                    offcanvasNav.setAttribute('aria-hidden', isActive);

                    if (!isActive) {
                        lenis.stop();
                        offcanvasLastActive = document.activeElement;
                        
                        offcanvasTimeline = gsap.timeline({ defaults: { ease: "power4.out" } });
                        offcanvasTimeline.fromTo('.offcanvas-link-item',
                            { y: 50, rotateX: -20, opacity: 0 },
                            { y: 0, rotateX: 0, opacity: 1, duration: 0.8, stagger: 0.08 }
                        );
                        offcanvasTimeline.fromTo('.offcanvas-meta-panel',
                            { x: 30, opacity: 0 },
                            { x: 0, opacity: 1, duration: 0.8 },
                            "-=0.5"
                        );
                        const firstLink = offcanvasNav.querySelector('.offcanvas-link');
                        if (firstLink) setTimeout(() => firstLink.focus(), 150);
                    } else {
                        lenis.start();
                        if (offcanvasTimeline) {
                            offcanvasTimeline.kill();
                        }
                        if (offcanvasLastActive) offcanvasLastActive.focus();
                        else menuToggle.focus();
                    }
                };

                this.addListener(menuToggle, 'click', toggleOffcanvas);
                offcanvasLinks.forEach(link => {
                    this.addListener(link, 'click', () => {
                        toggleOffcanvas();
                    });
                });

                // Lighting Engine spotlight coordinates mapping
                this.addListener(offcanvasNav, 'mousemove', (e) => {
                    const rect = offcanvasNav.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    offcanvasNav.style.setProperty('--shine-x', `${(x / rect.width) * 100}%`);
                    offcanvasNav.style.setProperty('--shine-y', `${(y / rect.height) * 100}%`);
                });
            }

            // Testimonials slider
            const track = document.getElementById('testimonial-track');
            if (track) {
                const slides = Array.from(track.children);
                const nextBtn = document.getElementById('btn-next-test');
                const prevBtn = document.getElementById('btn-prev-test');
                let currentSlideIndex = 0;

                const moveSlide = (index) => {
                    if (slides.length === 0) return;
                    if (index < 0) index = slides.length - 1;
                    else if (index >= slides.length) index = 0;
                    currentSlideIndex = index;
                    
                    const slideWidth = slides[0].getBoundingClientRect().width;
                    gsap.to(track, {
                        x: -((slideWidth + 30) * currentSlideIndex),
                        duration: 0.6,
                        ease: "power3.out"
                    });

                    const fill = document.querySelector('.carousel-indicator-fill');
                    if (fill) {
                        gsap.to(fill, {
                            width: `${((currentSlideIndex + 1) / slides.length) * 100}%`,
                            duration: 0.4,
                            ease: "power2.out"
                        });
                    }
                };

                if (nextBtn) this.addListener(nextBtn, 'click', () => moveSlide(currentSlideIndex + 1));
                if (prevBtn) this.addListener(prevBtn, 'click', () => moveSlide(currentSlideIndex - 1));
                this.addListener(window, 'resize', () => moveSlide(currentSlideIndex));

                let touchStartX = 0, touchEndX = 0;
                this.addListener(track, 'touchstart', (e) => {
                    touchStartX = e.changedTouches[0].screenX;
                }, { passive: true });

                this.addListener(track, 'touchend', (e) => {
                    touchEndX = e.changedTouches[0].screenX;
                    const threshold = 50;
                    if (touchStartX - touchEndX > threshold) moveSlide(currentSlideIndex + 1);
                    else if (touchEndX - touchStartX > threshold) moveSlide(currentSlideIndex - 1);
                }, { passive: true });
            }

            // FAQ Accordions
            const accordionHeaders = document.querySelectorAll('.accordion-header');
            accordionHeaders.forEach(header => {
                this.addListener(header, 'click', () => {
                    const item = header.parentElement;
                    const body = item.querySelector('.accordion-body');
                    const isActive = item.classList.contains('active');

                    document.querySelectorAll('.accordion-item').forEach(otherItem => {
                        if (otherItem !== item && otherItem.classList.contains('active')) {
                            otherItem.classList.remove('active');
                            const otherBody = otherItem.querySelector('.accordion-body');
                            gsap.to(otherBody, { height: 0, duration: 0.35, ease: "power2.out" });
                            otherItem.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
                            otherBody.setAttribute('aria-hidden', 'true');
                        }
                    });

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

            // Booking Modal
            const modalOverlay = document.getElementById('appointment-modal');
            const openModalBtns = document.querySelectorAll('.open-modal-btn');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const modalForm = document.getElementById('modal-booking-form');
            const modalSuccess = document.getElementById('modal-success-state');
            const successCloseBtn = document.getElementById('success-close-btn');
            let lastActiveElement = null;

            const openModal = () => {
                if (!modalOverlay) return;
                lastActiveElement = document.activeElement;
                modalOverlay.classList.add('active');
                modalOverlay.setAttribute('aria-hidden', 'false');
                lenis.stop();
                gsap.fromTo('.modal-box',
                    { scale: 0.9, opacity: 0, y: 30 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }
                );
                const modalName = document.getElementById('modal-name');
                if (modalName) setTimeout(() => modalName.focus(), 150);
            };

            const closeModal = () => {
                if (!modalOverlay) return;
                gsap.to('.modal-box', {
                    scale: 0.9, opacity: 0, y: 30, duration: 0.4, ease: "power2.inOut",
                    onComplete: () => {
                        modalOverlay.classList.remove('active');
                        modalOverlay.setAttribute('aria-hidden', 'true');
                        lenis.start();
                        if (modalForm) {
                            modalForm.style.display = 'flex';
                            modalForm.reset();
                            removeFormErrors(modalForm);
                        }
                        if (modalSuccess) modalSuccess.classList.remove('active');
                        if (lastActiveElement) lastActiveElement.focus();
                    }
                });
            };

            openModalBtns.forEach(btn => this.addListener(btn, 'click', openModal));
            if (closeModalBtn) this.addListener(closeModalBtn, 'click', closeModal);
            if (successCloseBtn) this.addListener(successCloseBtn, 'click', closeModal);

            if (modalOverlay) {
                this.addListener(modalOverlay, 'click', (e) => {
                    if (e.target === modalOverlay) closeModal();
                });
                this.addListener(document, 'keydown', (e) => {
                    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
                });
            }

            // Policy Modals Interaction System
            const policyModals = document.querySelectorAll('.policy-modal');
            const openPolicyModal = (modalId) => {
                const modal = document.querySelector(modalId);
                if (!modal) return;
                lastActiveElement = document.activeElement;
                modal.classList.add('active');
                modal.setAttribute('aria-hidden', 'false');
                lenis.stop();
                gsap.fromTo(modal.querySelector('.modal-box'),
                    { scale: 0.9, opacity: 0, y: 30 },
                    { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }
                );
                const closeBtn = modal.querySelector('.policy-close-btn');
                if (closeBtn) setTimeout(() => closeBtn.focus(), 150);
            };

            const closePolicyModal = (modal) => {
                if (!modal) return;
                gsap.to(modal.querySelector('.modal-box'), {
                    scale: 0.9, opacity: 0, y: 30, duration: 0.4, ease: "power2.inOut",
                    onComplete: () => {
                        modal.classList.remove('active');
                        modal.setAttribute('aria-hidden', 'true');
                        lenis.start();
                        if (lastActiveElement) lastActiveElement.focus();
                    }
                });
            };

            policyModals.forEach(modal => {
                const closeBtn = modal.querySelector('.policy-close-btn');
                if (closeBtn) {
                    this.addListener(closeBtn, 'click', () => closePolicyModal(modal));
                }
                this.addListener(modal, 'click', (e) => {
                    if (e.target === modal) closePolicyModal(modal);
                });
            });

            this.addListener(document, 'keydown', (e) => {
                if (e.key === 'Escape') {
                    policyModals.forEach(modal => {
                        if (modal.classList.contains('active')) closePolicyModal(modal);
                    });
                }
            });

            // Connected page anchor clicks to Lenis smooth scroll & modals
            document.querySelectorAll('a[href^="#"]:not(.footer-logo)').forEach(anchor => {
                this.addListener(anchor, 'click', function(e) {
                    const targetId = this.getAttribute('href');
                    if (targetId === '#') {
                        e.preventDefault();
                        return;
                    }
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        if (targetElement.classList.contains('modal-overlay')) {
                            if (targetId === '#appointment-modal') {
                                openModal();
                            } else {
                                openPolicyModal(targetId);
                            }
                        } else {
                            const navbarEl = document.querySelector('.main-navbar');
                            const offsetVal = navbarEl ? -navbarEl.offsetHeight : -80;
                            lenis.scrollTo(targetElement, {
                                offset: offsetVal,
                                duration: 1.5
                            });
                        }
                    }
                });
            });

            // Form Submit and validation definitions
            const directForm = document.getElementById('direct-booking-form');
            const directSuccess = document.getElementById('direct-success-state');
            const newsletterForm = document.getElementById('newsletter-form');

            const validateField = (input, validationFn, errorGroupClass = 'form-group') => {
                const group = input.closest(`.${errorGroupClass}`);
                const isValid = validationFn(input.value.trim());
                if (!isValid && group) {
                    group.classList.add('invalid');
                    gsap.fromTo(input, { x: -6 }, { x: 0, duration: 0.4, clearProps: "x", ease: "bounce.out" });
                } else if (group) {
                    group.classList.remove('invalid');
                }
                return isValid;
            };

            const removeFormErrors = (form) => {
                form.querySelectorAll('.form-group').forEach(group => group.classList.remove('invalid'));
            };

            const sanitizeInput = (val) => {
                return val.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
            };

            const nameValid = (val) => val.length >= 3;
            const phoneValid = (val) => /^[6-9]\d{9}$/.test(val);
            const selectionValid = (val) => val !== "";
            const dateValid = (val) => val !== "";
            const emailValid = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

            let directCaptchaAnswer = 0, modalCaptchaAnswer = 0;
            const generateCaptchas = () => {
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
            };
            generateCaptchas();

            const isSpamBot = (form) => {
                const honeypot = form.querySelector('input[name="website_url"]');
                return honeypot && honeypot.value.trim() !== "";
            };

            const isRateLimited = () => {
                const now = Date.now();
                const submissions = JSON.parse(localStorage.getItem('lr_submission_times') || '[]');
                const recentSubmissions = submissions.filter(time => now - time < 300000);
                if (recentSubmissions.length >= 3) return true;
                recentSubmissions.push(now);
                localStorage.setItem('lr_submission_times', JSON.stringify(recentSubmissions));
                return false;
            };

            const saveLeadToDb = (name, phone, concern, date) => {
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
                    refreshAdminData();
                    return newLead.id;
                } catch (e) {
                    console.error("Local database error", e);
                    return 'LR-' + Math.floor(1000 + Math.random() * 9000);
                }
            };

            const saveSubscriberToDb = (email) => {
                try {
                    const subscribers = JSON.parse(localStorage.getItem('lr_subscribers') || '[]');
                    if (!subscribers.some(sub => sub.email === email)) {
                        subscribers.push({ email: sanitizeInput(email), timestamp: new Date().toLocaleString() });
                        localStorage.setItem('lr_subscribers', JSON.stringify(subscribers));
                        refreshAdminData();
                    }
                } catch (e) {
                    console.error("Local database error", e);
                }
            };

            const redirectToWhatsApp = (name, phone, department, date) => {
                const waNumber = "916387742417";
                const message = `Hello Life Root Ayurveda,\nI would like to book a private consultation.\n\n*Name:* ${name}\n*WhatsApp:* ${phone}\n*Concern:* ${department}\n*Preferred Date:* ${date}`;
                window.location.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
            };

            // Modal Form submit listener
            if (modalForm) {
                this.addListener(modalForm, 'submit', (e) => {
                    e.preventDefault();
                    if (isSpamBot(modalForm)) { closeModal(); return; }
                    if (isRateLimited()) { alert("Too many requests. Please wait a few minutes."); return; }

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
                        if (submitBtn) {
                            submitBtn.classList.add('loading');
                            submitBtn.setAttribute('disabled', 'true');
                        }

                        saveLeadToDb(nameInput.value, phoneInput.value, deptInput.value, dateInput.value);

                        setTimeout(() => {
                            if (submitBtn) {
                                submitBtn.classList.remove('loading');
                                submitBtn.removeAttribute('disabled');
                            }
                            if (modalSuccess) {
                                const modalSuccessText = modalSuccess.querySelector('p');
                                if (modalSuccessText) {
                                    modalSuccessText.innerHTML = `Thank you for trusting Life Root Ayurveda. Your private consultation request has been securely registered. We are now redirecting you directly to our senior specialist on WhatsApp.`;
                                }
                                gsap.to(modalForm, {
                                    opacity: 0, duration: 0.3,
                                    onComplete: () => {
                                        modalForm.style.display = 'none';
                                        modalForm.style.opacity = 1;
                                        modalSuccess.classList.add('active');
                                        gsap.fromTo(modalSuccess, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 });
                                        setTimeout(() => {
                                            redirectToWhatsApp(nameInput.value, phoneInput.value, deptInput.value, dateInput.value);
                                        }, 1500);
                                    }
                                });
                            }
                        }, 1000);
                    } else {
                        generateCaptchas();
                    }
                });
            }

            // Direct Form Submit listener
            if (directForm) {
                this.addListener(directForm, 'submit', (e) => {
                    e.preventDefault();
                    if (isSpamBot(directForm)) { directForm.reset(); return; }
                    if (isRateLimited()) { alert("Too many requests."); return; }

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
                        if (submitBtn) {
                            submitBtn.classList.add('loading');
                            submitBtn.setAttribute('disabled', 'true');
                        }

                        saveLeadToDb(nameInput.value, phoneInput.value, deptInput.value, dateInput.value);

                        setTimeout(() => {
                            if (submitBtn) {
                                submitBtn.classList.remove('loading');
                                submitBtn.removeAttribute('disabled');
                            }
                            if (directSuccess) {
                                const directSuccessText = directSuccess.querySelector('p');
                                if (directSuccessText) {
                                    directSuccessText.innerHTML = `Thank you for trusting Life Root Ayurveda. Your request has been safely saved. We are now redirecting you to WhatsApp to consult with our specialist.`;
                                }
                                gsap.to(directForm, {
                                    opacity: 0, duration: 0.3,
                                    onComplete: () => {
                                        directForm.style.display = 'none';
                                        directForm.style.opacity = 1;
                                        directSuccess.classList.add('active');
                                        gsap.fromTo(directSuccess, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 });
                                        setTimeout(() => {
                                            redirectToWhatsApp(nameInput.value, phoneInput.value, deptInput.value, dateInput.value);
                                        }, 1500);
                                    }
                                });
                            }
                        }, 1000);
                    } else {
                        generateCaptchas();
                    }
                });
            }

            // Newsletter submit listener
            if (newsletterForm) {
                this.addListener(newsletterForm, 'submit', (e) => {
                    e.preventDefault();
                    if (isRateLimited()) { alert("Too many requests."); return; }

                    const emailInput = document.getElementById('news-email');
                    const errSpan = document.getElementById('err-news');
                    const successSpan = document.getElementById('success-news');

                    if (!emailInput) return;

                    const isEmailOk = emailValid(emailInput.value.trim());

                    if (isEmailOk) {
                        if (errSpan) errSpan.style.display = 'none';
                        if (successSpan) {
                            successSpan.style.display = 'block';
                            gsap.fromTo(successSpan, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
                            setTimeout(() => {
                                gsap.to(successSpan, { opacity: 0, duration: 0.3, onComplete: () => successSpan.style.display = 'none' });
                            }, 4000);
                        }
                        saveSubscriberToDb(emailInput.value);
                        emailInput.value = '';
                    } else {
                        if (successSpan) successSpan.style.display = 'none';
                        if (errSpan) {
                            errSpan.style.display = 'block';
                            gsap.fromTo(errSpan, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.3 });
                        }
                    }
                });
            }

            // Admin panel logic injection
            function injectAdminPanel() {
                if (document.getElementById('admin-panel')) return;
                const adminHtml = `
                <div class="admin-panel-overlay" id="admin-panel">
                    <div class="admin-box">
                        <div class="admin-header">
                            <h3>Life Root Ayurveda — Patient Dashboard</h3>
                            <button class="admin-close-btn" id="admin-close-btn">&times;</button>
                        </div>
                        
                        <div class="admin-login-view" id="admin-login-view">
                            <div class="admin-login-card">
                                <h4>Administrator Access</h4>
                                <p>Welcome back! Enter your secure passcode to access the patient consultations database.</p>
                                <input type="password" id="admin-passcode-input" placeholder="••••••••" maxlength="16">
                                <div class="err-admin-login" id="err-admin-login">Incorrect Passcode. Please try again.</div>
                                <button class="btn btn-primary w-full" id="admin-login-btn">Unlock Dashboard</button>
                            </div>
                        </div>
                        
                        <div class="admin-dashboard-view" id="admin-dashboard-view">
                            <div class="admin-stats-row">
                                <div class="admin-stat-card">
                                    <span>Total Inquiries</span>
                                    <h4 id="stat-total-leads">0</h4>
                                </div>
                                <div class="admin-stat-card">
                                    <span>New Pending Inquiries</span>
                                    <h4 id="stat-pending-leads">0</h4>
                                </div>
                                <div class="admin-stat-card">
                                    <span>Newsletter Members</span>
                                    <h4 id="stat-newsletter-subs">0</h4>
                                </div>
                            </div>
                            
                            <div class="admin-controls-bar">
                                <div class="admin-search-wrapper">
                                    <input type="text" class="admin-search-input" id="admin-search-input" placeholder="Search by name, phone, or department...">
                                </div>
                                <div class="admin-actions-group">
                                    <button class="btn-admin-action btn-export" id="admin-export-leads-btn">Download Patient Leads (CSV)</button>
                                    <button class="btn-admin-action btn-export" id="admin-export-news-btn">Download Newsletter Leads (CSV)</button>
                                    <button class="btn-admin-action btn-reset" id="admin-reset-btn">Clear Dashboard Records</button>
                                </div>
                            </div>
                            
                            <div class="admin-tab-bar">
                                <button class="admin-tab-btn active" id="tab-leads-btn">Patient Consultation Inquiries</button>
                                <button class="admin-tab-btn" id="tab-news-btn">Newsletter Members List</button>
                            </div>
                            
                            <div class="admin-table-wrapper">
                                <table class="admin-table" id="admin-leads-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Patient Name</th>
                                            <th>WhatsApp Contact</th>
                                            <th>Concern</th>
                                            <th>Appointment Date / Slot</th>
                                            <th>Status</th>
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
            const passcodeFileInput = document.getElementById('admin-passcode-input');
            const loginBtn = document.getElementById('admin-login-btn');
            const errLoginEl = document.getElementById('err-admin-login');
            const closeAdminBtn = document.getElementById('admin-close-btn');

            const leadsTable = document.getElementById('admin-leads-table');
            const newsTable = document.getElementById('admin-news-table');
            const tabLeadsBtn = document.getElementById('tab-leads-btn');
            const tabNewsBtn = document.getElementById('tab-news-btn');

            const searchInput = document.getElementById('admin-search-input');
            const exportLeadsBtn = document.getElementById('admin-export-leads-btn');
            const exportNewsBtn = document.getElementById('admin-export-news-btn');
            const resetBtn = document.getElementById('admin-reset-btn');

            const openAdminPanel = () => {
                if (!adminPanel) return;
                adminPanel.classList.add('active');
                lenis.stop();
                if (sessionStorage.getItem('lr_admin_logged_in') === 'true') {
                    adminPanel.classList.add('logged-in');
                    refreshAdminData();
                } else {
                    adminPanel.classList.remove('logged-in');
                    if (passcodeFileInput) {
                        passcodeFileInput.value = '';
                        setTimeout(() => passcodeFileInput.focus(), 150);
                    }
                    if (errLoginEl) errLoginEl.style.display = 'none';
                }
                gsap.fromTo('.admin-box', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.2)" });
            };

            const closeAdminPanel = () => {
                if (!adminPanel) return;
                gsap.to('.admin-box', {
                    scale: 0.9, opacity: 0, duration: 0.3,
                    onComplete: () => {
                        adminPanel.classList.remove('active');
                        lenis.start();
                    }
                });
            };

            // Trigger on clicking Footer Logo 5 times
            const footerLogo = document.querySelector('.footer-logo');
            if (footerLogo) {
                let logoClicks = 0;
                let lastClickTime = 0;
                let logoTimer = null;
                const CLICK_TIMEOUT = 2000; // Configurable timeout: 2 seconds window between clicks
                const MIN_CLICK_INTERVAL = 200; // Ignore clicks/taps faster than 200ms (accidental double-firing/bounces)

                // Prevent mobile double-tap zoom delay to ensure rapid taps register immediately
                footerLogo.style.touchAction = 'manipulation';

                this.addListener(footerLogo, 'click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    // If admin panel is already open, ignore clicks
                    if (adminPanel && adminPanel.classList.contains('active')) {
                        return;
                    }

                    const now = Date.now();
                    
                    // Ignore accidental double-events / rapid double-taps
                    if (now - lastClickTime < MIN_CLICK_INTERVAL) {
                        return;
                    }
                    
                    lastClickTime = now;
                    logoClicks++;
                    
                    clearTimeout(logoTimer);
                    
                    if (logoClicks >= 5) {
                        logoClicks = 0;
                        openAdminPanel();
                    } else {
                        logoTimer = setTimeout(() => {
                            logoClicks = 0;
                        }, CLICK_TIMEOUT);
                    }
                });
            }

            this.addListener(document, 'keydown', (e) => {
                if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
                    e.preventDefault();
                    openAdminPanel();
                }
            });

            if (closeAdminBtn) this.addListener(closeAdminBtn, 'click', closeAdminPanel);

            // SHA-256 Passcode validation
            function sha256(ascii) {
                function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
                var mathPow = Math.pow, maxWord = mathPow(2, 32), lengthProperty = 'length', i, j;
                var result = '', words = [], asciiLength = ascii[lengthProperty];
                var hash = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
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
                        h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
                    }
                    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0; h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
                }
                var hWords = [h0, h1, h2, h3, h4, h5, h6, h7];
                for (i = 0; i < 8; i++) {
                    var word = hWords[i];
                    if (word < 0) word += maxWord;
                    result += word.toString(16).padStart(8, '0');
                }
                return result;
            }

            const handleAdminLogin = () => {
                if (!passcodeFileInput) return;
                const passVal = passcodeFileInput.value.trim();
                if (sha256(passVal) === "e14cb9e5c0eeee0ea313a4e04fbd10aa17ac17aa33a3cad4bdfe74b87ca18ef8") {
                    if (errLoginEl) errLoginEl.style.display = 'none';
                    sessionStorage.setItem('lr_admin_logged_in', 'true');
                    adminPanel.classList.add('logged-in');
                    refreshAdminData();
                } else {
                    if (errLoginEl) errLoginEl.style.display = 'block';
                    passcodeFileInput.value = '';
                    gsap.fromTo(passcodeFileInput, { x: -6 }, { x: 0, duration: 0.4, clearProps: "x", ease: "bounce.out" });
                }
            };

            if (loginBtn) this.addListener(loginBtn, 'click', handleAdminLogin);
            if (passcodeFileInput) {
                this.addListener(passcodeFileInput, 'keydown', (e) => {
                    if (e.key === 'Enter') handleAdminLogin();
                });
            }

            if (tabLeadsBtn) {
                this.addListener(tabLeadsBtn, 'click', () => {
                    tabLeadsBtn.classList.add('active');
                    if (tabNewsBtn) tabNewsBtn.classList.remove('active');
                    if (leadsTable) leadsTable.style.display = 'table';
                    if (newsTable) newsTable.style.display = 'none';
                });
            }

            if (tabNewsBtn) {
                this.addListener(tabNewsBtn, 'click', () => {
                    tabNewsBtn.classList.add('active');
                    if (tabLeadsBtn) tabLeadsBtn.classList.remove('active');
                    if (leadsTable) leadsTable.style.display = 'none';
                    if (newsTable) newsTable.style.display = 'table';
                });
            }

            function refreshAdminData() {
                const leads = JSON.parse(localStorage.getItem('lr_leads') || '[]');
                const subscribers = JSON.parse(localStorage.getItem('lr_subscribers') || '[]');
                
                const totalEl = document.getElementById('stat-total-leads');
                const pendingEl = document.getElementById('stat-pending-leads');
                const subsEl = document.getElementById('stat-newsletter-subs');

                if (totalEl) totalEl.innerText = leads.length;
                if (pendingEl) pendingEl.innerText = leads.filter(l => l.status === 'pending').length;
                if (subsEl) subsEl.innerText = subscribers.length;

                renderLeads(leads);
                renderNewsletters(subscribers);
            }

            function renderLeads(leads) {
                const tbody = document.getElementById('admin-leads-tbody');
                if (!tbody) return;
                tbody.innerHTML = '';
                
                const filterText = searchInput ? searchInput.value.toLowerCase().trim() : '';
                const filteredLeads = leads.filter(l => 
                    l.name.toLowerCase().includes(filterText) ||
                    l.phone.toLowerCase().includes(filterText) ||
                    l.concern.toLowerCase().includes(filterText) ||
                    l.id.toLowerCase().includes(filterText)
                );

                if (filteredLeads.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="7" class="admin-empty-state">No patient inquiries have been received yet.</td></tr>`;
                    return;
                }

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
                if (!tbody) return;
                tbody.innerHTML = '';

                const filterText = searchInput ? searchInput.value.toLowerCase().trim() : '';
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

            function toggleLeadStatus(id) {
                let leads = JSON.parse(localStorage.getItem('lr_leads') || '[]');
                leads = leads.map(lead => {
                    if (lead.id === id) lead.status = (lead.status === 'pending' ? 'contacted' : 'pending');
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

            if (searchInput) {
                this.addListener(searchInput, 'input', () => refreshAdminData());
            }

            if (resetBtn) {
                this.addListener(resetBtn, 'click', () => {
                    if (confirm("WARNING: Are you sure you want to permanently clear all records?")) {
                        localStorage.removeItem('lr_leads');
                        localStorage.removeItem('lr_subscribers');
                        refreshAdminData();
                        alert("Cleared successfully.");
                    }
                });
            }

            function exportToCSV(filename, rows) {
                if (rows.length === 0) return;
                const processRow = function (row) {
                    let finalVal = '';
                    for (let j = 0; j < row.length; j++) {
                        let innerValue = row[j] === null ? '' : row[j].toString();
                        let result = innerValue.replace(/"/g, '""');
                        if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
                        if (j > 0) finalVal += ',';
                        finalVal += result;
                    }
                    return finalVal + '\n';
                };
                let csvFile = '';
                for (let i = 0; i < rows.length; i++) csvFile += processRow(rows[i]);
                const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
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

            if (exportLeadsBtn) {
                this.addListener(exportLeadsBtn, 'click', () => {
                    const leads = JSON.parse(localStorage.getItem('lr_leads') || '[]');
                    const headers = ["Lead ID", "Patient Name", "WhatsApp Number", "Concern", "Preferred Date", "Sub Date", "Status"];
                    const rows = leads.map(l => [l.id, l.name, l.phone, l.concern, l.date, l.timestamp, l.status]);
                    rows.unshift(headers);
                    exportToCSV("LifeRoot_Consultation_Leads.csv", rows);
                });
            }

            if (exportNewsBtn) {
                this.addListener(exportNewsBtn, 'click', () => {
                    const subs = JSON.parse(localStorage.getItem('lr_subscribers') || '[]');
                    const headers = ["Subscriber Email", "Subscribed Timestamp"];
                    const rows = subs.map(s => [s.email, s.timestamp]);
                    rows.unshift(headers);
                    exportToCSV("LifeRoot_Newsletter_Subscribers.csv", rows);
                });
            }
        }
    }
    AnimationRegistry.register(new InteractiveWidgetsModule());


    // ==========================================================================
    // MODULE 7: SPRING PHYSICS & ART OBJECTS ENGINE CONTROLLER
    // ==========================================================================
    class Spring {
        constructor(val = 0, tension = 100, friction = 12) {
            this.value = val;
            this.target = val;
            this.velocity = 0;
            this.tension = tension;
            this.friction = friction;
        }
        update(dt) {
            const force = (this.target - this.value) * this.tension;
            const damping = -this.velocity * this.friction;
            const acceleration = force + damping;
            this.velocity += acceleration * dt;
            this.value += this.velocity * dt;
            return this.value;
        }
    }

    class CardParticles {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.width = 0;
            this.height = 0;
            this.resize();
            this.initParticles();
        }
        resize() {
            if (!this.canvas || !this.canvas.parentNode) return;
            const rect = this.canvas.parentNode.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * (window.devicePixelRatio || 1);
            this.canvas.height = this.height * (window.devicePixelRatio || 1);
            this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        }
        initParticles() {
            this.particles = [];
            const count = 18;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    r: Math.random() * 1.3 + 0.4,
                    vx: (Math.random() - 0.5) * 0.08,
                    vy: (Math.random() - 0.5) * 0.08 - 0.04,
                    alpha: Math.random() * 0.35 + 0.1
                });
            }
        }
        updateAndDraw(tiltX, tiltY) {
            this.ctx.clearRect(0, 0, this.width, this.height);
            const driftX = tiltY * 0.04; 
            const driftY = -tiltX * 0.04; 
            
            this.particles.forEach(p => {
                p.x += p.vx + driftX;
                p.y += p.vy + driftY;
                
                if (p.x < 0) p.x = this.width;
                if (p.x > this.width) p.x = 0;
                if (p.y < 0) p.y = this.height;
                if (p.y > this.height) p.y = 0;
                
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
                this.ctx.fill();
            });
        }
    }

    class TreatmentWaves {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.width = 0;
            this.height = 0;
            this.time = Math.random() * 100;
            this.waveSpeedSpring = new Spring(0.8, 40, 10);
            this.waveAmplitudeSpring = new Spring(25, 45, 12);
            this.resize();
        }
        resize() {
            if (!this.canvas || !this.canvas.parentNode) return;
            const rect = this.canvas.parentNode.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * (window.devicePixelRatio || 1);
            this.canvas.height = this.height * (window.devicePixelRatio || 1);
            this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
        }
        updateAndDraw(dt, hoverActive) {
            if (this.width === 0 || this.height === 0) return;
            this.ctx.clearRect(0, 0, this.width, this.height);
            
            this.waveSpeedSpring.target = hoverActive ? 2.4 : 0.8;
            this.waveAmplitudeSpring.target = hoverActive ? 42 : 25;

            const speed = this.waveSpeedSpring.update(dt);
            const amplitude = this.waveAmplitudeSpring.update(dt);
            this.time += dt * speed;

            this.drawWave(amplitude, 0.015, this.time, 'rgba(212, 175, 55, 0.35)', 1.2);
            this.drawWave(amplitude * 0.7, 0.008, -this.time * 0.7, 'rgba(27, 67, 50, 0.25)', 2.0);
            this.drawWave(amplitude * 0.4, 0.022, this.time * 1.4 + 2, 'rgba(212, 175, 55, 0.18)', 0.8);
        }
        drawWave(amp, freq, phase, strokeStyle, lineWidth) {
            this.ctx.beginPath();
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = lineWidth;
            this.ctx.lineCap = 'round';
            const centerY = this.height / 2;

            for (let x = 0; x < this.width; x += 3) {
                const y = centerY + Math.sin(x * freq + phase) * amp * (0.8 + 0.2 * Math.sin(x * 0.002));
                if (x === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.stroke();
        }
    }

    class StatDials {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.width = 0;
            this.height = 0;
            this.progress = 0;
            this.resize();
        }
        resize() {
            if (!this.canvas || !this.canvas.parentNode) return;
            const rect = this.canvas.parentNode.getBoundingClientRect();
            this.width = rect.width;
            this.height = rect.height;
            this.canvas.width = this.width * (window.devicePixelRatio || 1);
            this.canvas.height = this.height * (window.devicePixelRatio || 1);
            this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
            this.draw();
        }
        setProgress(p) {
            this.progress = p;
            this.draw();
        }
        draw() {
            if (this.width === 0 || this.height === 0) return;
            this.ctx.clearRect(0, 0, this.width, this.height);

            const centerX = this.width / 2;
            const centerY = this.height / 2;
            const radius = Math.min(this.width, this.height) * 0.38;

            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = 'rgba(212, 175, 55, 0.04)';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();

            if (this.progress > 0) {
                this.ctx.beginPath();
                const startAngle = -Math.PI / 2;
                const endAngle = startAngle + (Math.PI * 2 * this.progress);
                this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                
                const grad = this.ctx.createLinearGradient(0, 0, this.width, this.height);
                grad.addColorStop(0, '#d4af37');
                grad.addColorStop(1, '#b9935a');
                
                this.ctx.strokeStyle = grad;
                this.ctx.lineWidth = 3;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();
            }
        }
    }

    class ArtObjectsEngineModule extends AnimationModule {
        constructor() {
            super('ArtObjectsEngine');
            this.rafId = null;
            this.resizeHandlers = [];
        }

        setup() {
            const hoverSupported = window.matchMedia('(hover: hover)').matches;
            const section = document.querySelector('.art-section');

            if (section) {
                this.addListener(section, 'mousemove', (e) => {
                    const rect = section.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    section.style.setProperty('--glow-x', `${x}px`);
                    section.style.setProperty('--glow-y', `${y}px`);
                });
            }

            const hero = document.querySelector('.hero-section');
            const heroDoctor = document.querySelector('.doctor-graphic-wrapper');
            const heroDoctorImg = document.querySelector('.doctor-portrait-img');
            const leaf1 = document.querySelector('.leaf-1');
            const leaf2 = document.querySelector('.leaf-2');
            const leaf3 = document.querySelector('.leaf-3');
            const annoLeft = document.querySelector('.annotation-left');
            const annoRight = document.querySelector('.annotation-right');

            const heroSprings = {
                tiltX: new Spring(0, 80, 14), tiltY: new Spring(0, 80, 14),
                imgX: new Spring(0, 70, 12), imgY: new Spring(0, 70, 12),
                shineX: new Spring(50, 50, 10), shineY: new Spring(50, 50, 10),
                leaf1X: new Spring(0, 45, 9), leaf1Y: new Spring(0, 45, 9),
                leaf2X: new Spring(0, 55, 11), leaf2Y: new Spring(0, 55, 11),
                leaf3X: new Spring(0, 35, 7), leaf3Y: new Spring(0, 35, 7),
                annoLX: new Spring(0, 65, 12), annoLY: new Spring(0, 65, 12),
                annoRX: new Spring(0, 70, 13), annoRY: new Spring(0, 70, 13)
            };

            if (hero && hoverSupported) {
                this.addListener(hero, 'mousemove', (e) => {
                    const rect = hero.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    const offX = (x - centerX) / centerX;
                    const offY = (y - centerY) / centerY;

                    heroSprings.tiltX.target = -offY * 6;
                    heroSprings.tiltY.target = offX * 6;
                    heroSprings.imgX.target = offX * -8;
                    heroSprings.imgY.target = offY * -8;
                    heroSprings.shineX.target = (x / rect.width) * 100;
                    heroSprings.shineY.target = (y / rect.height) * 100;
                    heroSprings.leaf1X.target = offX * 40;
                    heroSprings.leaf1Y.target = offY * 40;
                    heroSprings.leaf2X.target = offX * -25;
                    heroSprings.leaf2Y.target = offY * -25;
                    heroSprings.leaf3X.target = offX * 15;
                    heroSprings.leaf3Y.target = offY * 15;
                    heroSprings.annoLX.target = offX * 22;
                    heroSprings.annoLY.target = offY * 22;
                    heroSprings.annoRX.target = offX * -18;
                    heroSprings.annoRY.target = offY * -18;
                });

                this.addListener(hero, 'mouseleave', () => {
                    Object.keys(heroSprings).forEach(k => {
                        heroSprings[k].target = k.includes('shine') ? 50 : 0;
                    });
                });
            }

            const statCards = document.querySelectorAll('.stat-card');
            const statInstances = [];

            statCards.forEach((card, idx) => {
                const inner = card.querySelector('.stat-card-inner');
                const canvas = card.querySelector('.stat-radial-canvas');
                const shadow = card.querySelector('.stat-ambient-shadow');
                const numEl = card.querySelector('.stat-number');

                if (!inner || !numEl) return;

                const targetVal = parseFloat(numEl.getAttribute('data-target'));
                const isDecimal = numEl.getAttribute('data-decimal') === 'true';

                const springs = {
                    tiltX: new Spring(0, 80, 15), tiltY: new Spring(0, 80, 15),
                    shineX: new Spring(50, 50, 10), shineY: new Spring(50, 50, 10),
                    shadowX: new Spring(0, 60, 12), shadowY: new Spring(15, 60, 12),
                    lift: new Spring(0, 45, 8)
                };

                let dialInstance = null;
                if (canvas) {
                    dialInstance = new StatDials(canvas);
                    const resizeFn = () => dialInstance.resize();
                    window.addEventListener('resize', resizeFn);
                    this.resizeHandlers.push({ element: window, fn: resizeFn });
                }

                const progressObj = { value: 0 };
                gsap.to(progressObj, {
                    value: 1, duration: 2.2, ease: "power2.out",
                    scrollTrigger: { trigger: card, start: "top 95%", toggleActions: "play none none none" },
                    onUpdate: () => {
                        const currentNum = progressObj.value * targetVal;
                        numEl.innerText = isDecimal ? currentNum.toFixed(1) : Math.round(currentNum).toLocaleString();
                        if (dialInstance) dialInstance.setProgress(progressObj.value);
                    }
                });

                if (hoverSupported) {
                    this.addListener(card, 'mousemove', (e) => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;

                        springs.tiltX.target = ((centerY - y) / centerY) * 7;
                        springs.tiltY.target = ((x - centerX) / centerX) * 7;
                        springs.shineX.target = (x / rect.width) * 100;
                        springs.shineY.target = (y / rect.height) * 100;
                        springs.shadowX.target = ((x - centerX) / centerX) * -12;
                        springs.shadowY.target = 15 + ((y - centerY) / centerY) * -10;
                    });

                    this.addListener(card, 'mouseenter', () => { springs.lift.target = 15; });
                    this.addListener(card, 'mouseleave', () => {
                        springs.lift.target = 0; springs.tiltX.target = 0; springs.tiltY.target = 0;
                        springs.shineX.target = 50; springs.shineY.target = 50;
                        springs.shadowX.target = 0; springs.shadowY.target = 15;
                    });
                }

                gsap.set(card, { opacity: 0, y: 40 });
                gsap.to(card, {
                    opacity: 1, y: 0, duration: 1.0, delay: idx * 0.12, ease: "power2.out",
                    scrollTrigger: { trigger: card, start: "top 95%", toggleActions: "play none none none" },
                    onComplete: () => { card.style.transform = ''; }
                });

                statInstances.push({
                    card, inner, shadow, springs,
                    update: function(dt) {
                        const tX = springs.tiltX.update(dt);
                        const tY = springs.tiltY.update(dt);
                        const shX = springs.shineX.update(dt);
                        const shY = springs.shineY.update(dt);
                        const sdX = springs.shadowX.update(dt);
                        const sdY = springs.shadowY.update(dt);
                        const zLift = springs.lift.update(dt);
                        inner.style.transform = `perspective(1000px) rotateX(${tX}deg) rotateY(${tY}deg) translate3d(0, 0, ${zLift}px)`;
                        inner.style.setProperty('--shine-x', `${shX}%`);
                        inner.style.setProperty('--shine-y', `${shY}%`);
                        if (shadow) {
                            shadow.style.setProperty('--shadow-x', `${sdX}px`);
                            shadow.style.setProperty('--shadow-y', `${sdY}px`);
                        }
                    }
                });
            });

            const treatmentCards = document.querySelectorAll('.treatment-card');
            const treatmentInstances = [];

            treatmentCards.forEach((card, idx) => {
                const inner = card.querySelector('.treatment-card-inner');
                const btn = card.querySelector('.magnetic-btn');
                const canvas = card.querySelector('.treatment-energy-canvas');
                const shadow = card.querySelector('.treatment-ambient-shadow');
                const title = card.querySelector('.treatment-title');

                if (!inner) return;

                const personalities = [
                    { tension: 70, friction: 13, maxTilt: 6, maxParallax: 10 },
                    { tension: 85, friction: 14, maxTilt: 8, maxParallax: 14 },
                    { tension: 75, friction: 12, maxTilt: 5, maxParallax: 9 },
                    { tension: 100, friction: 15, maxTilt: 9, maxParallax: 15 },
                    { tension: 80, friction: 13, maxTilt: 7, maxParallax: 11 }
                ];
                const config = personalities[idx % personalities.length];

                const springs = {
                    tiltX: new Spring(0, config.tension, config.friction),
                    tiltY: new Spring(0, config.tension, config.friction),
                    shineX: new Spring(50, 60, 10), shineY: new Spring(50, 60, 10),
                    shadowX: new Spring(0, config.tension - 15, config.friction + 3),
                    shadowY: new Spring(20, config.tension - 15, config.friction + 3),
                    btnX: new Spring(0, 95, 13), btnY: new Spring(0, 95, 13),
                    lift: new Spring(0, 50, 8)
                };

                let waveInstance = null;
                if (canvas) {
                    waveInstance = new TreatmentWaves(canvas);
                    const resizeFn = () => waveInstance.resize();
                    window.addEventListener('resize', resizeFn);
                    this.resizeHandlers.push({ element: window, fn: resizeFn });
                }

                let hovered = false;

                if (hoverSupported) {
                    this.addListener(card, 'mousemove', (e) => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;

                        springs.tiltX.target = ((centerY - y) / centerY) * config.maxTilt;
                        springs.tiltY.target = ((x - centerX) / centerX) * config.maxTilt;
                        springs.shineX.target = (x / rect.width) * 100;
                        springs.shineY.target = (y / rect.height) * 100;
                        springs.shadowX.target = ((x - centerX) / centerX) * -14;
                        springs.shadowY.target = 20 + ((y - centerY) / centerY) * -10;

                        if (btn) {
                            const btnRect = btn.getBoundingClientRect();
                            const btnCenterX = btnRect.left + btnRect.width / 2;
                            const btnCenterY = btnRect.top + btnRect.height / 2;
                            const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);
                            if (dist < 75) {
                                springs.btnX.target = (e.clientX - btnCenterX) * 0.45;
                                springs.btnY.target = (e.clientY - btnCenterY) * 0.45;
                            } else {
                                springs.btnX.target = 0; springs.btnY.target = 0;
                            }
                        }
                    });

                    this.addListener(card, 'mouseenter', () => {
                        springs.lift.target = 18; hovered = true;
                        if (title) gsap.to(title, { letterSpacing: "0.04em", duration: 0.8, ease: "power3.out", overwrite: "auto" });
                    });

                    this.addListener(card, 'mouseleave', () => {
                        springs.lift.target = 0; springs.tiltX.target = 0; springs.tiltY.target = 0;
                        springs.shineX.target = 50; springs.shineY.target = 50;
                        springs.shadowX.target = 0; springs.shadowY.target = 20;
                        springs.btnX.target = 0; springs.btnY.target = 0;
                        hovered = false;
                        if (title) gsap.to(title, { letterSpacing: "0em", duration: 0.8, ease: "power3.out", overwrite: "auto" });
                    });
                }

                gsap.set(card, { opacity: 0, y: 50, rotateX: 8 });
                gsap.to(card, {
                    opacity: 1, y: 0, rotateX: 0, duration: 1.2, delay: idx * 0.15, ease: "power3.out",
                    scrollTrigger: { trigger: card, start: "top 92%", toggleActions: "play none none none" },
                    onComplete: () => { card.style.transform = ''; }
                });

                treatmentInstances.push({
                    card, inner, btn, shadow, springs, wave: waveInstance,
                    update: function(dt) {
                        const tX = springs.tiltX.update(dt);
                        const tY = springs.tiltY.update(dt);
                        const shX = springs.shineX.update(dt);
                        const shY = springs.shineY.update(dt);
                        const sdX = springs.shadowX.update(dt);
                        const sdY = springs.shadowY.update(dt);
                        const bX = springs.btnX.update(dt);
                        const bY = springs.btnY.update(dt);
                        const zLift = springs.lift.update(dt);
                        inner.style.transform = `perspective(1000px) rotateX(${tX}deg) rotateY(${tY}deg) translate3d(0, 0, ${zLift}px)`;
                        inner.style.setProperty('--shine-x', `${shX}%`);
                        inner.style.setProperty('--shine-y', `${shY}%`);
                        if (shadow) {
                            shadow.style.setProperty('--shadow-x', `${sdX}px`);
                            shadow.style.setProperty('--shadow-y', `${sdY}px`);
                        }
                        if (btn) btn.style.transform = `translate3d(${bX}px, ${bY}px, 20px)`;
                        if (this.wave) this.wave.updateAndDraw(dt, hovered);
                    }
                });
            });

            const timelineSteps = document.querySelectorAll('.timeline-step');
            const timelineInstances = [];

            timelineSteps.forEach((step, idx) => {
                const inner = step.querySelector('.timeline-step-inner');
                const shadow = step.querySelector('.timeline-step-ambient-shadow');

                if (!inner) return;

                const springs = {
                    tiltX: new Spring(0, 90, 15), tiltY: new Spring(0, 90, 15),
                    shineX: new Spring(50, 50, 10), shineY: new Spring(50, 50, 10),
                    shadowX: new Spring(0, 70, 13), shadowY: new Spring(8, 70, 13),
                    lift: new Spring(0, 50, 8)
                };

                if (hoverSupported) {
                    this.addListener(step, 'mousemove', (e) => {
                        const rect = step.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;

                        springs.tiltX.target = ((centerY - y) / centerY) * 4;
                        springs.tiltY.target = ((x - centerX) / centerX) * 4;
                        springs.shineX.target = (x / rect.width) * 100;
                        springs.shineY.target = (y / rect.height) * 100;
                        springs.shadowX.target = ((x - centerX) / centerX) * -8;
                        springs.shadowY.target = 8 + ((y - centerY) / centerY) * -6;
                    });

                    this.addListener(step, 'mouseenter', () => { springs.lift.target = 10; });
                    this.addListener(step, 'mouseleave', () => {
                        springs.lift.target = 0; springs.tiltX.target = 0; springs.tiltY.target = 0;
                        springs.shineX.target = 50; springs.shineY.target = 50;
                        springs.shadowX.target = 0; springs.shadowY.target = 8;
                    });
                }

                timelineInstances.push({
                    step, inner, shadow, springs,
                    update: function(dt) {
                        const tX = springs.tiltX.update(dt);
                        const tY = springs.tiltY.update(dt);
                        const shX = springs.shineX.update(dt);
                        const shY = springs.shineY.update(dt);
                        const sdX = springs.shadowX.update(dt);
                        const sdY = springs.shadowY.update(dt);
                        const zLift = springs.lift.update(dt);
                        inner.style.transform = `perspective(1000px) rotateX(${tX}deg) rotateY(${tY}deg) translate3d(0, 0, ${zLift}px)`;
                        inner.style.setProperty('--shine-x', `${shX}%`);
                        inner.style.setProperty('--shine-y', `${shY}%`);
                        if (shadow) {
                            shadow.style.setProperty('--shadow-x', `${sdX}px`);
                            shadow.style.setProperty('--shadow-y', `${sdY}px`);
                        }
                    }
                });
            });

            const cards = document.querySelectorAll('.amenity-card');
            const cardInstances = [];

            cards.forEach((card, idx) => {
                const inner = card.querySelector('.amenity-card-inner');
                const img = card.querySelector('.amenity-img');
                const btn = card.querySelector('.magnetic-btn');
                const canvas = card.querySelector('.card-particles-canvas');
                const shadow = card.querySelector('.card-ambient-shadow');
                const tag = card.querySelector('.amenity-tag');
                const title = card.querySelector('.amenity-info h3');
                const chars = card.querySelectorAll('.char');
                const desc = card.querySelector('.amenity-info p');
                const btnWrap = card.querySelector('.magnetic-btn-wrap');

                if (!inner || !img) return;

                gsap.set(card, { opacity: 0, y: 70, rotateX: 12 });
                if (tag) gsap.set(tag, { opacity: 0, y: 15 });
                if (chars) gsap.set(chars, { opacity: 0, y: 18 });
                if (desc) gsap.set(desc, { opacity: 0, y: 15 });
                if (btnWrap) gsap.set(btnWrap, { opacity: 0, scale: 0.9, y: 15 });

                const easings = ["power4.out", "back.out(1.5)", "power3.out", "expo.out", "circ.out"];
                const cardEase = easings[idx % easings.length];
                const delayOffset = idx * 0.22;

                gsap.to(card, {
                    opacity: 1, y: 0, rotateX: 0, duration: 1.3, delay: delayOffset, ease: cardEase,
                    scrollTrigger: { trigger: card, start: "top 90%", toggleActions: "play none none none" },
                    onComplete: () => { card.style.transform = ''; }
                });

                const timeline = gsap.timeline({
                    scrollTrigger: { trigger: card, start: "top 87%", toggleActions: "play none none none" }
                });

                timeline
                    .to(tag, { opacity: 0.8, y: 0, duration: 0.6, delay: delayOffset + 0.1, ease: "power2.out" })
                    .to(chars, { opacity: 1, y: 0, duration: 0.8, stagger: 0.015, ease: "power4.out" }, "-=0.35")
                    .to(desc, { opacity: 0.7, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.5")
                    .to(btnWrap, { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(2)" }, "-=0.4");

                const personalities = [
                    { tension: 65, friction: 12, maxTilt: 7, maxParallax: 12 },
                    { tension: 90, friction: 14, maxTilt: 9, maxParallax: 16 },
                    { tension: 80, friction: 11, maxTilt: 6, maxParallax: 10 },
                    { tension: 110, friction: 16, maxTilt: 10, maxParallax: 18 },
                    { tension: 85, friction: 13, maxTilt: 8, maxParallax: 14 }
                ];
                const config = personalities[idx % personalities.length];

                const springs = {
                    tiltX: new Spring(0, config.tension, config.friction),
                    tiltY: new Spring(0, config.tension, config.friction),
                    imgX: new Spring(0, config.tension - 10, config.friction + 2),
                    imgY: new Spring(0, config.tension - 10, config.friction + 2),
                    shineX: new Spring(50, 60, 10), shineY: new Spring(50, 60, 10),
                    shadowX: new Spring(0, config.tension - 15, config.friction + 3),
                    shadowY: new Spring(20, config.tension - 15, config.friction + 3),
                    btnX: new Spring(0, 95, 13), btnY: new Spring(0, 95, 13),
                    lift: new Spring(0, 50, 8)
                };

                let particlesInstance = null;
                if (canvas) {
                    particlesInstance = new CardParticles(canvas);
                    const resizeFn = () => particlesInstance.resize();
                    window.addEventListener('resize', resizeFn);
                    this.resizeHandlers.push({ element: window, fn: resizeFn });
                }

                if (hoverSupported) {
                    this.addListener(card, 'mousemove', (e) => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;

                        springs.tiltX.target = ((centerY - y) / centerY) * config.maxTilt;
                        springs.tiltY.target = ((x - centerX) / centerX) * config.maxTilt;
                        springs.imgX.target = ((x - centerX) / centerX) * -config.maxParallax;
                        springs.imgY.target = ((y - centerY) / centerY) * -config.maxParallax;
                        springs.shineX.target = (x / rect.width) * 100;
                        springs.shineY.target = (y / rect.height) * 100;
                        springs.shadowX.target = ((x - centerX) / centerX) * -16;
                        springs.shadowY.target = 20 + ((y - centerY) / centerY) * -12;

                        if (btn) {
                            const btnRect = btn.getBoundingClientRect();
                            const btnCenterX = btnRect.left + btnRect.width / 2;
                            const btnCenterY = btnRect.top + btnRect.height / 2;
                            const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);
                            if (dist < 75) {
                                springs.btnX.target = (e.clientX - btnCenterX) * 0.45;
                                springs.btnY.target = (e.clientY - btnCenterY) * 0.45;
                            } else {
                                springs.btnX.target = 0; springs.btnY.target = 0;
                            }
                        }
                    });

                    this.addListener(card, 'mouseenter', () => {
                        springs.lift.target = 25;
                        if (title) gsap.to(title, { letterSpacing: "0.06em", duration: 0.8, ease: "power3.out", overwrite: "auto" });
                    });

                    this.addListener(card, 'mouseleave', () => {
                        springs.lift.target = 0; springs.tiltX.target = 0; springs.tiltY.target = 0;
                        springs.imgX.target = 0; springs.imgY.target = 0;
                        springs.shineX.target = 50; springs.shineY.target = 50;
                        springs.shadowX.target = 0; springs.shadowY.target = 20;
                        springs.btnX.target = 0; springs.btnY.target = 0;
                        if (title) gsap.to(title, { letterSpacing: "0em", duration: 0.8, ease: "power3.out", overwrite: "auto" });
                    });
                }

                cardInstances.push({
                    card, inner, img, btn, shadow, springs, particles: particlesInstance,
                    update: function(dt) {
                        const tX = springs.tiltX.update(dt);
                        const tY = springs.tiltY.update(dt);
                        const imX = springs.imgX.update(dt);
                        const imY = springs.imgY.update(dt);
                        const shX = springs.shineX.update(dt);
                        const shY = springs.shineY.update(dt);
                        const sdX = springs.shadowX.update(dt);
                        const sdY = springs.shadowY.update(dt);
                        const bX = springs.btnX.update(dt);
                        const bY = springs.btnY.update(dt);
                        const zLift = springs.lift.update(dt);
                        inner.style.transform = `perspective(1000px) rotateX(${tX}deg) rotateY(${tY}deg) translate3d(0, 0, ${zLift}px)`;
                        img.style.setProperty('--img-x', `${imX}px`);
                        img.style.setProperty('--img-y', `${imY}px`);
                        inner.style.setProperty('--shine-x', `${shX}%`);
                        inner.style.setProperty('--shine-y', `${shY}%`);
                        if (shadow) {
                            shadow.style.setProperty('--shadow-x', `${sdX}px`);
                            shadow.style.setProperty('--shadow-y', `${sdY}px`);
                        }
                        if (btn) btn.style.transform = `translate3d(${bX}px, ${bY}px, 20px)`;
                        if (this.particles) this.particles.updateAndDraw(tX, tY);
                    }
                });
            });

            // Generic Cards Spring Binder (Remedy Cards, Testimonial Cards)
            const genericCards = document.querySelectorAll('.remedy-card, .testimonial-card');
            const genericInstances = [];

            genericCards.forEach((card, idx) => {
                card.style.transformStyle = 'preserve-3d';
                card.style.perspective = '1000px';

                // Add specular shine element if not exists
                let shineEl = card.querySelector('.card-specular-shine');
                if (!shineEl) {
                    shineEl = document.createElement('div');
                    shineEl.className = 'card-specular-shine';
                    shineEl.style.position = 'absolute';
                    shineEl.style.top = '0';
                    shineEl.style.left = '0';
                    shineEl.style.right = '0';
                    shineEl.style.bottom = '0';
                    shineEl.style.pointerEvents = 'none';
                    shineEl.style.borderRadius = 'inherit';
                    shineEl.style.background = 'radial-gradient(circle at var(--shine-x, 50%) var(--shine-y, 50%), rgba(255, 255, 255, 0.08) 0%, transparent 65%)';
                    card.appendChild(shineEl);
                }

                // Add ambient shadow element if not exists
                let shadowEl = card.querySelector('.card-ambient-shadow');
                if (!shadowEl) {
                    shadowEl = document.createElement('div');
                    shadowEl.className = 'card-ambient-shadow';
                    shadowEl.style.position = 'absolute';
                    shadowEl.style.top = '0';
                    shadowEl.style.left = '0';
                    shadowEl.style.right = '0';
                    shadowEl.style.bottom = '0';
                    shadowEl.style.pointerEvents = 'none';
                    shadowEl.style.borderRadius = 'inherit';
                    shadowEl.style.boxShadow = 'var(--shadow-dynamic-x, 0px) var(--shadow-dynamic-y, 10px) var(--shadow-dynamic-blur, 30px) rgba(0,0,0,0.06)';
                    shadowEl.style.transition = 'opacity 0.3s ease';
                    shadowEl.style.zIndex = '-1';
                    card.insertBefore(shadowEl, card.firstChild);
                }

                const springs = {
                    tiltX: new Spring(0, 80, 13),
                    tiltY: new Spring(0, 80, 13),
                    shineX: new Spring(50, 60, 10),
                    shineY: new Spring(50, 60, 10),
                    shadowX: new Spring(0, 70, 14),
                    shadowY: new Spring(10, 70, 14),
                    lift: new Spring(0, 50, 8)
                };

                if (hoverSupported) {
                    this.addListener(card, 'mousemove', (e) => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;

                        springs.tiltX.target = ((centerY - y) / centerY) * 6;
                        springs.tiltY.target = ((x - centerX) / centerX) * 6;
                        springs.shineX.target = (x / rect.width) * 100;
                        springs.shineY.target = (y / rect.height) * 100;
                        springs.shadowX.target = ((x - centerX) / centerX) * -10;
                        springs.shadowY.target = 10 + ((y - centerY) / centerY) * -8;
                    });

                    this.addListener(card, 'mouseenter', () => {
                        springs.lift.target = 12;
                    });

                    this.addListener(card, 'mouseleave', () => {
                        springs.lift.target = 0;
                        springs.tiltX.target = 0;
                        springs.tiltY.target = 0;
                        springs.shineX.target = 50;
                        springs.shineY.target = 50;
                        springs.shadowX.target = 0;
                        springs.shadowY.target = 10;
                    });
                }

                genericInstances.push({
                    card, shineEl, shadowEl, springs,
                    update: function(dt) {
                        const tX = springs.tiltX.update(dt);
                        const tY = springs.tiltY.update(dt);
                        const shX = springs.shineX.update(dt);
                        const shY = springs.shineY.update(dt);
                        const sdX = springs.shadowX.update(dt);
                        const sdY = springs.shadowY.update(dt);
                        const zLift = springs.lift.update(dt);

                        card.style.transform = `perspective(1000px) rotateX(${tX}deg) rotateY(${tY}deg) translate3d(0, 0, ${zLift}px)`;
                        card.style.setProperty('--shine-x', `${shX}%`);
                        card.style.setProperty('--shine-y', `${shY}%`);
                        card.style.setProperty('--shadow-dynamic-x', `${sdX}px`);
                        card.style.setProperty('--shadow-dynamic-y', `${sdY}px`);
                    }
                });
            });

            // 60FPS animation ticker
            let lastTime = performance.now();
            const loop = (now) => {
                const dt = Math.min((now - lastTime) / 1000, 0.1);
                lastTime = now;
                
                if (hero && hoverSupported) {
                    const hTX = heroSprings.tiltX.update(dt);
                    const hTY = heroSprings.tiltY.update(dt);
                    const hIX = heroSprings.imgX.update(dt);
                    const hIY = heroSprings.imgY.update(dt);
                    const hSX = heroSprings.shineX.update(dt);
                    const hSY = heroSprings.shineY.update(dt);
                    const l1X = heroSprings.leaf1X.update(dt);
                    const l1Y = heroSprings.leaf1Y.update(dt);
                    const l2X = heroSprings.leaf2X.update(dt);
                    const l2Y = heroSprings.leaf2Y.update(dt);
                    const l3X = heroSprings.leaf3X.update(dt);
                    const l3Y = heroSprings.leaf3Y.update(dt);
                    const aLX = heroSprings.annoLX.update(dt);
                    const aLY = heroSprings.annoLY.update(dt);
                    const aRX = heroSprings.annoRX.update(dt);
                    const aRY = heroSprings.annoRY.update(dt);

                    if (heroDoctor) heroDoctor.style.transform = `perspective(1000px) rotateX(${hTX}deg) rotateY(${hTY}deg)`;
                    if (heroDoctorImg) heroDoctorImg.style.transform = `translate3d(${hIX}px, ${hIY}px, 10px)`;
                    if (heroDoctor) {
                        heroDoctor.style.setProperty('--hero-shine-x', `${hSX}%`);
                        heroDoctor.style.setProperty('--hero-shine-y', `${hSY}%`);
                    }
                    if (leaf1) leaf1.style.transform = `translate3d(${l1X}px, ${l1Y}px, 0)`;
                    if (leaf2) leaf2.style.transform = `translate3d(${l2X}px, ${l2Y}px, 0)`;
                    if (leaf3) leaf3.style.transform = `translate3d(${l3X}px, ${l3Y}px, 0)`;
                    if (annoLeft) annoLeft.style.transform = `translate3d(${aLX}px, ${aLY}px, 0)`;
                    if (annoRight) annoRight.style.transform = `translate3d(${aRX}px, ${aRY}px, 0)`;
                }

                timelineInstances.forEach(inst => inst.update(dt));
                statInstances.forEach(inst => inst.update(dt));
                treatmentInstances.forEach(inst => inst.update(dt));
                cardInstances.forEach(inst => inst.update(dt));
                genericInstances.forEach(inst => inst.update(dt));
                
                this.rafId = requestAnimationFrame(loop);
            };
            this.rafId = requestAnimationFrame(loop);
        }

        cleanupModule() {
            if (this.rafId) cancelAnimationFrame(this.rafId);
            this.resizeHandlers.forEach(({ element, fn }) => {
                element.removeEventListener('resize', fn);
            });
            this.resizeHandlers = [];
        }
    }
    AnimationRegistry.register(new ArtObjectsEngineModule());

    // ==========================================================================
    // MODULE 8: BRAND FLOATING ACTION DOCK CONTROLLER
    // ==========================================================================
    class BrandActionDockModule extends AnimationModule {
        constructor() {
            super('BrandActionDock');
            this.lastScrollTop = 0;
            this.rafId = null;
        }

        checkRequirements() {
            return document.getElementById('brand-action-dock') !== null;
        }

        setup() {
            const dock = document.getElementById('brand-action-dock');
            const items = dock.querySelectorAll('.dock-item');
            const progressCircle = document.getElementById('dock-scroll-progress-circle');
            const pctText = document.getElementById('dock-scroll-pct');
            const scrollBtn = document.getElementById('dock-scroll-btn');

            // Interactive item highlights & perspective 3D lifts
            items.forEach(item => {
                const springs = {
                    tiltX: new Spring(0, 90, 15),
                    tiltY: new Spring(0, 90, 15),
                    shineX: new Spring(50, 50, 10),
                    shineY: new Spring(50, 50, 10),
                    lift: new Spring(0, 50, 8),
                    pullX: new Spring(0, 80, 12),
                    pullY: new Spring(0, 80, 12)
                };

                // Track physics state
                item.physics = springs;

                this.addListener(item, 'mousemove', (e) => {
                    const rect = item.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    springs.tiltX.target = ((centerY - y) / centerY) * 12;
                    springs.tiltY.target = ((x - centerX) / centerX) * 12;
                    springs.shineX.target = (x / rect.width) * 100;
                    springs.shineY.target = (y / rect.height) * 100;
                    
                    // Magnetic pull towards cursor
                    springs.pullX.target = (e.clientX - (rect.left + centerX)) * 0.35;
                    springs.pullY.target = (e.clientY - (rect.top + centerY)) * 0.35;
                });

                this.addListener(item, 'mouseenter', () => {
                    springs.lift.target = 10;
                });

                this.addListener(item, 'mouseleave', () => {
                    springs.lift.target = 0;
                    springs.tiltX.target = 0;
                    springs.tiltY.target = 0;
                    springs.shineX.target = 50;
                    springs.shineY.target = 50;
                    springs.pullX.target = 0;
                    springs.pullY.target = 0;
                });
            });

            // Scroll indicator & auto-hide logic
            this.addListener(window, 'scroll', () => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                
                // Calculate percentage
                const pct = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
                
                // Update SVG progress circle
                if (progressCircle) {
                    const radius = 15.9155;
                    const circumference = 2 * Math.PI * radius;
                    const offset = circumference - (pct / 100) * circumference;
                    progressCircle.style.strokeDashoffset = offset;
                }

                // Update text
                if (pctText) {
                    pctText.innerText = `${pct}%`;
                }

                // Morph arrow/percent based on scroll depth
                if (scrollTop > 400) {
                    dock.classList.add('can-scroll-top');
                    const tooltip = document.getElementById('dock-scroll-tooltip');
                    if (tooltip) tooltip.innerText = 'TOP';
                } else {
                    dock.classList.remove('can-scroll-top');
                    const tooltip = document.getElementById('dock-scroll-tooltip');
                    if (tooltip) tooltip.innerText = 'SCROLL';
                }

                // Smart context highlight depending on current section
                let activeSec = '';
                const sections = document.querySelectorAll('section');
                sections.forEach(sec => {
                    const secTop = sec.offsetTop - 200;
                    const secHeight = sec.offsetHeight;
                    if (scrollTop >= secTop && scrollTop < secTop + secHeight) {
                        activeSec = sec.getAttribute('id');
                    }
                });

                const callItem = dock.querySelector('.dock-item-call');
                const chatItem = dock.querySelector('.dock-item-chat');

                if (activeSec === 'treatments' || activeSec === 'why-choose-us') {
                    if (callItem) callItem.classList.add('dock-emphasize');
                    if (chatItem) chatItem.classList.remove('dock-emphasize');
                } else if (activeSec === 'testimonials') {
                    if (chatItem) chatItem.classList.add('dock-emphasize');
                    if (callItem) callItem.classList.remove('dock-emphasize');
                } else {
                    if (callItem) callItem.classList.remove('dock-emphasize');
                    if (chatItem) chatItem.classList.remove('dock-emphasize');
                }

                // Auto-hide when scrolling down, show when scrolling up
                if (scrollTop > 200) {
                    if (scrollTop > this.lastScrollTop) {
                        // Scrolling down: hide
                        dock.classList.add('dock-hidden');
                    } else {
                        // Scrolling up: show
                        dock.classList.remove('dock-hidden');
                    }
                } else {
                    // Near top: show
                    dock.classList.remove('dock-hidden');
                }

                this.lastScrollTop = scrollTop;
            });

            // Scroll action click handler
            if (scrollBtn) {
                this.addListener(scrollBtn, 'click', () => {
                    const scrollTop = window.scrollY;
                    if (scrollTop > 400) {
                        // Scroll back to top
                        lenis.scrollTo(0, { duration: 1.5 });
                    } else {
                        // Scroll down one section
                        const treatments = document.getElementById('treatments');
                        if (treatments) {
                            lenis.scrollTo(treatments, { duration: 1.2, offset: -80 });
                        }
                    }
                });
            }

            // High-performance RAF loop for spring rendering
            const renderLoop = (now) => {
                const dt = 0.016; // approximate delta for fixed physics tick
                
                items.forEach(item => {
                    const springs = item.physics;
                    if (!springs) return;

                    const tX = springs.tiltX.update(dt);
                    const tY = springs.tiltY.update(dt);
                    const shX = springs.shineX.update(dt);
                    const shY = springs.shineY.update(dt);
                    const liftZ = springs.lift.update(dt);
                    const pX = springs.pullX.update(dt);
                    const pY = springs.pullY.update(dt);

                    // Combine magnetic pull + hover lift + tilt perspective
                    item.style.transform = `translate3d(${pX}px, ${pY}px, ${liftZ}px) rotateX(${tX}deg) rotateY(${tY}deg)`;
                    
                    // Set specular highlight sweep coords
                    item.style.setProperty('--shine-x', `${shX}%`);
                    item.style.setProperty('--shine-y', `${shY}%`);
                });

                this.rafId = requestAnimationFrame(renderLoop);
            };
            this.rafId = requestAnimationFrame(renderLoop);
        }

        cleanupModule() {
            if (this.rafId) cancelAnimationFrame(this.rafId);
        }
    }
    AnimationRegistry.register(new BrandActionDockModule());



    // ==========================================================================
    // GLOBAL ANTI-CRASH PROTECTION
    // ==========================================================================
    window.addEventListener('error', (event) => {
        console.warn("Recovered from unhandled runtime error to prevent app crash:", event.error);
        event.preventDefault();
    });

});
