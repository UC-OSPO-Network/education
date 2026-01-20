# Outstanding Metadata Issues

**Analysis Date**: 2026-01-19/20
**Based On**: 32 "Keep" lessons

---

## 📊 Summary by Priority

| Issue | Field | Coverage | Priority | Complexity | Estimated Hours |
|-------|-------|----------|----------|------------|-----------------|
| ✅ Covered | `description` | 81% | Critical | Low | 2-3h (Issue #24) |
| ✅ Covered | `subTopic` | 6% | Critical | Medium | 2-3h (Issue #23) |
| ✅ Covered | `learnerCategory` | Some orphans | Critical | Low | 2-3h (Issue #25) |
| ✅ Covered | `dependsOn` | - | High | Medium | 2-3h (Issue #48) |
| 🔴 **NEW** | `learningResourceType` | 81% | High | Low | 1-2h |
| 🔴 **NEW** | `audience` | 81% | Medium | Medium | 2-3h |
| 🔴 **NEW** | `Learning Objectives` | 59% | Medium | High | 4-6h |
| 🟡 Lower | `teaches` | 69% | Medium | High | Covered by LOs |
| 🟡 Lower | `educationalLevel` | 91% | Low | Low | 30min |

---

## 🔴 High Priority: Missing Issues

### Issue A: Standardize learningResourceType

**Problem**:
- 6 lessons missing (19%)
- Current values are inconsistent
- Bioschemas expects controlled vocabulary

**Current values found**:
- "Tutorial"
- "Guide"
- "Course"
- "" (empty)

**Solution**: Use controlled vocabulary from Obsidian notes:
- Tutorial
- Guide
- Activity
- Course
- Webinar

**Affected lessons** (examples of missing):
- Building Community
- Leadership and Governance
- Social Coding and Open Source Collaboration
- (3 more)

**Acceptance Criteria**:
- [ ] All 32 lessons have learningResourceType
- [ ] Values use exact controlled vocabulary
- [ ] Update Google Sheet

**Estimated Time**: 1-2 hours

**Assigned To**: Could go to either student in Milestone 2

---

### Issue B: Standardize audience to Personas

**Problem**:
- 6 lessons missing (19%)
- Current values are inconsistent and generic
- From Obsidian: "Narrow Audience Categories: Refine the audience column into standardized personas"

**Current values** (samples):
- "Developers, PhD Students, Technical Writers"
- "Researchers, Open Science Contributors, Software Developers"
- "Beginners, Researchers, Software Developers"
- Too many combinations, not standardized

**Solution**: Define persona taxonomy

**Suggested Personas** (from patterns + Obsidian):
- PhD Students
- Research Software Engineers (RSEs)
- Researchers (General)
- Software Developers
- Postdocs
- Grant-Seeking Faculty
- Data Scientists
- Community Managers
- Project Maintainers

**Approach**:
1. Define canonical persona list (5-10 personas)
2. Map existing audience values to personas
3. Fill missing values
4. Allow multiple personas per lesson (comma-separated)

**Acceptance Criteria**:
- [ ] Define 5-10 canonical personas
- [ ] All 32 lessons have audience assigned
- [ ] Audience uses only canonical personas
- [ ] Update Google Sheet

**Estimated Time**: 2-3 hours

**Assigned To**: Good for Tim or a student in Milestone 2

---

### Issue C: Draft Learning Objectives

**Problem**:
- 13 lessons missing (41%)
- From Obsidian: "Ensure every lesson follows the pattern: 'After this lesson, the learner should be able to...'"
- Critical for learners to understand outcomes

**Current state**:
- 19 lessons have some form of Learning Objectives
- Many are bullet points, not standardized format
- Some are too vague

**Solution**: Draft standardized Learning Objectives

**Format** (from Obsidian):
> "After this lesson, the learner should be able to..."

**Example Good LO**:
```
After this lesson, the learner should be able to:
- Explain the concept of social coding
- Demonstrate collaboration workflows using GitHub
- Identify norms for effective participation in open source communities
```

**Approach**:
1. Review lesson content (URL)
2. Draft 3-5 specific, measurable outcomes
3. Use Bloom's taxonomy verbs (explain, demonstrate, apply, etc.)
4. Keep concise but descriptive

**Affected lessons** (missing LOs):
- Building Community
- Social Coding and Open Source Collaboration
- Introduction to Git
- How to Contribute to Open Source
- Starting an Open Source Project
- Finding Users for Your Project
- Metrics
- Best Practices for Maintainers
- (5 more)

**Acceptance Criteria**:
- [ ] All 32 lessons have Learning Objectives
- [ ] Format: "After this lesson, the learner should be able to..."
- [ ] 3-5 specific, measurable outcomes per lesson
- [ ] Use Bloom's taxonomy verbs
- [ ] Update Google Sheet

**Estimated Time**: 4-6 hours (requires reviewing lessons)

**Assigned To**: Could split between students or Tim in Milestone 2

**Note**: The `teaches` field (Bioschemas) can be auto-generated from Learning Objectives

---

## 🟡 Lower Priority Issues

### Issue D: Fill educationalLevel gaps

**Problem**: 3 lessons missing (9%)

**Missing from**:
- Introduction to Git
- How to Contribute to Open Source
- (1 more)

**Solution**: Review these 3 lessons and assign:
- Beginner
- Intermediate
- Advanced

**Estimated Time**: 30 minutes

**Can be bundled with another issue** or done quickly

---

## 🔄 Relationship to Existing Issues

### Already Covered ✅

| Existing Issue | Field | Status |
|----------------|-------|--------|
| #23 | subTopic | Assigned to Tim |
| #24 | description | Assigned to ShouzhiWang |
| #25 | learnerCategory orphans | Assigned to giaari15 |
| #48 | dependsOn (dependencies) | Assigned to giaari15 |

### Not Yet Covered 🔴

| New Issue | Field | Priority | Hours | Status |
|-----------|-------|----------|-------|--------|
| **#49** | learningResourceType | High | 1-2h | ✅ Created |
| **#50** | audience (personas) | Medium | 2-3h | ✅ Created |
| **#51** | Learning Objectives | Medium | 4-6h | ✅ Created |
| **D** | educationalLevel gaps | Low | 0.5h | Not yet created |

---

## 📋 Recommended Actions

### ✅ Issues Created (2026-01-19)

**Issue #49**: Standardize learningResourceType (1-2h, Milestone 2) - [Created](https://github.com/UC-OSPO-Network/education/issues/49)
**Issue #50**: Standardize audience to personas (2-3h, Milestone 2) - [Created](https://github.com/UC-OSPO-Network/education/issues/50)
**Issue #51**: Draft Learning Objectives for all lessons (4-6h, Milestone 2) - [Created](https://github.com/UC-OSPO-Network/education/issues/51)

**Total**: ~8-11 additional hours

**Assignment suggestion**:
- #49 → ShouzhiWang (quick, pairs with #24 descriptions)
- #50 → Tim or giaari15 (requires defining personas first)
- #51 → Split between both students OR Tim reviews/edits AI-drafted ones

---

### Option 2: Bundle with Existing Issues

**Bundle A**: Add learningResourceType to #24 (descriptions)
- Both are text fields, similar effort
- ShouzhiWang already working on content quality

**Bundle B**: Add audience to #25 (learnerCategory)
- Both are categorization tasks
- giaari15 already working on categories

**Bundle C**: Learning Objectives as separate issue
- Too substantial to bundle (4-6 hours)
- Could be Milestone 3 if time is tight

---

## 🎯 Impact Analysis

### Bioschemas Compliance Impact

**Current Bioschemas Status**:
- MINIMUM properties: ~95% compliant
- RECOMMENDED properties: ~80% compliant

**After addressing these issues**:
- MINIMUM: ~98% compliant (descriptions filled)
- RECOMMENDED: ~90% compliant
  - teaches ✅ (derived from Learning Objectives)
  - audience ✅ (standardized personas)
  - educationalLevel ✅ (gaps filled)

### User Experience Impact

**High Impact**:
- `learningResourceType`: Enables filtering by format (Tutorial vs Course vs Guide)
- `audience`: Better targeting ("Show me lessons for PhD students")
- `Learning Objectives`: Helps learners decide if lesson meets their needs

**Medium Impact**:
- `educationalLevel` gaps: Only 3 lessons affected
- `teaches`: Mostly derived from Learning Objectives

---

## 🤔 Questions for Tim

1. **Create 3 new issues** or **bundle with existing**?

2. **Learning Objectives**:
   - Should we draft these manually or use AI assistance?
   - Is Milestone 2 or 3 better timing?

3. **Audience personas**:
   - Do you have a preferred persona list?
   - Should we align with existing UC/NSF categories?

4. **Priority**: Are these blocking anything or can they be deferred to Milestone 3?

---

## 📊 Updated Milestone Workload (If All Added to Milestone 2)

### Current Milestone 2 Totals:
- ShouzhiWang: 8-11 hours (3 issues)
- giaari15: 5-7 hours (2 issues)

### If New Issues Added:
- **Option 1** (3 separate issues):
  - ShouzhiWang: +3h (if gets #49)
  - giaari15: +3h (if gets #50)
  - Either/Both: +6h (if split #51)
  - **New totals**: ~14-17h each

- **Option 2** (bundled):
  - ShouzhiWang: 8-11h (no change, bundled with #24)
  - giaari15: 5-7h (no change, bundled with #25)
  - New issue #51: +4-6h (Learning Objectives)

---

**Recommendation**: Create issues but assign to **Milestone 3** if Milestone 2 is already full. Learning Objectives are important but not blocking.
