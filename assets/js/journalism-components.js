/**
 * Journalism Components Interactive Features
 * Content warnings, source documents, and other interactive elements
 */

(function() {
    'use strict';

    // Content Warning Toggle
    document.querySelectorAll('.content-warning-button').forEach(button => {
        button.addEventListener('click', function() {
            const warning = this.closest('.content-warning');
            const content = warning.querySelector('.content-warning-content');

            if (content) {
                content.classList.toggle('visible');
                this.textContent = content.classList.contains('visible') ? 'Hide Content' : 'Show Content';
            }
        });
    });

    // Source Document Full Screen Toggle
    document.querySelectorAll('[data-fullscreen-pdf]').forEach(button => {
        button.addEventListener('click', function() {
            const embed = this.closest('.source-document').querySelector('.source-document-embed');
            if (embed && embed.requestFullscreen) {
                embed.requestFullscreen();
            }
        });
    });

})();
