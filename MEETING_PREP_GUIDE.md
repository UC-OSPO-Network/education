UC OSPO Education Project - Comprehensive Meeting Preparation Guide
GitHub Issues, Milestones, and Project Status

Last Updated: 2026-01-20
For: Handoff meeting with Lauren, Reid, Shawn, Gia, and education group members

Table of Contents

1. Project Overview and Vision
2. What We Have Accomplished
3. Current Work In Progress
4. Three Main Milestones Explained
5. All GitHub Issues by Category
6. Priority Framework
7. Pull Request Status
8. Community Contributions
9. Student Work Opportunities
10. Key Documentation Index
11. Discussion Questions
12. Technical Architecture Reference

---

1. Project Overview and Vision

What we are building

A comprehensive open source education platform that serves the entire UC system:

Curates and organizes 56+ lessons from trusted sources
    Carpentries (Software, Data, Library)
    CodeRefinery
    Intersect
    Software Sustainability Institute
    Open Source Guides

Organizes learning into six pathway journeys
    Getting Started with Open Source
    Contributing to a Project
    Maintaining and Sustaining Software
    Building Inclusive Communities
    Understanding Licensing and Compliance
    Strategic Practices and Career Development

Guides learners through role-based progression
    User/Consumer (just learning about OSS)
    Contributor (making first contributions)
    Maintainer (sustaining projects)
    Community Manager (building communities)
    Governance (leading projects, policy decisions)

Tracks metadata using Bioschemas Training schema
    Enables discoverability through search engines
    Provides structured data for lesson attributes
    Supports rich lesson detail pages
    Facilitates integration with other platforms

Enables UC system-wide collaboration
    Shared curriculum across all UC campuses
    Collaborative lesson development
    Cross-campus workshops and events
    Unified open source education strategy

Primary audiences

Students and early career researchers
    Learning OSS basics (what is open source, how to contribute)
    Finding projects to contribute to
    Understanding licensing and compliance
    Building portfolios

Graduate students and postdocs
    Contributing to OSS projects in their field
    Starting their own OSS projects
    Understanding sustainability and maintenance
    Career development through OSS

Research software engineers
    Maintaining OSS tools and libraries
    Best practices for software development
    Community building and governance
    Security and institutional policy

Faculty and principal investigators
    Understanding OSS for grant requirements
    Supporting student OSS work
    Project governance decisions
    Reproducibility and FAIR principles

Library, IT, and support staff
    Supporting OSS initiatives on campus
    Understanding licensing questions
    Helping researchers with OSS tools
    Training and workshop facilitation

Success metrics from Sloan grant

Year 1 (2025-2026)
    Complete comprehensive lesson inventory
    Launch MVP website with pathway navigation
    Enhance metadata coverage to 90+ percent
    Establish lesson development program
    Deploy automation scripts
    Build contributor community

Year 2 (2026-2027)
    Migrate to Git-based CMS (Keystatic)
    Conduct collaborative lesson development training
    Fill identified curriculum gaps
    Launch individual lesson pages
    Implement feedback system
    Grow contributor base

Year 3 (2027-2028)
    Sustain lesson author cohort
    Track usage analytics
    Measure learning outcomes
    Expand to additional lesson sources
    Integrate with broader UC education initiatives

---

2. What We Have Accomplished

Phase 1 is complete as of January 2026

Website launch and deployment
    Built Astro static site with React components
    Deployed to GitHub Pages at https://UC-OSPO-Network.github.io/education
    Future home: education.ucospo.net (pending DNS configuration)
    Responsive design works on desktop, tablet, mobile
    Meets basic WCAG accessibility standards

Six pathway pages
    Getting Started with Open Source
    Contributing to a Project
    Maintaining and Sustaining Software
    Building Inclusive Communities
    Understanding Licensing and Compliance
    Strategic Practices and Career Development

Homepage with interactive stacked pathway cards
    Matches Lauren's Figma design
    Click to explore each pathway
    Visual hierarchy showing learning progression

Filterable lesson library
    Search across lesson names, descriptions, keywords
    Filter by OSS role (Contributor, Maintainer, etc)
    Filter by skill level (Beginner, Intermediate, Advanced)
    Filter by pathway (Getting Started, Contributing, etc)
    Real-time filtering with React

Additional pages
    For Educators: how to use these materials in teaching
    Develop a Lesson: program for lesson authors

UC official branding
    Colors: UC Blue, UC Gold, dark theme
    Typography: Helvetica Neue with proper hierarchy
    Consistent with main ucospo.net site

Data infrastructure established

56 lessons inventoried
    From Carpentries, CodeRefinery, Intersect, SSI
    Metadata extracted and standardized
    Marked for inclusion (Keep candidate, Keep)
    Assigned to pathways and roles

Google Sheets to CSV to Astro pipeline
    Google Sheet published as CSV
    Astro fetches CSV at build time
    No database needed, fully static
    Easy for non-technical folks to update

Bioschemas Training schema compliance
    38 metadata fields tracked
    Enables rich structured data
    Search engine friendly
    Supports future integrations

Metadata enhancement via automation
    Slug generation: 0 to 100 percent coverage
    Language codes: standardized to IETF (en, es, fr, etc)
    Time estimates: 0 to 98 percent coverage (ISO 8601 duration)
    Author information: 57 to 88 percent coverage
    License information: extracted from source pages
    Dates: creation, modification, publication tracked
    Saved approximately 35+ hours of manual work

Developer experience improvements

Comprehensive documentation
    README: project overview, features, setup
    CONTRIBUTING: how to contribute, PR process
    STUDENT_README: developer guide with code structure
    Multiple guides in .github folder for specific topics
    Inline code comments for complex logic

Automated PR validation checks
    Data validation: Google Sheets CSV accessibility
    TypeScript check: no type errors
    Build process: ensure site builds successfully
    Critical pages: verify required pages exist
    Link checking: no broken internal links
    Runs automatically on every PR without approval needed

PR preview workflow configured
    Vercel integration for automatic preview deployments
    Each PR gets unique URL for review
    Preserves GitHub Pages as production deployment
    Prevents deploying main branch to Vercel
    Awaiting UC-OSPO-Network organization setup

GitHub Actions CI/CD pipeline
    Automatic deployment to GitHub Pages on push to main
    Build validation before merge
    Status checks required for PR approval

Safe Google Sheets update tools
    Merge script combines all enhanced CSV files
    Google Apps Script for one-click column updates
    Preserves all formatting, colors, conditional formatting
    VLOOKUP-based update process documented
    Prevents data loss during updates

