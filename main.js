document.addEventListener('DOMContentLoaded', () => {
    // Dynamic Year
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Mobile Menu Toggle
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('.desktop-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('open');
            menuBtn.classList.toggle('active');

            // Animate hamburger to X (optional, driven by CSS class)
        });

        // Close menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                menuBtn.classList.remove('active');
            });
        });
    }

    // ScrollSpy: Highlight active menu item using IntersectionObserver
    const sections = document.querySelectorAll('section[id]');
    const navLinksItems = document.querySelectorAll('.nav-link');

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                // Remove active from all links
                navLinksItems.forEach(link => link.classList.remove('active'));
                // Add active to current link
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, {
        rootMargin: '-20% 0px -60% 0px', // Active zone is near the top of the viewport
        threshold: 0
    });

    sections.forEach(section => {
        scrollSpyObserver.observe(section);
    });
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    // Targets to animate
    const animateTargets = document.querySelectorAll('.hero-content, .section-title, .skills-grid, .project-card, .about-grid, .contact-content');

    animateTargets.forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
});
