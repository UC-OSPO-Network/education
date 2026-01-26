# UC OSPO Education Website - Student Developer Guide

Welcome! This is the UC Open Source Program Office (OSPO) Education website built with Astro and React.

## 🚀 Project Overview

This website helps learners explore open-source learning materials through six main pathways:
1. Getting Started with Open Source
2. Contributing to a Project
3. Maintaining & Sustaining Software
4. Building Inclusive Communities
5. Understanding Licensing & Compliance
6. Strategic Practices & Career Development

## 📁 Project Structure

```
keystatic.config.ts             # Keystatic CMS configuration (Git-backed editing)
src/
├── components/
│   ├── Card.astro             # Basic card component
│   ├── Folder.astro           # Deprecated folder component
│   ├── LessonFilter.jsx       # React component for filtering lessons
│   ├── PathwayCard.astro      # Pathway card component
│   └── StackedPathways.jsx    # Interactive stacked pathways (NEW)
├── content/
│   ├── config.ts              # Astro Content Collections schema
│   └── lessons/               # Lesson data files (edited via Keystatic)
├── layouts/
│   └── BaseLayout.astro       # Main layout with header/footer
├── lib/
│   └── lessons.ts             # Loads lessons from Astro content collection
├── pages/
│   ├── index.astro            # Homepage with stacked pathways
│   ├── lessons.astro          # Filterable lessons library
│   └── pathways/
│       ├── index.astro        # All pathways page
│       └── [id].astro         # Individual pathway pages
├── types/
│   └── lesson.ts              # TypeScript types for lessons
└── public/
    └── styles.css             # Global styles with UC branding
```

## 🎨 Design System

### Colors (UC Official Branding)
```css
--uc-blue: #1295D8       /* Primary brand color */
--uc-gold: #FFB511       /* Primary accent color */
--uc-dark-blue: #005581  /* Secondary blue */
--uc-light-blue: #72CDF4 /* Secondary light blue */
--uc-dark-gray: #1E1E1E  /* Background */
--uc-med-gray: #2A2A2A   /* Card backgrounds */
```

### Typography
- Primary: Helvetica Neue, Arial (fallback)
- Recommended: Kievit (if available)

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The site will be available at `http://localhost:4321/education`

## 📊 Data Management

### Lesson Data Source
Lessons are stored as files in the repo and edited via Keystatic:
- **Keystatic admin UI (local dev only)**: `http://127.0.0.1:4321/keystatic`
- **Content location**: `src/content/lessons/*.json`
- **Schema**: `src/content/config.ts`
- **Keystatic config**: `keystatic.config.ts`

### Key Metadata Fields (Simplified for MVP)
Essential fields to display:
- `name` - Lesson title
- `description` - Lesson description
- `url` - Link to the lesson
- `learnerCategory` - Which pathway the lesson belongs to (can be left **Unassigned**)
- `educationalLevel` - Beginner/Intermediate/Advanced
- `oss_role` - OSS role (Contributor, Maintainer, etc.)
- `subTopic` - Grouping within a pathway
- `keepStatus` - Filter to only show lessons marked "keep" or "keepCandidate"

### Adding/Updating Lessons
1. Run the site locally: `npm run dev`
2. Open Keystatic: `http://127.0.0.1:4321/keystatic`
3. Edit existing lessons or create new ones under the **Lessons** collection
4. Commit the changed files in `src/content/lessons/`

### GitHub-backed Editing (Auth)
Keystatic supports GitHub-backed edits (creates commits/PRs). To enable this locally:
1. Create a GitHub OAuth App for this repo/org
2. Add callback URLs:
   - `http://127.0.0.1:4321/api/keystatic/github/oauth/callback`
3. Create a `.env` file (copy from `.env.example`) and set:
   - `PUBLIC_KEYSTATIC_STORAGE=github`
   - `KEYSTATIC_GITHUB_CLIENT_ID=...`
   - `KEYSTATIC_GITHUB_CLIENT_SECRET=...`
   - `KEYSTATIC_SECRET=...` (random long string)

If you don’t need GitHub auth locally, leave `PUBLIC_KEYSTATIC_STORAGE` unset and Keystatic will use local storage.

### One-time Migration From Google Sheets (Optional)
If you need to import the current Google Sheets data into files once:
- Run: `npm run migrate:lessons`
- This writes `src/content/lessons/*.json`
- After that, Google Sheets changes will **not** automatically update the site anymore.

