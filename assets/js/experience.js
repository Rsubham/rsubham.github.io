const selectors = {
    header: '[data-site-header]',
    menuToggle: '[data-menu-toggle]',
    nav: '[data-primary-nav]',
    navLinks: '.primary-nav__link',
    heroTitle: '[data-hero-title]',
    heroFooter: '[data-hero-footer]',
    animated: '[data-animate]',
    liquidInteractive: '.liquid-button, .liquid-glass',
    tiltCards: '[data-tilt]',
    magnetic: '.liquid-button',
    sectionHeading: '.section-heading',
    sectionNumber: '.section-number',
};

const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

class SmoothScroll {
    constructor() {
        if (touchDevice || reduceMotion) return;

        document.documentElement.style.scrollBehavior = 'auto';
        this.current = window.scrollY;
        this.target = window.scrollY;
        this.ease = 0.08;
        this.isMoving = false;
        this.bind();
    }

    bind() {
        window.addEventListener('wheel', (event) => {
            event.preventDefault();
            this.target += event.deltaY;
            this.clampTarget();
        }, { passive: false });

        window.addEventListener('keydown', (event) => {
            const activeTag = document.activeElement?.tagName;
            if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

            const movement = {
                ArrowDown: 100,
                ArrowUp: -100,
                PageDown: 500,
                PageUp: -500,
                Space: event.shiftKey ? -400 : 400,
            }[event.code];

            if (movement !== undefined) {
                event.preventDefault();
                this.target += movement;
                this.clampTarget();
            }

            if (event.code === 'Home') {
                event.preventDefault();
                this.target = 0;
                this.start();
            }

            if (event.code === 'End') {
                event.preventDefault();
                this.target = this.maxScroll();
                this.start();
            }
        });

        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (event) => {
                const id = anchor.getAttribute('href');
                if (!id || id === '#') return;

                const targetElement = document.querySelector(id);
                if (!targetElement) return;

                event.preventDefault();
                history.pushState(null, '', id);
                this.target = targetElement.getBoundingClientRect().top + window.scrollY;
                this.clampTarget();
            });
        });

        window.addEventListener('hashchange', () => this.syncToHash());

        window.addEventListener('scroll', () => {
            if (!this.isMoving) {
                this.current = window.scrollY;
                this.target = window.scrollY;
            }
        }, { passive: true });

        if (window.location.hash) {
            this.current = 0;
            this.target = 0;
            window.addEventListener('load', () => this.syncToHash(true), { once: true });
            window.setTimeout(() => this.syncToHash(), 150);
        }
    }

    syncToHash(snap = false) {
        const element = window.location.hash && document.querySelector(window.location.hash);
        if (!element) return;

        const top = element.getBoundingClientRect().top + window.scrollY;
        this.target = top;
        if (snap) this.current = top;
        this.clampTarget();
    }

    maxScroll() {
        return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    clampTarget() {
        this.target = clamp(this.target, 0, this.maxScroll());
        this.start();
    }

    start() {
        if (this.isMoving) return;
        this.isMoving = true;
        requestAnimationFrame(() => this.tick());
    }

    tick() {
        this.current += (this.target - this.current) * this.ease;

        if (Math.abs(this.target - this.current) < 0.1) {
            this.current = this.target;
            this.isMoving = false;
        }

        window.scrollTo(0, this.current);
        if (this.isMoving) requestAnimationFrame(() => this.tick());
    }
}

class CursorTrail {
    constructor() {
        if (!canHover || reduceMotion) return;

        this.pointer = { x: -100, y: -100 };
        this.dot = { x: -100, y: -100 };
        this.ring = { x: -100, y: -100 };

        this.dotElement = document.createElement('div');
        this.ringElement = document.createElement('div');
        this.dotElement.className = 'cursor-dot';
        this.ringElement.className = 'cursor-ring';
        document.body.append(this.dotElement, this.ringElement);

        document.addEventListener('mousemove', (event) => {
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
        }, { passive: true });

        document.querySelectorAll('a, button, .liquid-button, .liquid-glass, input, textarea').forEach((element) => {
            element.addEventListener('mouseenter', () => this.setHovering(true));
            element.addEventListener('mouseleave', () => this.setHovering(false));
        });

        this.render();
    }

