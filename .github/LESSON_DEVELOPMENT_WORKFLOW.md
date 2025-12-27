# Lesson Development Program Workflow

This document outlines the complete user flow and administrative workflow for the UC OSPO Collaborative Lesson Development Program.

## Program Overview

- **Capacity**: 4 lessons total
- **Team Size**: Up to 4 people per lesson (16 participants maximum)
- **Timeline**: Q1 2026 proposals → Q2 2026 training → Q3-Q4 2026 development
- **Training**: Carpentries collaborative lesson development (online)
- **Support**: UC OSPO mentorship + student developers
- **Publication**: UC OSPO site → Carpentries Incubator (if applicable)

## User Flow: From Discovery to Publication

### Phase 1: Discovery & Proposal (Q1 2026)

#### Educator's Journey

1. **Discovery**
   - Educator visits UC OSPO Education website
   - Clicks "Develop a Lesson" in navigation (highlighted in gold)
   - Lands on `/develop-a-lesson` page

2. **Learning About the Program**
   - Reads program overview, benefits, and timeline
   - Reviews identified lesson gaps
   - Reads FAQ to address questions
   - Decides to apply

3. **Proposal Submission**
   - Clicks "SUBMIT A PROPOSAL" CTA button
   - Redirected to GitHub issue template: `lesson-proposal.yml`
   - Fills out structured form:
     - Lesson title and description
     - Gap area alignment
     - Learning pathway alignment
     - Learning objectives (3-5)
     - Educational level
     - Target audience
     - Why this lesson matters
     - Primary contact information
     - Team members (current or TBD)
     - Team expertise and qualifications
     - Team formation status
     - Timeline availability commitments
     - Additional notes
     - Program commitment checkboxes
   - Submits GitHub issue

4. **Confirmation**
   - Issue automatically created with labels:
     - `lesson-proposal`
     - `phase-3-advanced`
   - Issue appears in UC OSPO project board "Education" swimlane
   - Educator receives GitHub notification
   - UC OSPO team receives notification

#### Admin Actions After Submission

1. **Initial Triage** (within 3 business days)
   - Review proposal for completeness
   - Add appropriate topic label:
     - `topic: licensing`
     - `topic: intro-oss`
     - `topic: security`
     - `topic: governance`
     - `topic: software-eng`
     - `topic: community-dev`
   - Add `proposal-status: under-review` label
   - Comment on issue acknowledging receipt
   - Ask clarifying questions if needed

2. **Team Matching** (ongoing during Q1)
   - If individual proposals align thematically, introduce proposers
   - Suggest potential collaborations
   - Help form complete teams
   - Update issue with team formation progress

### Phase 2: Review & Selection (Late Q1 2026)

#### Admin Workflow

1. **Proposal Review Meeting**
   - Evaluate all proposals against criteria:
     - **Impact**: How critical is this gap? How many learners will benefit?
     - **Alignment**: Fits UC OSPO mission and identified needs?
     - **Team Readiness**: Complete team with relevant expertise?
     - **Feasibility**: Realistic scope for 6-month development?
     - **Quality**: Clear objectives, well-thought-out proposal?
   - Score and rank proposals
   - Select top 4 lessons

2. **Notification Process**

   **For Selected Proposals:**
   - Update issue with `proposal-status: selected` label
   - Remove `proposal-status: under-review` label
   - Post congratulatory comment with next steps:
     ```markdown
     🎉 Congratulations! Your lesson proposal has been selected for the 2026 UC OSPO Collaborative Lesson Development Program.

     ## Next Steps
     1. We'll contact your team via email within 3 business days
     2. You'll receive Carpentries training enrollment information
     3. We'll schedule a kickoff meeting with your team and UC OSPO mentors

     ## What to Expect
     - **Q2 2026**: Carpentries collaborative lesson development training (online)
     - **Q3-Q4 2026**: Lesson development with mentorship and support
     - **Regular check-ins**: Bi-weekly team syncs with UC OSPO

     Welcome to the program! 🚀
     ```
   - Email team with detailed onboarding information
   - Add team to Carpentries training roster
   - Assign UC OSPO mentor
   - Assign student developer support

   **For Non-Selected Proposals:**
   - Update issue with `proposal-status: not-selected` label
   - Remove `proposal-status: under-review` label
   - Post thoughtful feedback comment:
     ```markdown
     Thank you for your excellent lesson proposal. After careful review, we've selected 4 lessons for this cohort, and unfortunately this proposal was not selected.

     ## Feedback
     [Specific feedback on the proposal - strengths and areas for improvement]

     ## Future Opportunities
     - We may run additional cohorts in the future
     - You're welcome to develop this lesson independently - we can connect you with resources
     - Consider joining as a reviewer or contributor to selected lessons
     - Stay connected with UC OSPO community

     We appreciate your commitment to open source education!
     ```
   - Offer alternatives (community resources, future cohorts, etc.)

### Phase 3: Training (Q2 2026)

#### Team Experience

1. **Onboarding**
   - Kickoff meeting with UC OSPO team
   - Introduction to assigned mentor and student support
   - Overview of tools and platforms
   - Team working agreement creation

2. **Carpentries Training**
   - Participate in online Carpentries lesson development training
   - Learn collaborative development practices
   - Start lesson outline and design

#### Admin Tracking

- Update issue with `proposal-status: in-development` label
- Create project-specific tracking (e.g., dedicated repo or project board)
- Regular mentor check-ins
- Track training completion

### Phase 4: Development (Q3-Q4 2026)

#### Team Experience

1. **Lesson Development**
   - Collaborative writing using Carpentries Workbench or similar tools
   - Regular team syncs
   - Bi-weekly check-ins with UC OSPO mentor
   - Student developer support for technical implementation
   - Peer review from other lesson teams
   - User testing with target audience

