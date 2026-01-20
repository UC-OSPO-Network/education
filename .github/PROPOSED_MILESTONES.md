# Proposed Milestones for UC OSPO Education Project

## Analysis of Current Issues

### Issue Categories

**Migration Issues (Critical Path)**
- #40 - Set up Keystatic CMS
- #41 - Set up content collections
- #42 - Create migration script
- #43 - Update app code
- #44 - Configure Keystatic to edit lessons
- #45 - Add CI/CD validation
- #46 - Create audit tool
- #47 - EPIC: Migration overview

**Data Quality Issues (Critical Priority)**
- #23 - Add subTopic to all lessons (priority: critical)
- #24 - Write missing descriptions (priority: critical)
- #25 - Assign learnerCategory to orphaned lessons (priority: critical)
- #26 - Find 5-7 'Getting Started' lessons (priority: high)

**User Experience Features**
- #28 - Create lesson detail pages (priority: high)
- #29 - GitHub Issues feedback system (priority: medium)
- #30 - Visual pathway roadmaps (priority: medium)
- #31 - Improve search with fuzzy matching (priority: medium)

**Code Quality & Testing**
- #27 - Add error handling and loading states (priority: medium)
- #32 - WCAG 2.1 AA accessibility audit (priority: high)
- #33 - Add domain/lifecycle filters (priority: low)
- #34 - Improve TypeScript types (priority: low)

**Infrastructure**
- #35 - Integrate with main ucospo.net domain (priority: medium)

**Older/Vague Issues**
- #1-18 - Various older issues needing clarification

---

## Proposed Milestone Structure

### Milestone 1: "Content Infrastructure Migration" 🏗️
**Timeline**: Week 1-2 (Jan 20 - Feb 2)
**Goal**: Move from Google Sheets to Git-based content management

**Why this first?**
- Blocks everything else
- Establishes single source of truth
- Enables PR workflow for content changes
- Foundation for all future work

**Issues** (7 issues, ~27-35 hours):
- #40 - Set up Keystatic CMS (4-6h)
- #41 - Set up content collections (3-4h)
- #42 - Create migration script (4-5h)
- #43 - Update app code (5-6h)
- #44 - Configure Keystatic (4-5h)
- #46 - Create audit tool (3-4h)
- #47 - Migration EPIC (tracking)

**Definition of Done**:
- ✅ All 56 lessons migrated to JSON singletons
- ✅ Keystatic admin UI working at `/keystatic`
- ✅ All pages use content collections (not CSV)
- ✅ Audit confirms no data loss
- ✅ Site builds and deploys successfully

---

### Milestone 2: "Data Quality & Completeness" 📊
**Timeline**: Week 2-3 (Feb 3 - Feb 16)
**Goal**: Clean up missing data and improve lesson metadata quality

**Why second?**
- Easier to edit via Keystatic than Google Sheets
- Students can use PR workflow to contribute
- Unblocks feature work that depends on complete data

**Issues** (4 issues, ~10-14 hours):
- #23 - Add subTopic to all lessons (2-3h)
- #24 - Write missing descriptions (2-3h)
- #25 - Assign learnerCategory to orphaned lessons (2-3h)
- #26 - Find 5-7 'Getting Started' lessons (3-4h)
- #45 - Add lesson validation to CI/CD (4-5h)

**Definition of Done**:
- ✅ All 'Keep' lessons have descriptions
- ✅ All lessons have assigned learnerCategory
- ✅ All lessons have subTopic
- ✅ Getting Started pathway has 5-7 lessons
- ✅ CI/CD validates data quality on PRs

---

### Milestone 3: "User Experience Features" ✨
**Timeline**: Week 3-4 (Feb 17 - Mar 2)
**Goal**: Enhance user experience with new features

