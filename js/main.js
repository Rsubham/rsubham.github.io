document.addEventListener('DOMContentLoaded', () => {

    const hamBtn = document.querySelector('.ham-btn');
    const navbar = document.querySelector('.navbar');
    const header = document.querySelector('.header');

    if (hamBtn && navbar && header) {
        hamBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navbar.classList.toggle('active');
            header.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });

        document.querySelectorAll('.navbar-list a').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('active');
                header.classList.remove('active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const observerOptions = {
        threshold: 0.05,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    const interactiveElements = document.querySelectorAll('.liquid-btn, .liquid-glass');

    interactiveElements.forEach(el => {
        el.addEventListener('mousemove', e => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty('--mouse-x', `${x}px`);
            el.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    const timeEl = document.getElementById('local-time');
    if (timeEl) {
        const updateTime = () => {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
        };
        updateTime();
        setInterval(updateTime, 10000);
    }

    const form = document.getElementById("contact-form");
    if (form) {
        form.addEventListener("submit", function () {
            const submitBtn = form.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Sending...';

            // Allow standard POST submission to prevent CORS issues with FormSubmit.co
        });
    }

    // Custom scrollbar setup to prevent native scrollbar layout shifts
    const scrollTrack = document.createElement('div');
    scrollTrack.classList.add('custom-scrollbar-track');

    const scrollThumb = document.createElement('div');
    scrollThumb.classList.add('custom-scrollbar-thumb');

    scrollTrack.appendChild(scrollThumb);
    document.body.appendChild(scrollTrack);

    let scrollTimeout;
    const navHeight = 80;

    function updateScrollbar() {
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;

        if (documentHeight <= windowHeight) {
            scrollTrack.style.display = 'none';
            return;
        } else {
            scrollTrack.style.display = 'block';
        }

        const scrollPercent = scrollTop / (documentHeight - windowHeight);
        const trackHeight = windowHeight - navHeight - 10;
        const thumbHeight = Math.max(40, (windowHeight / documentHeight) * trackHeight);
        const maxTop = trackHeight - thumbHeight;
        const thumbTop = scrollPercent * maxTop;

        scrollThumb.style.height = `${thumbHeight}px`;
        scrollThumb.style.transform = `translateY(${thumbTop}px)`;

        scrollThumb.classList.add('visible');

        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            scrollThumb.classList.remove('visible');
        }, 1200);
    }

    window.addEventListener('scroll', updateScrollbar, { passive: true });
    window.addEventListener('resize', updateScrollbar, { passive: true });

    setTimeout(updateScrollbar, 500);
});
