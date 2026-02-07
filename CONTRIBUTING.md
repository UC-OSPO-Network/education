# Contributing to UC OSPO Education Website

## Welcome!

Welcome! We're glad you want to contribute to the UC OSPO Education Lesson & Pathways project! 💖

This project is part of the UC OSPO Network's education subgroup, working to curate and organize open source education resources from The Carpentries, CodeRefinery, and other sources.

As you get started, you're in the best position to give us feedback on areas of our project that we need help with including:

* Problems found during setting up a new developer environment
* Gaps in our documentation or README
* Issues with the lesson data or Google Sheets integration
* Bugs in our validation scripts or build process
* Ideas for improving lesson discovery and navigation

If anything doesn't make sense, or doesn't work when you run it, please open a bug report and let us know!

## Table of Contents

* [Ways to Contribute](#ways-to-contribute)
* [Come to Community Calls](#come-to-community-calls)
* [Finding an Issue](#finding-an-issue)
* [Setting Up a Dev Environment](#setting-up-a-dev-environment)
* [Running Tests](#running-tests)
* [Asking for Help](#asking-for-help)
* [Norms for Commits](#norms-for-commits)
* [Pull Request Lifecycle](#pull-request-lifecycle)
* [Code of Conduct](#code-of-conduct)

## Ways to Contribute

We welcome many different types of contributions, including:

* **Lesson Curation**: Help identify, review, and add lessons to our inventory
* **Content Enhancement**: Improve lesson descriptions, metadata, and categorization
* **Feature Development**: Build new features for lesson discovery and navigation
* **Data Quality**: Help validate and improve our Google Sheets data
* **Bug Fixes**: Fix issues in the build process, validation scripts, or site functionality
* **Documentation**: Improve our README, contributing guide, or inline documentation
* **Testing**: Help test PR previews and report issues
* **Web Design**: Enhance the visual design and user experience
* **Accessibility**: Improve accessibility features and compliance
* **Issue Triage**: Help organize and prioritize GitHub issues

Not everything happens through a GitHub pull request. Please come to our [education subgroup meetings](https://docs.google.com/document/d/1-CJxDt05f9YoYfGB8-NC0zvQZbEJzHT1P7keRciMlrY/edit?tab=t.0#heading=h.vs4sjkl9adbl) or open a [GitHub Discussion](https://github.com/UC-OSPO-Network/education/discussions) and let's discuss how we can work together.

## Come to Education Subgroup Meetings

Anyone interested in our project is welcome to join our [education subgroup meetings](https://docs.google.com/document/d/1-CJxDt05f9YoYfGB8-NC0zvQZbEJzHT1P7keRciMlrY/edit?tab=t.0#heading=h.vs4sjkl9adbl)! You never need an invite to join us. In fact, we want you to join us, even if you don't have anything you feel like you want to contribute. Just being there is enough!

Check our [meeting notes](https://docs.google.com/document/d/1-CJxDt05f9YoYfGB8-NC0zvQZbEJzHT1P7keRciMlrY/edit?tab=t.0#heading=h.vs4sjkl9adbl) for the meeting schedule, Zoom link, and past discussions.

You don't have to turn on your video. The first time you come, just introducing yourself is perfectly fine. Over time, we hope that you feel comfortable voicing your opinions, giving feedback on others' ideas, and even sharing your own ideas and experiences.

## Finding an Issue

We have good first issues for new contributors and help wanted issues suitable for any contributor:

* [good first issue](https://github.com/UC-OSPO-Network/education/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) - Issues with extra information to help you make your first contribution
* [help wanted](https://github.com/UC-OSPO-Network/education/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) - Issues suitable for any contributor

Sometimes there won't be any issues with these labels. That's ok! There is likely still something for you to work on. If you want to contribute but you don't know where to start or can't find a suitable issue, you can:

* Open a [GitHub Discussion](https://github.com/UC-OSPO-Network/education/discussions) asking where help is needed
* Comment on an existing issue asking if it's available to work on
* Join our [education subgroup meetings](https://docs.google.com/document/d/1-CJxDt05f9YoYfGB8-NC0zvQZbEJzHT1P7keRciMlrY/edit?tab=t.0#heading=h.vs4sjkl9adbl) and ask there

Once you see an issue that you'd like to work on, please post a comment saying that you want to work on it. Something like "I want to work on this" is fine.

## Setting up a Dev Environment

**Prerequisites:**
* Node.js (version 20 or higher)
* npm (Node Package Manager)
* Git

**Steps:**

1. Clone the project:

```shell
git clone https://github.com/UC-OSPO-Network/education.git
cd education
```

2. Install dependencies:

```shell
npm install
```

3. Start the development server:

```shell
npm run dev
```

This will start a local development server at `http://localhost:4321`.

## Running Tests

Before submitting your pull request, run these validation checks locally:

1. **Validate data source:**
   ```shell
   node .github/scripts/validate-data.mjs
   ```

2. **Run TypeScript type checking:**
   ```shell
   npx astro check
   ```

3. **Build the site:**
   ```shell
   npm run build
   ```

4. **Validate build output:**
   ```shell
   node .github/scripts/validate-build.mjs
   ```

5. **Check for broken links:**
   ```shell
   node .github/scripts/check-links.mjs
   ```

These checks run automatically on pull requests via GitHub Actions. Make sure they all pass locally to avoid failed PR checks.

## Asking for Help

The best way to reach us with a question when contributing is to ask on:

* **The original GitHub issue** - Comment on the issue you're working on
* **[GitHub Discussions](https://github.com/UC-OSPO-Network/education/discussions)** - For general questions
* **[Education subgroup meetings](https://docs.google.com/document/d/1-CJxDt05f9YoYfGB8-NC0zvQZbEJzHT1P7keRciMlrY/edit?tab=t.0#heading=h.vs4sjkl9adbl)** - Join us at our regular meetings

## Norms for Commits

We encourage clear, descriptive commit messages that explain what changed and why:

* Use present tense ("Add feature" not "Added feature")
* Use imperative mood ("Fix bug" not "Fixes bug")
* Include context when helpful ("Fix broken link in pathways page")
* Reference issues when applicable ("Fixes #123")

Optionally, consider using [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format (e.g., `feat:`, `fix:`, `docs:`) for consistency.

## Pull Request Lifecycle

### Before You Submit

When you submit your pull request, or push new commits to it, our automated systems will run validation checks on your code. We require that your pull request passes these checks before we can merge it. We recommend that you run the following locally before submitting:

* **Data validation** - Ensure Google Sheets data is accessible and valid
* **TypeScript check** - Run `npx astro check` to catch type errors
* **Build** - Run `npm run build` to ensure the site builds successfully
* **Critical pages** - Verify required pages exist after building
* **Link checking** - Ensure no broken internal links

All pull requests will automatically get a preview deployment via Vercel so reviewers can see your changes live.

#### When to Submit

Submit your pull request when you have a working implementation that addresses the issue or feature request. Your code should be tested and ready for review, even if you're open to suggestions for improvements.

#### Draft vs. Ready PRs

* Use **Draft PRs** when your work is incomplete or you want early feedback on your approach
* Convert to **Ready for Review** when your implementation is complete and tested
* Mark as ready even if you expect minor changes during review

#### Branch Strategy

Create a feature branch from the latest `main` branch. Use descriptive branch names like `feature/add-user-authentication` or `fix/memory-leak-in-parser`.

### Submission Process

#### PR Scope

We prefer **small, focused pull requests** that address a single issue or implement one feature. Large PRs are harder to review and more likely to conflict with other changes. If your feature is large, consider breaking it into multiple PRs.

#### Signaling Readiness

* Remove "Draft" status when ready for review
* Ensure all CI checks are passing
* Include a clear description of what the PR does and why
* Link to relevant issues using "Fixes #123" or "Addresses #456"

### Review Process

**Initial Review Timeline**: Expect an initial review within **3-5 business days**. Complex PRs may take longer.

**Follow-up Reviews**: After addressing feedback, expect follow-up reviews within **2-3 business days**.

#### Requesting Reviews

* After pushing changes, add a comment like "Ready for re-review" or "@mention" specific reviewers
* If your PR hasn't been reviewed after the expected timeline, add a polite comment requesting status
* For urgent fixes, mention the urgency in your comment

### Handling Common Situations

#### Stalled Pull Requests

If your PR appears stalled:

1. First, check if all feedback has been addressed
2. After 1 week of no activity, add a polite comment requesting status
3. If still no response after another week, reach out via [preferred communication channel]

#### Abandoned Pull Requests

If you can no longer continue work on your PR:

* Comment on the PR explaining the situation
* Maintainers may either:
    * Take over the PR and push additional commits to complete it
    * Close the PR and create a new issue for others to pick up
    * Close the PR if the change is no longer needed

#### Follow-up Work

* Small follow-up changes should be addressed in the same PR when possible
* Larger follow-ups or new issues discovered during review should be handled in separate issues/PRs
* Use "TODO" comments sparingly and create follow-up issues for any deferred work

### After Your PR is Merged

**Release Timeline**: Merged pull requests are included in the next release, which typically happens:

* **Patch releases**: Every 2-4 weeks for bug fixes
* **Minor releases**: Every 1-3 months for new features
* **Major releases**: As needed for breaking changes

#### Release Process

After merge, your changes will:

1. Be available immediately in the `main` branch
2. Go through additional testing in our staging environment
3. Be included in the next scheduled release
4. Be documented in the changelog with attribution

#### Staying Updated

Watch the repository to be notified when your contributions are released. We'll also tag you in release notes when your PR introduces significant changes.

---

*Questions about the PR process? Feel free to ask in the issue comments, discussions, or reach out to the maintainers directly.*

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) to understand the expectations for behavior within our community. We are committed to providing a welcoming and inclusive environment for all contributors.
