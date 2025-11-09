# Greymuzzle - Professional Journalism Theme for Ghost

A beautiful, accessible, and feature-rich Ghost theme designed specifically for investigative journalism in the furry community. Built on the foundation of the Dope theme with extensive enhancements for professional news reporting.

**Live Site: https://greymuzzle.net**

## Features

### 🎨 Design & Accessibility
- **Dark mode by default** with light mode support and auto-switching based on system preferences
- **WCAG AAA compliant** color contrast ratios (7:1+ for normal text)
- **Comprehensive accessibility features**:
  - Skip to content links
  - Full keyboard navigation support
  - Screen reader optimized
  - Focus indicators
  - ARIA labels throughout
  - High contrast mode support
  - Reduced motion preferences respected

### 📰 Journalism-Specific Features
- **Article type badges**: Investigation, Breaking, Profile, Analysis, Update
- **Enhanced bylines** with author photos, bios, and contact links
- **Reading progress bar** for longform articles
- **Table of contents** (auto-generated from headings)
- **Publication and update timestamps** with clear visual distinction
- **Source citations and footnotes** support
- **Correction and update notices** with timestamps
- **Content warnings** for sensitive material

### 🔍 Investigative Tools
- **Whistleblower tip submission** prominently featured in header and footer
- **Secure submission messaging** with encryption indicators
- **Key findings boxes** for investigation summaries
- **Methodology sections** for transparency
- **Timeline components** for chronological stories
- **Data visualization containers** with captions and source attribution

### 📝 Content Components
- **Pull quotes** with attribution
- **Callout boxes** (info, warning, important, tip)
- **Sidenotes and margin notes**
- **Interview-style blockquotes**
- **Image credits and captions**
- **Spoiler/sensitive content toggles**
- **Drop caps** for feature stories
- **Section dividers** with icons

### 🏠 Homepage Layout
- **Featured story hero** with large images and excerpts
- **Top stories section** with numbered sidebar
- **Category-based organization** with color coding
- **Latest news list** with thumbnails
- **Newsletter signup** call-to-action
- **Load more** functionality

### ⚡ Performance
- **Lazy loading** for images and content
- **Font optimization** with font-display: swap
- **Content visibility** hints for browser optimization
- **Minimal repaints** and efficient animations
- **Mobile-first** responsive design
- **Print-optimized** styles for article archiving

### 🎨 Customization Options

Configure in Ghost Admin → Settings → Design:

**Typography:**
- Title font: Modern sans-serif, Elegant serif, or Newspaper classic
- Body font: Modern sans-serif or Elegant serif

**Display Options:**
- Show/hide author information
- Show/hide reading time
- Show/hide related posts
- Show/hide publication dates
- Show/hide update dates
- Enable/disable table of contents
- Enable/disable reading progress bar

**Journalism Features:**
- Whistleblower tip link (customize URL)
- Color scheme: Dark mode, Light mode, or Auto

## Installation

### Quick Install

1. Download the latest release: `greymuzzle.zip`
2. Log into Ghost Admin → Settings → Design
3. Click "Upload theme" and select the zip file
4. Click "Activate"

### From Source

```bash
# Clone the repository
git clone https://github.com/yourusername/greymuzzle.git
cd greymuzzle

# Install dependencies
npm install

# Build the theme
npm run zip

# Upload dist/greymuzzle.zip to Ghost
```

