# Greymuzzle
_Furry-centric investigative journalism, powered by Ghost & the **Dope** theme_

Greymuzzle is a furry fandom-native newsroom focused on:
- Accountability in furry spaces  
- Safety, anti-abuse, and anti-fascist reporting  
- Labor, money, and power in the fandom  
- Culture, history, and “greymuzzle” memory
- Artist profiles

Greymuzzle is:
- Anti-fascist
- Pro-survivor
- Pro-worker
- Explicitly queer-friendly and furry-centric

We expect all contributors to:
- Respect sources, including their boundaries and trauma
- Avoid harassment, dogpiling, or targeted hate
- Keep doxxable data and sensitive evidence out of Git and in secure channels
- A more formal Code of Conduct (e.g. Contributor Covenant) can be found in [CODE_OF_CONDUCT.md](https://github.com/nicweyand/Greymuzzle/blob/main/CODE_OF_CONDUCT.md).

# Dope

A unique tag-based [Ghost](https://github.com/TryGhost/Ghost) theme to arrange your publications into collections. Keep organized and let your readers explore your publications with beautifully designed tag columns.

**Demo: https://dope.ghost.io**

# Instructions

1. [Download this theme](https://github.com/TryGhost/Dope/archive/main.zip)
2. Log into Ghost, and go to the `Design` settings area to upload the zip file

# Development

Styles are compiled using Gulp/PostCSS to polyfill future CSS spec. You'll need [Node](https://nodejs.org/), [Yarn](https://yarnpkg.com/) and [Gulp](https://gulpjs.com) installed globally. After that, from the theme's root directory:

```bash
# Install
yarn

# Run build & watch for changes
yarn dev
```

Now you can edit `/assets/css/` files, which will be compiled to `/assets/built/` automatically.

The `zip` Gulp task packages the theme files into `dist/dope.zip`, which you can then upload to your site.

```bash
yarn zip
```

# Contribution

This repo is synced automatically with [TryGhost/Themes](https://github.com/TryGhost/Themes) monorepo. If you're looking to contribute or raise an issue, head over to the main repository [TryGhost/Themes](https://github.com/TryGhost/Themes) where our official themes are developed.

# Copyright & License

Copyright (c) 2013-2025 Ghost Foundation - Released under the [MIT license](LICENSE).
