document.addEventListener('DOMContentLoaded', () => {
    const ENQUIRY_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwjCf9TE9b8BnpEs8wUmzHU6xzPevHB8fPIL2WwpkNVsSOdA7ycA7a3mo7sg7ad22ch/exec';
    const viewer = document.querySelector('.card-viewer');
    const lightbox = document.querySelector('.lightbox');
    const closeTargets = document.querySelectorAll('[data-close="true"]');
    const siteHeader = document.querySelector('.site-header');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelectorAll('.page-nav a, .back-link');
    const enquiryForm = document.querySelector('[data-enquiry-form]');
    const submitButton = document.querySelector('[data-submit-button]');
    const feedback = document.querySelector('[data-form-feedback]');

    if (siteHeader && navToggle) {
        const setMenuState = (isOpen) => {
            siteHeader.classList.toggle('is-open', isOpen);
            navToggle.setAttribute('aria-expanded', String(isOpen));
            navToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
        };

        navToggle.addEventListener('click', () => {
            const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
            setMenuState(!isOpen);
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', () => setMenuState(false));
        });

        document.addEventListener('click', (event) => {
            if (!siteHeader.classList.contains('is-open')) return;

            if (!siteHeader.contains(event.target)) {
                setMenuState(false);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                setMenuState(false);
            }
        });
    }

    if (viewer && lightbox) {
        const openLightbox = () => {
            lightbox.hidden = false;
            document.body.classList.add('lightbox-open');
        };

        const closeLightbox = () => {
            lightbox.hidden = true;
            document.body.classList.remove('lightbox-open');
        };

        viewer.addEventListener('click', openLightbox);

        closeTargets.forEach((target) => {
            target.addEventListener('click', closeLightbox);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !lightbox.hidden) {
                closeLightbox();
            }
        });
    }

    if (!enquiryForm || !submitButton || !feedback) return;

    const setFeedback = (message, tone) => {
        feedback.textContent = message;
        feedback.classList.remove('is-success', 'is-error');

        if (tone) {
            feedback.classList.add(tone);
        }
    };

    enquiryForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!ENQUIRY_ENDPOINT) {
            setFeedback('The enquiry form is ready. Add your Google Apps Script web app URL in haugtun.js to start receiving submissions.', 'is-error');
            return;
        }

        const formData = new FormData(enquiryForm);
        formData.append('submitted_at', new Date().toISOString());

        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        setFeedback('');

        try {
            await fetch(ENQUIRY_ENDPOINT, {
                method: 'POST',
                mode: 'no-cors',
                body: new URLSearchParams(formData),
            });

            enquiryForm.reset();
            setFeedback('Your enquiry has been submitted successfully. I will get back to you soon.', 'is-success');
        } catch (error) {
            setFeedback('Something went wrong while sending your enquiry. Please try again or contact me directly.', 'is-error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send enquiry';
        }
    });
});
