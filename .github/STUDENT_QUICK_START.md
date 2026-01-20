# Student Quick Start Guide 🚀

**Welcome ShouzhiWang and giaari15!**

This guide shows you exactly what to work on and in what order.

---

## 🎯 Week 1: Get Started (Jan 20-26)

### ShouzhiWang - Start Here

**Your First Issue**: [#40 - Set up Keystatic CMS](https://github.com/UC-OSPO-Network/education/issues/40)

**What to do**:
1. Clone the repo if you haven't: `git clone https://github.com/UC-OSPO-Network/education.git`
2. Create a new branch: `git checkout -b feature/keystatic-setup`
3. Follow the tasks in issue #40
4. Install Keystatic: `npm install @keystatic/core @keystatic/astro`
5. Create `keystatic.config.ts` in project root
6. Test that Keystatic admin UI loads at `/keystatic`
7. Submit PR when done, request review from @jt14den

**Time**: 4-6 hours
**Due**: Week 1

---

### giaari15 - Start Here

**Your First Issue**: [#41 - Set up Content Collections](https://github.com/UC-OSPO-Network/education/issues/41)

**What to do**:
1. Clone the repo if you haven't: `git clone https://github.com/UC-OSPO-Network/education.git`
2. Create a new branch: `git checkout -b feature/content-collections`
3. Follow the tasks in issue #41
4. Create `src/content/` directory and `config.ts`
5. Define Zod schema for lessons
6. Create 2-3 example lesson JSON files for testing
7. Submit PR when done, request review from @jt14den

**Time**: 3-4 hours
**Due**: Week 1

---

## 📋 Full Assignment List

### ShouzhiWang's Issues

**Milestone 1 (Due Feb 2)**:
- ✅ [#40](https://github.com/UC-OSPO-Network/education/issues/40) - Set up Keystatic CMS (4-6h) ← **START HERE**
- [ ] [#44](https://github.com/UC-OSPO-Network/education/issues/44) - Configure Keystatic (4-5h) - *After #40 & #41*
- [ ] [#43](https://github.com/UC-OSPO-Network/education/issues/43) - Update app code (5-6h) - *After #42*

**Milestone 2 (Due Feb 16)**:
- [ ] [#23](https://github.com/UC-OSPO-Network/education/issues/23) - Add subTopics (2-3h)
- [ ] [#24](https://github.com/UC-OSPO-Network/education/issues/24) - Write descriptions (2-3h)
- [ ] [#45](https://github.com/UC-OSPO-Network/education/issues/45) - CI/CD validation (4-5h)

**Milestone 3 (Due Mar 2)**:
- [ ] [#28](https://github.com/UC-OSPO-Network/education/issues/28) - Lesson detail pages (4-6h)

**Total**: ~25-33 hours

---

### giaari15's Issues

**Milestone 1 (Due Feb 2)**:
- ✅ [#41](https://github.com/UC-OSPO-Network/education/issues/41) - Set up content collections (3-4h) ← **START HERE**
- [ ] [#42](https://github.com/UC-OSPO-Network/education/issues/42) - Migration script (4-5h) - *After #41*
- [ ] [#46](https://github.com/UC-OSPO-Network/education/issues/46) - Audit tool (3-4h) - *After #42*

**Milestone 2 (Due Feb 16)**:
- [ ] [#25](https://github.com/UC-OSPO-Network/education/issues/25) - Assign categories (2-3h)
- [ ] [#26](https://github.com/UC-OSPO-Network/education/issues/26) - Find Getting Started lessons (3-4h)

**Milestone 3 (Due Mar 2)**:
- [ ] [#31](https://github.com/UC-OSPO-Network/education/issues/31) - Improve search (4-5h)

**Total**: ~20-25 hours

---

## 🔄 How to Work on Issues

### 1. Before Starting
```bash
# Make sure you're on the latest main branch
git checkout main
git pull origin main

# Create a new branch for your issue
git checkout -b feature/issue-40-keystatic-setup
```

### 2. While Working
- Comment on the issue: "Starting work on this"
- Push commits regularly: `git push origin feature/issue-40-keystatic-setup`
- Ask questions if stuck: Comment on the issue or tag @jt14den

### 3. When Ready for Review
```bash
# Make sure everything builds
npm run build

# Push final changes
git add .
git commit -m "feat: set up Keystatic CMS (#40)"
git push origin feature/issue-40-keystatic-setup
```

### 4. Create Pull Request
- Go to GitHub and create PR
- Link to issue in description: "Closes #40"
- Request review from @jt14den
- Add description of what you changed

---

## 🆘 Getting Help

### If You're Stuck (>1 hour on same problem)
1. Comment on the issue describing the problem
2. Tag @jt14den for help
3. Share error messages or screenshots

### Common Commands
```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Check for errors
npx astro check

# Build site
npm run build

# See all issues assigned to you
gh issue list --assignee @me

# See milestone progress
gh milestone list
```

---

## 📚 Important Resources

- **Full Assignment Details**: [.github/MILESTONE_ASSIGNMENTS.md](.github/MILESTONE_ASSIGNMENTS.md)
- **Migration Plan**: [.github/MIGRATION_TO_KEYSTATIC.md](.github/MIGRATION_TO_KEYSTATIC.md)
- **Student README**: [STUDENT_README.md](../STUDENT_README.md)
- **Milestones**: https://github.com/UC-OSPO-Network/education/milestones
- **Keystatic Docs**: https://keystatic.com/docs
- **Astro Docs**: https://docs.astro.build

---

## ✅ Success Tips

1. **Start with your Week 1 issue** (#40 for ShouzhiWang, #41 for giaari15)
2. **Read the issue carefully** - All instructions are in the issue description
3. **Check the "References" section** in each issue for helpful docs
4. **Ask questions early** - Don't stay stuck for hours
5. **Push commits often** - You won't lose work
6. **Test before submitting** - Run `npm run build` to catch errors
7. **Help each other** - Share learnings in comments or team chat

---

## 🎉 Milestone Goals

**By Feb 2**: Complete migration from Google Sheets to Keystatic
**By Feb 16**: All lessons have complete, quality metadata
**By Mar 2**: Site has lesson pages and better search

---

**Questions?** Comment on your assigned issue or tag @jt14den

**Good luck! 🚀**