Community engagement

Issue templates created
    Lesson proposal template for new submissions
    Bug report template
    Feature request template
    Clear contribution pathways

Lesson development program launched
    Public submission page on website
    GitHub issue-based workflow
    Review and approval process documented
    Timeline: Q1 2026 proposals, end 2026 publication

External contributors engaged
    3 contributors submitted PRs already
    gaurirathi: fuzzy search implementation
    brainstrom286: TypeScript migration, error handling, subdomain work
    kirandharmar867-maker: interested in TypeScript work

Clear contribution guidelines
    Code of conduct established
    Contributing guide with PR lifecycle explained
    Student-ready issues labeled and documented

---

3. Current Work In Progress

Active pull requests (4 total)

PR 52: Documentation updates
    Status: MERGED today (January 20)
    Updated README with project details
    Updated CONTRIBUTING with UC OSPO specifics
    All TODO sections completed

PR 53: Enhanced gitignore
    Status: Ready for review
    Adds .history folder (Local History extension)
    Adds Vercel and build output directories
    Adds Vim, Emacs, VS Code, OS artifacts
    Prevents future accidental commits of editor files

PR 39: Fuzzy search with highlighting
    Status: Needs security review
    By: gaurirathi
    Implements Fuse.js for typo-tolerant search
    Adds highlighting of matched text
    Security concern: uses dangerouslySetInnerHTML
    Need safer highlighting approach before merge
    Otherwise clean implementation

PR 37: Error handling and loading states
    Status: Blocked by CNAME issue
    By: brainstrom286
    Adds ErrorBoundary component
    Implements timeout handling for CSV fetch
    Loading spinner and retry button
    Problem: includes public/CNAME file for subdomain
    Need to remove CNAME before merge

PR 38: TypeScript migration
    Status: Blocked by CNAME and .history files
    By: brainstrom286
    Enables strict TypeScript checking
    Migrates key files to .ts and .tsx
    All type checks passing
    Problems: includes public/CNAME file and 13 .history files
    Need to remove both before merge

PR 36: Subdomain deployment preparation
    Status: Blocked by DNS access
    By: brainstrom286 (via fork)
    Prepares site for education.ucospo.net subdomain
    Includes CSV parsing improvements
    Includes metadata enhancements
    Problem: requires DNS/CNAME configuration we don't control
    Need coordination with Laura Langdon

Design implementation work

Vibe coding session completed
    Explored Lauren's Figma design in Astro
    Identified technical constraints
    Experimented with component structure
    Need feedback loop on fidelity

Lauren's design work
    Current state: in progress
    Figma files: to be shared at meeting
    Design system: needs documentation
    Handoff planning: to be discussed

Community contributions waiting

gaurirathi wants to work on visual pathway roadmaps (issue 30)
    Has submitted fuzzy search PR
    Expressed interest in roadmap visualization
    Proposing MVP approach (one pathway first)
    Awaiting approval to start

kirandharmar867-maker interested in TypeScript work (issue 34)
    Expressed interest January 3
    Unaware that PR 38 already addresses this
    Need to redirect to other student-ready issues

brainstrom286 waiting on PR reviews
    3 PRs submitted, all need feedback
    Active contributor, responsive to feedback
    Need to unblock with CNAME guidance

---

4. Three Main Milestones Explained

Milestone 1: Content Infrastructure Migration

Target: Q1 2026 (January - March)
Status: Planning phase
Issues: 8 total, all high priority
Student-ready: 7 of 8 (Epic is coordination)

Why we are doing this migration

Current limitations with Google Sheets
    No version control or change tracking
    No review process for edits
    Hard to coordinate multi-person edits
    Can't see who changed what and when
    Risk of accidental data loss
    Not git-friendly for developers

Benefits of Keystatic CMS
    Git-based: all changes tracked in version control
    Pull request workflow: review before publishing
    Visual editor: non-technical folks can still edit
    Type safety: validates data structure
    Better for collaboration: clear ownership and review
    Enables richer lesson data: relationships, prerequisites

Technical approach
    Lessons become individual JSON files in Git
    Astro Content Collections API for type-safe queries
    Keystatic provides admin UI at /admin route
    Editors make changes, create PRs automatically
    Review and merge like code changes
    No more Google Sheets dependency

Issues breakdown

Issue 47: EPIC - Migrate from Google Sheets to Keystatic + Content Collections
    Type: Epic (planning and coordination)
    Purpose: Track overall migration progress
    Not student-ready: requires architectural decisions
    Owner: Tim and experienced developers

Issue 40: Set up Keystatic CMS for content management
    Priority: High
    Student-ready: Yes
    Tasks: Install Keystatic, configure admin route, set up collections
    Deliverable: /admin interface working locally
    Estimated time: 4-6 hours

Issue 41: Set up Astro content collections with lesson singletons
    Priority: High
    Student-ready: Yes
    Tasks: Define content collections, create lesson schema, configure Astro
    Deliverable: Type-safe lesson queries working
    Estimated time: 3-5 hours

Issue 42: Create data migration script (CSV to JSON singletons)
    Priority: High
    Student-ready: Yes
    Tasks: Script to convert CSV rows to JSON files, preserve all metadata
    Deliverable: All 56 lessons as individual JSON files
    Estimated time: 4-6 hours

Issue 43: Update application code to use content collections
    Priority: High
    Student-ready: Yes
    Tasks: Replace getSheetData calls with content collection queries
    Deliverable: All pages working with new data source
    Estimated time: 6-8 hours

Issue 44: Configure Keystatic to edit lesson singletons
    Priority: High
    Student-ready: Yes
    Tasks: Define Keystatic schema matching lesson fields
    Deliverable: Editors can add/edit lessons via /admin
    Estimated time: 4-6 hours

Issue 46: Create migration audit/comparison tool
    Priority: Medium
    Student-ready: Yes
    Tasks: Script to compare old CSV with new JSON files
    Deliverable: Validation that no data lost in migration
    Estimated time: 3-4 hours

Issue 48: Convert dependencies from numeric IDs to slug-based references
    Priority: High
    Student-ready: Yes
    Tasks: Change "Depends On: 2, 5, 7" to "Depends On: git-basics, pull-requests"
    Deliverable: Human-readable lesson relationships
    Estimated time: 2-3 hours

Sequencing considerations
    Should complete after data quality milestone
    Don't want to migrate incomplete or messy data
    Test with 5-10 lessons before full migration
    Can be done in parallel with some UX features

