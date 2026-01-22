# UC OSPO Education Group Meeting
## 2026-01-20 @ 4:00 PM

**Attendees:** Lauren, Reid, Shawn, Gia, Tim, + others

**Zoom:** https://ucla.zoom.us/j/97776026230

---

## Agenda

### 1. Welcome & Introductions (5 min)
- Quick intros for anyone new or returning after break
- Overview of today's goals: design review, project status, next steps

### 2. Lauren's Design Work & Needs (25 min)

#### A. Vibe Coding Session Debrief (10 min)
**What We Did:**
- Explored implementing Lauren's Figma design in Astro
- Experimented with design → code translation
- Identified technical constraints and opportunities

**Feedback Loop Discussion:**
- How do we establish ongoing design fidelity reviews?
- Weekly design check-ins? Async Figma comments?
- Who has final design approval authority?
- Which components matched design well? Which need refinement?
- Technical constraints that affect design decisions?

#### B. Lauren's Current Work & Handoff (10 min)
**Lauren to share:**
- Current state of design work (Figma files, components, assets)
- What has been completed vs. in-progress
- Design system documentation (colors, spacing, typography, components)
- What Lauren needs from the team
- Timeline and availability

#### C. Lauren's Future Involvement (5 min)
**Key Questions:**
- **Complete handoff** with documentation → students implement?
- **Ongoing consultant/resource** → available for questions/reviews?
- **Continued collaboration** → involved in new feature designs?
- **Timeline:** How long is Lauren available? What's the transition plan?

**Discussion:**
- Who owns design decisions for new features after handoff?
- How do we maintain design consistency?
- Design system governance going forward?

### 3. GitHub Project Status & Recent Activity (25 min)

**📖 Comprehensive Review Available:**
For detailed breakdown of all issues, milestones, and project direction, see:
**`PROJECT_STATUS_GUIDE.md`** - Complete status report with:
- All 3 milestones explained
- 30+ issues categorized by type, priority, and readiness
- Priority matrix (urgent/important quadrants)
- Student work opportunities
- Key questions for discussion

**Quick Summary for Meeting:**

#### **Pull Requests - Current Status:**

**Merged ✅:**
- PR #52: Documentation updates (README, CONTRIBUTING) - merged today!

**Ready for Review:**
- PR #53: Enhanced .gitignore (editor artifacts, OS files)
- PR #39: Fuzzy search implementation ⚠️ (has security concern to address)

**Blocked - Need Updates:**
- PR #38: TypeScript migration ❌ (contains CNAME + .history files to remove)
- PR #37: Error handling ❌ (contains CNAME to remove)
- PR #36: Subdomain deployment ❌ (waiting on DNS/CNAME access)

**Key Issue:** Multiple PRs include `public/CNAME` for subdomain deployment, but we don't control the DNS yet. Need to coordinate with Laura on domain management.

#### **Recent Issues Created (last 48 hours):**

**Migration Epic (HIGH PRIORITY):**
- #47: EPIC - Migrate from Google Sheets to Keystatic + Content Collections
- #40-46, #48: Related migration subtasks (7 issues)
  - Set up Keystatic CMS
  - Astro content collections
  - Migration scripts
  - Slug-based references
  - Validation checks

**Data Quality (CRITICAL PRIORITY):**
- #23: Add subTopic to all 'Keep candidate' lessons
- #24: Write missing descriptions for lessons
- #25: Assign learnerCategory to orphaned lessons
- #51: Draft Learning Objectives for all lessons (NEW)
- #49-50: Standardize learningResourceType and audience

**Features & Enhancements:**
- #31: Fuzzy search (has PR #39)
- #30: Visual pathway roadmaps (gaurirathi interested)
- #28: Individual lesson detail pages
- #32: WCAG 2.1 AA accessibility audit