    setHovering(isHovering) {
        this.dotElement.classList.toggle('is-hovering', isHovering);
        this.ringElement.classList.toggle('is-hovering', isHovering);
    }

    render() {
        this.dot.x += (this.pointer.x - this.dot.x) * 0.15;
        this.dot.y += (this.pointer.y - this.dot.y) * 0.15;
        this.ring.x += (this.pointer.x - this.ring.x) * 0.08;
        this.ring.y += (this.pointer.y - this.ring.y) * 0.08;

        this.dotElement.style.transform = `translate3d(${this.dot.x}px, ${this.dot.y}px, 0)`;
        this.ringElement.style.transform = `translate3d(${this.ring.x}px, ${this.ring.y}px, 0)`;

        requestAnimationFrame(() => this.render());
    }
}

const initializeNavigation = () => {
    const header = document.querySelector(selectors.header);
    const toggle = document.querySelector(selectors.menuToggle);
    const nav = document.querySelector(selectors.nav);
    const navLinks = [...document.querySelectorAll(selectors.navLinks)];

    const setMenuState = (isOpen) => {
        toggle?.setAttribute('aria-expanded', String(isOpen));
        nav?.classList.toggle('is-open', isOpen);
        header?.classList.toggle('is-menu-open', isOpen);
        document.body.classList.toggle('is-menu-open', isOpen);
    };

    toggle?.addEventListener('click', () => {
        const isOpen = toggle.getAttribute('aria-expanded') === 'true';
        setMenuState(!isOpen);
    });

    navLinks.forEach((link) => link.addEventListener('click', () => setMenuState(false)));

    const setHeaderState = () => {
        header?.classList.toggle('is-scrolled', window.scrollY > 20);
    };

    window.addEventListener('scroll', setHeaderState, { passive: true });
    setHeaderState();
};

const initializeHeroTitle = () => {
    const title = document.querySelector(selectors.heroTitle);
    if (!title || reduceMotion) return;

    const lines = [];
    let currentLine = [];

    [...title.childNodes].forEach((node) => {
        if (node.nodeName === 'BR') {
            lines.push(currentLine);
            currentLine = [];
            return;
        }
        currentLine.push(node);
    });

    if (currentLine.length) lines.push(currentLine);
    title.textContent = '';

    lines.forEach((lineNodes, index) => {
        const outer = document.createElement('span');
        const inner = document.createElement('span');

        outer.className = 'hero-title-line';
        inner.className = 'hero-title-line__inner';
        inner.style.transitionDelay = `${0.3 + index * 0.15}s, ${0.3 + index * 0.15}s`;

        lineNodes.forEach((node) => inner.append(node.cloneNode(true)));
        outer.append(inner);
        title.append(outer);
    });

    window.setTimeout(() => {
        title.querySelectorAll('.hero-title-line__inner').forEach((line) => line.classList.add('is-visible'));
    }, 150);
};

const splitSectionHeadings = () => {
    document.querySelectorAll(selectors.sectionHeading).forEach((heading) => {
        const nodes = [...heading.childNodes];
        let wordIndex = 0;

        heading.textContent = '';

        nodes.forEach((node) => {
            if (node.nodeName === 'BR') {
                heading.append(document.createElement('br'));
                return;
            }

            if (node.nodeType !== Node.TEXT_NODE) {
                heading.append(node.cloneNode(true));
                return;
            }

            node.textContent.split(/(\s+)/).forEach((chunk) => {
                if (!chunk.trim()) {
                    if (chunk) heading.append(document.createTextNode(' '));
                    return;
                }

                const word = document.createElement('span');
                word.className = 'heading-word';
                word.textContent = chunk;
                word.style.transitionDelay = `${0.2 + wordIndex * 0.35}s`;
                wordIndex += 1;
                heading.append(word);
            });
        });
    });
};