Milestone 2: Data Quality and Completeness

Target: End of January 2026
Status: In progress, blocking other work
Issues: 7 total (3 critical, 4 medium)
Student-ready: All 7 issues

Why this is critical priority

Many features depend on complete metadata
    Can't build good search without descriptions and keywords
    Can't organize pathways without subTopics and categories
    Can't show learning objectives without them being written
    Poor metadata means poor user experience

Blocking migration to CMS
    Don't want to migrate incomplete data
    Easier to fix in Google Sheets than in Git
    Clean data makes migration validation easier

Community perception
    Incomplete lessons look unprofessional
    Users may not trust recommendations
    Need quality before promoting widely

Critical issues (must complete ASAP)

Issue 23: Add subTopic to all 'Keep candidate' lessons
    Current state: 13 lessons missing subTopics (23 percent)
    Why it matters: subTopics group lessons within pathways
    Example: "Contributing" pathway has subTopics like "Getting Started", "Pull Requests", "Code Review"
    Without subTopics: lessons are unorganized, hard to navigate
    Task: Review each lesson, assign appropriate subTopic from controlled vocabulary
    Time estimate: 2-3 hours
    Student-ready: Yes, clear list of lessons and valid subTopics provided

Issue 24: Write missing descriptions for lessons
    Current state: 29 lessons missing descriptions (52 percent)
    Why it matters: descriptions help learners decide if lesson is relevant
    Search relies on descriptions (keywords alone not enough)
    Standards: 100-300 words, focus on learning outcomes
    Task: Visit lesson URL, read content, write clear description
    Time estimate: 6-8 hours (can split among multiple people)
    Student-ready: Yes, examples and templates provided
    AI assistance: Can use AI to draft, then human review

Issue 25: Assign learnerCategory to orphaned lessons
    Current state: 8 lessons not assigned to any pathway (14 percent)
    Why it matters: orphaned lessons are invisible in pathway pages
    Users navigate by pathway, won't find these lessons
    Task: Determine which pathway each lesson belongs to
    Pathways: Getting Started, Contributing, Maintaining, Community, Licensing, Career
    Time estimate: 1-2 hours
    Student-ready: Yes, clear criteria for each pathway

Medium priority issues

Issue 26: Find 5-7 'Getting Started' lessons for beginners
    Priority: High
    Current state: Getting Started pathway is thin
    Why it matters: Most important pathway for new learners
    Need: Lessons about "what is open source", "why contribute", "finding projects"
    Task: Research existing materials, propose additions to inventory
    Time estimate: 3-4 hours
    Student-ready: Yes

Issue 49: Standardize learningResourceType using controlled vocabulary
    Priority: Medium
    Current state: Inconsistent values (guide, tutorial, lesson, course, etc)
    Why it matters: Enables filtering by resource type
    Bioschemas compliance requires controlled vocabulary
    Task: Map existing values to standard taxonomy, update Google Sheet
    Time estimate: 2-3 hours
    Student-ready: Yes

Issue 50: Standardize audience to canonical personas
    Priority: Medium
    Current state: Free-text audience values
    Why it matters: Want to filter by audience (student, researcher, faculty, etc)
    Need: Match to defined learner personas
    Task: Review learner profiles doc, map lessons to personas
    Time estimate: 2-3 hours
    Student-ready: Yes

Issue 51: Draft Learning Objectives for all lessons
    Priority: Medium (enhancement, not blocker)
    Current state: 13 lessons missing learning objectives (23 percent)
    Why it matters: Helps learners understand what they'll learn
    Enables Bioschemas "teaches" property
    Supports prerequisite mapping
    Format: "After this lesson, the learner should be able to..."
    Use Bloom's taxonomy verbs (explain, demonstrate, apply, etc)
    Time estimate: 4-6 hours total
    Student-ready: Yes, can use AI to draft initial versions
    Can be split among multiple people

Additional quality issue

Issue 45: Add lesson validation checks to PR workflow
    Priority: Medium
    Type: Automation/infrastructure
    Task: Extend GitHub Actions to validate lesson metadata
    Check: Required fields present, controlled vocabulary values
    Benefit: Catch data quality issues before merge
    Time estimate: 3-4 hours
    Student-ready: Yes, requires GitHub Actions knowledge

Milestone 3: User Experience Features

Target: Q1-Q2 2026 (February - June)
Status: Design and planning phase
Issues: 4 total
Student-ready: All 4 issues

Why these features matter

Current site is functional but basic
    Users can browse and filter, but experience is minimal
    No way to see full lesson details
    No way to provide feedback
    Hard to visualize learning journey
    Search is literal string matching (no typo tolerance)

These features enable engagement
    Lesson pages: Show full context, prerequisites, reviews
    Feedback system: Users can report issues, suggest improvements
    Visual roadmaps: Help learners see their progression
    Better search: Find relevant lessons even with typos

Issues breakdown

Issue 28: Create individual lesson detail pages
    Priority: High
    Current state: Clicking lesson goes to external URL
    Proposed: Lesson detail page shows all metadata first
    Include: Full description, learning objectives, prerequisites, time estimate, audience, OSS role
    Include: Author, license, dates, keywords
    Include: "View lesson" button to external resource
    Include: Feedback form
    Include: Related lessons (based on dependencies, tags)
    Technical: Dynamic routes in Astro [slug].astro
    Depends on: Clean metadata (Milestone 2)
    Time estimate: 6-8 hours
    Student-ready: Yes

Issue 29: Implement GitHub Issues-based feedback system
    Priority: Medium
    Current state: No way for users to provide feedback
    Proposed: Feedback form on each lesson page
    Technical: Use GitHub Issues API to create issues automatically
    Form fields: Issue type (broken link, outdated content, suggestion)
    Form fields: Description, email (optional)
    Creates: GitHub issue with lesson context and user feedback
    Labels: Automatically tagged with lesson name
    Reference: Carpentries uses this approach successfully
    Time estimate: 4-6 hours
    Student-ready: Yes, API integration practice

Issue 30: Design and implement visual pathway roadmaps
    Priority: Medium
    Current state: Pathways shown as lists of lessons
    Proposed: Visual roadmap showing learning progression
    Show: Prerequisites, suggested order, branches
    Show: Progress indicators (if we add tracking)
    Visual inspiration: Badgr pathways, TryHackMe roadmaps, code academy tracks
    MVP approach: Start with one pathway, expand to others
    gaurirathi interested: Submitted comment January 19
    Time estimate: 10-15 hours (design + implementation)
    Student-ready: Yes, good for students with design + code skills