#### **Community Contributions:**
- gaurirathi: Fuzzy search PR (#39) + interested in visual roadmaps (#30)
- brainstrom286: 3 PRs submitted (TypeScript, error handling, subdomain)
- kirandharmar867-maker: Interested in TypeScript work (but already covered by PR #38)

### 4. Project Orientation & Architecture Overview (15 min)

**Current Tech Stack:**
- **Frontend:** Astro + React
- **Data Source:** Google Sheets CSV (published)
- **Deployment:** GitHub Pages (production)
- **PR Previews:** Vercel (configured, pending org setup)
- **Validation:** Automated checks on PRs (data, TypeScript, build, links)

**Site Structure:**
- Homepage with stacked pathway cards
- 6 pathway pages (Getting Started, Contributing, Maintaining, Communities, Licensing, Career Development)
- Filterable lessons library with search
- "For Educators" and "Develop a Lesson" pages

**Data Pipeline:**
```
Google Sheets → CSV Export → Astro build → Static HTML → GitHub Pages
```

**Enhancement Scripts (completed):**
- Slug generation (100% coverage)
- Language standardization (IETF codes)
- Time estimation (ISO 8601 duration)
- Metadata scraping (authors, licenses, dates)

**NEW: Google Sheets Update Tools** (created today)
- Safe merge script to update canonical spreadsheet
- Google Apps Script for one-click updates
- Preserves all formatting, colors, conditional formatting

**Key Documentation:**
- README.md - Project overview, setup, usage
- CONTRIBUTING.md - How to contribute
- STUDENT_README.md - Developer guide
- scripts/UPDATING_GOOGLE_SHEETS.md - How to safely update data

### 5. Milestones & Priorities (10 min)

**Phase 1 (Current - In Progress):**
- ✅ Initial website deployment
- ✅ Lesson inventory and metadata enhancement
- ✅ Basic search and filtering
- ✅ Documentation and contributing guides
- 🔄 Design refinement (Lauren's work)
- 🔄 PR preview workflow setup
- ⏳ Accessibility improvements
- ⏳ Data quality completion (critical issues)

**Phase 2 (Planning - Jan-Feb 2026):**
- Migrate to Keystatic CMS + Astro Content Collections
- Individual lesson detail pages
- Visual pathway roadmaps
- Enhanced search with fuzzy matching
- Lesson feedback system
- Additional filters (domain-specific, lifecycle status)

**Phase 3 (Future):**
- Collaborative lesson development training
- Gap lesson creation
- Community engagement features
- Analytics and usage tracking

**Immediate Priorities:**
1. **Critical Data Quality** - Issues #23, #24, #25 (student-ready)
2. **Design Handoff** - Lauren's design → implementation plan
3. **DNS/CNAME** - Coordinate with Laura for subdomain deployment
4. **PR Reviews** - Unblock PRs #37, #38 (remove CNAME, .history files)
5. **Accessibility Audit** - Issue #32

### 6. Handoff Planning (10 min)

**Key Handoffs Needed:**
- Lauren → Design files, specifications, assets
- Lauren → Design system documentation (colors, spacing, components)
- Tim/Team → Continue PR reviews and issue triage
- Team → Student work coordination (who's doing what?)

**Questions to Address:**
- Who will implement Lauren's designs?
- Timeline for design implementation?
- Student availability and skills assessment
- Who owns PR review/merge authority?
- How to onboard new contributors?

### 7. Action Items & Next Steps (5 min)

**Immediate Actions:**
- [ ] Lauren: Share design files and requirements
- [ ] Tim: Contact Laura about DNS/CNAME for subdomain
- [ ] Team: Review and approve PR #53 (.gitignore)
- [ ] Team: Decide on PR #39 fuzzy search (with security fix)
- [ ] Team: Comment on PRs #37, #38 asking for CNAME removal
- [ ] Team: Assign critical data quality issues (#23-25)
- [ ] Team: Plan Keystatic migration approach (Epic #47)

**Short-term (This Week):**
- [ ] Set up Vercel under UC-OSPO-Network organization
- [ ] Create design implementation plan
- [ ] Prioritize student work assignments
- [ ] Review gaurirathi's interest in visual roadmaps (#30)

**Ongoing:**
- [ ] Continue PR reviews
- [ ] Monitor GitHub Discussions for community questions
- [ ] Weekly check-ins on student progress

---

## Resources

- **GitHub Repository:** https://github.com/UC-OSPO-Network/education
- **Live Site:** https://UC-OSPO-Network.github.io/education
- **GitHub Project:** https://github.com/orgs/UC-OSPO-Network/projects/1/views/7
- **Google Sheet (Inventory):** https://docs.google.com/spreadsheets/d/1JqM5OYX4f-T0jR-GJ5UeI7PnGJP6o4jtPRNtDJUGPmI/edit?gid=565807714
- **Learner Profiles:** [Link from shared drive]
- **Figma Designs:** [Lauren to share]

---

## Notes Section

[Take notes during meeting]

---

## Next Meeting

Date: [To be determined]
Time: [To be determined]
Focus: [To be determined based on today's outcomes]
