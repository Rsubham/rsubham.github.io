document.addEventListener('DOMContentLoaded', () => {

    // nav toggle
    const hamBtn = document.querySelector('.ham-btn');
    const navbar = document.querySelector('.navbar');
    const header = document.querySelector('.header');

    if (hamBtn && navbar && header) {
        hamBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const isActive = navbar.classList.toggle('active');
            header.classList.toggle('active');
            document.body.classList.toggle('menu-open');

            const menuIcon = hamBtn.querySelector('ion-icon[name="menu-outline"]');
            const closeIcon = hamBtn.querySelector('ion-icon[name="close-outline"]');

            menuIcon.style.display = isActive ? 'none' : 'block';
            closeIcon.style.display = isActive ? 'block' : 'none';
        });

        document.querySelectorAll('.navbar-list a').forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('active');
                header.classList.remove('active');
                document.body.classList.remove('menu-open');
                hamBtn.querySelector('ion-icon[name="menu-outline"]').style.display = 'block';
                hamBtn.querySelector('ion-icon[name="close-outline"]').style.display = 'none';
            });
        });
    }

    // header shrinks on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // reveal elements as they come into view
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

    // mouse glow follow effect on cards
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

    // keep footer time accurate
    const timeEl = document.getElementById('local-time');
    if (timeEl) {
        const updateTime = () => {
            const now = new Date();
            timeEl.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
        };
        updateTime();
        setInterval(updateTime, 10000);
    }

    // contact form submit
    const form = document.getElementById("contact-form");
    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const originalText = btnText.textContent;

            btnText.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(event.target.action, {
                    method: form.method,
                    body: new FormData(event.target),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    btnText.textContent = 'Message Sent';
                    submitBtn.style.background = '#2dd4bf'; // Muted teal success state
                    submitBtn.style.color = '#09090b';
                    form.reset();

                    setTimeout(() => {
                        btnText.textContent = originalText;
                        submitBtn.style.background = '';
                        submitBtn.style.color = '';
                        submitBtn.disabled = false;
                    }, 4000);
                } else {
                    throw new Error('Something went wrong');
                }
            } catch (error) {
                btnText.textContent = 'Error. Please try again.';
                submitBtn.style.background = '#ef4444';
                submitBtn.style.color = '#09090b';

                setTimeout(() => {
                    btnText.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.disabled = false;
                }, 4000);
            }
        });
    }

    // custom scrollbar (built manually, the native one takes layout space)
    const scrollTrack = document.createElement('div');
    scrollTrack.classList.add('custom-scrollbar-track');

    const scrollThumb = document.createElement('div');
    scrollThumb.classList.add('custom-scrollbar-thumb');

    scrollTrack.appendChild(scrollThumb);
    document.body.appendChild(scrollTrack);

    let scrollTimeout;
    const navHeight = 80; // header is roughly this tall

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
        const trackHeight = windowHeight - navHeight - 10; // 10px bottom padding
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

    // run once on load so thumb position is set
    setTimeout(updateScrollbar, 500);
});
