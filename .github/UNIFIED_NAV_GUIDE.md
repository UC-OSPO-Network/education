# Unified Navigation Implementation Guide

This guide explains the unified navigation system (Option C) that creates a seamless experience between ucospo.net and the education subsite.

## ✅ What's Been Implemented (Education Site)

### Components Created

1. **`src/components/UnifiedNav.astro`**
   - Full unified navigation with dropdowns
   - Includes all main site links (About, Events, Blog, Resources)
   - Education dropdown is highlighted with gold badge
   - Responsive mobile menu
   - Logo placeholder (needs actual logo)
   - GitHub and RSS social links

2. **`src/layouts/BaseLayout.astro`** (Updated)
   - Uses UnifiedNav component
   - New footer with 4 columns:
     - UC OSPO Network links
     - Education links
     - UC Campus links (all 6 campuses)
     - Connect (GitHub, RSS)
   - Matches main site footer structure

### Features

✅ **Two-level navigation hierarchy**
- Top level: Logo + Site title + Social links
- Main nav: About, Events, Blog, Resources, Education (with dropdowns)

✅ **Visual consistency**
- UC Blue background (#1295D8)
- Gold accents (#FFB511)
- White text
- Dropdown menus on hover

✅ **Education section highlighted**
- Gold background badge for "Education" nav item
- Indicates current site
- Dropdown shows all education pages

✅ **Responsive design**
- Desktop: Horizontal navigation with dropdowns
- Tablet: Simplified layout
- Mobile: Hamburger menu with expandable sections

✅ **Accessibility**
- ARIA labels
- Keyboard navigation support
- Focus indicators
- Screen reader friendly

✅ **Active page highlighting**
- Current page highlighted in dropdown
- JavaScript detects current path

## 🔧 What Needs to Be Done

### 1. Add UC OSPO Logo

**Download logo from main site**:
```bash
# Get the logo from ucospo.net
wget https://ucospo.net/path/to/logo.png -O public/uc-ospo-logo.png
# OR if it's an SVG:
wget https://ucospo.net/path/to/logo.svg -O public/uc-ospo-logo.svg
```

**Update UnifiedNav.astro** (line ~58):
```astro
<!-- Replace this: -->
<div class="logo-placeholder">UC</div>

<!-- With this: -->
<img src="/uc-ospo-logo.png" alt="UC OSPO Logo" width="48" height="48" />
<!-- OR if SVG: -->
<img src="/uc-ospo-logo.svg" alt="UC OSPO Logo" width="48" height="48" />
```

### 2. Implement Same Navigation on Main Site

The main site (ucospo.net repo) needs to adopt the same navigation structure for consistency.

**Main site changes needed**:

1. **Add "Education" dropdown to main navigation**:
   ```html
   <li class="nav-item">
     <a href="https://ucospo.net/education" class="nav-link">
       Education
       <span class="dropdown-arrow">▼</span>
     </a>
     <div class="dropdown-menu">
       <a href="https://ucospo.net/education">All Pathways</a>
       <a href="https://ucospo.net/education/lessons">All Lessons</a>
       <a href="https://ucospo.net/education/pathways">Browse Pathways</a>
       <a href="https://ucospo.net/education/develop-a-lesson">Develop a Lesson</a>
     </div>
   </li>
   ```

2. **Match header structure**:
   - Logo on left
   - Social links (GitHub, RSS) on right
   - Navigation bar below

3. **Match footer structure**:
   - 4 columns: UC OSPO Network, Education, UC Campuses, Connect
   - Include education section links
   - Same styling

4. **Ensure visual consistency**:
   - Same UC Blue background
   - Same Gold accents
   - Same fonts (Kievit/Arial)
   - Same hover effects

### 3. Update URLs After Domain Setup

Once `ucospo.net/education` is configured (see issue #35), update these URLs:

**In education site** (`UnifiedNav.astro`):
- Change `/education` to `/` throughout
- Links currently use `/education` prefix for local dev

**In main site**:
- Update Education dropdown links to point to `ucospo.net/education`

### 4. Test Cross-Site Navigation

After both sites are deployed:

**Checklist**:
- [ ] Main site → Education links work
- [ ] Education site → Main site links work
- [ ] Dropdowns work on both sites
- [ ] Mobile navigation works on both sites
- [ ] Footer links work bidirectionally
- [ ] Active page highlighting works correctly
- [ ] Logo links to main site from education
- [ ] Social links work from both sites

## 📐 Navigation Structure Reference

```
UC OSPO Network Site
├── Logo (links to /)
├── About ▼
│   ├── About UC OSPO Network
│   └── Guiding Themes
├── Events
├── Blog
├── Resources ▼
│   └── OSS Resources
└── Education ▼ [Links to ucospo.net/education]
    ├── All Pathways
    ├── All Lessons
    ├── Browse Pathways
    └── Develop a Lesson

Education Site (ucospo.net/education)
├── Logo (links to ucospo.net)
├── About ▼ [Links to main site]
│   ├── About UC OSPO Network
│   └── Guiding Themes
├── Events [Links to main site]
├── Blog [Links to main site]
├── Resources ▼ [Links to main site]
│   └── OSS Resources
└── Education ▼ [HIGHLIGHTED - Current Site]
    ├── All Pathways
    ├── All Lessons
    ├── Browse Pathways
    └── Develop a Lesson
```

## 🎨 Visual Design Tokens

Ensure both sites use these consistently:

```css
/* Colors */
--uc-blue: #1295D8;        /* Header background */
--uc-gold: #FFB511;        /* Accents, current site badge */
--uc-white: #FFFFFF;       /* Text on blue background */
--uc-dark-gray: #1E1E1E;   /* Page background */
--uc-light-blue: #72CDF4;  /* Hover states */

/* Typography */
font-family: 'Kievit', Arial, sans-serif;

/* Spacing */
Header padding: 1rem 2rem
Nav link padding: 1rem 1.25rem
Footer padding: 3rem 2rem

/* Border */
Gold border: 3px solid var(--uc-gold)
```

## 🚀 Deployment Sequence

1. **Education site** (Current repo):
   - ✅ UnifiedNav implemented
   - ✅ Footer updated
   - ⏳ Add logo when available
   - ⏳ Deploy to GitHub Pages
   - ⏳ Test at current URL

2. **Main site** (ucospo.net repo):
   - ⏳ Add Education dropdown to navigation
   - ⏳ Update footer to include Education section
   - ⏳ Match header/footer styling
   - ⏳ Deploy to ucospo.net

3. **Domain setup** (Issue #35):
   - ⏳ Configure ucospo.net/education subdomain
   - ⏳ Update Astro config in education repo
   - ⏳ Update links in both sites

4. **Final testing**:
   - ⏳ Test all cross-site navigation
   - ⏳ Verify consistency
   - ⏳ Mobile testing
   - ⏳ Accessibility audit

## 📝 Notes for Main Site Team

If you're implementing this on the main ucospo.net site:

1. **Copy the navigation structure** from `UnifiedNav.astro`
2. **Highlight the appropriate section** - use `current-site` class on whichever section matches the current site
3. **Update dropdown links** - Education dropdown should point to ucospo.net/education URLs
4. **Match the footer** - Use same 4-column structure
5. **Test dropdowns** - Ensure hover/click behavior works on your platform (Jekyll, Hugo, etc.)

## 🐛 Known Issues / TODO

- [ ] Add actual UC OSPO logo (currently placeholder)
- [ ] Test with real domain (ucospo.net/education)
- [ ] Verify dropdown behavior on all browsers
- [ ] Add keyboard navigation enhancements
- [ ] Consider adding search functionality
- [ ] Add skip navigation link for accessibility

## 📚 References

- UC Branding Guidelines: https://brand.universityofcalifornia.edu
- Main site repo: https://github.com/UC-OSPO-Network/ucospo.net
- Education site repo: https://github.com/UC-OSPO-Network/education
- Integration issue: #35
