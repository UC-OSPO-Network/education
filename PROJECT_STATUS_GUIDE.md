# UC OSPO Education Project - Status Guide
## GitHub Issues, Milestones & Project Direction

**Last Updated:** 2026-01-20
**For Meeting:** Handoff with Lauren, Reid, Shawn, Gia, and Ed Group

---

## 📖 Table of Contents

1. [Project Overview & Vision](#project-overview--vision)
2. [Current State Summary](#current-state-summary)
3. [Milestones & Roadmap](#milestones--roadmap)
4. [Issue Breakdown by Category](#issue-breakdown-by-category)
5. [Priority Matrix](#priority-matrix)
6. [Key Documentation](#key-documentation)
7. [Student Work Opportunities](#student-work-opportunities)
8. [Questions for Discussion](#questions-for-discussion)

---

## Project Overview & Vision

### What We're Building
A comprehensive open source education platform that:
- **Curates** 56+ lessons from Carpentries, CodeRefinery, and other trusted sources
- **Organizes** learning into 6 pathway journeys (Getting Started → Career Development)
- **Guides** learners through role-based progression (Contributor → Maintainer → Community Manager)
- **Tracks** metadata using Bioschemas Training schema for discoverability
- **Enables** UC system-wide collaboration on OSS education

### Who It's For
**Primary Audiences:**
- Students & Early Career Researchers (learning OSS basics)
- Grad Students & Postdocs (contributing to OSS projects)
- Research Software Engineers (maintaining OSS tools)
- Faculty & PIs (understanding OSS governance)
- Library & IT Staff (supporting OSS initiatives)

### Success Metrics (Sloan Grant)
- **Year 1:** Complete lesson inventory, launch MVP website, metadata enhancement
- **Year 2:** Migrate to CMS, collaborative lesson development, fill curriculum gaps
- **Year 3:** Community growth, lesson authors cohort, usage analytics

---

## Current State Summary

### ✅ What's Done (Phase 1 Complete)

**Website Launch:**
- Built Astro + React static site
- 6 pathway pages + homepage with stacked cards
- Filterable lesson library (search, role, skill level)
- Deployed to GitHub Pages: https://UC-OSPO-Network.github.io/education
- UC official branding (colors, typography)
- Responsive design + accessibility basics

**Data Infrastructure:**
- 56 lessons inventoried from multiple sources
- Google Sheets → CSV → Astro build pipeline
- Bioschemas Training schema compliance
- 4 automation scripts (slugs, languages, time estimates, metadata scraping)
- Metadata coverage: slugs 100%, time 98%, authors 88%, dates 82%

**Developer Experience:**
- Comprehensive documentation (README, CONTRIBUTING, STUDENT_README)
- Automated PR checks (data validation, TypeScript, build, links)
- PR preview workflow configured (Vercel pending org setup)
- GitHub Actions CI/CD pipeline
- Safe Google Sheets update tools

**Community:**
- 3 external contributors submitted PRs
- Issue templates for lesson proposals and feedback
- Lesson development program launched
- Clear contribution guidelines

### 🔄 What's In Progress

**Active PRs:**
- #39: Fuzzy search (gaurirathi) - ⚠️ needs security fix
- #37: Error handling (brainstrom286) - ⚠️ blocked by CNAME
- #38: TypeScript migration (brainstrom286) - ⚠️ blocked by CNAME + .history files
- #36: Subdomain deployment - ⚠️ waiting on DNS access

**Documentation Updates:**
- PR #52: MERGED today (README, CONTRIBUTING)
- PR #53: Ready for review (.gitignore enhancements)

**Vibe Coding:**
- Lauren's Figma design → Astro implementation exploration
- Feedback loop needed on design fidelity

### ⏳ What's Next (Phase 2)

**Immediate (This Month):**
- Complete critical data quality (issues #23-25)
- Finish Lauren's design implementation
- Set up Vercel under org account
- Review/merge community PRs
- Coordinate DNS for subdomain

**Q1 2026 (Jan-Mar):**
- Migrate to Keystatic CMS (Epic #47)
- Individual lesson detail pages (#28)
- Visual pathway roadmaps (#30)
- Enhanced search (#31)
- Accessibility audit (#32)

---

## Milestones & Roadmap

### Milestone 1: Content Infrastructure Migration
**Status:** Planning
**Target:** Q1 2026
**Why:** Move from Google Sheets to Git-based CMS for better workflows

**Issues (8 total):**
- #47 - **EPIC:** Migrate from Google Sheets to Keystatic + Content Collections
- #40 - Set up Keystatic CMS for content management (HIGH)
- #41 - Set up Astro content collections with lesson singletons (HIGH)
- #42 - Create data migration script (CSV → JSON singletons) (HIGH)
- #43 - Update application code to use content collections (HIGH)
- #44 - Configure Keystatic to edit lesson singletons (HIGH)
- #46 - Create migration audit/comparison tool (MEDIUM)
- #48 - Convert dependencies from numeric IDs to slug-based references (HIGH)

**Why This Matters:**
- **For Maintainers:** Edit lessons directly in GitHub, PR workflow
- **For Quality:** Version control, review process, validation
- **For Scale:** Easier to onboard lesson authors
- **For Features:** Enables rich lesson detail pages, relationships

**Dependencies:**
- Complete data quality issues first (ensure clean migration)
- Test with 5-10 lessons before full migration

**Student-Ready:** All except #47 (Epic is planning/coordination)

---

### Milestone 2: Data Quality & Completeness
**Status:** In Progress (3 critical, 3 medium)
**Target:** End of January 2026
**Why:** Clean, complete metadata is foundation for all features

**Critical Issues (Must Complete ASAP):**
- #23 - Add subTopic to all 'Keep candidate' lessons (13 missing)
- #24 - Write missing descriptions for lessons (29 missing, 41% incomplete)
- #25 - Assign learnerCategory to orphaned lessons (8 lessons, 14% orphaned)

**Medium Priority:**
- #26 - Find 5-7 'Getting Started' lessons for beginners (HIGH)
- #49 - Standardize learningResourceType using controlled vocabulary
- #50 - Standardize audience to canonical personas
- #51 - Draft Learning Objectives for all lessons (13 missing, 4-6 hrs)

**Additional:**
- #45 - Add lesson validation checks to PR workflow (automation)

**Why This Matters:**
- **For Learners:** Can't discover lessons without good descriptions/keywords
- **For Pathways:** Can't organize without subTopics and learnerCategory
- **For Search:** Poor metadata = poor search results
- **For Migration:** Don't want to migrate incomplete data

**How to Help:**
Students can contribute! Each issue has clear acceptance criteria and examples.

**Time Estimates:**
- #23 (subTopics): 2-3 hours
- #24 (descriptions): 6-8 hours (can be split)
- #25 (categorization): 1-2 hours
- #51 (learning objectives): 4-6 hours (AI can help draft)

---

### Milestone 3: User Experience Features
**Status:** Design/Planning
**Target:** Q1-Q2 2026
**Why:** Enhanced discovery and engagement features

**Issues (4 total):**
- #28 - Create individual lesson detail pages (HIGH, student-ready)
- #29 - Implement GitHub Issues-based feedback system (MEDIUM, student-ready)
- #30 - Design and implement visual pathway roadmaps (MEDIUM, gaurirathi interested)
- #31 - Improve search with fuzzy matching (MEDIUM, PR #39 submitted)

**Why This Matters:**
- **Lesson Pages:** Show full metadata, prerequisites, feedback
- **Feedback System:** Let users report issues, suggest improvements
- **Visual Roadmaps:** Help learners see their journey
- **Better Search:** Typo tolerance, relevance ranking

**Dependencies:**
- #28 depends on clean data (Milestone 2)
- #30 may benefit from Keystatic migration (Milestone 1)
- #31 has a PR but needs security review

**Student-Ready:** All 4 issues

---

### No Milestone (Backlog/Older Issues)
**Status:** Needs Triage
**Count:** 11 issues

**Key Items to Review:**
- #15 - Work on resources/lesson(s) around **licensing** (gap lesson)
- #16 - Resources UI (may be superseded by current design)
- #17 - Lesson pathways (partially complete, needs refinement)
- #18 - Gap identification (ongoing)
- #11 - Look into paying authors for lesson development (Year 2 planning)
- #27 - Add error handling and loading states (PR #37 submitted)
- #32 - WCAG 2.1 AA accessibility audit (HIGH priority)
- #33 - Add domain-specific and lifecycle status filters (LOW)
- #34 - TypeScript types and improve type safety (PR #38 submitted)
- #35 - Integrate education site with main ucospo.net domain (CNAME issue)

**Action Needed:**
- Assign to milestones or close if superseded
- Update priorities based on current goals
- Link related PRs

---

## Issue Breakdown by Category

### By Type

**Features (11):**
- Visual roadmaps, lesson pages, feedback system, filters, Keystatic CMS setup

**Data Quality (6):**
- Descriptions, subTopics, learnerCategory, learning objectives, standardization

**Refactor/Code Quality (4):**
- TypeScript migration, error handling, content collections migration, validation checks

**Infrastructure (3):**
- Keystatic setup, domain integration, PR workflow enhancements

**Content (2):**
- Getting started lessons, licensing lesson development

**Testing (1):**
- Accessibility audit

### By Priority

**Critical (3):** #23, #24, #25 (data quality - blocking other work)
**High (10):** Migration tasks (#40-44, #48), lesson pages (#28), accessibility (#32), Getting Started (#26)
**Medium (6):** Roadmaps, feedback, search, standardization, filters
**Low (2):** Domain filters, enhanced TypeScript

### By Label

**student-ready (17):** Clear scope, good first issues, can work independently
**phase-2-enhancement (20):** Sloan Year 2 work
**education (20+):** All education group issues
**a11y (1):** Accessibility focus
**area: filters, lessons, pathways:** Feature categories

---

## Priority Matrix

### Urgent & Important (Do First)
1. **Data Quality** (#23, #24, #25) - Blocks other work
2. **Lauren Design Handoff** - Needed for implementation
3. **DNS/CNAME Resolution** - Unblocks 3 PRs
4. **PR Reviews** - Community waiting (#39, #37, #38)

### Important but Not Urgent (Schedule)
1. **Keystatic Migration** (Epic #47) - Plan thoroughly
2. **Lesson Detail Pages** (#28) - After data quality
3. **Accessibility Audit** (#32) - Compliance requirement
4. **Visual Roadmaps** (#30) - UX enhancement

### Urgent but Not Important (Delegate)
1. **Vercel Org Setup** - Quick admin task
2. **Close/Update Old Issues** - Housekeeping
3. **PR #53 Review** - Simple .gitignore update

### Neither Urgent nor Important (Defer)
1. **Advanced Filters** (#33) - Nice to have
2. **Paid Authors Discussion** (#11) - Year 2 planning
3. **Domain Integration** (#35) - Depends on CNAME

---

## Key Documentation

### For Users/Contributors
- **README.md** - Project overview, features, setup, usage
- **CONTRIBUTING.md** - How to contribute, PR process, commit guidelines
- **CODE_OF_CONDUCT.md** - Community standards

### For Developers
- **STUDENT_README.md** - Developer guide, tech stack, code structure
- **.github/REFERENCE.md** - Data dictionary, Bioschemas schema (38 columns)
- **.github/AUTOMATION_GUIDE.md** - How to use enhancement scripts
- **.github/LESSON_DEVELOPMENT_WORKFLOW.md** - Lesson submission process
- **scripts/UPDATING_GOOGLE_SHEETS.md** - Safe data update procedures

### For Design/UX
- **.github/SKILL_BADGES_IMPLEMENTATION.md** - Skill badge system
- **.github/UNIFIED_NAV_GUIDE.md** - Navigation patterns
- **Lauren's Figma files** - Visual designs (to be shared)

### For Project Management
- **.github/LABEL_RECOMMENDATIONS.md** - Issue labeling system
- **.github/LESSON_PROGRAM_QUICK_START.md** - Lesson program overview

---

## Student Work Opportunities

### Immediate (Can Start This Week)

**Data Quality (No coding required):**
- Issue #23: Add subTopics (2-3 hours, spreadsheet work)
- Issue #24: Write descriptions (can split into chunks)
- Issue #25: Categorize orphaned lessons (1-2 hours)
- Issue #51: Draft learning objectives (AI can help)

**Code Quality (Beginner-friendly):**
- PR #39 Review: Test fuzzy search, provide feedback
- Issue #33: Add simple filters (domain, lifecycle)
- Fix .gitignore issues in PR #38

### Short-term (Next 2 Weeks)

**Feature Development (Intermediate):**
- Issue #28: Lesson detail pages (Astro + React)
- Issue #29: Feedback form (GitHub API integration)
- Issue #31: Better search (if PR #39 doesn't merge)

**Infrastructure (Advanced):**
- Issue #41: Set up Astro content collections
- Issue #42: Write migration script
- Issue #44: Configure Keystatic

### Medium-term (This Quarter)

**UX/Design (All levels):**
- Issue #30: Visual pathway roadmaps (design + code)
- Issue #32: Accessibility audit (testing + fixes)
- Lauren's design implementation (varies by component)

**Content/Strategy (Non-coding):**
- Issue #26: Curate Getting Started lessons
- Issue #15: Research licensing lesson needs
- Issue #18: Continue gap analysis

---

## Questions for Discussion

### Lauren's Design Work

1. **Fidelity Feedback Loop:**
   - How do we want to review design implementation?
   - Weekly design reviews? Async feedback in Figma comments?
   - Who has final design approval?

2. **Lauren's Involvement Going Forward:**
   - Complete handoff with documentation?
   - Available as consultant/resource?
   - Ongoing collaboration on new features?
   - Timeline for her availability?

3. **Design System:**
   - Do we have component library/design tokens documented?
   - How do we maintain design consistency after handoff?
   - Who owns design decisions for new features?

4. **Vibe Coding Session:**
   - What did we learn about design → code translation?
   - Which components match design well?
   - Which need refinement?
   - Any technical constraints that affect design?

### Project Priorities

5. **Milestone Sequencing:**
   - Should we finish Data Quality before starting Migration?
   - Can we do UX features in parallel with Migration?
   - Which student(s) should focus on what?

6. **Community PRs:**
   - How quickly do we want to review/merge external contributions?
   - Who has merge authority?
   - What's our quality bar for accepting PRs?

7. **DNS/CNAME Issue:**
   - Who can we talk to about getting subdomain access?
   - Is this a blocker or can we defer?
   - What's the process for UC DNS changes?

### Team Coordination

8. **Student Assignments:**
   - Who's working on what?
   - How do we avoid duplicating effort?
   - What's the communication cadence?

9. **Issue Triage:**
   - Should we close old issues (#16, #17)?
   - Need to update priorities/milestones?
   - Who maintains the GitHub project board?

10. **Documentation:**
    - Is our documentation clear enough for new contributors?
    - What's missing that students need?
    - Who reviews/updates docs as we evolve?

---

## Action Plan Template

### Immediate (This Week)
- [ ] Lauren: Share design files, document handoff needs
- [ ] Team: Review PR #53 (.gitignore)
- [ ] Tim: Contact Laura re: DNS/CNAME
- [ ] Team: Assign critical data quality issues
- [ ] Team: Set up Vercel under org

### Short-term (Next 2 Weeks)
- [ ] Complete data quality issues #23-25
- [ ] Implement Lauren's design feedback
- [ ] Review/merge or request changes on community PRs
- [ ] Plan Keystatic migration approach
- [ ] Assign student work for Q1

### Ongoing
- [ ] Weekly student check-ins
- [ ] PR reviews within 3-5 business days
- [ ] Monthly milestone progress reviews
- [ ] Quarterly roadmap updates

---

## Resources & Links

**GitHub:**
- Repository: https://github.com/UC-OSPO-Network/education
- Project Board: https://github.com/orgs/UC-OSPO-Network/projects/1/views/7
- Issues: https://github.com/UC-OSPO-Network/education/issues
- PRs: https://github.com/UC-OSPO-Network/education/pulls

**Live Site:**
- Production: https://UC-OSPO-Network.github.io/education
- Future: education.ucospo.net (pending DNS)

**Data:**
- Google Sheet: https://docs.google.com/spreadsheets/d/1JqM5OYX4f-T0jR-GJ5UeI7PnGJP6o4jtPRNtDJUGPmI/edit
- CSV Export: (auto-generated, don't edit directly)

**Design:**
- Figma: [Lauren to share link]
- UC Branding: https://brand.universityofcalifornia.edu

**Documentation:**
- Meeting Notes: [Link to meeting notes doc]
- Learner Profiles: [Link to profiles doc]
- Process Doc: https://docs.google.com/document/d/1D4tCqMkB6-QTdvCSR2N-6VZSSUUOQZ87Kl4UEsuHeRs

---

**Questions about this guide?**
Comment in the meeting agenda or ask in Slack #education channel.
