// Animation Engine
(function () {
    'use strict';

    // Smooth Scroll
    class SmoothScroll {
        constructor() {
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
            this.current = window.scrollY;
            this.target = window.scrollY;
            this.ease = 0.08;
            this.init();
        }
        init() {
            window.addEventListener('wheel', (e) => {
                e.preventDefault();
                this.target += e.deltaY;
                this.clamp();
            }, { passive: false });

            window.addEventListener('keydown', (e) => {
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                const map = { ArrowDown: 100, ArrowUp: -100, PageDown: 500, PageUp: -500, Space: 400 };
                if (map[e.code] !== undefined) {
                    e.preventDefault();
                    this.target += (e.code === 'Space' && e.shiftKey) ? -400 : map[e.code];
                    this.clamp();
                }
                if (e.code === 'Home') { e.preventDefault(); this.target = 0; }
                if (e.code === 'End') { e.preventDefault(); this.target = this.max(); }
            });

            document.querySelectorAll('a[href^="#"]').forEach(a => {
                a.addEventListener('click', (e) => {
                    const id = a.getAttribute('href');
                    if (id === '#') return;
                    const el = document.querySelector(id);
                    if (el) {
                        e.preventDefault();
                        history.pushState(null, null, id);
                        this.target = el.getBoundingClientRect().top + window.scrollY;
                        this.clamp();
                    }
                });
            });

            window.addEventListener('hashchange', () => {
                const hash = window.location.hash;
                if (hash && hash !== '#') {
                    const el = document.querySelector(hash);
                    if (el) {
                        this.target = el.getBoundingClientRect().top + window.scrollY;
                        this.clamp();
                    }
                }
            });

            if (window.location.hash) {
                const hash = window.location.hash;
                const el = document.querySelector(hash);
                if (el) {
                    this.current = 0;
                    this.target = 0;

                    setTimeout(() => {
                        const top = el.getBoundingClientRect().top + window.scrollY;
                        this.target = top;
                        this.clamp();
                    }, 150);

                    window.addEventListener('load', () => {
                        const top = el.getBoundingClientRect().top + window.scrollY;
                        this.target = top;
                        this.current = top; // Prevent scroll jumps on page load
                        this.clamp();
                    });
                }
            }

            this.tick();
        }
        clamp() { this.target = Math.max(0, Math.min(this.target, this.max())); }
        max() { return document.documentElement.scrollHeight - window.innerHeight; }
        tick() {
            this.current += (this.target - this.current) * this.ease;
            if (Math.abs(this.target - this.current) < 0.5) this.current = this.target;
            window.scrollTo(0, this.current);
            requestAnimationFrame(() => this.tick());
        }
    }

    // Custom Cursor
    class CustomCursor {
        constructor() {
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;
            if (window.matchMedia('(hover: none)').matches) return;

            this.mx = -100; this.my = -100;
            this.dx = -100; this.dy = -100;
            this.rx = -100; this.ry = -100;

            this.dot = document.createElement('div');
            this.dot.className = 'cursor-dot';
            this.ring = document.createElement('div');
            this.ring.className = 'cursor-ring';
            document.body.appendChild(this.dot);
            document.body.appendChild(this.ring);

            document.addEventListener('mousemove', e => { this.mx = e.clientX; this.my = e.clientY; });

            document.querySelectorAll('a, button, .liquid-btn, .liquid-glass, .social-link, input, textarea').forEach(el => {
                el.addEventListener('mouseenter', () => { this.dot.classList.add('hovering'); this.ring.classList.add('hovering'); });
                el.addEventListener('mouseleave', () => { this.dot.classList.remove('hovering'); this.ring.classList.remove('hovering'); });
            });

            this.render();
        }
        render() {
            this.dx += (this.mx - this.dx) * 0.15;
            this.dy += (this.my - this.dy) * 0.15;
            this.rx += (this.mx - this.rx) * 0.08;
            this.ry += (this.my - this.ry) * 0.08;
            if (this.dot) { this.dot.style.left = this.dx + 'px'; this.dot.style.top = this.dy + 'px'; }
            if (this.ring) { this.ring.style.left = this.rx + 'px'; this.ring.style.top = this.ry + 'px'; }
            requestAnimationFrame(() => this.render());
        }
    }


    // Hero Title Line Reveal
    class HeroTitleReveal {
        constructor() {
            const title = document.querySelector('.hero-title');
            if (!title) return;

            const nodes = Array.from(title.childNodes);
            const lines = [];
            let cur = [];
            nodes.forEach(n => {
                if (n.nodeName === 'BR') { lines.push(cur); cur = []; }
                else cur.push(n);
            });
            if (cur.length) lines.push(cur);

            title.innerHTML = '';
            lines.forEach((lineNodes, i) => {
                const outer = document.createElement('span');
                outer.style.cssText = 'display: block; overflow: hidden;';
                const inner = document.createElement('span');
                inner.style.cssText = `display: block; transform: translateY(115%); opacity: 0;`;
                inner.setAttribute('data-hero-line', i);
                lineNodes.forEach(n => inner.appendChild(n.cloneNode(true)));
                outer.appendChild(inner);
                title.appendChild(outer);
            });

            setTimeout(() => {
                title.querySelectorAll('[data-hero-line]').forEach((line, i) => {
                    line.style.transition = `transform 1.1s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.15}s, opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.15}s`;
                    line.style.transform = 'translateY(0)';
                    line.style.opacity = '1';
                });
            }, 150);
        }
    }

    function assignAnimations() {
        function anim(el, type, delay) {
            if (!el) return;
            el.setAttribute('data-anim', type);
            if (delay) {
                el.style.animationDelay = delay + 's';
                el.style.transitionDelay = delay + 's';
            }
        }

        // Splits heading text into span elements to enable staggered character/word animations
        function splitHeading(el) {
            const nodes = Array.from(el.childNodes);
            el.innerHTML = '';
            let wordIndex = 0;
            nodes.forEach(node => {
                if (node.nodeName === 'BR') {
                    el.appendChild(document.createElement('br'));
                } else if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent;
                    const words = text.split(/(\s+)/);
                    words.forEach(word => {
                        if (word.trim().length === 0) {
                            if (word.length > 0) {
                                el.appendChild(document.createTextNode(' '));
                            }
                        } else {
                            const span = document.createElement('span');
                            span.className = 'heading-word';
                            span.textContent = word;
                            span.style.display = 'inline-block';
                            span.style.transitionDelay = `${0.2 + wordIndex * 0.35}s`;
                            wordIndex++;
                            el.appendChild(span);
                        }
                    });
                } else {
                    el.appendChild(node.cloneNode(true));
                }
            });
        }

        const logo = document.querySelector('.logo');
        anim(logo, 'fade-in');
        logo && (logo.style.animationDelay = '0.1s');

        document.querySelectorAll('.navbar-list li').forEach((li, i) => {
            anim(li, 'fade-in', 0.2 + i * 0.08);
        });

        const hamBtn = document.querySelector('.ham-btn');
        anim(hamBtn, 'fade-in', 0.15);

        const metaLabel = document.querySelector('.meta-label');
        anim(metaLabel, 'blur-in', 0.6);

        const heroDesc = document.querySelector('.hero-description');
        anim(heroDesc, 'fade-up-hero', 1.1);

        const heroBtn = document.querySelector('.hero-actions .liquid-btn');
        anim(heroBtn, 'fade-up-hero', 1.35);

        document.querySelectorAll('.hero-actions .social-link').forEach((link, i) => {
            anim(link, 'fade-up-hero', 1.5 + i * 0.1);
        });

        const heroFooter = document.querySelector('.hero-footer');
        if (heroFooter) {
            heroFooter.style.borderTopColor = 'transparent';
            heroFooter.style.transition = 'border-top-color 1.5s cubic-bezier(0.16, 1, 0.3, 1) 1s';
            setTimeout(() => { heroFooter.style.borderTopColor = ''; }, 200);
        }

        document.querySelectorAll('.section-number').forEach(el => {
            anim(el, 'slide-left');
        });

        document.querySelectorAll('.section-heading').forEach(el => {
            anim(el, 'heading-reveal');
            splitHeading(el);
        });

        const profileContainer = document.querySelector('.profile-photo-container');
        anim(profileContainer, 'clip-up');

        const aboutStatement = document.querySelector('.about-statement');
        anim(aboutStatement, 'blur-in');

        document.querySelectorAll('.about-text p').forEach((p, i) => {
            anim(p, 'fade-up', i * 0.2);
        });

        const techGrid = document.querySelector('.tech-grid');
        anim(techGrid, 'scale-in');

        document.querySelectorAll('.tech-title').forEach((el, i) => {
            anim(el, 'blur-in', i * 0.15);
        });

        document.querySelectorAll('.tech-list li').forEach((li, i) => {
            anim(li, 'pop-in', i * 0.06);
        });

        document.querySelectorAll('.project-item').forEach((item, i) => {
            anim(item, 'fade-up', i * 0.15);
        });

        document.querySelectorAll('.project-name').forEach(el => {
            anim(el, 'blur-in');
        });

        document.querySelectorAll('.project-type').forEach(el => {
            anim(el, 'fade-in', 0.1);
        });

        document.querySelectorAll('.project-links a').forEach(el => {
            anim(el, 'fade-in', 0.15);
        });

        document.querySelectorAll('.project-summary').forEach(el => {
            anim(el, 'fade-up', 0.1);
        });

        document.querySelectorAll('.project-item').forEach(project => {
            project.querySelectorAll('.tech-tags span').forEach((tag, i) => {
                anim(tag, 'pop-in', i * 0.1);
            });
        });

        document.querySelectorAll('.subsection-title').forEach(el => {
            anim(el, 'blur-in');
        });

        document.querySelectorAll('.timeline-node').forEach((node, i) => {
            anim(node, 'slide-left', i * 0.15);
        });

        document.querySelectorAll('.node-meta').forEach(el => anim(el, 'fade-in', 0.1));
        document.querySelectorAll('.node-title').forEach(el => anim(el, 'blur-in', 0.15));
        document.querySelectorAll('.node-desc').forEach(el => anim(el, 'fade-up', 0.2));

        document.querySelectorAll('.cert-item').forEach((item, i) => {
            anim(item, 'scale-in', i * 0.1);
        });

        document.querySelectorAll('.cert-name').forEach(el => anim(el, 'fade-in', 0.1));
        document.querySelectorAll('.cert-issuer').forEach(el => anim(el, 'fade-in', 0.15));

        const formIntro = document.querySelector('.form-intro');
        anim(formIntro, 'fade-up');

        document.querySelectorAll('.input-group').forEach((group, i) => {
            anim(group, 'fade-up', i * 0.12);
        });

        const submitBtn = document.querySelector('.submit-btn');
        anim(submitBtn, 'fade-up', 0.4);

        const formContainer = document.querySelector('.form-container');
        anim(formContainer, 'scale-in');

        const footer = document.querySelector('.footer');
        anim(footer, 'fade-up');
    }

    // Intersection Observer Engine
    function observeAll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.classList.add('in-view');

                    // Clear delays after transition to ensure interactive hover states are instant
                    if (el.style.transitionDelay || el.style.animationDelay) {
                        const delaySec = parseFloat(el.style.transitionDelay || el.style.animationDelay || 0);
                        setTimeout(() => {
                            el.style.transitionDelay = '';
                            el.style.animationDelay = '';
                        }, (delaySec * 1000) + 800);
                    }

                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        const clipObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    clipObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });

        document.querySelectorAll('[data-anim]').forEach(el => {
            if (el.getAttribute('data-anim') === 'clip-up') {
                clipObserver.observe(el);
            } else {
                observer.observe(el);
            }
        });

        setTimeout(() => {
            const heroElements = document.querySelectorAll('.hero [data-anim], .header [data-anim]');
            heroElements.forEach(el => el.classList.add('in-view'));
        }, 50);

        // Fallback trigger if IntersectionObserver misses the photo container during layout shifts
        window.addEventListener('load', () => {
            const photo = document.querySelector('.profile-photo-container[data-anim]');
            if (photo && !photo.classList.contains('in-view')) {
                clipObserver.observe(photo);
            }
        });
    }

    // Text Scramble on Section Numbers
    function setupScramble() {
        const chars = '!<>-_\\/[]{}—=+*^?#';
        function scramble(el) {
            const orig = el.textContent;
            let iter = 0;
            const iv = setInterval(() => {
                el.textContent = orig.split('').map((c, j) =>
                    j < iter ? orig[j] : chars[Math.floor(Math.random() * chars.length)]
                ).join('');
                if (iter >= orig.length) clearInterval(iv);
                iter += 0.5;
            }, 35);
        }

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) { scramble(e.target); obs.unobserve(e.target); }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.section-number').forEach(el => obs.observe(el));
    }

    // 3D Tilt on Cards
    function setupTilt() {
        if ('ontouchstart' in window) return;

        document.querySelectorAll('.tech-grid, .project-item, .timeline-node, .cert-item, .form-container').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width - 0.5;
                const y = (e.clientY - r.top) / r.height - 0.5;
                card.style.transition = 'transform 0.12s ease-out';
                card.style.setProperty('transform', `perspective(800px) rotateX(${y * -6}deg) rotateY(${x * 6}deg) translateZ(12px)`, 'important');
            });
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                card.style.setProperty('transform', '', 'important');
            });
        });
    }

    // Magnetic Hover on Buttons
    function setupMagnetic() {
        if ('ontouchstart' in window) return;

        document.querySelectorAll('.liquid-btn, .logo').forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                let transIn = 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)';
                if (el.classList.contains('logo')) transIn += ', letter-spacing 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                el.style.transition = transIn;
                el.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });
            el.addEventListener('mouseleave', () => {
                let transOut = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                if (el.classList.contains('logo')) transOut += ', letter-spacing 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                el.style.transition = transOut;
                el.style.transform = '';
            });
        });
    }

    // Parallax (orbs)
    function setupParallax() {
        const orbs = document.querySelectorAll('.liquid-orb');
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    const s = window.scrollY;
                    orbs.forEach((orb, i) => {
                        const speed = 0.015 + i * 0.01;
                        const dir = i % 2 === 0 ? 1 : -1;
                        orb.style.transform = `translateY(${s * speed * dir}px)`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // Form Focus Glow
    function setupFormGlow() {
        document.querySelectorAll('.input-group input, .input-group textarea').forEach(input => {
            const glow = document.createElement('span');
            glow.style.cssText = 'position:absolute;bottom:0;left:50%;width:0;height:1px;background:linear-gradient(90deg,#2dd4bf,#818cf8);transition:width 0.4s cubic-bezier(0.16,1,0.3,1),left 0.4s cubic-bezier(0.16,1,0.3,1);pointer-events:none;';
            input.parentElement.style.position = 'relative';
            input.parentElement.appendChild(glow);
            input.addEventListener('focus', () => { glow.style.width = '100%'; glow.style.left = '0'; });
            input.addEventListener('blur', () => { glow.style.width = '0'; glow.style.left = '50%'; });
        });
    }

    // Active Navigation Highlight
    function setupActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.navbar-list a');

        function updateActive() {
            const scrollPos = window.scrollY + 200; // Offset for sticky header
            let activeId = '';

            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                if (scrollPos >= top && scrollPos < top + height) {
                    activeId = section.getAttribute('id');
                }
            });

            if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 120) {
                activeId = 'contact';
            }

            navLinks.forEach(link => {
                if (link.getAttribute('href') === `#${activeId}`) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // Sync URL hash without polluting navigation history
            if (activeId && window.location.hash !== `#${activeId}`) {
                if (activeId === 'home') {
                    history.replaceState(null, null, window.location.pathname + window.location.search);
                } else {
                    history.replaceState(null, null, `#${activeId}`);
                }
            }
        }

        window.addEventListener('scroll', updateActive, { passive: true });
        window.addEventListener('load', updateActive);
        updateActive();
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        new SmoothScroll();
        new CustomCursor();
        new HeroTitleReveal();

        assignAnimations();
        observeAll();
        setupScramble();
        setupTilt();
        setupMagnetic();
        setupParallax();
        setupFormGlow();
        setupActiveNav();
    });
})();