2. **Milestones**
   - Month 1: Lesson outline and learning objectives finalized
   - Month 2: 50% content draft complete
   - Month 3: Full draft complete
   - Month 4: Internal review and revisions
   - Month 5: User testing and feedback incorporation
   - Month 6: Final polish and publication prep

#### Admin Support

- Bi-weekly mentor check-ins with teams
- Facilitate peer review between lesson teams
- Provide feedback on drafts
- Coordinate user testing opportunities
- Track progress against milestones
- Address blockers and provide resources

### Phase 5: Publication (End 2026)

#### Publication Process

1. **Final Review**
   - UC OSPO team reviews completed lesson
   - Carpentries standards check (if submitting to Incubator)
   - Accessibility review
   - Technical review

2. **Publication on UC OSPO Site**
   - Lesson added to UC OSPO Education website
   - CSV updated with lesson metadata
   - Appropriate pathway assignment
   - DOI minting for citation
   - Author attribution and UC OSPO Lesson Developer badges

3. **Carpentries Incubator Submission** (if applicable)
   - Lessons meeting Carpentries standards submitted to Incubator
   - Community review process
   - Potential pathway to official Carpentries lesson programs

4. **Launch & Promotion**
   - Blog post announcing new lessons
   - Social media promotion
   - UC-wide communication
   - Community showcases
   - Author recognition event

#### Issue Closure

- Update issue with `proposal-status: completed` label
- Post completion celebration comment with:
  - Link to published lesson
  - Author acknowledgments
  - Lesson usage statistics (after launch)
  - Thank you and recognition
- Close issue

## Label Management Guide

### Primary Labels

- `lesson-proposal` - Applied automatically to all proposals
- `phase-3-advanced` - Applied automatically (future feature)

### Topic Labels

Apply ONE topic label per proposal:
- `topic: licensing` - Licensing and compliance lessons
- `topic: intro-oss` - Introduction to open source
- `topic: security` - Security and institutional policy
- `topic: governance` - Community governance and sustainability
- `topic: software-eng` - Software engineering best practices
- `topic: community-dev` - Community development and building

### Status Labels

Proposals move through these statuses sequentially:
1. `proposal-status: under-review` - Initial review in progress
2. `proposal-status: selected` OR `proposal-status: not-selected` - Decision made
3. `proposal-status: in-development` - (Selected only) Training and development
4. `proposal-status: completed` - (Selected only) Lesson published

### Using Labels to Track Progress

**GitHub Project Board Views:**

- **All Proposals**: Filter by `lesson-proposal`
- **Under Review**: Filter by `proposal-status: under-review`
- **Selected Cohort**: Filter by `proposal-status: selected` OR `proposal-status: in-development`
- **By Topic**: Filter by `topic:*` labels
- **Completed Lessons**: Filter by `proposal-status: completed`

## Communication Templates

### Auto-Acknowledgment Comment (Within 3 Days)

```markdown
Thank you for submitting a lesson proposal to the UC OSPO Collaborative Lesson Development Program!

We've received your proposal for **[Lesson Title]** and it's now under review.

**Next Steps:**
- Our team will review all proposals during Q1 2026
- We'll notify selected teams by [specific date]
- If you have questions, feel free to comment on this issue

**In the Meantime:**
- Review the [Carpentries Lesson Development documentation](https://carpentries.github.io/curriculum-development/)
- Connect with other proposers in the discussion forum
- Refine your team composition if needed

We appreciate your commitment to building open source education resources!
```

### Selection Notification (Email + GitHub Comment)

**Email Subject:** 🎉 Your lesson proposal has been selected - UC OSPO 2026 Program

**GitHub Comment:** (See Phase 2 above)

### Non-Selection Notification (Email + GitHub Comment)

**Email Subject:** UC OSPO Lesson Development Program - Proposal Update

**GitHub Comment:** (See Phase 2 above)

## FAQ for Administrators

### Q: What if we receive more than 4 high-quality proposals?

**A:** Rank by impact and readiness. Consider:
- Funding additional proposals if budget allows
- Inviting top runners-up for next cohort
- Offering independent development support
- Combining similar proposals into one lesson

### Q: What if a team drops out during development?

**A:**
1. Assess reason and impact
2. Try to fill gaps with remaining team members
3. Consider bringing in alternate proposal team if early in process
4. Adjust timeline if needed
5. In worst case, mark as `blocked` and defer to next cohort

### Q: How do we handle proposal modifications after submission?

**A:** Encourage teams to comment on their issue with updates. Proposers can refine:
- Team composition
- Lesson scope
- Learning objectives
- Timeline

Major changes should be discussed with UC OSPO team.

### Q: Can we select the same team for multiple lessons?

**A:** Generally no - we want to maximize participation. Exception: if a team has unique expertise and proposals are clearly distinct.

## Success Metrics

Track these metrics throughout the program:

### Proposal Phase
- Total proposals received
- Proposals by topic area
- Individual vs. team proposals
- Geographic distribution (UC campus, external)

### Development Phase
- Training completion rate
- Milestone achievement rate
- Team retention rate
- Mentor satisfaction

### Publication Phase
- Lessons completed and published
- Lesson quality scores (review feedback)
- Time to publication
- Carpentries Incubator acceptance rate

### Impact Phase (Post-Launch)
- Lesson usage statistics
- Learner feedback scores
- Citation counts
- Community adoption rate
- Reuse and adaptation by others

---

**Version**: 1.0
**Last Updated**: 2025
**Maintained By**: UC OSPO Team
**Questions**: Contact Tim Dennis or open a GitHub Discussion