const initializeRevealSystem = () => {
    if (reduceMotion) {
        document.querySelectorAll(selectors.animated).forEach((element) => element.classList.add('is-in-view'));
        document.querySelectorAll(selectors.sectionHeading).forEach((element) => element.classList.add('is-in-view'));
        return;
    }

    document.querySelectorAll(selectors.animated).forEach((element) => {
        if (element.dataset.delay) {
            element.style.animationDelay = `${element.dataset.delay}s`;
            element.style.transitionDelay = `${element.dataset.delay}s`;
        }
    });

    const defaultObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            entry.target.classList.add('is-in-view');
            window.setTimeout(() => {
                entry.target.style.animationDelay = '';
                entry.target.style.transitionDelay = '';
                if (entry.target.matches(selectors.tiltCards)) {
                    entry.target.style.animation = 'none';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = '';
                    entry.target.removeAttribute('data-animate');
                }
            }, (Number(entry.target.dataset.delay || 0) * 1000) + 900);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    const clipObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in-view');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0, rootMargin: '0px 0px -20px 0px' });

    document.querySelectorAll(selectors.animated).forEach((element) => {
        const observer = element.dataset.animate === 'clip-up' ? clipObserver : defaultObserver;
        observer.observe(element);
    });

    const headingObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in-view');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(selectors.sectionHeading).forEach((heading) => headingObserver.observe(heading));

    window.setTimeout(() => {
        document.querySelectorAll('.hero [data-animate], .site-header [data-animate]').forEach((element) => element.classList.add('is-in-view'));
    }, 50);
};

const initializeScramble = () => {
    if (reduceMotion) return;

    const chars = '!<>-_\\/[]{}\u2014=+*^?#';

    const scramble = (element) => {
        const original = element.textContent;
        let iteration = 0;

        const interval = window.setInterval(() => {
            element.textContent = original
                .split('')
                .map((char, index) => (index < iteration ? original[index] : chars[Math.floor(Math.random() * chars.length)]))
                .join('');

            if (iteration >= original.length) window.clearInterval(interval);
            iteration += 0.5;
        }, 35);
    };

    const observer = new IntersectionObserver((entries, instance) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            scramble(entry.target);
            instance.unobserve(entry.target);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll(selectors.sectionNumber).forEach((number) => observer.observe(number));
};

const initializePointerEffects = () => {
    if (reduceMotion) return;

    document.querySelectorAll(selectors.liquidInteractive).forEach((element) => {
        element.addEventListener('mousemove', (event) => {
            const rect = element.getBoundingClientRect();
            element.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
            element.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
        }, { passive: true });
    });

    document.querySelectorAll(selectors.tiltCards).forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;

            card.style.setProperty('--tilt-rx', `${y * -8}deg`);
            card.style.setProperty('--tilt-ry', `${x * 8}deg`);
            card.style.transition = 'transform 0.12s ease-out';
            card.style.transform = `perspective(800px) translateY(-4px) rotateX(${y * -8}deg) rotateY(${x * 8}deg) scale(1.015)`;
            card.classList.add('is-tilting');
        }, { passive: true });

        card.addEventListener('pointerleave', () => {
            card.classList.remove('is-tilting');
            card.style.setProperty('--tilt-rx', '0deg');
            card.style.setProperty('--tilt-ry', '0deg');
            card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.transform = '';
        });
    });

    document.querySelectorAll(selectors.magnetic).forEach((element) => {
        const textElement = element.querySelector('.liquid-button__text');

        element.addEventListener('mousemove', (event) => {
            const rect = element.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;

            // Highly responsive elastic translation and slight scaling for the button body
            element.style.transition = 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)';
            element.style.transform = `translate3d(${x * 0.38}px, ${y * 0.38}px, 0) scale(1.025)`;

            // High-end inner 3D depth parallax transition for the text inside
            if (textElement) {
                textElement.style.transition = 'transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)';
                textElement.style.transform = `translate3d(${x * 0.22}px, ${y * 0.22}px, 0)`;
            }
        }, { passive: true });

        element.addEventListener('mouseleave', () => {
            // Elegant, organic spring back reset when cursor leaves the element bounds
            element.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            element.style.transform = '';

            if (textElement) {
                textElement.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                textElement.style.transform = '';
            }
        });
    });
};

