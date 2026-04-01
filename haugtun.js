document.addEventListener('DOMContentLoaded', () => {
    const viewer = document.querySelector('.card-viewer');
    const lightbox = document.querySelector('.lightbox');
    const closeTargets = document.querySelectorAll('[data-close="true"]');

    if (!viewer || !lightbox) return;

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
});
