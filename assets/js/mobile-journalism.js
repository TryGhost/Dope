/**
 * Mobile Journalism Controls for Greymuzzle
 * By Nic Weyand!
 * Thumb-zone navigation, reading progress, and mobile-optimized features
 */

(function() {
    'use strict';

    const MobileJournalism = {
        sections: [],
        currentSection: 0,
        scrollProgress: 0,
        isTouch: false,

        init: function() {
            // Only initialize on mobile devices
            if (window.innerWidth > 768) return;

            this.isTouch = 'ontouchstart' in window;
            this.detectSections();
            this.createMobileControls();
            this.setupReadingProgress();
            this.setupSwipeGestures();
            this.setupFontControls();
            this.trackScrollPosition();
        },

        /**
         * Detect article sections (headings)
         */
        detectSections: function() {
            const content = document.querySelector('.post-content');
            if (!content) return;

            const headings = content.querySelectorAll('h2, h3');
            this.sections = Array.from(headings);
        },

        /**
         * Create mobile jump controls
         */
        createMobileControls: function() {
            if (this.sections.length === 0) return;

            const controls = document.createElement('div');
            controls.className = 'mobile-jump-controls';
            controls.setAttribute('role', 'navigation');
            controls.setAttribute('aria-label', 'Article navigation');

            // Previous section button
            const prevBtn = document.createElement('button');
            prevBtn.className = 'jump-btn jump-btn-prev';
            prevBtn.setAttribute('aria-label', 'Previous section');
            prevBtn.innerHTML = '↑';
            prevBtn.addEventListener('click', () => this.jumpSection(-1));
            controls.appendChild(prevBtn);

            // Next section button
            const nextBtn = document.createElement('button');
            nextBtn.className = 'jump-btn jump-btn-next';
            nextBtn.setAttribute('aria-label', 'Next section');
            nextBtn.innerHTML = '↓';
            nextBtn.addEventListener('click', () => this.jumpSection(1));
            controls.appendChild(nextBtn);

            // Share button
            const shareBtn = document.createElement('button');
            shareBtn.className = 'jump-btn jump-btn-share';
            shareBtn.setAttribute('aria-label', 'Share article');
            shareBtn.innerHTML = '⤴';
            shareBtn.addEventListener('click', () => this.openShareSheet());
            controls.appendChild(shareBtn);

            document.body.appendChild(controls);

            // Store references
            this.prevBtn = prevBtn;
            this.nextBtn = nextBtn;
        },

        /**
         * Jump to previous/next section
         */
        jumpSection: function(direction) {
            const newSection = this.currentSection + direction;

            if (newSection < 0 || newSection >= this.sections.length) {
                return; // At boundaries
            }

            this.currentSection = newSection;
            const target = this.sections[this.currentSection];

            // Scroll to section with offset for header
            const header = document.querySelector('.site-header');
            const headerHeight = header ? header.offsetHeight : 0;
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Announce to screen readers
            this.announce(`Navigated to ${target.textContent}`);

            // Update button states
            this.updateButtonStates();
        },

        /**
         * Update button enabled/disabled states
         */
        updateButtonStates: function() {
            if (this.prevBtn) {
                this.prevBtn.disabled = this.currentSection === 0;
            }
            if (this.nextBtn) {
                this.nextBtn.disabled = this.currentSection >= this.sections.length - 1;
            }
        },

        /**
         * Setup reading progress bar
         */
        setupReadingProgress: function() {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'mobile-reading-progress';

            const progressBar = document.createElement('div');
            progressBar.className = 'mobile-reading-progress-bar';
            progressContainer.appendChild(progressBar);

            document.body.insertBefore(progressContainer, document.body.firstChild);

            this.progressBar = progressBar;

            // Update on scroll
            window.addEventListener('scroll', () => this.updateReadingProgress(), { passive: true });
        },

        /**
         * Update reading progress
         */
        updateReadingProgress: function() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrolled = window.pageYOffset;
            const progress = (scrolled / documentHeight) * 100;

            this.scrollProgress = Math.min(100, Math.max(0, progress));

            if (this.progressBar) {
                this.progressBar.style.width = this.scrollProgress + '%';
            }

            // Update current section based on scroll
            this.updateCurrentSection();
        },

        /**
         * Update current section based on scroll position
         */
        updateCurrentSection: function() {
            const scrollPos = window.pageYOffset + 100;

            for (let i = this.sections.length - 1; i >= 0; i--) {
                const section = this.sections[i];
                if (section.offsetTop <= scrollPos) {
                    if (this.currentSection !== i) {
                        this.currentSection = i;
                        this.updateButtonStates();
                    }
                    break;
                }
            }
        },

        /**
         * Setup swipe gestures for section navigation
         */
        setupSwipeGestures: function() {
            if (!this.isTouch) return;

            let startY = 0;
            let startX = 0;

            document.addEventListener('touchstart', (e) => {
                startY = e.touches[0].clientY;
                startX = e.touches[0].clientX;
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                const endY = e.changedTouches[0].clientY;
                const endX = e.changedTouches[0].clientX;
                const diffY = startY - endY;
                const diffX = startX - endX;

                // Require horizontal swipe to be small (vertical scroll gesture)
                if (Math.abs(diffX) > 50) return;

                // Swipe up (next section)
                if (diffY > 100) {
                    this.jumpSection(1);
                }
                // Swipe down (previous section)
                else if (diffY < -100) {
                    this.jumpSection(-1);
                }
            }, { passive: true });
        },

        /**
         * Setup font size controls
         */
        setupFontControls: function() {
            const article = document.querySelector('.post-content');
            if (!article) return;

            const controls = document.createElement('div');
            controls.className = 'mobile-font-controls';
            controls.setAttribute('role', 'group');
            controls.setAttribute('aria-label', 'Font size controls');

            controls.innerHTML = `
                <span class="mobile-font-controls-label">Text size:</span>
                <button class="mobile-font-btn" data-size="small" aria-label="Small text">A</button>
                <button class="mobile-font-btn active" data-size="medium" aria-label="Medium text">A</button>
                <button class="mobile-font-btn" data-size="large" aria-label="Large text">A</button>
            `;

            // Insert before article
            article.parentNode.insertBefore(controls, article);

            // Handle font size changes
            controls.querySelectorAll('.mobile-font-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const size = this.dataset.size;

                    // Update active state
                    controls.querySelectorAll('.mobile-font-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');

                    // Apply font size
                    article.classList.remove('font-small', 'font-medium', 'font-large');
                    article.classList.add(`font-${size}`);

                    // Save preference
                    localStorage.setItem('greymuzzle_font_size', size);

                    MobileJournalism.announce(`Font size changed to ${size}`);
                });

                // Set appropriate font sizes via inline styles for the buttons
                if (btn.dataset.size === 'small') {
                    btn.style.fontSize = '12px';
                } else if (btn.dataset.size === 'medium') {
                    btn.style.fontSize = '16px';
                } else {
                    btn.style.fontSize = '20px';
                }
            });

            // Restore saved preference
            const savedSize = localStorage.getItem('greymuzzle_font_size');
            if (savedSize) {
                const btn = controls.querySelector(`[data-size="${savedSize}"]`);
                if (btn) btn.click();
            }
        },

        /**
         * Open mobile share sheet
         */
        openShareSheet: function() {
            // Try native share API first
            if (navigator.share) {
                const title = document.querySelector('.post-title');
                const titleText = title ? title.textContent : document.title;

                navigator.share({
                    title: titleText,
                    url: window.location.href
                }).catch(() => {
                    // User cancelled, do nothing
                });
            } else {
                // Fallback: trigger existing share button
                const shareBtn = document.querySelector('.social-share-button');
                if (shareBtn) shareBtn.click();
            }
        },

        /**
         * Track scroll position
         */
        trackScrollPosition: function() {
            let scrollTimeout;

            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);

                scrollTimeout = setTimeout(() => {
                    // Save reading position
                    const articleId = document.body.dataset.postId;
                    if (articleId) {
                        localStorage.setItem(`reading_position_${articleId}`, window.pageYOffset);
                    }
                }, 500);
            }, { passive: true });

            // Restore reading position on load
            const articleId = document.body.dataset.postId;
            if (articleId) {
                const savedPosition = localStorage.getItem(`reading_position_${articleId}`);
                if (savedPosition && window.pageYOffset === 0) {
                    setTimeout(() => {
                        window.scrollTo({
                            top: parseInt(savedPosition, 10),
                            behavior: 'smooth'
                        });
                    }, 100);
                }
            }
        },

        /**
         * Announce to screen readers
         */
        announce: function(message) {
            let announcer = document.getElementById('mobile-announcer');

            if (!announcer) {
                announcer = document.createElement('div');
                announcer.id = 'mobile-announcer';
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
        document.addEventListener('DOMContentLoaded', () => MobileJournalism.init());
    } else {
        MobileJournalism.init();
    }

    // Re-initialize on orientation change or resize to mobile
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768 && MobileJournalism.sections.length === 0) {
            MobileJournalism.init();
        }
    });

    // Export for external use
    window.GreymuzzleMobileJournalism = MobileJournalism;

})();
