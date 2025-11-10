/**
 * Advanced Search System for Greymuzzle
 * Ghost Content API search with filters, keyboard shortcuts, and result highlighting
 */

(function() {
    'use strict';

    const Search = {
        modal: null,
        input: null,
        resultsContainer: null,
        isOpen: false,
        searchTimeout: null,
        recentSearches: [],
        allPosts: [],
        ghostAPIKey: null, // Will be set from meta tag
        ghostAPIUrl: null,
        currentFilter: 'all',

        init: function() {
            this.loadAPIConfig();
            this.createSearchModal();
            this.setupKeyboardShortcuts();
            this.loadRecentSearches();
            this.prefetchPosts();
        },

        /**
         * Load Ghost API configuration from meta tags
         */
        loadAPIConfig: function() {
            // Try to get API URL from current domain
            this.ghostAPIUrl = window.location.origin + '/ghost/api/content';

            // Try to get API key from meta tag (you need to add this to default.hbs)
            const keyMeta = document.querySelector('meta[name="ghost-api-key"]');
            this.ghostAPIKey = keyMeta ? keyMeta.content : null;
        },

        /**
         * Prefetch all posts for offline search capability
         */
        prefetchPosts: function() {
            // This caches posts in memory for faster search
            // In a real implementation, you'd fetch from Ghost API
            // For now, we'll use a simpler client-side approach
        },

        /**
         * Create search modal UI
         */
        createSearchModal: function() {
            const modal = document.createElement('div');
            modal.className = 'search-modal';
            modal.id = 'search-modal';
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('aria-modal', 'true');
            modal.setAttribute('aria-label', 'Search articles');
            modal.setAttribute('aria-hidden', 'true');

            modal.innerHTML = `
                <div class="search-overlay" aria-hidden="true"></div>
                <div class="search-container">
                    <div class="search-header">
                        <div class="search-input-wrapper">
                            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            <input
                                type="search"
                                class="search-input"
                                id="search-input"
                                placeholder="Search investigations, profiles, and more..."
                                autocomplete="off"
                                aria-label="Search input"
                                aria-autocomplete="list"
                                aria-controls="search-results"
                                aria-expanded="false"
                            >
                            <button class="search-close" aria-label="Close search" title="Close search (Esc)">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
                        </div>

                        <div class="search-filters" role="tablist" aria-label="Search filters">
                            <button class="search-filter active" data-filter="all" role="tab" aria-selected="true">
                                All
                            </button>
                            <button class="search-filter" data-filter="investigation" role="tab" aria-selected="false">
                                Investigations
                            </button>
                            <button class="search-filter" data-filter="profile" role="tab" aria-selected="false">
                                Profiles
                            </button>
                            <button class="search-filter" data-filter="breaking" role="tab" aria-selected="false">
                                Breaking
                            </button>
                            <button class="search-filter" data-filter="analysis" role="tab" aria-selected="false">
                                Analysis
                            </button>
                        </div>

                        <div class="search-shortcuts">
                            <kbd>↑</kbd><kbd>↓</kbd> Navigate
                            <kbd>↵</kbd> Select
                            <kbd>Esc</kbd> Close
                        </div>
                    </div>

                    <div class="search-body">
                        <div class="search-results" id="search-results" role="listbox" aria-label="Search results">
                            <!-- Results will be inserted here -->
                        </div>

                        <div class="search-empty" id="search-empty" style="display: none;">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                            </svg>
                            <p>No results found</p>
                            <p class="search-empty-hint">Try different keywords or filters</p>
                        </div>

                        <div class="search-loading" id="search-loading" style="display: none;">
                            <div class="search-spinner"></div>
                            <p>Searching...</p>
                        </div>

                        <div class="search-initial" id="search-initial">
                            <h3>Recent Searches</h3>
                            <div class="search-recent-list" id="search-recent-list">
                                <!-- Recent searches will be inserted here -->
                            </div>
                            <div class="search-tips">
                                <h3>Search Tips</h3>
                                <ul>
                                    <li>Use quotes for exact phrases: <code>"convention fraud"</code></li>
                                    <li>Filter by type using the tabs above</li>
                                    <li>Search by author: <code>author:name</code></li>
                                    <li>Search by tag: <code>tag:investigation</code></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            this.modal = modal;
            this.input = modal.querySelector('#search-input');
            this.resultsContainer = modal.querySelector('#search-results');

            this.setupEventListeners();
        },

        /**
         * Setup all event listeners
         */
        setupEventListeners: function() {
            // Close button
            const closeBtn = this.modal.querySelector('.search-close');
            closeBtn.addEventListener('click', () => this.close());

            // Overlay click
            const overlay = this.modal.querySelector('.search-overlay');
            overlay.addEventListener('click', () => this.close());

            // Input
            this.input.addEventListener('input', (e) => this.handleInput(e));
            this.input.addEventListener('keydown', (e) => this.handleKeydown(e));

            // Filters
            const filters = this.modal.querySelectorAll('.search-filter');
            filters.forEach(filter => {
                filter.addEventListener('click', (e) => this.handleFilterClick(e));
            });

            // Prevent modal close when clicking inside container
            const container = this.modal.querySelector('.search-container');
            container.addEventListener('click', (e) => e.stopPropagation());
        },

        /**
         * Setup keyboard shortcuts
         */
        setupKeyboardShortcuts: function() {
            document.addEventListener('keydown', (e) => {
                // Cmd/Ctrl + K to open search
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    this.open();
                }

                // / to open search
                if (e.key === '/' && !this.isOpen) {
                    // Don't trigger if user is typing in an input
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                        return;
                    }
                    e.preventDefault();
                    this.open();
                }

                // Esc to close
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        },

        /**
         * Open search modal
         */
        open: function() {
            if (this.isOpen) return;

            this.isOpen = true;
            this.modal.classList.add('open');
            this.modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            // Focus input
            setTimeout(() => this.input.focus(), 100);

            // Show recent searches
            this.displayRecentSearches();

            // Announce to screen readers
            this.announce('Search opened. Type to search articles.');
        },

        /**
         * Close search modal
         */
        close: function() {
            if (!this.isOpen) return;

            this.isOpen = false;
            this.modal.classList.remove('open');
            this.modal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';

            // Clear input and results
            this.input.value = '';
            this.resultsContainer.innerHTML = '';
            this.showInitialState();

            this.announce('Search closed');
        },

        /**
         * Handle input changes
         */
        handleInput: function(e) {
            const query = e.target.value.trim();

            clearTimeout(this.searchTimeout);

            if (query.length === 0) {
                this.showInitialState();
                return;
            }

            if (query.length < 2) {
                return;
            }

            // Debounce search
            this.searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        },

        /**
         * Handle keyboard navigation
         */
        handleKeydown: function(e) {
            const results = this.resultsContainer.querySelectorAll('.search-result-item');
            const selected = this.resultsContainer.querySelector('.search-result-item.selected');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!selected && results.length > 0) {
                    results[0].classList.add('selected');
                    results[0].scrollIntoView({ block: 'nearest' });
                } else if (selected) {
                    const next = selected.nextElementSibling;
                    if (next && next.classList.contains('search-result-item')) {
                        selected.classList.remove('selected');
                        next.classList.add('selected');
                        next.scrollIntoView({ block: 'nearest' });
                    }
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (selected) {
                    const prev = selected.previousElementSibling;
                    if (prev && prev.classList.contains('search-result-item')) {
                        selected.classList.remove('selected');
                        prev.classList.add('selected');
                        prev.scrollIntoView({ block: 'nearest' });
                    }
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selected) {
                    const link = selected.querySelector('a');
                    if (link) {
                        this.saveRecentSearch(this.input.value.trim());
                        window.location.href = link.href;
                    }
                }
            }
        },

        /**
         * Handle filter clicks
         */
        handleFilterClick: function(e) {
            const filter = e.currentTarget;
            const filterValue = filter.dataset.filter;

            // Update active state
            this.modal.querySelectorAll('.search-filter').forEach(f => {
                f.classList.remove('active');
                f.setAttribute('aria-selected', 'false');
            });
            filter.classList.add('active');
            filter.setAttribute('aria-selected', 'true');

            this.currentFilter = filterValue;

            // Re-run search if there's a query
            const query = this.input.value.trim();
            if (query.length >= 2) {
                this.performSearch(query);
            }

            this.announce(`Filter changed to ${filterValue}`);
        },

        /**
         * Perform search
         */
        performSearch: async function(query) {
            this.showLoading();

            try {
                // Parse advanced search syntax
                const parsedQuery = this.parseQuery(query);

                // Perform the search
                const results = await this.searchPosts(parsedQuery);

                // Display results
                this.displayResults(results, query);

            } catch (error) {
                console.error('Search error:', error);
                this.showError();
            }
        },

        /**
         * Parse advanced search query
         */
        parseQuery: function(query) {
            const parsed = {
                text: query,
                author: null,
                tag: null,
                exactPhrase: null
            };

            // Extract author: syntax
            const authorMatch = query.match(/author:(\S+)/);
            if (authorMatch) {
                parsed.author = authorMatch[1];
                parsed.text = query.replace(/author:\S+/, '').trim();
            }

            // Extract tag: syntax
            const tagMatch = query.match(/tag:(\S+)/);
            if (tagMatch) {
                parsed.tag = tagMatch[1];
                parsed.text = query.replace(/tag:\S+/, '').trim();
            }

            // Extract exact phrase
            const phraseMatch = query.match(/"([^"]+)"/);
            if (phraseMatch) {
                parsed.exactPhrase = phraseMatch[1];
                parsed.text = query.replace(/"[^"]+"/, '').trim();
            }

            return parsed;
        },

        /**
         * Search posts using Ghost Content API or client-side
         */
        searchPosts: async function(parsedQuery) {
            // In a production environment, you would use Ghost's Content API:
            // const url = `${this.ghostAPIUrl}/posts/?key=${this.ghostAPIKey}&filter=...&limit=20`;
            // const response = await fetch(url);
            // const data = await response.json();
            // return data.posts;

            // For this implementation, we'll use a client-side search
            // by scraping the current page's content
            return this.clientSideSearch(parsedQuery);
        },

        /**
         * Client-side search implementation
         */
        clientSideSearch: function(parsedQuery) {
            const results = [];
            const query = parsedQuery.text.toLowerCase();

            // Search through posts on the current page
            // In a real implementation, you'd want to fetch all posts or use Ghost API
            const posts = document.querySelectorAll('.post-card, .post, article[class*="post"]');

            posts.forEach(post => {
                const title = post.querySelector('.post-card-title, .post-title, h1, h2');
                const excerpt = post.querySelector('.post-card-excerpt, .post-excerpt, p');
                const link = post.querySelector('a[href*="/"]');
                const tags = post.querySelectorAll('.post-tag, .post-card-tag');

                if (!title || !link) return;

                const titleText = title.textContent.toLowerCase();
                const excerptText = excerpt ? excerpt.textContent.toLowerCase() : '';
                const url = link.href;

                // Filter by type if specified
                if (this.currentFilter !== 'all') {
                    const hasFilterTag = Array.from(tags).some(tag =>
                        tag.textContent.toLowerCase().includes(this.currentFilter)
                    );
                    if (!hasFilterTag) return;
                }

                // Filter by tag if specified
                if (parsedQuery.tag) {
                    const hasTag = Array.from(tags).some(tag =>
                        tag.textContent.toLowerCase().includes(parsedQuery.tag.toLowerCase())
                    );
                    if (!hasTag) return;
                }

                // Check if matches query
                if (titleText.includes(query) || excerptText.includes(query)) {
                    const tagList = Array.from(tags).map(tag => tag.textContent.trim());

                    results.push({
                        title: title.textContent.trim(),
                        excerpt: excerptText.substring(0, 150),
                        url: url,
                        tags: tagList,
                        relevance: titleText.includes(query) ? 2 : 1
                    });
                }
            });

            // Sort by relevance
            results.sort((a, b) => b.relevance - a.relevance);

            return results.slice(0, 20); // Limit to 20 results
        },

        /**
         * Display search results
         */
        displayResults: function(results, query) {
            this.hideLoading();
            this.hideInitial();

            const resultsContainer = this.resultsContainer;
            resultsContainer.innerHTML = '';

            if (results.length === 0) {
                this.showEmpty();
                return;
            }

            this.hideEmpty();

            results.forEach((result, index) => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.setAttribute('role', 'option');
                resultItem.setAttribute('aria-label', result.title);

                // Highlight query in title
                const highlightedTitle = this.highlightText(result.title, query);

                resultItem.innerHTML = `
                    <a href="${result.url}" class="search-result-link">
                        <div class="search-result-content">
                            <h3 class="search-result-title">${highlightedTitle}</h3>
                            ${result.excerpt ? `<p class="search-result-excerpt">${this.highlightText(result.excerpt, query)}</p>` : ''}
                            ${result.tags.length > 0 ? `
                                <div class="search-result-tags">
                                    ${result.tags.slice(0, 3).map(tag => `<span class="search-result-tag">${tag}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                        <svg class="search-result-arrow" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                        </svg>
                    </a>
                `;

                // Click handler
                resultItem.addEventListener('click', () => {
                    this.saveRecentSearch(query);
                });

                // Hover handler
                resultItem.addEventListener('mouseenter', () => {
                    resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    resultItem.classList.add('selected');
                });

                resultsContainer.appendChild(resultItem);
            });

            // Update ARIA
            this.input.setAttribute('aria-expanded', 'true');
            this.announce(`${results.length} results found`);
        },

        /**
         * Highlight search query in text
         */
        highlightText: function(text, query) {
            if (!query) return text;

            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        },

        /**
         * Show/hide states
         */
        showLoading: function() {
            document.getElementById('search-loading').style.display = 'flex';
            document.getElementById('search-empty').style.display = 'none';
            document.getElementById('search-initial').style.display = 'none';
        },

        hideLoading: function() {
            document.getElementById('search-loading').style.display = 'none';
        },

        showEmpty: function() {
            document.getElementById('search-empty').style.display = 'flex';
        },

        hideEmpty: function() {
            document.getElementById('search-empty').style.display = 'none';
        },

        showInitialState: function() {
            document.getElementById('search-initial').style.display = 'block';
            document.getElementById('search-empty').style.display = 'none';
            document.getElementById('search-loading').style.display = 'none';
            this.resultsContainer.innerHTML = '';
            this.input.setAttribute('aria-expanded', 'false');
        },

        hideInitial: function() {
            document.getElementById('search-initial').style.display = 'none';
        },

        showError: function() {
            this.resultsContainer.innerHTML = `
                <div class="search-error">
                    <p>An error occurred while searching. Please try again.</p>
                </div>
            `;
        },

        /**
         * Recent searches management
         */
        loadRecentSearches: function() {
            const saved = localStorage.getItem('greymuzzle_recent_searches');
            if (saved) {
                try {
                    this.recentSearches = JSON.parse(saved);
                } catch (e) {
                    this.recentSearches = [];
                }
            }
        },

        saveRecentSearch: function(query) {
            if (!query || query.length < 2) return;

            // Remove if already exists
            this.recentSearches = this.recentSearches.filter(s => s !== query);

            // Add to beginning
            this.recentSearches.unshift(query);

            // Keep only last 10
            this.recentSearches = this.recentSearches.slice(0, 10);

            // Save to localStorage
            localStorage.setItem('greymuzzle_recent_searches', JSON.stringify(this.recentSearches));
        },

        displayRecentSearches: function() {
            const container = document.getElementById('search-recent-list');
            if (!container) return;

            if (this.recentSearches.length === 0) {
                container.innerHTML = '<p class="search-no-recent">No recent searches</p>';
                return;
            }

            container.innerHTML = this.recentSearches
                .map(search => `
                    <button class="search-recent-item" data-query="${search}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                        </svg>
                        <span>${search}</span>
                    </button>
                `)
                .join('');

            // Add click handlers
            container.querySelectorAll('.search-recent-item').forEach(item => {
                item.addEventListener('click', () => {
                    const query = item.dataset.query;
                    this.input.value = query;
                    this.performSearch(query);
                });
            });
        },

        /**
         * Announce to screen readers
         */
        announce: function(message) {
            let announcer = document.getElementById('search-announcer');

            if (!announcer) {
                announcer = document.createElement('div');
                announcer.id = 'search-announcer';
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
        document.addEventListener('DOMContentLoaded', () => Search.init());
    } else {
        Search.init();
    }

    // Export for external use
    window.GreymuzzleSearch = Search;

})();