const initializeScrollEffects = () => {
    const orbs = [...document.querySelectorAll('.ambient-orb')];
    const sections = [...document.querySelectorAll('section[id]')];
    const navLinks = [...document.querySelectorAll(selectors.navLinks)];
    const track = document.createElement('div');
    const thumb = document.createElement('div');
    let ticking = false;
    let scrollHideTimer;

    track.className = 'custom-scrollbar';
    thumb.className = 'custom-scrollbar__thumb';
    track.append(thumb);
    document.body.append(track);

    const updateActiveNav = () => {
        const scrollPosition = window.scrollY + 200;
        let activeId = '';

        sections.forEach((section) => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) activeId = section.id;
        });

        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120) {
            activeId = 'contact';
        }

        navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${activeId}`;
            link.classList.toggle('is-active', isActive);
            if (isActive) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });

        if (activeId && window.location.hash !== `#${activeId}`) {
            const targetUrl = activeId === 'home'
                ? window.location.pathname + window.location.search
                : `#${activeId}`;
            history.replaceState(null, '', targetUrl);
        }
    };

    const updateScrollbar = () => {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (documentHeight <= windowHeight) {
            track.style.display = 'none';
            return;
        }

        track.style.display = 'block';

        const trackHeight = windowHeight - 90;
        const thumbHeight = Math.max(40, (windowHeight / documentHeight) * trackHeight);
        const maxTop = trackHeight - thumbHeight;
        const progress = window.scrollY / (documentHeight - windowHeight);

        thumb.style.height = `${thumbHeight}px`;
        thumb.style.transform = `translate3d(0, ${progress * maxTop}px, 0)`;
        thumb.classList.add('is-visible');

        window.clearTimeout(scrollHideTimer);
        scrollHideTimer = window.setTimeout(() => thumb.classList.remove('is-visible'), 1200);
    };

    const updateParallax = () => {
        if (reduceMotion) return;

        const scrollY = window.scrollY;
        orbs.forEach((orb, index) => {
            const speed = 0.015 + index * 0.01;
            const direction = index % 2 === 0 ? 1 : -1;
            orb.style.transform = `translate3d(0, ${scrollY * speed * direction}px, 0)`;
        });
    };

    const update = () => {
        updateParallax();
        updateActiveNav();
        updateScrollbar();
        ticking = false;
    };

    const requestUpdate = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    };

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    window.addEventListener('load', requestUpdate, { once: true });
    window.setTimeout(requestUpdate, 500);
    requestUpdate();
};

const initializeFooterClock = () => {
    const timeElement = document.getElementById('local-time');
    if (!timeElement) return;

    const update = () => {
        timeElement.textContent = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short',
        });
    };

    update();
    window.setInterval(update, 10000);
};

const initializeContactForm = () => {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', () => {
        const text = form.querySelector('[data-submit-text]');
        if (text) text.textContent = 'Sending...';
    });
};

const initializeHeroFooterStroke = () => {
    const footer = document.querySelector(selectors.heroFooter);
    if (!footer || reduceMotion) return;

    footer.style.borderTopColor = 'transparent';
    footer.style.transition = 'border-top-color 1.5s cubic-bezier(0.16, 1, 0.3, 1) 1s';
    window.setTimeout(() => {
        footer.style.borderTopColor = '';
    }, 200);
};

export const initPortfolioExperience = () => {
    initializeNavigation();
    initializeHeroTitle();
    splitSectionHeadings();
    initializeRevealSystem();
    initializeScramble();
    initializePointerEffects();
    initializeScrollEffects();
    initializeFooterClock();
    initializeContactForm();
    initializeHeroFooterStroke();

    new SmoothScroll();
    new CursorTrail();
};
