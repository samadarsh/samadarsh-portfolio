document.addEventListener('DOMContentLoaded', () => {
    const yearSpan = document.getElementById('year');
    document.body.classList.add('js-ready');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const body = document.body;
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.desktop-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const closeMenu = () => {
        if (!menuBtn || !nav) return;
        nav.classList.remove('open');
        body.classList.remove('menu-open');
        menuBtn.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
    };

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            const willOpen = !nav.classList.contains('open');
            nav.classList.toggle('open', willOpen);
            body.classList.toggle('menu-open', willOpen);
            menuBtn.classList.toggle('active', willOpen);
            menuBtn.setAttribute('aria-expanded', String(willOpen));
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });

        document.addEventListener('click', (event) => {
            if (!nav.classList.contains('open')) return;
            if (nav.contains(event.target) || menuBtn.contains(event.target)) return;
            closeMenu();
        });
    }

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => link.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
            if (activeLink) activeLink.classList.add('active');
        });
    }, {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach((section) => {
        scrollSpyObserver.observe(section);
    });

    if (reducedMotion) {
        document.querySelectorAll('.reveal-on-scroll').forEach((element) => {
            element.classList.add('is-visible');
        });
        return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-on-scroll').forEach((element) => {
        revealObserver.observe(element);
    });
});
