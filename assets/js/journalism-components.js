/**
 * Journalism Components Interactive Features
 * By Nic Weyand!
 * Content warnings, source documents, spoilers, footnotes, citations, and interactive elements
 */

(function() {
    'use strict';

    const JournalismComponents = {
        init: function() {
            this.initContentWarnings();
            this.initSourceDocuments();
            this.initSpoilers();
            this.initFootnotes();
            this.initCitations();
            this.initDropCaps();
            this.initLazyLoading();
            this.initMethodologyBoxes();
        },

        /**
         * Content Warning Toggle
         */
        initContentWarnings: function() {
            document.querySelectorAll('.content-warning-button').forEach(button => {
                button.addEventListener('click', function() {
                    const warning = this.closest('.content-warning');
                    const content = warning.querySelector('.content-warning-content');

                    if (content) {
                        const isVisible = content.classList.toggle('visible');
                        this.textContent = isVisible ? 'Hide Content' : 'Show Content';
                        this.setAttribute('aria-expanded', isVisible);

                        // Announce to screen readers
                        JournalismComponents.announce(
                            isVisible ? 'Content warning content shown' : 'Content warning content hidden'
                        );
                    }
                });

                // Keyboard support
                button.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });
        },

        /**
         * Source Document Full Screen Toggle
         */
        initSourceDocuments: function() {
            document.querySelectorAll('[data-fullscreen-pdf]').forEach(button => {
                button.addEventListener('click', function() {
                    const embed = this.closest('.source-document').querySelector('.source-document-embed');
                    if (embed && embed.requestFullscreen) {
                        embed.requestFullscreen();
                    }
                });
            });
        },

        /**
         * Spoiler Toggle
         * Usage: <span class="spoiler" data-spoiler-label="Plot twist">Hidden text</span>
         */
        initSpoilers: function() {
            document.querySelectorAll('.spoiler').forEach(spoiler => {
                const originalText = spoiler.textContent;
                const label = spoiler.dataset.spoilerLabel || 'Spoiler';

                spoiler.setAttribute('role', 'button');
                spoiler.setAttribute('tabindex', '0');
                spoiler.setAttribute('aria-label', `Hidden spoiler: ${label}. Press to reveal.`);
                spoiler.classList.add('spoiler-hidden');

                const toggle = () => {
                    const isHidden = spoiler.classList.toggle('spoiler-hidden');
                    spoiler.setAttribute('aria-label',
                        isHidden ? `Hidden spoiler: ${label}. Press to reveal.` : `Revealed: ${originalText}. Press to hide.`
                    );
                    this.announce(isHidden ? 'Spoiler hidden' : 'Spoiler revealed');
                };

                spoiler.addEventListener('click', toggle);
                spoiler.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggle();
                    }
                });
            });
        },

        /**
         * Footnote Hover Popups
         * Usage: <a href="#fn-1" class="footnote-ref" data-footnote="1">1</a>
         */
        initFootnotes: function() {
            document.querySelectorAll('.footnote-ref').forEach(ref => {
                const footnoteId = ref.getAttribute('href')?.substring(1);
                if (!footnoteId) return;

                const footnoteElement = document.getElementById(footnoteId);
                if (!footnoteElement) return;

                const popup = document.createElement('div');
                popup.className = 'footnote-popup';
                popup.setAttribute('role', 'tooltip');
                popup.innerHTML = footnoteElement.innerHTML;
                ref.appendChild(popup);

                // Show on hover
                ref.addEventListener('mouseenter', () => {
                    popup.classList.add('visible');
                    this.positionFootnotePopup(ref, popup);
                });

                ref.addEventListener('mouseleave', () => {
                    popup.classList.remove('visible');
                });

                // Show on focus for keyboard users
                ref.addEventListener('focus', () => {
                    popup.classList.add('visible');
                    this.positionFootnotePopup(ref, popup);
                });

                ref.addEventListener('blur', () => {
                    popup.classList.remove('visible');
                });
            });
        },

        /**
         * Position footnote popup to avoid viewport overflow
         */
        positionFootnotePopup: function(ref, popup) {
            const rect = ref.getBoundingClientRect();
            const popupRect = popup.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            // Reset positioning
            popup.style.left = '';
            popup.style.right = '';

            // Check if popup would overflow right edge
            if (rect.left + popupRect.width > viewportWidth - 20) {
                popup.style.left = 'auto';
                popup.style.right = '0';
            }
        },

        /**
         * Citation Reference Highlighting
         * Click a citation to highlight it in the text
         */
        initCitations: function() {
            document.querySelectorAll('.citation-ref').forEach(ref => {
                ref.addEventListener('click', function(e) {
                    e.preventDefault();

                    // Remove previous highlights
                    document.querySelectorAll('.citation-ref.highlighted').forEach(el => {
                        el.classList.remove('highlighted');
                    });

                    // Highlight this citation
                    this.classList.add('highlighted');

                    // Scroll to source if it exists
                    const citationId = this.getAttribute('href')?.substring(1);
                    if (citationId) {
                        const citation = document.getElementById(citationId);
                        if (citation) {
                            citation.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            citation.classList.add('citation-highlighted');

                            setTimeout(() => {
                                citation.classList.remove('citation-highlighted');
                            }, 3000);
                        }
                    }

                    // Remove highlight after 3 seconds
                    setTimeout(() => {
                        this.classList.remove('highlighted');
                    }, 3000);
                });
            });
        },

        /**
         * Drop Cap Initialization
         * Automatically add drop caps to article first paragraphs
         */
        initDropCaps: function() {
            const article = document.querySelector('.post-content');
            if (!article) return;

            // Check if drop caps are enabled
            if (!article.classList.contains('has-drop-cap')) return;

            const firstParagraph = article.querySelector('p:first-of-type');
            if (!firstParagraph) return;

            const text = firstParagraph.textContent.trim();
            if (text.length < 50) return; // Don't add drop cap to short paragraphs

            const firstLetter = text.charAt(0);
            const restOfText = text.substring(1);

            firstParagraph.innerHTML = `<span class="drop-cap" aria-hidden="true">${firstLetter}</span>${restOfText}`;
        },

        /**
         * Lazy Loading for Embedded Media
         * Improves performance for longform articles
         */
        initLazyLoading: function() {
            if ('IntersectionObserver' in window) {
                const lazyImages = document.querySelectorAll('img[loading="lazy"], iframe[data-lazy]');

                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const element = entry.target;

                            if (element.tagName === 'IFRAME' && element.dataset.lazy) {
                                element.src = element.dataset.lazy;
                                element.removeAttribute('data-lazy');
                            }

                            element.classList.add('loaded');
                            observer.unobserve(element);
                        }
                    });
                }, {
                    rootMargin: '50px 0px'
                });

                lazyImages.forEach(img => imageObserver.observe(img));
            }
        },

        /**
         * Methodology Box Expand/Collapse
         */
        initMethodologyBoxes: function() {
            document.querySelectorAll('.methodology-box-toggle').forEach(toggle => {
                toggle.addEventListener('click', function() {
                    const box = this.closest('.methodology-box');
                    const content = box.querySelector('.methodology-box-content');

                    if (content) {
                        const isExpanded = content.classList.toggle('expanded');
                        this.textContent = isExpanded ? 'Hide Methodology' : 'Show Methodology';
                        this.setAttribute('aria-expanded', isExpanded);

                        JournalismComponents.announce(
                            isExpanded ? 'Methodology expanded' : 'Methodology collapsed'
                        );
                    }
                });
            });
        },

        /**
         * Announce to screen readers
         */
        announce: function(message) {
            let announcer = document.getElementById('journalism-announcer');

            if (!announcer) {
                announcer = document.createElement('div');
                announcer.id = 'journalism-announcer';
                announcer.setAttribute('role', 'status');
                announcer.setAttribute('aria-live', 'polite');
                announcer.setAttribute('aria-atomic', 'true');
                announcer.style.cssText = 'position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;';
                document.body.appendChild(announcer);
            }

            announcer.textContent = message;
            setTimeout(() => { announcer.textContent = ''; }, 1000);
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => JournalismComponents.init());
    } else {
        JournalismComponents.init();
    }

    // Export for external use
    window.GreymuzzleJournalismComponents = JournalismComponents;

})();