## Development

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Ghost](https://ghost.org/) 5.0+ (compatible with 6.0)

### Setup

```bash
# Install dependencies
npm install

# Run build & watch for changes
npm run dev

# Build for production
npm run zip

# Run Ghost theme validator
npm test
```

### File Structure

```
greymuzzle/
├── assets/
│   └── css/
│       ├── general/           # Base styles, variables, accessibility
│       │   ├── vars.css       # Design system (colors, typography, spacing)
│       │   ├── accessibility.css
│       │   ├── fonts.css
│       │   └── performance.css
│       ├── journalism/        # Journalism-specific components
│       │   ├── components.css # Bylines, citations, callouts
│       │   └── longform.css   # TOC, timelines, key findings
│       ├── site/              # Site structure
│       │   ├── navigation.css # Header, footer, menus
│       │   ├── header.css
│       │   └── ...
│       └── blog/              # Content layouts
│           ├── homepage.css   # News layout, story grids
│           ├── post.css
│           └── ...
├── partials/                  # Reusable template components
├── default.hbs                # Main layout
├── index.hbs                  # Homepage
├── post.hbs                   # Article template
├── page.hbs                   # Static pages
└── package.json
```

## Usage Guide

### Setting Up Categories

Create tags in Ghost Admin for automatic styling:

- `investigation` → Gold badge
- `breaking` → Red badge with pulse animation
- `profile` → Mint green badge
- `analysis` → Purple badge
- `update` → Teal badge

### Creating Investigative Articles

1. Create a new post
2. Add tag `investigation` as primary tag
3. The article will automatically include:
   - Investigation badge
   - Whistleblower CTA at bottom
   - Key findings box (add in content)
   - Source citations section

### Adding Content Components

Use Ghost's content editor with HTML cards:

**Pull Quote:**
```html
<div class="pullquote">
    Your compelling quote here
    <span class="pullquote-attribution">Source Name</span>
</div>
```

**Callout Box:**
```html
<div class="callout callout-important">
    <div class="callout-title">Important</div>
    <p>Your important message here</p>
</div>
```

**Key Findings:**
```html
<div class="key-findings">
    <h3 class="key-findings-title">Key Findings</h3>
    <ul>
        <li>Finding one</li>
        <li>Finding two</li>
        <li>Finding three</li>
    </ul>
</div>
```

**Timeline:**
```html
<div class="timeline">
    <div class="timeline-item">
        <div class="timeline-date">Jan 2024</div>
        <div class="timeline-marker"></div>
        <div class="timeline-content">
            <div class="timeline-title">Event Title</div>
            <p>Event description</p>
        </div>
    </div>
</div>
```

### Whistleblower Tips Page

1. Create a static page at `/submit-tip`
2. Add secure submission form or instructions
3. Configure link in theme settings: `/submit-tip`

### Newsletter Integration

The homepage includes a newsletter signup section. Connect your Ghost newsletter in Settings → Memberships.

## Color System

### Journalism Semantic Colors

- **Investigation**: `#d4af37` (Gold) - In-depth reporting
- **Breaking**: `#ff6b6b` (Red) - Urgent news
- **Update**: `#4ecdc4` (Teal) - Story updates
- **Correction**: `#ffa94d` (Orange) - Corrections
- **Profile**: `#95e1d3` (Mint) - People features
- **Analysis**: `#aa96da` (Purple) - Opinion/analysis
- **Whistleblower**: `#f38181` (Coral) - Tips/sources

### Brand Colors

Customize in `/assets/css/general/vars.css`:

```css
--brand-primary: #7c9ebd;   /* Links, accents */
--brand-secondary: #9b8fb5; /* Secondary elements */
--brand-tertiary: #8ba89f;  /* Tertiary elements */
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Performance Targets

- **Lighthouse Score**: 95+ on mobile and desktop
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `npm test`
5. Submit a pull request

## Roadmap

- [ ] Multi-author collaboration bylines
- [ ] Podcast episode embeds
- [ ] Interactive data visualization templates
- [ ] Public database browser integration
- [ ] Advanced search with filters
- [ ] Comment moderation tools
- [ ] Species-themed category icons

## Credits

- Base theme: [Dope by Ghost](https://github.com/TryGhost/Dope)
- Built for: [Greymuzzle Investigative Journalism](https://greymuzzle.net)
- Fonts: Inter, Lora, Playfair Display

## License

Copyright (c) 2025 Greymuzzle - Released under the [MIT license](LICENSE).

Based on Dope theme - Copyright (c) 2013-2025 Ghost Foundation

## Support

- Documentation: https://greymuzzle.net/theme-docs
- Issues: https://github.com/yourusername/greymuzzle/issues
- Community: https://greymuzzle.net/community

---

**Made with 🐾 for the furry journalism community**