**Why third?**
- Depends on having lesson singletons (#28 needs slugs)
- Depends on having complete data (search/roadmaps)
- High-impact user-facing improvements

**Issues** (4 issues, ~16-21 hours):
- #28 - Create lesson detail pages (4-6h) ⭐ **Priority 1**
- #31 - Improve search with fuzzy matching (4-5h) ⭐ **Priority 2**
- #29 - GitHub Issues feedback system (4-5h)
- #30 - Visual pathway roadmaps (4-5h)

**Definition of Done**:
- ✅ Every lesson has detail page at `/lessons/[slug]`
- ✅ Search works across multiple fields
- ✅ Users can submit feedback via GitHub Issues
- ✅ Pathways show visual learning progression

---

### Milestone 4: "Code Quality & Accessibility" 🔧
**Timeline**: Week 4-5 (Mar 3 - Mar 16)
**Goal**: Improve code quality, accessibility, and developer experience

**Why fourth?**
- Can happen in parallel with Milestone 3
- Important but not blocking
- Improves long-term maintainability

**Issues** (4 issues, ~10-15 hours):
- #32 - WCAG 2.1 AA accessibility audit (4-6h) ⭐ **Priority**
- #27 - Add error handling and loading states (3-4h)
- #34 - Improve TypeScript types (2-3h)
- #33 - Add domain/lifecycle filters (1-2h)

**Definition of Done**:
- ✅ Site passes WCAG 2.1 AA audit
- ✅ All pages have error/loading states
- ✅ TypeScript errors eliminated
- ✅ Advanced filters implemented

---

### Milestone 5: "Infrastructure & Deployment" 🚀
**Timeline**: Ongoing / Future
**Goal**: Production infrastructure improvements

**Issues** (1+ issues):
- #35 - Integrate with main ucospo.net domain

**Definition of Done**:
- ✅ Education site accessible at education.ucospo.net
- ✅ Proper routing and navigation
- ✅ SSL/DNS configured

---

### Milestone 6: "Backlog & Future Planning" 🔮
**Timeline**: To be triaged
**Goal**: Triage and clarify older issues

**Issues** (13 issues):
- #1-18 (excluding closed issues)

**Action Required**:
- Review each issue
- Close duplicates or outdated issues
- Convert vague issues to concrete tasks
- Re-assign to appropriate milestones

---

## Recommended Milestone Creation Order

### Create Immediately (Student Work)
1. ✅ **Milestone 1: Content Infrastructure Migration** (Jan 20 - Feb 2)
2. ✅ **Milestone 2: Data Quality & Completeness** (Feb 3 - Feb 16)
3. ✅ **Milestone 3: User Experience Features** (Feb 17 - Mar 2)

### Create Later
4. **Milestone 4: Code Quality & Accessibility** (Mar 3+)
5. **Milestone 5: Infrastructure & Deployment** (Ongoing)
6. **Milestone 6: Backlog & Future Planning** (Ongoing)

---

## Student Assignment Strategy

### Week 1-2: Migration Focus
**Team 1 (2 students)**: Infrastructure
- #40 Keystatic setup
- #41 Content collections

**Team 2 (2 students)**: Migration & Validation
- #42 Migration script
- #46 Audit tool

**Team 3 (2 students)**: Integration
- #43 Update app code
- #44 Configure Keystatic
- #45 CI/CD validation

### Week 2-3: Data Quality (Can overlap with Week 2)
**All students** (can divide work):
- #23 Add subTopics
- #24 Write descriptions
- #25 Assign categories
- #26 Find Getting Started lessons

### Week 3-4: Feature Development
**Team 1**: Lesson detail pages (#28)
**Team 2**: Search improvements (#31)
**Team 3**: Feedback system (#29) or Roadmaps (#30)

---

## Critical Dependencies

```
Milestone 1 (Migration)
    │
    ├──▶ Milestone 2 (Data Quality)
    │       │
    │       └──▶ Milestone 3 (Features)
    │               │
    │               └──▶ Milestone 4 (Quality)
    │
    └──▶ Milestone 5 (Infrastructure) [parallel]
```

**Key Insight**: Milestone 1 must complete before meaningful work on Milestones 2-4 can begin. However, Milestone 5 can proceed independently.

---

## Success Metrics

### Milestone 1 Success
- 0 build errors
- 56 lessons in content collections
- Keystatic UI functional
- 100% data migration verified

### Milestone 2 Success
- 0 lessons missing descriptions
- 0 lessons missing subTopic
- 0 orphaned lessons
- 5+ Getting Started lessons added

### Milestone 3 Success
- Lesson detail pages get >50% of traffic
- Search usage increases 2x
- 5+ feedback submissions received
- Users spend more time on pathway pages

### Milestone 4 Success
- 0 WCAG AA violations
- 0 TypeScript errors
- Lighthouse accessibility score >90
- Developer satisfaction improved

---

## Recommendation

Start by creating **Milestones 1, 2, and 3** immediately. These represent 2-4 weeks of focused student work with clear deliverables.

**Commands to create milestones**:
```bash
gh milestone create "Content Infrastructure Migration" --description "Move from Google Sheets to Keystatic + Content Collections" --due-date 2026-02-02
gh milestone create "Data Quality & Completeness" --description "Clean up missing data and improve lesson metadata" --due-date 2026-02-16
gh milestone create "User Experience Features" --description "Enhance UX with lesson pages, search, and feedback" --due-date 2026-03-02
```

Then assign issues to milestones:
```bash
gh issue edit 40 --milestone "Content Infrastructure Migration"
gh issue edit 41 --milestone "Content Infrastructure Migration"
# ... etc
```