Issue 31: Improve search with fuzzy matching
    Priority: Medium
    Current state: Exact string matching only
    Proposed: Typo-tolerant search with result ranking
    PR submitted: PR 39 by gaurirathi (needs security fix)
    Alternative: If PR 39 doesn't merge, reimplement from scratch
    Library options: Fuse.js (what PR 39 uses), Algolia, MiniSearch
    Time estimate: 4-6 hours if reimplementing
    Student-ready: Yes

---

5. All GitHub Issues by Category

By type (32 total issues)

Features (11 issues)
    Issue 30: Visual pathway roadmaps
    Issue 28: Individual lesson detail pages
    Issue 29: GitHub Issues feedback system
    Issue 33: Domain-specific and lifecycle filters
    Issue 40: Set up Keystatic CMS
    Issue 41: Set up Astro content collections
    Issue 42: Migration script
    Issue 44: Configure Keystatic
    Issue 46: Migration audit tool
    Issue 47: Migration EPIC
    Issue 48: Slug-based dependencies

Data quality and content (8 issues)
    Issue 23: Add subTopics
    Issue 24: Write descriptions
    Issue 25: Assign learnerCategory
    Issue 26: Find Getting Started lessons
    Issue 49: Standardize learningResourceType
    Issue 50: Standardize audience
    Issue 51: Draft learning objectives
    Issue 15: Licensing lesson development

Refactoring and code quality (4 issues)
    Issue 34: TypeScript types (PR 38 submitted)
    Issue 27: Error handling (PR 37 submitted)
    Issue 43: Update code for content collections
    Issue 45: Lesson validation checks

Infrastructure and deployment (3 issues)
    Issue 35: Integrate with main ucospo.net domain (blocked by DNS)
    Issue 40: Keystatic setup
    Issue 45: PR workflow validation

Testing and accessibility (1 issue)
    Issue 32: WCAG 2.1 AA accessibility audit

Planning and process (3 issues)
    Issue 11: Paying authors for lesson development (Year 2)
    Issue 17: Lesson pathways (partially complete, ongoing)
    Issue 18: Gap identification (ongoing)

Legacy/unclear status (2 issues)
    Issue 16: Resources UI (may be superseded by current design)

By priority

Critical (3 issues)
    Issue 23: subTopics
    Issue 24: descriptions
    Issue 25: learnerCategory

High (11 issues)
    Issue 26: Getting Started lessons
    Issue 28: Lesson detail pages
    Issue 32: Accessibility audit
    Issue 40: Keystatic setup
    Issue 41: Content collections
    Issue 42: Migration script
    Issue 43: Update code
    Issue 44: Configure Keystatic
    Issue 47: Migration EPIC
    Issue 48: Slug-based dependencies

Medium (11 issues)
    Issue 29: Feedback system
    Issue 30: Visual roadmaps
    Issue 31: Fuzzy search
    Issue 33: Additional filters
    Issue 35: Domain integration
    Issue 45: Validation checks
    Issue 46: Migration audit
    Issue 49: learningResourceType
    Issue 50: audience
    Issue 51: learning objectives

Low (2 issues)
    Issue 33: Domain-specific filters (duplicate, also medium)
    Issue 34: TypeScript

By milestone assignment

Content Infrastructure Migration (8 issues)
    Issues 40, 41, 42, 43, 44, 46, 47, 48

Data Quality and Completeness (7 issues)
    Issues 23, 24, 25, 26, 45, 49, 50, 51

User Experience Features (4 issues)
    Issues 28, 29, 30, 31

No milestone assigned (11 issues)
    Issues 11, 15, 16, 17, 18, 27, 32, 33, 34, 35
    Need to review and assign to appropriate milestone or close

By student-ready label (17 issues)

Issues explicitly marked student-ready
    Issue 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 40, 41, 42, 43, 44, 46, 48

These issues have:
    Clear scope and acceptance criteria
    Examples and templates provided
    Can be completed independently
    Don't require deep architectural knowledge
    Have estimated time commitments

---

6. Priority Framework

Urgent and important (do first)

Data quality issues 23, 24, 25
    Blocking other work (migration, features)
    Relatively quick wins (8-12 hours total)
    Can be split among multiple people
    No coding required

