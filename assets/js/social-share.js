/**
 * Social Sharing System for Greymuzzle
 * Privacy-focused sharing with Twitter, Mastodon, Bluesky, Facebook, Email, and more
 * Includes text selection sharing, copy link, and accessibility features
 */

(function() {
    'use strict';

    const SocialShare = {
        shareData: {},
        selectedText: '',
        selectionPopup: null,

        init: function() {
            this.collectShareData();
            this.createShareButtons();
            this.setupCopyLink();
            this.setupSelectionSharing();
            this.setupKeyboardShortcuts();
            this.setupPrintButton();
        },

        /**
         * Collect article metadata for sharing
         */
        collectShareData: function() {
            const article = document.querySelector('.post-content');
            const title = document.querySelector('.post-title');
            const excerpt = document.querySelector('.post-excerpt');
            const url = window.location.href;
            const canonicalUrl = document.querySelector('link[rel="canonical"]');

            this.shareData = {
                url: canonicalUrl ? canonicalUrl.href : url,
                title: title ? title.textContent.trim() : document.title,
                excerpt: excerpt ? excerpt.textContent.trim() : '',
                hashtags: this.extractHashtags(),
                via: this.extractTwitterHandle()
            };

            // Encode for URLs
            this.shareData.encodedUrl = encodeURIComponent(this.shareData.url);
            this.shareData.encodedTitle = encodeURIComponent(this.shareData.title);
            this.shareData.encodedExcerpt = encodeURIComponent(this.shareData.excerpt);
        },

        /**
         * Extract hashtags from article tags
         */
        extractHashtags: function() {
            const tags = document.querySelectorAll('.post-tag');
            const hashtags = [];

            tags.forEach(tag => {
                const tagText = tag.textContent.trim().replace(/\s+/g, '');
                if (tagText && hashtags.length < 3) { // Limit to 3 hashtags
                    hashtags.push(tagText);
                }
            });

            return hashtags;
        },

        /**
         * Extract Twitter handle from site metadata
         */
        extractTwitterHandle: function() {
            const twitterMeta = document.querySelector('meta[name="twitter:site"]');
            if (twitterMeta) {
                return twitterMeta.content.replace('@', '');
            }
            return '';
        },

        /**
         * Create share buttons container
         */
        createShareButtons: function() {
            const article = document.querySelector('.single-post');
            if (!article) return;

            const shareContainer = document.createElement('div');
            shareContainer.className = 'social-share-container';
            shareContainer.setAttribute('role', 'complementary');
            shareContainer.setAttribute('aria-label', 'Share this article');

            const shareTitle = document.createElement('div');
            shareTitle.className = 'social-share-title';
            shareTitle.textContent = 'Share this story';
            shareContainer.appendChild(shareTitle);

            const shareButtons = document.createElement('div');
            shareButtons.className = 'social-share-buttons';
            shareButtons.setAttribute('role', 'group');
            shareButtons.setAttribute('aria-label', 'Social sharing buttons');

            // Create share buttons
            const platforms = [
                {
                    name: 'Twitter',
                    icon: this.getTwitterIcon(),
                    url: this.getTwitterUrl(),
                    ariaLabel: 'Share on Twitter (opens in new window)'
                },
                {
                    name: 'Mastodon',
                    icon: this.getMastodonIcon(),
                    handler: this.shareMastodon.bind(this),
                    ariaLabel: 'Share on Mastodon (opens instance selector)'
                },
                {
                    name: 'Bluesky',
                    icon: this.getBlueskyIcon(),
                    url: this.getBlueskyUrl(),
                    ariaLabel: 'Share on Bluesky (opens in new window)'
                },
                {
                    name: 'Facebook',
                    icon: this.getFacebookIcon(),
                    url: this.getFacebookUrl(),
                    ariaLabel: 'Share on Facebook (opens in new window)'
                },
                {
                    name: 'Email',
                    icon: this.getEmailIcon(),
                    url: this.getEmailUrl(),
                    ariaLabel: 'Share via email (opens email client)'
                },
                {
                    name: 'Copy Link',
                    icon: this.getCopyIcon(),
                    handler: this.copyLink.bind(this),
                    ariaLabel: 'Copy link to clipboard'
                },
                {
                    name: 'Print',
                    icon: this.getPrintIcon(),
                    handler: () => window.print(),
                    ariaLabel: 'Print this article'
                }
            ];

            platforms.forEach(platform => {
                const button = document.createElement('a');
                button.className = `social-share-button social-share-${platform.name.toLowerCase().replace(' ', '-')}`;
                button.setAttribute('aria-label', platform.ariaLabel);
                button.setAttribute('role', 'button');
                button.setAttribute('tabindex', '0');
                button.innerHTML = platform.icon;

                // Add tooltip
                const tooltip = document.createElement('span');
                tooltip.className = 'social-share-tooltip';
                tooltip.textContent = platform.name;
                button.appendChild(tooltip);

                if (platform.url) {
                    button.href = platform.url;
                    button.target = '_blank';
                    button.rel = 'noopener noreferrer';
                } else if (platform.handler) {
                    button.href = '#';
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        platform.handler();
                    });
                    button.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            platform.handler();
                        }
                    });
                }

                shareButtons.appendChild(button);
            });

            shareContainer.appendChild(shareButtons);

            // Insert after article header or at the top of content
            const insertPoint = article.querySelector('.post-header') || article.querySelector('header');
            if (insertPoint && insertPoint.nextSibling) {
                insertPoint.parentNode.insertBefore(shareContainer, insertPoint.nextSibling);
            } else {
                article.insertBefore(shareContainer, article.firstChild);
            }

            // Add floating share buttons on desktop
            this.createFloatingShareButtons(platforms);
        },

        /**
         * Create floating share buttons (sidebar)
         */
        createFloatingShareButtons: function(platforms) {
            if (window.innerWidth < 1200) return; // Only on desktop

            const floatingContainer = document.createElement('div');
            floatingContainer.className = 'social-share-floating';
            floatingContainer.setAttribute('role', 'complementary');
            floatingContainer.setAttribute('aria-label', 'Quick share actions');

            // Only include major platforms in floating version
            const floatingPlatforms = platforms.filter(p =>
                ['Twitter', 'Mastodon', 'Bluesky', 'Copy Link'].includes(p.name)
            );

            floatingPlatforms.forEach(platform => {
                const button = document.createElement('a');
                button.className = `social-share-button-floating social-share-${platform.name.toLowerCase().replace(' ', '-')}`;
                button.setAttribute('aria-label', platform.ariaLabel);
                button.setAttribute('role', 'button');
                button.innerHTML = platform.icon;

                if (platform.url) {
                    button.href = platform.url;
                    button.target = '_blank';
                    button.rel = 'noopener noreferrer';
                } else if (platform.handler) {
                    button.href = '#';
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        platform.handler();
                    });
                }

                floatingContainer.appendChild(button);
            });

            document.body.appendChild(floatingContainer);

            // Show/hide on scroll
            let scrollTimeout;
            window.addEventListener('scroll', () => {
                clearTimeout(scrollTimeout);
                const article = document.querySelector('.post-content');
                if (!article) return;

                const rect = article.getBoundingClientRect();
                if (rect.top < 0 && rect.bottom > window.innerHeight / 2) {
                    floatingContainer.classList.add('visible');
                } else {
                    floatingContainer.classList.remove('visible');
                }
            }, { passive: true });
        },

        /**
         * Twitter share URL
         */
        getTwitterUrl: function() {
            const text = `${this.shareData.title}`;
            const hashtags = this.shareData.hashtags.join(',');
            let url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${this.shareData.encodedUrl}`;

            if (hashtags) {
                url += `&hashtags=${encodeURIComponent(hashtags)}`;
            }

            if (this.shareData.via) {
                url += `&via=${encodeURIComponent(this.shareData.via)}`;
            }

            return url;
        },

        /**
         * Bluesky share URL
         */
        getBlueskyUrl: function() {
            const text = `${this.shareData.title}\n\n${this.shareData.url}`;
            return `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`;
        },

        /**
         * Facebook share URL
         */
        getFacebookUrl: function() {
            return `https://www.facebook.com/sharer/sharer.php?u=${this.shareData.encodedUrl}`;
        },

        /**
         * Email share URL
         */
        getEmailUrl: function() {
            const subject = `Worth reading: ${this.shareData.title}`;
            const body = `I thought you might be interested in this article:\n\n${this.shareData.title}\n\n${this.shareData.url}`;
            return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        },

        /**
         * Mastodon share handler (asks for instance)
         */
        shareMastodon: function() {
            const instance = prompt('Enter your Mastodon instance (e.g., mastodon.social):',
                                   localStorage.getItem('mastodon_instance') || 'mastodon.social');

            if (instance) {
                // Save for future use
                localStorage.setItem('mastodon_instance', instance);

                const text = `${this.shareData.title}\n\n${this.shareData.url}`;
                const url = `https://${instance}/share?text=${encodeURIComponent(text)}`;
                window.open(url, '_blank', 'noopener,noreferrer');
            }
        },

        /**
         * Copy link to clipboard
         */
        copyLink: function() {
            const url = this.shareData.url;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(() => {
                    this.showCopyFeedback('Link copied to clipboard!');
                }).catch(() => {
                    this.fallbackCopy(url);
                });
            } else {
                this.fallbackCopy(url);
            }
        },

        /**
         * Fallback copy method for older browsers
         */
        fallbackCopy: function(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();

            try {
                document.execCommand('copy');
                this.showCopyFeedback('Link copied to clipboard!');
            } catch (err) {
                this.showCopyFeedback('Failed to copy link. Please copy manually.');
            }

            document.body.removeChild(textarea);
        },

        /**
         * Show copy feedback message
         */
        showCopyFeedback: function(message) {
            let feedback = document.querySelector('.copy-feedback');

            if (!feedback) {
                feedback = document.createElement('div');
                feedback.className = 'copy-feedback';
                feedback.setAttribute('role', 'status');
                feedback.setAttribute('aria-live', 'polite');
                document.body.appendChild(feedback);
            }

            feedback.textContent = message;
            feedback.classList.add('visible');

            setTimeout(() => {
                feedback.classList.remove('visible');
            }, 3000);
        },

        /**
         * Setup copy link functionality
         */
        setupCopyLink: function() {
            // Already handled in main button creation
        },

        /**
         * Setup text selection sharing
         */
        setupSelectionSharing: function() {
            const content = document.querySelector('.post-content');
            if (!content) return;

            let selectionTimeout;

            const handleSelection = () => {
                clearTimeout(selectionTimeout);

                selectionTimeout = setTimeout(() => {
                    const selection = window.getSelection();
                    const selectedText = selection.toString().trim();

                    if (selectedText && selectedText.length > 10 && selectedText.length < 500) {
                        this.selectedText = selectedText;
                        this.showSelectionPopup(selection);
                    } else {
                        this.hideSelectionPopup();
                    }
                }, 300);
            };

            content.addEventListener('mouseup', handleSelection);
            content.addEventListener('touchend', handleSelection);

            // Hide on scroll
            window.addEventListener('scroll', () => {
                this.hideSelectionPopup();
            }, { passive: true });
        },

        /**
         * Show selection sharing popup
         */
        showSelectionPopup: function(selection) {
            if (!this.selectionPopup) {
                this.selectionPopup = document.createElement('div');
                this.selectionPopup.className = 'selection-share-popup';
                this.selectionPopup.setAttribute('role', 'dialog');
                this.selectionPopup.setAttribute('aria-label', 'Share selected text');

                const twitterBtn = document.createElement('button');
                twitterBtn.className = 'selection-share-btn';
                twitterBtn.innerHTML = this.getTwitterIcon() + ' Tweet';
                twitterBtn.setAttribute('aria-label', 'Share selection on Twitter');
                twitterBtn.addEventListener('click', () => this.shareSelection('twitter'));

                const copyBtn = document.createElement('button');
                copyBtn.className = 'selection-share-btn';
                copyBtn.innerHTML = this.getCopyIcon() + ' Copy';
                copyBtn.setAttribute('aria-label', 'Copy selected text');
                copyBtn.addEventListener('click', () => this.shareSelection('copy'));

                this.selectionPopup.appendChild(twitterBtn);
                this.selectionPopup.appendChild(copyBtn);
                document.body.appendChild(this.selectionPopup);
            }

            // Position the popup
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            this.selectionPopup.style.top = (rect.top + window.pageYOffset - 50) + 'px';
            this.selectionPopup.style.left = (rect.left + (rect.width / 2)) + 'px';
            this.selectionPopup.classList.add('visible');
        },

        /**
         * Hide selection popup
         */
        hideSelectionPopup: function() {
            if (this.selectionPopup) {
                this.selectionPopup.classList.remove('visible');
            }
        },

        /**
         * Share selected text
         */
        shareSelection: function(platform) {
            const quote = `"${this.selectedText}"`;

            if (platform === 'twitter') {
                const text = `${quote}\n\n${this.shareData.title}`;
                const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${this.shareData.encodedUrl}`;
                window.open(url, '_blank', 'noopener,noreferrer');
            } else if (platform === 'copy') {
                const textToCopy = `${quote}\n\nFrom: ${this.shareData.title}\n${this.shareData.url}`;

                if (navigator.clipboard) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        this.showCopyFeedback('Quote copied to clipboard!');
                    });
                } else {
                    this.fallbackCopy(textToCopy);
                }
            }

            this.hideSelectionPopup();
        },

        /**
         * Setup keyboard shortcuts for sharing
         */
        setupKeyboardShortcuts: function() {
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + Shift + S = Share
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                    e.preventDefault();
                    this.copyLink();
                }

                // Ctrl/Cmd + P = Print
                // (Browser default, but we ensure it works)
            });
        },

        /**
         * Setup print button
         */
        setupPrintButton: function() {
            // Add print styles notice
            const style = document.createElement('style');
            style.textContent = `
                @media print {
                    .social-share-container,
                    .social-share-floating,
                    .selection-share-popup,
                    .site-header,
                    .site-footer,
                    .related-posts {
                        display: none !important;
                    }
                }
            `;
            document.head.appendChild(style);
        },

        /**
         * Icon SVGs
         */
        getTwitterIcon: function() {
            return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
        },

        getMastodonIcon: function() {
            return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21.327 8.566c0-4.339-2.843-5.61-2.843-5.61-1.433-.658-3.894-.935-6.451-.956h-.063c-2.557.021-5.016.298-6.45.956 0 0-2.843 1.272-2.843 5.61 0 .993-.019 2.181.012 3.441.103 4.243.778 8.425 4.701 9.463 1.809.479 3.362.579 4.612.51 2.268-.126 3.541-.809 3.541-.809l-.075-1.646s-1.621.511-3.441.449c-1.804-.062-3.707-.194-3.999-2.409a4.523 4.523 0 0 1-.04-.621s1.77.433 4.014.536c1.372.063 2.658-.08 3.965-.236 2.506-.299 4.688-1.843 4.962-3.254.434-2.223.398-5.424.398-5.424zm-3.353 5.59h-2.081V9.057c0-1.075-.452-1.62-1.357-1.62-1 0-1.501.647-1.501 1.927v2.791h-2.069V9.364c0-1.28-.501-1.927-1.502-1.927-.905 0-1.357.546-1.357 1.62v5.099H6.026V8.903c0-1.074.273-1.927.823-2.558.566-.631 1.307-.955 2.228-.955 1.065 0 1.872.409 2.405 1.228l.518.869.519-.869c.533-.819 1.34-1.228 2.405-1.228.92 0 1.662.324 2.228.955.549.631.822 1.484.822 2.558v5.253z"/></svg>';
        },

        getBlueskyIcon: function() {
            return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/></svg>';
        },

        getFacebookIcon: function() {
            return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 3.667h-3.533v7.98H9.101z"/></svg>';
        },

        getEmailIcon: function() {
            return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>';
        },

        getCopyIcon: function() {
            return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
        },

        getPrintIcon: function() {
            return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/></svg>';
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => SocialShare.init());
    } else {
        SocialShare.init();
    }

    // Export for external use
    window.GreymuzzleSocialShare = SocialShare;

})();
