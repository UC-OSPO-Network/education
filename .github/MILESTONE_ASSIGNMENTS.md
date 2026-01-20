# Milestone Assignments - UC OSPO Education Project

**Created**: 2026-01-19
**Students**: ShouzhiWang, giaari15
**Instructor/Reviewer**: jt14den (Tim)

---

## 🏗️ Milestone 1: Content Infrastructure Migration
**Due Date**: February 2, 2026
**Goal**: Move from Google Sheets to Keystatic + Content Collections

### ShouzhiWang's Issues (3 issues, ~13-16 hours)

| Issue | Title | Hours | Priority | Dependencies |
|-------|-------|-------|----------|--------------|
| [#40](https://github.com/UC-OSPO-Network/education/issues/40) | Set up Keystatic CMS | 4-6h | High | None - Start first |
| [#44](https://github.com/UC-OSPO-Network/education/issues/44) | Configure Keystatic to edit lessons | 4-5h | High | After #40 & #41 |
| [#43](https://github.com/UC-OSPO-Network/education/issues/43) | Update app code to use content collections | 5-6h | High | After #42 |

**Suggested Sequence**:
1. Week 1: Start with #40 (Keystatic setup)
2. Week 1-2: Once #40 and #41 done → #44 (Connect Keystatic)
3. Week 2: Once #42 done → #43 (Update app code)

---

### giaari15's Issues (4 issues, ~13-16 hours)

| Issue | Title | Hours | Priority | Dependencies |
|-------|-------|-------|----------|--------------|
| [#41](https://github.com/UC-OSPO-Network/education/issues/41) | Set up content collections with singletons | 3-4h | High | None - Start first |
| [#48](https://github.com/UC-OSPO-Network/education/issues/48) | Convert dependencies to slug-based | 2-3h | High | After #41 |
| [#42](https://github.com/UC-OSPO-Network/education/issues/42) | Create migration script (CSV → JSON) | 4-5h | High | After #41, #48 |
| [#46](https://github.com/UC-OSPO-Network/education/issues/46) | Create migration audit tool | 3-4h | Medium | After #42 |

**Suggested Sequence**:
1. Week 1: Start with #41 (Content collections)
2. Week 1: Once #41 done → #48 (Convert dependencies)
3. Week 1-2: Once #48 done → #42 (Migration script)
4. Week 2: Once #42 done → #46 (Audit tool)

---

### Tim's Issues (Tracking/Review)

| Issue | Title | Role |
|-------|-------|------|
| [#47](https://github.com/UC-OSPO-Network/education/issues/47) | EPIC: Migration overview | Track progress, review PRs |

---

## 📊 Milestone 2: Data Quality & Completeness
**Due Date**: February 16, 2026
**Goal**: Clean up missing lesson data using new Keystatic workflow

### ShouzhiWang's Issues (3 issues, ~8-11 hours)

| Issue | Title | Hours | Priority | Dependencies |
|-------|-------|-------|----------|--------------|
| [#23](https://github.com/UC-OSPO-Network/education/issues/23) | Add subTopic to all lessons | 2-3h | Critical | After Milestone 1 |
| [#24](https://github.com/UC-OSPO-Network/education/issues/24) | Write missing descriptions | 2-3h | Critical | After Milestone 1 |
| [#45](https://github.com/UC-OSPO-Network/education/issues/45) | Add lesson validation to CI/CD | 4-5h | Medium | After Milestone 1 |

---

### giaari15's Issues (2 issues, ~5-7 hours)

| Issue | Title | Hours | Priority | Dependencies |
|-------|-------|-------|----------|--------------|
| [#25](https://github.com/UC-OSPO-Network/education/issues/25) | Assign learnerCategory to orphaned lessons | 2-3h | Critical | After Milestone 1 |
| [#26](https://github.com/UC-OSPO-Network/education/issues/26) | Find 5-7 'Getting Started' lessons | 3-4h | High | After Milestone 1 |

---

### Unassigned (To be assigned - 3 issues, ~8-11 hours)

| Issue | Title | Hours | Priority | Dependencies |
|-------|-------|-------|----------|--------------|
| [#49](https://github.com/UC-OSPO-Network/education/issues/49) | Standardize learningResourceType | 1-2h | High | After Milestone 1 |
| [#50](https://github.com/UC-OSPO-Network/education/issues/50) | Standardize audience to personas | 2-3h | Medium | After Milestone 1 |
| [#51](https://github.com/UC-OSPO-Network/education/issues/51) | Draft Learning Objectives for all lessons | 4-6h | Medium | After Milestone 1 |

**Assignment notes**:
- #49 could pair with #24 (ShouzhiWang - both are content quality)
- #50 could go to Tim or giaari15 (requires defining persona taxonomy first)
- #51 is substantial - could split between students or use AI assistance for drafts

---

## ✨ Milestone 3: User Experience Features
**Due Date**: March 2, 2026
**Goal**: Enhance UX with new features

### ShouzhiWang's Issues (1 issue, ~4-6 hours)

| Issue | Title | Hours | Priority | Dependencies |
|-------|-------|-------|----------|--------------|
| [#28](https://github.com/UC-OSPO-Network/education/issues/28) | Create individual lesson detail pages | 4-6h | High | After Milestone 1 |

---

### giaari15's Issues (1 issue, ~4-5 hours)

| Issue | Title | Hours | Priority | Dependencies |
|-------|-------|-------|----------|--------------|
| [#31](https://github.com/UC-OSPO-Network/education/issues/31) | Improve search with fuzzy matching | 4-5h | Medium | After Milestone 1 |

---

### Unassigned (To be assigned later)

| Issue | Title | Hours | Priority | Notes |
|-------|-------|-------|----------|-------|
| [#29](https://github.com/UC-OSPO-Network/education/issues/29) | GitHub Issues feedback system | 4-5h | Medium | Can be picked up by either student |
| [#30](https://github.com/UC-OSPO-Network/education/issues/30) | Visual pathway roadmaps | 4-5h | Medium | Can be picked up by either student |

---

## 📈 Workload Summary

### ShouzhiWang
- **Milestone 1**: 13-16 hours (3 issues)
- **Milestone 2**: 8-11 hours (3 issues)
- **Milestone 3**: 4-6 hours (1 issue)
- **Total**: ~25-33 hours (7 issues)
- **Potential additions**: +1-2h if assigned #49

### giaari15
- **Milestone 1**: 13-16 hours (4 issues)
- **Milestone 2**: 5-7 hours (2 issues)
- **Milestone 3**: 4-5 hours (1 issue)
- **Total**: ~22-28 hours (7 issues)
- **Potential additions**: +2-3h if assigned #50

### Unassigned (Milestone 2)
- **#49**: 1-2h (learningResourceType)
- **#50**: 2-3h (audience personas)
- **#51**: 4-6h (Learning Objectives)
- **Total unassigned**: ~8-11 hours

### Unassigned (Milestone 3)
- **#29**: 4-5h (GitHub feedback system)
- **#30**: 4-5h (Visual pathways)

**Note**: With the 3 new Milestone 2 issues, there's flexibility in assignment:
- Assign all to students → each gets ~33-40 hours total
- Keep some unassigned for Tim or later
- Split #51 (Learning Objectives) between multiple people

---

## 🔄 Workflow & Collaboration

### Week 1 (Jan 20-26): Parallel Infrastructure Setup
**ShouzhiWang**: #40 (Keystatic setup)
**giaari15**: #41 (Content collections)
Both can work independently in parallel.

### Week 1-2 (Jan 27 - Feb 2): Integration & Migration
**ShouzhiWang**: #44 (Configure Keystatic)
**giaari15**: #42 (Migration script) → #46 (Audit tool)
Coordinate: #44 needs both #40 and #41 complete.

### Week 2 (Feb 3-9): App Updates & Testing
**ShouzhiWang**: #43 (Update app code)
**giaari15**: Finish #46 if needed, start Milestone 2
Coordinate: #43 needs #42 complete.

### Week 2-3 (Feb 10-16): Data Quality
**Both students**: Work through Milestone 2 issues
Can divide work or pair on difficult issues.

### Week 3-4 (Feb 17 - Mar 2): Features
**ShouzhiWang**: #28 (Lesson detail pages)
**giaari15**: #31 (Search improvements)
**Both**: Pick up #29 or #30 as capacity allows.

---

## 🎯 Critical Success Factors

### For Students
1. **Communicate blockers early** - Don't wait if stuck
2. **Submit PRs regularly** - Small, focused PRs easier to review
3. **Test thoroughly** - Run `npm run build` before submitting
4. **Document changes** - Update STUDENT_README as you go
5. **Help each other** - Share context and learnings

### For Tim (Reviewer)
1. **Quick PR reviews** - Try to review within 24 hours to unblock students
2. **Weekly check-ins** - Monitor milestone progress
3. **Adjust assignments** - Rebalance if someone gets stuck or finishes early
4. **Celebrate wins** - Acknowledge completed milestones

---

## 📋 Communication Guidelines

### Before Starting an Issue
- Comment on the issue: "Starting work on this"
- Ask questions if requirements unclear
- Check dependencies are complete

### While Working
- Push commits regularly (don't wait until done)
- Update issue with progress/blockers
- Ask for help if stuck >1 hour

### Submitting PR
- Link PR to issue (e.g., "Closes #40")
- Request review from @jt14den
- Add description of what changed and how to test
- Include screenshots for UI changes

### After PR Merged
- Close the issue
- Update milestone progress
- Start next issue

---

## 🔗 Quick Links

- [Milestones](https://github.com/UC-OSPO-Network/education/milestones)
- [Project Board](https://github.com/orgs/UC-OSPO-Network/projects)
- [Migration Plan](.github/MIGRATION_TO_KEYSTATIC.md)
- [Student README](../STUDENT_README.md)
- [Keystatic Docs](https://keystatic.com/docs)
- [Astro Content Collections Docs](https://docs.astro.build/en/guides/content-collections/)

---

## ❓ Questions or Issues?

- **Stuck on an issue?** Comment on the issue and @jt14den
- **Need clarification?** Ask in issue comments or team chat
- **Found a bug?** Create new issue with `bug` label
- **Have an idea?** Create new issue with `enhancement` label

---

**Last Updated**: 2026-01-19
**Next Review**: End of Week 1 (Jan 26)
