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
src/
├── components/
│   ├── Card.astro             # Basic card component
│   ├── Folder.astro           # Deprecated folder component
│   ├── LessonFilter.tsx       # React component for filtering lessons
│   ├── PathwayCard.astro      # Pathway card component
│   └── StackedPathways.jsx    # Interactive stacked pathways (NEW)
├── layouts/
│   └── BaseLayout.astro       # Main layout with header/footer
├── lib/
│   └── getSheetData.ts        # Fetches lesson data from Google Sheets
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

The site will be available at `http://localhost:4321`

## 📊 Data Management

### Lesson Data Source
Lessons are stored in a Google Sheet and fetched via a published CSV:
- **File**: `src/lib/getSheetData.ts`
- **Sheet URL**: Already configured
- **Format**: Bioschemas Training schema

### Key Metadata Fields (Simplified for MVP)
Essential fields to display:
- `name` - Lesson title
- `description` - Lesson description
- `url` - Link to the lesson
- `learnerCategory` - Which pathway(s) the lesson belongs to
- `educationalLevel` - Beginner/Intermediate/Advanced
- `oss_role` - OSS role (Contributor, Maintainer, etc.)
- `subTopic` - Grouping within a pathway
- `Keep?` - Filter to only show lessons marked "Keep candidate" or "Keep"

### Adding/Updating Lessons
1. Edit the Google Sheet (ask Tim for access)
2. Mark lessons with `Keep?` = "Keep candidate" or "Keep"
3. The website automatically fetches new data on each build

## 📄 Pages Overview

### Homepage (`src/pages/index.astro`)
- Stacked, interactive pathway cards
- Matches Figma design
- Uses `StackedPathways.jsx` component

### All Lessons (`src/pages/lessons.astro`)
- Filterable table view
- Filters: Search, OSS Role, Skill Level, Pathway
- Uses `LessonFilter.tsx` React component

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

### TypeScript Usage

This project uses strict TypeScript checks via Astro’s strict tsconfig.

### Guidelines
- Prefer explicit interfaces for data structures (e.g. CSV rows, props)
- Avoid `any`; use indexed signatures when working with CSV-style data
- All React components should be typed using `.tsx`
- Run `npx astro check` before submitting changes

Strict typing helps catch errors early and improves maintainability.


### Working with the CSV Data
```javascript
import { getSheetData } from '../lib/getSheetData.ts';

// In Astro component
const lessons = await getSheetData();

// Filter active lessons
const activeLessons = lessons.filter(lesson =>
  lesson['Keep?']?.includes('Keep')
);
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

**Issue**: CSV data not loading
- **Solution**: Check the published CSV URL in `getSheetData.ts`

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
