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

    // ScrollSpy: Highlight active menu item
    // Select all sections that have an ID and match our nav links
    const sections = document.querySelectorAll('section[id]');

    function scrollSpy() {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100; // Adjust offset for header
            const sectionId = current.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                if (navLink) navLink.classList.add('active');
            } else {
                if (navLink) navLink.classList.remove('active');
            }
        });
    }

    window.addEventListener('scroll', scrollSpy);
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