Lauren design handoff
    Team waiting on design specifications
    Implementation work depends on it
    Timeline pressure (Lauren's availability)
    Affects all visual components

DNS and CNAME resolution for subdomain
    Blocking 3 PRs from community contributors
    Community perception (responsive to contributions)
    Relatively quick administrative task
    Need Laura Langdon's help

Review and merge community PRs
    gaurirathi waiting since January 19 (fuzzy search)
    brainstrom286 waiting since January (3 PRs)
    Shows we value community contributions
    Quick wins: PR 53 (gitignore) ready to merge now

Important but not urgent (schedule)

Keystatic migration planning (Epic 47)
    Large project, needs careful planning
    Don't rush, get architecture right
    Test thoroughly before full migration
    Can wait until after data quality complete

Lesson detail pages (Issue 28)
    Important for user experience
    Depends on clean metadata (Milestone 2 first)
    Significant development effort (6-8 hours)
    Schedule for after data quality

Accessibility audit (Issue 32)
    Compliance requirement
    Important for inclusivity
    Not blocking other work
    Schedule for Q1 but not this week

Visual roadmaps (Issue 30)
    Nice to have, not critical
    Significant design and development effort
    gaurirathi interested (good student project)
    Schedule for after other priorities

Urgent but not important (delegate)

Vercel organization setup
    Quick administrative task
    Unblocks PR previews
    Tim has admin access
    Can be done in 15 minutes

Close or update old issues
    Housekeeping task
    Issues 16, 17, 18 may be outdated
    Low priority, do during slower period

PR 53 review and merge
    Simple gitignore update
    Already reviewed, just needs approval
    2 minutes to merge

Neither urgent nor important (defer)

Advanced filtering features (Issue 33)
    Domain-specific, lifecycle status filters
    Nice to have, not essential
    Current filters are sufficient for now
    Schedule for Phase 3 or later

Paid authors discussion (Issue 11)
    Year 2 planning, not immediate
    Depends on budget and Sloan grant planning
    Can wait until summer 2026

Domain integration with main site (Issue 35)
    Depends on CNAME resolution
    Not critical for site functionality
    Defer until DNS access resolved

---

7. Pull Request Status

PR 52: Documentation updates
    Status: MERGED January 20, 2026
    Author: Claude Code via Tim
    Changes: Updated README and CONTRIBUTING files
    Removed all TODO placeholders
    Added project-specific information
    Result: Clean, professional documentation

PR 53: Enhanced gitignore
    Status: Ready for review and merge
    Author: Claude Code via Tim
    Branch: docs/update-readme-contributing
    Changes: Comprehensive gitignore additions
    Adds .history (Local History extension files)
    Adds .vercel and .output (build directories)
    Adds Vim, Emacs, VS Code artifacts
    Adds OS-specific files (Windows, macOS)
    Why: Prevents future accidents like PR 38 .history files
    Action needed: Quick review and merge (2 minutes)

PR 39: Fuzzy search with highlighting
    Status: Needs security fix, otherwise ready
    Author: gaurirathi
    Submitted: January 19, 2026
    Changes: Implements Fuse.js for typo-tolerant search
    Adds search result highlighting
    Performance: Uses memoization, handles 56 lessons efficiently
    Security concern: Uses dangerouslySetInnerHTML for highlighting
    Recommended fix: Replace with safe React component approach
    Alternative: Create mark elements without HTML parsing
    Action needed: Comment with security concern and suggested fix
    Timeline: If author fixes quickly, can merge this week
    Fallback: If not fixed, create new issue and defer to later

PR 37: Error handling and loading states
    Status: Blocked, needs CNAME file removed
    Author: brainstrom286
    Submitted: January 7, 2026
    Changes: Excellent error handling implementation
    Adds ErrorBoundary component for crash recovery
    Adds 8-second timeout for CSV fetch
    Adds loading spinner and retry button
    Graceful error messages
    Problem: Includes public/CNAME file
    CNAME points to education.ucospo.net (subdomain not configured)
    Why blocked: DNS/CNAME not under our control yet
    Action needed: Comment asking author to remove public/CNAME
    Timeline: Once CNAME removed, ready to merge
    Note: Error handling code itself is excellent quality

PR 38: TypeScript migration
    Status: Blocked, needs CNAME and .history files removed
    Author: brainstrom286
    Submitted: January 15, 2026
    Changes: Enables strict TypeScript checking
    Migrates getSheetData to TypeScript with interfaces
    Converts React components to .tsx with typed props
    All type checks passing (0 errors)
    Problems: Includes public/CNAME file (same issue as PR 37)
    Includes 13 .history files (Local History VS Code extension)
    .history files are editor artifacts, should not be committed
    Action needed: Comment asking to remove both
    Note PR 53 adds .history to gitignore (prevents future issues)
    Timeline: Once cleaned up, ready to merge
    Note: TypeScript work itself is high quality

PR 36: Subdomain deployment
    Status: Blocked indefinitely by DNS access
    Author: brainstrom286 (via fork brainstrom286/education)
    Submitted: January 5, 2026
    Changes: Prepares site for education.ucospo.net subdomain
    Includes CSV parsing improvements
    Includes metadata enhancements
    Problem: Requires DNS/CNAME configuration
    We do not control UC OSPO Network DNS
    Need Laura Langdon's help to coordinate with whoever manages DNS
    Action needed: Already commented January 20 about DNS issue
    Timeline: Waiting on administrative process, could be weeks
    Note: May need to extract non-DNS changes to separate PR

Summary of actions needed on PRs

Immediate (this week)
    Merge PR 53 (gitignore) - 2 minutes
    Comment on PR 39 with security fix suggestion - 5 minutes
    Comment on PR 37 asking to remove CNAME - 2 minutes
    Comment on PR 38 asking to remove CNAME and .history - 2 minutes

Short-term (next 1-2 weeks)
    Review PR 39 again after security fix
    Merge PR 37 after CNAME removed
    Merge PR 38 after CNAME and .history removed

Long-term (timeline uncertain)
    Contact Laura about DNS for subdomain
    Wait for administrative process
    Re-evaluate PR 36 approach

---

8. Community Contributions

External contributors

gaurirathi
    Activity: Submitted PR 39 (fuzzy search) on January 19
    Interest: Wants to work on visual pathway roadmaps (Issue 30)
    Comment: Proposes MVP approach (one pathway first, then expand)
    Quality: Clean code, good commit messages, responsive
    Status: Waiting on security fix for PR 39
    Next steps: Approve for Issue 30 work if interested

brainstrom286
    Activity: Submitted 3 PRs (subdomain, error handling, TypeScript)
    Dates: January 5, 7, 15
    Quality: Good code quality, comprehensive changes
    Issues: Accidentally included CNAME and .history files
    Needs guidance on what to remove
    Status: Waiting on feedback on all 3 PRs
    Next steps: Provide clear feedback, unblock PRs

kirandharmar867-maker
    Activity: Commented on Issue 34 (TypeScript) January 3
    Interest: Wants to work on TypeScript improvements
    Status: Unaware PR 38 already addresses this issue
    Next steps: Comment redirecting to other student-ready issues
    Suggest: Issues 23, 24, 25 (data quality) or 28 (lesson pages)

Observations about community engagement

Positive signs
    3 contributors in first month of public launch
    High quality contributions (not spam)
    Contributors express interest in ongoing work
    Clear interest in improving the project

Areas to improve
    Need faster PR review response time
    Aim for initial review within 3-5 business days
    Need clearer guidance on what not to include (CNAME)
    Better issue triage and assignment

Recommendations
    Establish PR review rotation among team
    Add PR review to weekly team meeting agenda
    Update CONTRIBUTING with CNAME/subdomain guidance
    Respond to community comments within 48 hours
    Celebrate and acknowledge contributions publicly

---

9. Student Work Opportunities

Immediate opportunities (can start this week)

No coding required

Issue 23: Add subTopics (2-3 hours)
    Review 13 lessons without subTopics
    Visit lesson URLs to understand content
    Assign appropriate subTopic from controlled vocabulary
    Update Google Sheet
    Skills: Reading comprehension, categorization
    Can work independently

Issue 24: Write descriptions (6-8 hours, can split)
    Review 29 lessons without descriptions
    Visit lesson URLs, read through content
    Write 100-300 word descriptions
    Focus on learning outcomes
    Can use AI to draft, then refine
    Skills: Technical writing, synthesis
    Can split among 2-3 people

Issue 25: Assign learnerCategory (1-2 hours)
    Review 8 orphaned lessons
    Determine which pathway(s) they belong to
    Update Google Sheet
    Skills: Understanding pathway themes
    Quick task for getting oriented

Simple coding tasks

Test PR 39: Fuzzy search (1-2 hours)
    Pull down PR branch locally
    Test search functionality
    Check for edge cases
    Provide feedback on user experience
    Skills: Testing, UX evaluation
    Good for getting familiar with codebase

Review and test PR 53: Gitignore (30 minutes)
    Quick code review
    Verify it catches the right files
    Good first review practice

Add simple filters to Issue 33 (3-4 hours)
    Add domain-specific filter dropdown
    Add lifecycle status filter
    Follow existing filter pattern in LessonFilter.jsx
    Skills: React, JavaScript, following patterns

Short-term opportunities (next 2 weeks)

Feature development (intermediate)

Issue 28: Lesson detail pages (6-8 hours)
    Create dynamic route [slug].astro
    Design layout for lesson detail page
    Display all metadata fields
    Add "View External Lesson" button
    Link related lessons
    Skills: Astro, React, TypeScript, CSS
    Good for students comfortable with framework

Issue 29: Feedback form with GitHub API (4-6 hours)
    Create feedback form component
    Integrate GitHub Issues API
    Handle form submission
    Create issue with lesson context
    Add error handling
    Skills: React, API integration, forms
    Good for backend-curious students

Issue 31: Reimpl fuzzy search if needed (4-6 hours)
    Only if PR 39 doesn't merge
    Implement Fuse.js integration
    Add safe result highlighting
    Test with lesson data
    Skills: JavaScript, libraries, search algorithms

Infrastructure work (advanced)

Issue 41: Set up Astro content collections (3-5 hours)
    Define content collections schema
    Configure Astro for content collections
    Create TypeScript types
    Test queries
    Skills: Astro, TypeScript, content modeling
    Good for students wanting to learn Astro deeply

Issue 42: Data migration script (4-6 hours)
    Write Node.js script to convert CSV to JSON
    Preserve all metadata fields
    Handle special characters and encoding
    Validate output
    Skills: Node.js, data transformation, scripting
    Good for students interested in data engineering

Issue 44: Configure Keystatic (4-6 hours)
    Set up Keystatic collections
    Match lesson schema
    Configure admin UI fields
    Test editing workflow
    Skills: CMS configuration, schemas
    Good for students interested in content management

Medium-term opportunities (this quarter)

UX and design (all skill levels)

Issue 30: Visual pathway roadmaps (10-15 hours)
    Design pathway visualization
    Implement interactive roadmap
    Show prerequisites and progression
    Add progress indicators (optional)
    Skills: Design, React, SVG or Canvas, interactivity
    Good for students with design and code skills
    gaurirathi already interested

Issue 32: Accessibility audit (6-8 hours)
    Run automated accessibility tests
    Manual testing with screen reader
    Keyboard navigation testing
    Create issues for found problems
    Fix issues or delegate
    Skills: WCAG standards, testing, HTML/CSS
    Good for students interested in accessibility

Lauren's design implementation (varies by component)
    Depends on handoff discussion
    Could range from small components to full pages
    Skills: CSS, React, design systems
    Good for students who want to work closely with designer

Content and non-coding work

Issue 26: Curate Getting Started lessons (3-4 hours)
    Research existing beginner OSS materials
    Evaluate for inclusion criteria
    Propose additions to inventory
    Document source and rationale
    Skills: Research, curation, writing
    No coding required

Issue 15: Research licensing lesson needs (3-4 hours)
    Review existing licensing materials
    Identify gaps for UC context
    Interview tech transfer offices
    Propose lesson outline
    Skills: Research, synthesis, subject matter exploration
    No coding required

Issue 18: Continue gap analysis (ongoing)
    Review learner personas
    Map lessons to personas and needs
    Identify gaps in coverage
    Propose new lesson topics
    Skills: Analysis, documentation
    No coding required

Skills development by issue

Want to learn React
    Issues: 28, 29, 30, 33

Want to learn Astro
    Issues: 28, 41, 44

Want to learn TypeScript
    Issues: 41, 42 (PR 38 already covers general TypeScript)

Want to learn CMS and content modeling
    Issues: 40, 41, 44

Want to learn data engineering
    Issues: 42, 46

Want to learn API integration
    Issues: 29

Want to learn accessibility
    Issue: 32

Want to learn UX design
    Issues: 30, 32

Prefer non-coding work
    Issues: 15, 18, 23, 24, 25, 26

---

10. Key Documentation Index

For users and contributors

README.md
    Purpose: Project overview for all audiences
    Contains: Features, installation, usage, attribution
    Updated: January 20, 2026
    Status: Complete, no TODOs
    For: Anyone new to the project

CONTRIBUTING.md
    Purpose: How to contribute to the project
    Contains: Ways to contribute, dev setup, running tests, PR lifecycle, commit guidelines
    Updated: January 20, 2026
    Status: Complete, customized for UC OSPO Education
    For: Anyone wanting to contribute

CODE_OF_CONDUCT.md
    Purpose: Community standards and expectations
    Contains: Standards for behavior, reporting process
    Status: Established
    For: All community members

For developers and students

STUDENT_README.md
    Purpose: Developer guide for students working on project
    Contains: Project structure, design system, getting started, data management, pages overview, next steps, tips
    Status: Complete and current
    For: Student developers, new technical contributors

.github/REFERENCE.md
    Purpose: Complete technical reference
    Contains: Data dictionary for all 38 spreadsheet columns, Bioschemas compliance details, automation technical details, identifier strategy
    Status: Comprehensive
    For: Deep technical reference, understanding metadata

.github/AUTOMATION_GUIDE.md
    Purpose: How to use automation scripts
    Contains: Guide for enhancement scripts, how to review output, how to update Google Sheets
    Status: Complete with examples
    For: Anyone running scripts or updating data

.github/LESSON_DEVELOPMENT_WORKFLOW.md
    Purpose: Lesson submission and review process
    Contains: How to submit proposals, review workflow, timeline
    Status: Documented
    For: Lesson authors, reviewers

.github/LESSON_PROGRAM_QUICK_START.md
    Purpose: Overview of lesson development program
    Contains: Program goals, timeline, how to participate
    Status: Current
    For: Potential lesson authors

For design and UX

.github/SKILL_BADGES_IMPLEMENTATION.md
    Purpose: Skill badge system design
    Contains: Color coding, usage, implementation details
    Status: Implemented
    For: Understanding badge system

.github/UNIFIED_NAV_GUIDE.md
    Purpose: Navigation patterns and consistency
    Contains: Navigation structure, patterns, best practices
    Status: Documented
    For: Maintaining navigation consistency

Lauren's Figma files
    Purpose: Visual design specifications
    Contains: Components, layouts, design system
    Status: To be shared at meeting
    For: Design implementation

For project management

.github/LABEL_RECOMMENDATIONS.md
    Purpose: Issue labeling conventions
    Contains: Label taxonomy, when to use each label
    Status: Established
    For: Issue triage, project organization

scripts/UPDATING_GOOGLE_SHEETS.md
    Purpose: How to safely update canonical spreadsheet
    Contains: Merge process, Google Apps Script, preserving formatting
    Status: Complete with step-by-step instructions
    For: Anyone updating lesson data

MEETING_PREP_GUIDE.md (this document)
    Purpose: Comprehensive project status for meetings
    Contains: Everything in this document
    Status: Current as of January 20, 2026
    For: Meeting preparation, project overview

Documentation that should exist but doesn't yet

Design System Documentation
    What it should contain: Colors, typography, spacing, component specifications
    Who should create it: Lauren or Tim based on Figma
    Priority: High (needed for consistent implementation)

Keystatic Migration Plan
    What it should contain: Step-by-step migration process, rollback plan, testing checklist
    Who should create it: Tim and student developers
    Priority: Medium (before starting migration)

Testing Strategy
    What it should contain: What to test, how to test, test cases
    Who should create it: Development team
    Priority: Medium

Deployment Guide
    What it should contain: How to deploy, rollback procedures, troubleshooting
    Who should create it: Tim
    Priority: Low (mostly automated via GitHub Actions)

---

11. Discussion Questions

About Lauren's design work

Feedback loop and review process
    How do we want to review design implementation for fidelity?
    Weekly design check-ins scheduled?
    Async feedback via Figma comments?
    Who has final design approval authority?
    What's the turnaround time expected for feedback?

Vibe coding session learnings
    What did we learn from implementing Figma to Astro?
    Which components translated well from design to code?
    Which components need refinement or have technical constraints?
    What design patterns work best with Astro and React?
    Any performance or accessibility concerns discovered?

Lauren's handoff and future involvement
    Complete handoff scenario: Lauren documents everything, team implements independently
        What documentation do we need from Lauren?
        Design system specifications (colors, spacing, typography)?
        Component library with all states and variations?
        Asset files (icons, images)?
        Handoff timeline?

    Consultant scenario: Lauren available for questions and reviews
        How often would Lauren be available?
        Response time expectations?
        Scope of consultation (review only, or occasional implementation help)?
        Timeline for this arrangement?

    Ongoing collaboration scenario: Lauren continues designing new features
        Which features would Lauren design?
        What's the collaboration process for new features?
        How does this fit with student work?
        Timeline and sustainability?

    Which model works best for everyone?
    Hybrid approach possible?

Design system governance
    After handoff, who owns design decisions?
    How do we ensure design consistency?
    What if students implement something that doesn't match design?
    Process for proposing design changes?
    How do we document design decisions?

About project priorities and sequencing

Milestone sequencing
    Should we complete Data Quality (Milestone 2) before starting Content Infrastructure Migration (Milestone 1)?
    Pros of finishing data quality first: Clean data to migrate, easier validation
    Cons of waiting: Delays CMS benefits, students waiting on work
    Can we do both in parallel? Risk of coordination overhead

    Can we work on UX Features (Milestone 3) in parallel with Migration?
    Which features can proceed independently?
    Which features depend on migration completion?

Student work coordination
    How many students do we have available?
    What are their skill levels and interests?
    How do we assign work to avoid duplication?
    What if two students want the same issue?
    How do we coordinate PR reviews when multiple students involved?

External contributions
    How quickly do we want to review and merge external PRs?
    Aim for 3-5 business days for initial review?
    Who is responsible for PR reviews?
    Establish review rotation?
    What's our quality bar for accepting contributions?
    How do we guide contributors who need changes?

About DNS and infrastructure

DNS and CNAME issue
    Who at UC OSPO Network has access to DNS configuration?
    Is this a Laura Langdon question?
    What's the process for requesting DNS changes at UC?
    Timeline expectations (days, weeks, months)?
    Is subdomain deployment a priority or can we defer?
    Should we extract non-DNS changes from PR 36 to separate PR?

Vercel organization setup
    Who has admin access to create Vercel org?
    Tim has access, should do this week
    Do we need to coordinate with anyone?
    Budget implications (Vercel pricing for org)?

About team coordination

Communication and check-ins
    What's the communication cadence for students?
    Weekly check-ins?
    Daily standups on Slack?
    How do students report progress?
    What if student gets blocked?
    How do we coordinate between multiple students?

Issue triage and management
    Who maintains GitHub project board?
    Should we close old issues (16, 17, 18)?
    Should we update priorities based on current goals?
    Process for creating new issues?
    Who assigns issues to milestones?
    How do we mark issues as student-ready?

Code review and merge authority
    Who can approve and merge PRs?
    Need at least 2-3 people with merge access
    Process for getting changes reviewed?
    What if reviewer disagrees with approach?
    How do we handle urgent merges?

Documentation maintenance
    Who updates documentation as project evolves?
    How do we keep student guides current?
    Process for proposing documentation changes?
    Who reviews documentation PRs?

About scope and planning

Feature creep prevention
    How do we decide what's in scope for Phase 2?
    Process for evaluating new feature requests?
    What if students propose additional features?
    How do we say no respectfully?

Year 2 planning
    When do we start planning Year 2 work?
    Collaborative lesson development training (Carpentries)
    Gap lesson creation
    Paid authors (Issue 11)
    Timeline for Year 2 kickoff?

Success metrics and evaluation
    How will we measure success?
    Usage analytics (need to implement)?
    User feedback collection?
    Learning outcomes assessment?
    Community growth metrics?

---

12. Technical Architecture Reference

Current architecture

Frontend framework
    Astro 5.x as static site generator
    React 19 for interactive components
    TypeScript for type safety (in progress)
    Tailwind CSS not used, custom CSS

Data layer
    Google Sheets as content source
    Published CSV endpoint (read-only)
    Fetched at build time via getSheetData.js
    Parsed with PapaParse library
    No runtime database

Build and deployment
    GitHub Actions for CI/CD
    Builds on push to main branch
    Deploys to GitHub Pages
    Base path: /education
    Production URL: https://UC-OSPO-Network.github.io/education

Validation and checks
    Automated PR checks via GitHub Actions
    Data validation: CSV accessibility test
    TypeScript check: npx astro check
    Build test: npm run build succeeds
    Page validation: critical pages exist
    Link checking: no broken internal links
    All checks must pass before merge

Preview deployments
    Vercel for PR previews
    Each PR gets unique URL
    Automatic deployment on PR update
    Vercel config: vercel.json
    Main branch deployments disabled (GitHub Pages is production)
    Awaiting UC-OSPO-Network org setup

Component structure

Layout
    BaseLayout.astro: Header, navigation, footer
    Consistent across all pages
    UC branding colors and typography

Pages (Astro)
    index.astro: Homepage with stacked pathway cards
    lessons.astro: Filterable lesson library
    pathways/index.astro: All pathways overview
    pathways/[id].astro: Dynamic pathway pages
    for-educators.astro: Teaching resources
    develop-a-lesson.astro: Lesson development program

Components (React)
    StackedPathways.jsx: Homepage interactive cards (client:load)
    LessonFilter.jsx: Filterable lesson table (client:load)
    LessonCard.jsx: Individual lesson card
    PathwayCard.astro: Pathway card component
    SkillBadge.jsx: Color-coded skill level badges

Data fetching
    lib/getSheetData.js: Fetches and parses CSV
    Called at build time from Astro pages
    Returns array of lesson objects
    Filters to "Keep" lessons only
    Type definitions in types/lesson.ts

Styling approach
    public/styles.css: Global styles
    CSS custom properties for colors
    Component-scoped styles in .astro files
    Inline styles for dynamic values
    No CSS framework dependency

Planned architecture changes (after Milestone 1)

Content layer
    Migrate from Google Sheets CSV to Git-based content
    Astro Content Collections API
    Lessons as JSON files in src/content/lessons/
    Type-safe queries via collection schemas
    Version control for all content changes

CMS layer
    Keystatic CMS for visual editing
    Admin interface at /admin route
    Editors create PRs automatically
    Review and merge workflow
    No database, all file-based

Data relationships
    Slug-based dependencies instead of numeric IDs
    Content collections support relationships
    Can query related lessons efficiently
    Enables prerequisite chains

Enhanced pages
    Individual lesson detail pages at /lessons/[slug]
    Richer metadata display
    Related lessons section
    Feedback form integration
    Breadcrumb navigation

Development workflow improvements

Local development
    npm run dev: starts dev server at localhost:4321
    Hot module reloading
    Fast refresh for React components
    Instant updates on file changes

Testing approach (to be enhanced)
    npm run build: test build succeeds
    npx astro check: TypeScript validation
    Manual testing in browser
    Need to add: component tests, e2e tests
    Need to add: accessibility testing automation

Code quality
    ESLint configuration (to be added)
    Prettier for formatting (to be added)
    TypeScript strict mode (in progress via PR 38)
    Pre-commit hooks (to be added)

Git workflow
    Main branch is production
    Feature branches for new work
    PR required for all changes
    Review required before merge
    Automated checks must pass
    Squash and merge preferred

Scripts and automation

Enhancement scripts (in scripts/ folder)
    generate-slugs.js: Creates URL-safe slugs from lesson names
    standardize-languages.js: Converts to IETF language codes
    estimate-time-required.js: Calculates ISO 8601 duration from word count
    scrape-metadata.js: Extracts author, license, dates from lesson URLs
    run-phase1.js: Runs all enhancement scripts sequentially
    merge-enhanced-data.js: Combines enhanced CSVs for Google Sheets update

Output location
    scripts/output/: Generated CSV files
    Date-stamped filenames
    Ready for manual Google Sheets import

Dependencies

Core dependencies
    astro: Static site framework
    react and react-dom: UI library for interactive components
    papaparse: CSV parsing
    framer-motion: Animation library (currently unused, candidate for removal)

Development dependencies
    @astrojs/react: Astro React integration
    @types/node: TypeScript types for Node.js
    typescript: Type checking

Potential future dependencies
    fuse.js: Fuzzy search (if PR 39 merges)
    @keystatic/core and @keystatic/astro: CMS integration (Milestone 1)
    @astrojs/content: Enhanced content collections (may be built-in)

Performance considerations

Build performance
    Static site generation is fast (under 2 minutes)
    CSV fetch happens once at build time
    No runtime data fetching
    All pages pre-rendered

Runtime performance
    Minimal JavaScript shipped to client
    Only interactive components hydrate
    Lessons page React bundle is largest (~50kb)
    No unnecessary framework overhead

Optimization opportunities
    Image optimization (no images currently)
    Bundle size analysis and reduction
    Consider removing unused framer-motion
    Lazy load non-critical components

Accessibility

Current standards
    Semantic HTML elements used
    ARIA labels on interactive elements (some)
    Keyboard navigation supported (basic)
    Color contrast meets WCAG AA (mostly)
    Alt text on images (no images yet)

Known gaps (Issue 32 to address)
    Need comprehensive audit
    Screen reader testing needed
    Keyboard-only navigation testing
    Focus indicators need improvement
    Skip links missing
    Landmark regions need review

Security considerations

Current security measures
    No user authentication required
    No user data collection
    No server-side code
    Static files only
    GitHub Actions secrets for API keys (when needed)

Potential vulnerabilities
    PR 39 uses dangerouslySetInnerHTML (flagged for fix)
    Google Sheets CSV could be compromised (low risk)
    Dependency vulnerabilities (run npm audit regularly)

Best practices
    Keep dependencies updated
    Review all external contributions carefully
    Sanitize any user input (feedback forms)
    HTTPS enforced by GitHub Pages

Monitoring and analytics (to be implemented)

Current state
    No analytics currently implemented
    GitHub provides repo traffic data
    No user behavior tracking
    No error monitoring

Future needs
    Privacy-respecting analytics (Plausible or similar)
    Error tracking (Sentry or similar)
    Build monitoring
    Performance monitoring
    Usage metrics for Sloan reporting

---

End of Meeting Preparation Guide

This guide compiled from:
    GitHub issues and milestones
    Pull request history and status
    Project documentation files
    Meeting notes and planning documents
    Recent work by Tim and Claude Code
    Community contributions and comments

For questions or updates to this guide, contact Tim Dennis or update directly in repository.
