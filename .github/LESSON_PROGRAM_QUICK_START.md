# Lesson Development Program - Quick Start Guide

Quick reference for managing the UC OSPO Collaborative Lesson Development Program.

## What Was Created

### 1. Public-Facing Page
**File**: `src/pages/develop-a-lesson.astro`
**URL**: `https://UC-OSPO-Network.github.io/education/develop-a-lesson`

**Features**:
- Compelling hero section with CTA
- Program overview and benefits
- All 6 identified lesson gaps
- Timeline (Q1→Q2→Q3-Q4→End 2026)
- FAQ section (8 common questions)
- Multiple CTAs linking to proposal form
- Navigation link added to BaseLayout (highlighted in gold)

### 2. GitHub Issue Template
**File**: `.github/ISSUE_TEMPLATE/lesson-proposal.yml`
**URL**: `https://github.com/UC-OSPO-Network/education/issues/new?template=lesson-proposal.yml`

**Collects**:
- Lesson title and description
- Gap area alignment
- Pathway alignment
- Learning objectives
- Educational level
- Target audience (checkboxes)
- Why it matters
- Team information and status
- Expertise and qualifications
- Timeline commitments
- Program agreement checkboxes

**Auto-applies labels**: `lesson-proposal`, `phase-3-advanced`

### 3. Tracking Labels

#### Topic Labels (apply ONE per proposal)
- `topic: licensing`
- `topic: intro-oss`
- `topic: security`
- `topic: governance`
- `topic: software-eng`
- `topic: community-dev`

#### Status Labels (proposals move through these)
- `proposal-status: under-review`
- `proposal-status: selected`
- `proposal-status: not-selected`
- `proposal-status: in-development`
- `proposal-status: completed`

#### Primary Label (auto-applied)
- `lesson-proposal` (identifies all proposals)

### 4. Workflow Documentation
**File**: `.github/LESSON_DEVELOPMENT_WORKFLOW.md`

**Includes**:
- Complete user flow from discovery to publication
- Admin workflow for each phase
- Label management guide
- Communication templates
- FAQ for administrators
- Success metrics to track

## Quick Actions

### When a Proposal Comes In

1. **Within 3 days**:
   ```bash
   # Add topic label
   gh issue edit [NUMBER] --add-label "topic: licensing"

   # Add status label
   gh issue edit [NUMBER] --add-label "proposal-status: under-review"

   # Comment to acknowledge
   gh issue comment [NUMBER] --body "Thank you for your proposal! ..."
   ```

2. **Help with team matching**: Introduce similar proposals in comments

3. **Review regularly**: Check all `proposal-status: under-review` issues

### When Making Selections (End of Q1 2026)

**For selected proposals**:
```bash
# Update labels
gh issue edit [NUMBER] \
  --remove-label "proposal-status: under-review" \
  --add-label "proposal-status: selected"

# Comment with next steps
gh issue comment [NUMBER] --body "🎉 Congratulations! ..."

# Email team separately with onboarding details
```

**For non-selected proposals**:
```bash
# Update labels
gh issue edit [NUMBER] \
  --remove-label "proposal-status: under-review" \
  --add-label "proposal-status: not-selected"

# Comment with feedback
gh issue comment [NUMBER] --body "Thank you for your proposal. ..."
```

### During Development (Q2-Q4 2026)

```bash
# Move selected proposals to development
gh issue edit [NUMBER] --add-label "proposal-status: in-development"

# Track progress in comments or separate tracking board
```

### When Lesson is Published (End 2026)

```bash
# Mark as completed
gh issue edit [NUMBER] --add-label "proposal-status: completed"

# Add celebration comment with lesson link
gh issue comment [NUMBER] --body "🎉 Your lesson is now published! ..."

# Close the issue
gh issue close [NUMBER] --comment "Lesson development complete. Thank you!"
```

## View Proposals by Status

```bash
# All proposals
gh issue list --label "lesson-proposal"

# Under review
gh issue list --label "proposal-status: under-review"

# Selected for 2026
gh issue list --label "proposal-status: selected"

# In development
gh issue list --label "proposal-status: in-development"

# By topic
gh issue list --label "topic: licensing"
```

## Timeline Checklist

### Q1 2026: Proposal & Selection Phase
- [ ] Promote "Develop a Lesson" page via social media, email, UC channels
- [ ] Monitor incoming proposals, acknowledge within 3 days
- [ ] Add topic labels to categorize proposals
- [ ] Help connect individual proposers to form teams
- [ ] Schedule proposal review meeting (late Q1)
- [ ] Score and select top 4 proposals
- [ ] Notify all applicants (selected + not selected)
- [ ] Begin onboarding selected teams

### Q2 2026: Training Phase
- [ ] Enroll selected teams in Carpentries training
- [ ] Assign UC OSPO mentors to each lesson team
- [ ] Assign student developer support
- [ ] Host kickoff meetings with each team
- [ ] Update issues to `proposal-status: in-development`
- [ ] Track training completion

### Q3-Q4 2026: Development Phase
- [ ] Bi-weekly check-ins with lesson teams
- [ ] Track milestone progress
- [ ] Facilitate peer review between teams
- [ ] Provide resources and unblock teams
- [ ] Coordinate user testing
- [ ] Review drafts and provide feedback

### End 2026: Publication Phase
- [ ] Final review of completed lessons
- [ ] Add lessons to UC OSPO Education website
- [ ] Update CSV with lesson metadata
- [ ] Mint DOIs for citation
- [ ] Issue UC OSPO Lesson Developer badges
- [ ] Submit applicable lessons to Carpentries Incubator
- [ ] Launch celebration and promotion
- [ ] Update issues to `proposal-status: completed` and close
- [ ] Collect success metrics

## Key Dates to Set

**Customize these dates and communicate them clearly**:

- Proposal submission opens: [DATE]
- Proposal submission deadline: [DATE]
- Selection notifications sent: [DATE]
- Carpentries training begins: [DATE]
- Development milestones:
  - Outline complete: [DATE]
  - 50% draft: [DATE]
  - Full draft: [DATE]
  - User testing: [DATE]
- Final submission deadline: [DATE]
- Publication target: [DATE]

## Communication Channels

Set up these channels for the program:

- **Public**: `/develop-a-lesson` page for discovery
- **Proposals**: GitHub issues for structured submissions
- **Questions**: GitHub Discussions or dedicated email
- **Team Coordination**: Slack/Discord channel for selected teams
- **Mentorship**: Regular video calls (Zoom/Meet)

## Promotion Ideas

- UC campus newsletters
- Social media posts (Twitter/X, LinkedIn, Mastodon)
- Faculty mailing lists
- Open source community forums
- Carpentries community channels
- OSPO Alliance network
- Conference presentations (e.g., CHAOSScon, OSPOCon)

## Testing the Flow

Before launch, test the complete user flow:

1. Visit `/develop-a-lesson` page - is it compelling?
2. Click "SUBMIT A PROPOSAL" button - does it work?
3. Fill out issue template - are questions clear?
4. Submit test proposal - does it create properly with labels?
5. Practice label management with test issue
6. Review workflow documentation - any gaps?

## Questions?

- **Technical issues**: Check `.github/LESSON_DEVELOPMENT_WORKFLOW.md`
- **Process questions**: Open a GitHub Discussion
- **Program updates**: Edit `/develop-a-lesson.astro` and redeploy

---

**Ready to launch?** Promote the page and watch proposals come in! 🚀
