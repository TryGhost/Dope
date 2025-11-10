/**
 * Table of Contents Generator for Greymuzzle
 * Auto-generates TOC from article headings with scroll spy, smooth scrolling,
 * keyboard navigation, and mobile collapse functionality
 */

(function() {
    'use strict';

    const TOC = {
        container: null,
        contentArea: null,
        headings: [],
        currentActive: null,
        isCollapsed: false,
        observer: null,

        init: function() {
            this.container = document.getElementById('toc-container');
            this.contentArea = document.querySelector('.post-content');

            if (!this.container || !this.contentArea) return;

            this.collectHeadings();

            if (this.headings.length === 0) {
                // No headings found, hide the TOC
                const tocWrapper = document.querySelector('.toc');
                if (tocWrapper) tocWrapper.style.display = 'none';
                return;
            }

            this.buildTOC();
            this.addMobileToggle();
            this.setupScrollSpy();
            this.setupKeyboardNav();
            this.setupSmoothScroll();
            this.addSkipLinks();
            this.announceToScreenReaders();
        },

        /**
         * Collect all H2 and H3 headings from the article
         */
        collectHeadings: function() {
            const headingElements = this.contentArea.querySelectorAll('h2, h3');
            const seenIds = new Map();

            headingElements.forEach((heading, index) => {
                let id = heading.id;

                // Generate ID if missing
                if (!id) {
                    id = this.generateId(heading.textContent);

                    // Handle duplicate IDs
                    if (seenIds.has(id)) {
                        const count = seenIds.get(id) + 1;
                        seenIds.set(id, count);
                        id = `${id}-${count}`;
                    } else {
                        seenIds.set(id, 1);
                    }

                    heading.id = id;
                }

                this.headings.push({
                    element: heading,
                    id: id,
                    text: heading.textContent,
                    level: parseInt(heading.tagName.charAt(1)),
                    top: 0 // Will be calculated later
                });
            });

            // Calculate positions after DOM is ready
            setTimeout(() => this.updateHeadingPositions(), 100);
        },

        /**
         * Generate URL-friendly ID from heading text
         */
        generateId: function(text) {
            return text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .substring(0, 50);
        },

        /**
         * Update heading positions (needed for scroll spy)
         */
        updateHeadingPositions: function() {
            this.headings.forEach(heading => {
                heading.top = heading.element.getBoundingClientRect().top + window.pageYOffset;
            });
        },

        /**
         * Build the Table of Contents HTML
         */
        buildTOC: function() {
            const ul = document.createElement('ul');
            ul.className = 'toc-list';
            ul.setAttribute('role', 'list');

            let currentH2Item = null;

            this.headings.forEach((heading, index) => {
                const li = document.createElement('li');
                li.setAttribute('role', 'listitem');

                const a = document.createElement('a');
                a.href = `#${heading.id}`;
                a.textContent = heading.text;
                a.className = 'toc-link';
                a.setAttribute('data-heading-index', index);

                // Add ARIA label for better accessibility
                a.setAttribute('aria-label', `Jump to section: ${heading.text}`);

                if (heading.level === 2) {
                    li.appendChild(a);
                    ul.appendChild(li);
                    currentH2Item = li;
                } else if (heading.level === 3 && currentH2Item) {
                    // Nest H3 under previous H2
                    let nestedUl = currentH2Item.querySelector('.toc-list-nested');
                    if (!nestedUl) {
                        nestedUl = document.createElement('ul');
                        nestedUl.className = 'toc-list-nested';
                        nestedUl.setAttribute('role', 'list');
                        currentH2Item.appendChild(nestedUl);
                    }
                    li.appendChild(a);
                    nestedUl.appendChild(li);
                }
            });

            this.container.appendChild(ul);
        },

        /**
         * Add mobile collapse/expand toggle
         */
        addMobileToggle: function() {
            const tocWrapper = document.querySelector('.toc');
            if (!tocWrapper) return;

            const title = tocWrapper.querySelector('.toc-title');
            if (!title) return;

            // Make title clickable on mobile
            title.style.cursor = 'pointer';
            title.setAttribute('role', 'button');
            title.setAttribute('aria-expanded', 'true');
            title.setAttribute('aria-controls', 'toc-container');
            title.setAttribute('tabindex', '0');

            // Add toggle indicator
            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'toc-toggle-icon';
            toggleIcon.setAttribute('aria-hidden', 'true');
            toggleIcon.innerHTML = '▼';
            toggleIcon.style.cssText = 'float: right; transition: transform 0.3s ease;';
            title.appendChild(toggleIcon);

            const toggle = () => {
                this.isCollapsed = !this.isCollapsed;
                this.container.style.display = this.isCollapsed ? 'none' : 'block';
                toggleIcon.innerHTML = this.isCollapsed ? '▶' : '▼';
                toggleIcon.style.transform = this.isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)';
                title.setAttribute('aria-expanded', !this.isCollapsed);

                // Announce to screen readers
                this.announce(`Table of contents ${this.isCollapsed ? 'collapsed' : 'expanded'}`);
            };

            title.addEventListener('click', toggle);
            title.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggle();
                }
            });

            // Auto-collapse on mobile
            const checkMobile = () => {
                if (window.innerWidth <= 768 && !this.isCollapsed) {
                    toggle();
                }
            };

            checkMobile();
            window.addEventListener('resize', checkMobile, { passive: true });
        },

        /**
         * Setup scroll spy to highlight current section
         */
        setupScrollSpy: function() {
            // Use Intersection Observer for better performance
            const options = {
                rootMargin: '-80px 0px -80% 0px',
                threshold: 0
            };

            this.observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        const link = this.container.querySelector(`a[href="#${id}"]`);

                        if (link) {
                            this.setActiveLink(link);
                        }
                    }
                });
            }, options);

            // Observe all headings
            this.headings.forEach(heading => {
                this.observer.observe(heading.element);
            });

            // Fallback for browsers without IntersectionObserver
            if (!('IntersectionObserver' in window)) {
                this.setupScrollSpyFallback();
            }
        },

        /**
         * Fallback scroll spy for older browsers
         */
        setupScrollSpyFallback: function() {
            let ticking = false;

            const updateActiveLink = () => {
                const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;

                // Check if at bottom of page
                if (scrollPos + windowHeight >= documentHeight - 50) {
                    const lastLink = this.container.querySelector('.toc-link:last-of-type');
                    if (lastLink) this.setActiveLink(lastLink);
                    return;
                }

                // Find current heading
                for (let i = this.headings.length - 1; i >= 0; i--) {
                    const heading = this.headings[i];
                    if (scrollPos >= heading.top - 100) {
                        const link = this.container.querySelector(`a[href="#${heading.id}"]`);
                        if (link) this.setActiveLink(link);
                        break;
                    }
                }

                ticking = false;
            };

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(updateActiveLink);
                    ticking = true;
                }
            }, { passive: true });

            window.addEventListener('resize', () => {
                this.updateHeadingPositions();
            }, { passive: true });
        },

        /**
         * Set active link and update ARIA
         */
        setActiveLink: function(link) {
            if (this.currentActive === link) return;

            // Remove previous active
            if (this.currentActive) {
                this.currentActive.classList.remove('active');
                this.currentActive.removeAttribute('aria-current');
            }

            // Set new active
            link.classList.add('active');
            link.setAttribute('aria-current', 'location');
            this.currentActive = link;

            // Ensure active link is visible in TOC (for sticky sidebar)
            const tocWrapper = document.querySelector('.toc');
            if (tocWrapper) {
                const linkRect = link.getBoundingClientRect();
                const tocRect = tocWrapper.getBoundingClientRect();

                if (linkRect.bottom > tocRect.bottom || linkRect.top < tocRect.top) {
                    link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            }
        },

        /**
         * Setup smooth scrolling for TOC links
         */
        setupSmoothScroll: function() {
            const links = this.container.querySelectorAll('a');

            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();

                    const targetId = link.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        // Get the header height for offset
                        const header = document.querySelector('.site-header');
                        const headerHeight = header ? header.offsetHeight : 0;
                        const offset = 20; // Additional spacing

                        const targetPosition = targetElement.getBoundingClientRect().top +
                                             window.pageYOffset -
                                             headerHeight -
                                             offset;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });

                        // Update URL hash without jumping
                        if (history.pushState) {
                            history.pushState(null, null, `#${targetId}`);
                        }

                        // Focus the heading for accessibility
                        targetElement.setAttribute('tabindex', '-1');
                        targetElement.focus();

                        // Announce to screen readers
                        this.announce(`Navigated to ${targetElement.textContent}`);
                    }
                });
            });
        },

        /**
         * Setup keyboard navigation (Arrow keys to navigate TOC)
         */
        setupKeyboardNav: function() {
            const links = Array.from(this.container.querySelectorAll('a'));

            links.forEach((link, index) => {
                link.addEventListener('keydown', (e) => {
                    let targetIndex = -1;

                    switch(e.key) {
                        case 'ArrowDown':
                            e.preventDefault();
                            targetIndex = index + 1;
                            break;
                        case 'ArrowUp':
                            e.preventDefault();
                            targetIndex = index - 1;
                            break;
                        case 'Home':
                            e.preventDefault();
                            targetIndex = 0;
                            break;
                        case 'End':
                            e.preventDefault();
                            targetIndex = links.length - 1;
                            break;
                    }

                    if (targetIndex >= 0 && targetIndex < links.length) {
                        links[targetIndex].focus();
                    }
                });
            });
        },

        /**
         * Add skip links for accessibility
         */
        addSkipLinks: function() {
            const firstHeading = this.headings[0];
            if (!firstHeading) return;

            // Check if skip link already exists
            if (document.querySelector('.skip-to-content')) return;

            const skipLink = document.createElement('a');
            skipLink.href = `#${firstHeading.id}`;
            skipLink.className = 'skip-to-content';
            skipLink.textContent = 'Skip to article content';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 0;
                background: var(--color-bg-primary);
                color: var(--color-text-primary);
                padding: 8px;
                text-decoration: none;
                z-index: 9999;
            `;

            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '0';
            });

            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });

            document.body.insertBefore(skipLink, document.body.firstChild);
        },

        /**
         * Announce to screen readers
         */
        announce: function(message) {
            let announcer = document.getElementById('toc-announcer');

            if (!announcer) {
                announcer = document.createElement('div');
                announcer.id = 'toc-announcer';
                announcer.setAttribute('role', 'status');
                announcer.setAttribute('aria-live', 'polite');
                announcer.setAttribute('aria-atomic', 'true');
                announcer.style.cssText = `
                    position: absolute;
                    left: -10000px;
                    width: 1px;
                    height: 1px;
                    overflow: hidden;
                `;
                document.body.appendChild(announcer);
            }

            announcer.textContent = message;
            setTimeout(() => { announcer.textContent = ''; }, 1000);
        },

        /**
         * Announce TOC availability to screen readers
         */
        announceToScreenReaders: function() {
            this.announce(`Table of contents available with ${this.headings.length} sections`);
        },

        /**
         * Destroy the TOC and clean up
         */
        destroy: function() {
            if (this.observer) {
                this.observer.disconnect();
            }
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => TOC.init());
    } else {
        TOC.init();
    }

    // Re-initialize on URL hash change (for navigation)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash) {
            const target = document.querySelector(hash);
            if (target) {
                const link = TOC.container.querySelector(`a[href="${hash}"]`);
                if (link) TOC.setActiveLink(link);
            }
        }
    });

    // Handle URL hash on initial load
    window.addEventListener('load', () => {
        const hash = window.location.hash;
        if (hash) {
            setTimeout(() => {
                const target = document.querySelector(hash);
                if (target) {
                    const header = document.querySelector('.site-header');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const targetPosition = target.getBoundingClientRect().top +
                                         window.pageYOffset -
                                         headerHeight -
                                         20;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                }
            }, 100);
        }
    });

    // Export for external use if needed
    window.GreymuzzleTOC = TOC;

})();