## 📄 Pages Overview

### Homepage (`src/pages/index.astro`)
- Stacked, interactive pathway cards
- Matches Figma design
- Uses `StackedPathways.jsx` component

### All Lessons (`src/pages/lessons.astro`)
- Filterable table view
- Filters: Search, OSS Role, Skill Level, Pathway
- Uses `LessonFilter.jsx` React component

### Pathway Pages (`src/pages/pathways/[id].astro`)
- Dynamic routes for each pathway
- Lessons grouped by subTopic
- Displays metadata badges

## 🎯 MVP Completed Features

✅ Homepage with stacked pathway navigation
✅ 6 pathway pages with lessons
✅ Filterable lessons library
✅ UC official branding (colors & style)
✅ Google Sheets CSV integration
✅ Responsive design
✅ Accessibility basics

## 🔨 Next Steps for Students

### Phase 2 Enhancements (Priority Order)

1. **Lesson Detail Pages**
   - Create individual lesson pages
   - Show full metadata
   - Add "View External Lesson" button

2. **Feedback System**
   - Add feedback form on lesson pages
   - Use GitHub Issues API to collect feedback
   - Example: https://github.com/carpentries-incubator/proposals/issues/new

3. **Roadmap View**
   - Create visual pathway roadmaps
   - Show learning progression
   - Step-by-step guided pathways

4. **Enhanced Filtering**
   - Add domain-specific tags
   - Lifecycle status filters
   - Save filter preferences

5. **Search Enhancement**
   - Implement better search (Algolia/Fuse.js)
   - Search across keywords, descriptions
   - Highlight search results

6. **Progress Tracking** (Phase 3)
   - Save user progress through pathways
   - Mark lessons as completed
   - Use localStorage or optional user accounts

### Code Quality Tasks
- [ ] Add more TypeScript types
- [ ] Write component tests
- [ ] Add ESLint configuration
- [ ] Improve accessibility (ARIA labels, keyboard nav)
- [ ] Add loading states for data fetching
- [ ] Error handling for failed CSV fetches

## 🧪 Testing

```bash
# Run Astro check for type errors
npx astro check

# Build to test for errors
npm run build
```

## 📦 Deployment

Current setup:
- **Platform**: GitHub Pages
- **Base URL**: `/education`
- **Site**: `https://UC-OSPO-Network.github.io/education`

To deploy:
```bash
npm run build
# Push to main branch - GitHub Actions will deploy
```

## 💡 Tips for Students

### Working with Astro
- `.astro` files support HTML + JavaScript
- Use `---` fences for TypeScript/JavaScript code
- Components can be Astro (`.astro`) or React (`.jsx`)
- Use `client:load` directive for interactive React components

### Working with the CSV Data
```javascript
import { getActiveLessons } from '../lib/lessons';

// In Astro component
const activeLessons = await getActiveLessons();
```

### Adding a New Page
1. Create file in `src/pages/`
2. Import BaseLayout
3. Add navigation link in `BaseLayout.astro`

### Styling
- Global styles: `public/styles.css`
- Component styles: `<style>` tags in `.astro` files
- Inline styles: Use CSS variables for consistency

## 🐛 Common Issues

**Issue**: Keystatic page not loading
- **Solution**: Ensure `@keystatic/astro` is in `astro.config.mjs` and visit `http://127.0.0.1:4321/keystatic`

**Issue**: GitHub sign-in fails (redirect mismatch)
- **Solution**: Confirm your OAuth callback URL is exactly `http://127.0.0.1:4321/api/keystatic/github/oauth/callback`

**Issue**: React component not interactive
- **Solution**: Add `client:load` directive to component

**Issue**: Build fails
- **Solution**: Run `astro check` to find TypeScript errors

## 📚 Resources

- [Astro Docs](https://docs.astro.build)
- [React Docs](https://react.dev)
- [UC Branding Guidelines](https://brand.universityofcalifornia.edu)
- [Bioschemas Training Schema](https://bioschemas.org/profiles/TrainingMaterial)

## 🤝 Getting Help

Questions? Contact:
- Tim Dennis (OSPO lead)
- Check GitHub Issues
- Review Figma design files

---

**Built with ❤️ by UC OSPO student developers**
