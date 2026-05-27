# Gemini Prompt: Evaluate and Improve UC OSPO Lesson Metadata

Copy everything below the horizontal rule into Gemini.

---

I maintain a lesson catalog for the UC Open Source Program Office (UC OSPO) education site. The catalog contains 40 lessons covering open source practices, research software engineering, and institutional open source policy.

I need you to evaluate and improve metadata quality across the catalog. Return a JSON object keyed by lesson slug — only include slugs where you are making changes. For each slug, include only the fields you are changing.

## Fields to evaluate and improve

### 1. `teaches` (highest priority — many are blank)
A single sentence starting with an action verb describing the core skill or outcome. Be specific to the lesson content, not generic. Under 120 characters. Examples of good values:
- "Apply accessibility best practices to open source projects"
- "Navigate the legal aspects of open source licensing and contribution"

### 2. `competencyRequired`
Normalize to a comma-separated list of plain-text tags from this controlled set only:
`Git`, `GitHub`, `Command line`, `Python`, `R`, `Docker`, `CI/CD`, `Markdown`, `Open source basics`, `Maintainer experience`, `Contribution experience`

Use an empty string if none apply. Do not invent new tags outside this list.

### 3. `keywords`
Replace with 3–6 clean, lowercase keyword strings relevant to the lesson. Remove raw git tags (e.g., "english packaging pip python"), duplicates, and unhelpful terms. Focus on what a learner would search for.

### 4. `description`
Only flag if the current description is clearly wrong (e.g., still refers to a renamed lesson) or is copied from the wrong source. Keep changes minimal — descriptions are often accurate. Under 160 characters.

### 5. `educationalLevel`
Flag only clear errors. Valid values: `Beginner`, `Intermediate`, `Advanced`.

### 6. Flags (do not change — just note)
In a separate `"_flags"` key per slug, note any of:
- `duplicate`: this lesson appears to be the same content as another slug (note which)
- `bad-prereq`: a prerequisite seems logically wrong (note why)
- `misassigned-pathway`: the pathway seems wrong for this lesson's level/content

## Rules
- Return only the slugs you are changing or flagging
- Only include fields you are actually changing within each slug
- Do not invent content — base `teaches` on the lesson name, description, and URL
- `competencyRequired` must only use tags from the controlled list above
- For `_flags`, use it even if you are not changing any other fields for that slug

## Output format

```json
{
  "slug-of-lesson": {
    "teaches": "...",
    "competencyRequired": "...",
    "keywords": ["...", "..."],
    "_flags": {
      "duplicate": "same-content-as-other-slug",
      "bad-prereq": "explanation",
      "misassigned-pathway": "explanation"
    }
  }
}
```

---

## Full lesson catalog (40 lessons)

```
slug: accessibility-best-practices-for-your-project
  name: Accessibility Best Practices for Your Project
  url: https://opensource.guide/accessibility-best-practices-for-your-project/
  domain: General Open Source | level: Intermediate | duration: 15min
  pathway: ['maintaining'] | isPartOf: Open Source Guides
  description: Practical, actionable steps to make your open source project usable by everyone, especially people with disabilities.
  competencyRequired: GitHub, open source project experience
  keywords: ['accessibility', 'WCAG', 'disability', 'inclusion', 'documentation']
  teaches: Apply accessibility best practices to open source projects
  prerequisites: ['best-practices-for-maintainers']

slug: best-practices-for-maintainers
  name: Best Practices for Maintainers
  url: https://opensource.guide/best-practices/
  domain: General Open Source | level: Intermediate | duration: 14min
  pathway: ['maintaining'] | isPartOf: Open Source Guides
  description: Making your life easier as an open source maintainer, from documenting processes to leveraging your community.
  competencyRequired: (empty)
  keywords: ['best practices', 'maintainers', 'community']
  teaches: (empty)
  prerequisites: ['introduction-to-git']

slug: building-better-research-software
  name: Building Better Research Software
  url: https://carpentries-incubator.github.io/better-research-software/
  domain: Research Software | level: Intermediate | duration: 11min
  pathway: ['maintaining'] | isPartOf: (empty)
  description: This short course is teaching tools and practices for producing and sharing quality, sustainable and FAIR software.
  competencyRequired: (empty)
  keywords: ['FAIR software', 'research software', 'reproducibility', 'software engineering', 'open science']
  teaches: Explain key principles of open and reproducible research; Analyse software for maintainability and reuse; Apply professional software development workflows; Design modular and extensible software; Design and implement testing and documentation practices; Evaluate software projects for openness and sustainability; Select appropriate tools for collaborative research software development.
  prerequisites: ['introduction-to-git']

slug: building-community
  name: Building Community
  url: https://opensource.guide/building-community/
  domain: General Open Source | level: Intermediate | duration: 14min
  pathway: ['building-communities'] | isPartOf: Open Source Guides
  description: Building a healthy community helps your project thrive. Learn how to foster collaboration and inclusivity.
  competencyRequired: (empty)
  keywords: ['community', 'collaboration', 'inclusivity']
  teaches: Foster inclusive and engaged open source communities
  prerequisites: ['social-coding-and-open-source-collaboration']

slug: cicd-for-research-software-with-gitlab-ci
  name: CI/CD for Research Software with GitLab CI
  url: https://hsf-training.github.io/hsf-training-cicd/
  domain: Research Software | level: Intermediate | duration: 9min
  pathway: ['maintaining'] | isPartOf: HSF Training CI/CD Series
  description: This lesson covers the implementation of CI/CD pipelines in research software projects using GitLab CI.
  competencyRequired: Git, CI/CD concepts, research software development
  keywords: ['CI/CD', 'GitLab CI', 'continuous integration', 'continuous delivery', 'research software']
  teaches: The student will be able to set up and automate CI/CD pipelines for research software using GitLab CI.
  prerequisites: ['unit-testing-and-tdd-in-python']

slug: code-of-conduct
  name: Your Code of Conduct
  url: https://opensource.guide/code-of-conduct/
  domain: General Open Source | level: Intermediate | duration: 10min
  pathway: ['building-communities'] | isPartOf: Open Source Guides
  description: Facilitate healthy and constructive community behavior by adopting and enforcing a code of conduct.
  competencyRequired: Open source project experience
  keywords: ['code of conduct', 'community standards', 'enforcement', 'harassment', 'inclusion']
  teaches: Establish and enforce a code of conduct for an open source project
  prerequisites: ['building-community']

slug: collaboration-in-open-research-projects
  name: Collaboration in Open Research Projects
  url: https://book.the-turing-way.org/collaboration/collaboration
  domain: Research Software | level: Intermediate | duration: 2min
  pathway: ['contributing'] | isPartOf: The Turing Way
  description: This lesson introduces collaboration in open research projects using Git and GitHub.
  competencyRequired: Basic understanding of Git, GitHub, and collaborative work in research
  keywords: ['collaboration', 'Git', 'GitHub', 'open science', 'research']
  teaches: The student will be able to use Git and GitHub for collaborative research, manage contributions, and follow best practices for open science.
  prerequisites: ['introduction-to-git']

slug: collaborative-git-for-teams
  name: Collaborative Git for Teams
  url: https://coderefinery.github.io/git-collaborative/
  domain: General Open Source | level: Intermediate | duration: 6min
  pathway: ['contributing'] | isPartOf: CodeRefinery Git Training Series
  description: This lesson explains how to use Git for collaborative software development, focusing on branching and merging.
  competencyRequired: Git, version control
  keywords: ['Git', 'version control', 'collaboration', 'branching', 'merging']
  teaches: The student will be able to use Git collaboratively, manage branches, resolve merge conflicts, and set up Git workflows for team projects.
  prerequisites: ['introduction-to-git']

slug: continuous-integration-and-delivery-with-github-actions
  name: Continuous Integration and Delivery with GitHub Actions
  url: https://intersect-training.org/CI-CD/
  domain: General Open Source | level: Intermediate | duration: 2min
  pathway: ['maintaining'] | isPartOf: DevOps Essentials Series
  description: This lesson covers how to set up continuous integration and continuous delivery pipelines using GitHub Actions.
  competencyRequired: Git, CI/CD concepts, software development
  keywords: ['CI', 'CD', 'continuous integration', 'continuous delivery', 'GitHub Actions', 'automation']
  teaches: The student will be able to set up CI/CD pipelines for their projects and automate tests, builds, and deployments.
  prerequisites: ['testing-and-test-driven-development']

slug: effective-code-review
  name: Effective Code Review
  url: https://intersect-training.org/Code-Review/
  domain: General Open Source | level: Intermediate | duration: 5min
  pathway: ['maintaining'] | isPartOf: Collaborative Development Series
  description: This lesson teaches best practices for conducting and participating in code reviews.
  competencyRequired: Git, collaborative coding
  keywords: ['code review', 'software development', 'feedback', 'Git']
  teaches: The student will be able to conduct a code review, provide constructive feedback, and manage changes.
  prerequisites: ['collaborative-git-for-teams']

slug: finding-users-for-your-project
  name: Finding Users for Your Project
  url: https://opensource.guide/finding-users/
  domain: General Open Source | level: Beginner | duration: 9min
  pathway: ['maintaining'] | isPartOf: Open Source Guides
  description: Launching a successful open source project involves more than just code. Start your journey here.
  competencyRequired: (empty)
  keywords: ['users', 'adoption', 'promotion']
  teaches: (empty)
  prerequisites: ['best-practices-for-maintainers']

slug: getting-paid-for-open-source-work
  name: Getting Paid for Open Source Work
  url: https://opensource.guide/getting-paid/
  domain: General Open Source | level: Intermediate | duration: 12min
  pathway: ['strategic'] | isPartOf: Open Source Guides
  description: Sustain your work in open source by getting financial support for your time or your project.
  competencyRequired: Open source contribution experience
  keywords: ['funding', 'sustainability', 'grants', 'sponsorship', 'open source business models']
  teaches: Identify and pursue financial sustainability strategies for open source work
  prerequisites: ['starting-an-open-source-project']

slug: how-to-contribute-to-open-source
  name: Finding and Evaluating Projects
  url: https://opensource.guide/how-to-contribute/
  domain: General Open Source | level: Beginner | duration: 24min
  pathway: ['getting-started'] | isPartOf: Open Source Guides
  description: Learn how to find your first project using discovery tools, understanding labels, and identifying beginner-friendly tasks.
  competencyRequired: (empty)
  keywords: ['Contributing']
  teaches: (empty)
  prerequisites: ['best-practices-for-maintainers']

slug: intermediate-python-development
  name: Intermediate Python Development
  url: https://carpentries-incubator.github.io/python-intermediate-development/
  domain: Research Software | level: Intermediate | duration: 16min
  pathway: ['maintaining'] | isPartOf: Carpentries Incubator Python Training Series
  description: This lesson covers intermediate Python development skills such as writing reusable code, testing, virtual environments.
  competencyRequired: Basic Python programming skills
  keywords: ['Python', 'software development', 'testing', 'virtual environments', 'packaging']
  teaches: Intermediate skills in collaborative research software development, including version control, testing, packaging, documentation, and sustainable coding practices using Python.
  prerequisites: ['introduction-to-git']

slug: intermediate-research-software-development-skills-python-lesson-material
  name: Intermediate Research Software Development Skills (Python) Lesson Material
  url: https://carpentries-incubator.github.io/python-intermediate-development/
  domain: Research Software | level: Intermediate | duration: 16min
  pathway: ['maintaining'] | isPartOf: (empty)
  description: This course aims to teach a core set of established, intermediate-level software development skills and best practices for working as part of a team in a research environment.
  competencyRequired: (empty)
  keywords: ['training training-materials software-development carpentry-lesson python software-engineering-research intermediate software-design']
  teaches: (empty)
  prerequisites: ['modular-programming-with-python']

slug: introduction-to-docker-for-research-note-this-is-now-called-introduction-to-docker-and-podman
  name: Introduction to Docker and Podman
  url: https://hsf-training.github.io/hsf-training-docker/index.html
  domain: Research Software | level: Beginner | duration: 6min
  pathway: ['maintaining'] | isPartOf: HSF Training Series
  description: This lesson covers the fundamentals of Docker, including creating containers, managing Docker images, and using Docker for software reproducibility.
  competencyRequired: Basic understanding of software development and command line usage
  keywords: ['Docker', 'containers', 'reproducibility', 'software deployment', 'research']
  teaches: The student will be able to create, manage, and share Docker containers for software development and reproducible research.
  prerequisites: []

slug: introduction-to-git
  name: Introduction to Git
  url: https://coderefinery.github.io/git-intro/
  domain: General Open Source | level: Beginner | duration: 10min
  pathway: ['getting-started'] | isPartOf: CodeRefinery Git Training Series
  description: This lesson introduces Git, a distributed version control system, and teaches how to use it to track changes and collaborate.
  competencyRequired: Basic understanding of the command line
  keywords: ['Git', 'version control', 'repositories', 'project management']
  teaches: The student will be able to use Git for version control, create and manage repositories, and track changes in a project.
  prerequisites: ['understanding-software-licensing']

slug: issue-tracking-with-github
  name: Issue Tracking with GitHub
  url: https://intersect-training.org/Issue-Tracking/
  domain: General Open Source | level: Intermediate | duration: 5min
  pathway: ['contributing'] | isPartOf: Software Development Essentials
  description: This lesson covers the basics of issue tracking for software projects using GitHub Issues.
  competencyRequired: GitHub, issue tracking systems
  keywords: ['GitHub', 'issue tracking', 'project management', 'bugs', 'features']
  teaches: The student will be able to manage issues in a software development project using GitHub Issues.
  prerequisites: ['best-practices-for-maintainers']

slug: leadership-and-governance
  name: Leadership and Governance
  url: https://opensource.guide/leadership-and-governance/
  domain: General Open Source | level: Advanced | duration: 11min
  pathway: ['building-communities'] | isPartOf: Open Source Guides
  description: Effective leadership and governance ensure long-term success for your open source project.
  competencyRequired: (empty)
  keywords: ['leadership', 'governance', 'project management', 'community']
  teaches: How to design transparent governance structures, set project policies, and lead open source communities effectively.
  prerequisites: ['building-community']

slug: maintaining-balance-for-open-source-maintainers
  name: Maintaining Balance for Open Source Maintainers
  url: https://opensource.guide/maintaining-balance-for-open-source-maintainers/
  domain: General Open Source | level: Intermediate | duration: 10min
  pathway: ['maintaining'] | isPartOf: Open Source Guides
  description: Tips for self-care and avoiding burnout as a maintainer.
  competencyRequired: Open source maintainer experience
  keywords: ['burnout', 'self-care', 'sustainability', 'maintainer health', 'work-life balance']
  teaches: Recognize and prevent maintainer burnout through sustainable practices
  prerequisites: ['best-practices-for-maintainers']

slug: making-good-pull-requests
  name: Making Your First Pull Request
  url: https://intersect-training.org/Making-Good-PRs/
  domain: General Open Source | level: Beginner | duration: 5min
  pathway: ['getting-started'] | isPartOf: Open Source Collaboration Series
  description: A step-by-step walkthrough covering forking, cloning, feature branches, and responding to code review feedback.
  competencyRequired: Git, version control
  keywords: ['Git', 'pull requests', 'version control', 'collaboration']
  teaches: The student will be able to create clear and well-structured pull requests for software projects.
  prerequisites: ['social-coding-and-open-source-collaboration']

slug: metrics
  name: Metrics
  url: https://opensource.guide/metrics/
  domain: General Open Source | level: Intermediate | duration: 6min
  pathway: ['maintaining'] | isPartOf: Open Source Guides
  description: Tracking the success of your project helps you make informed decisions and communicate impact effectively.
  competencyRequired: (empty)
  keywords: ['metrics', 'project success', 'impact']
  teaches: (empty)
  prerequisites: ['building-community']

slug: modular-programming-with-python
  name: Modular Programming with Python
  url: https://coderefinery.github.io/modular-type-along/
  domain: Research Software | level: Intermediate | duration: 3min
  pathway: ['maintaining'] | isPartOf: CodeRefinery Python Series
  description: This lesson covers modular programming in Python, writing reusable code in modules and organizing codebases.
  competencyRequired: Basic understanding of Python programming
  keywords: ['modular programming', 'Python', 'software development', 'collaboration']
  teaches: The student will be able to write modular Python code, organize it into reusable components, and test it for maintainability.
  prerequisites: ['introduction-to-git']

slug: python-package-development-best-practices
  name: Python Package Development Best Practices
  url: https://education.molssi.org/python-package-best-practices/
  domain: Research Software | level: Intermediate | duration: 11min
  pathway: ['maintaining'] | isPartOf: MolSSI Python Best Practices Series
  description: This lesson covers best practices for building Python packages, focusing on scientific software.
  competencyRequired: Intermediate knowledge of Python and package management
  keywords: ['Python', 'packaging', 'best practices', 'dependencies', 'testing', 'PyPI']
  teaches: The student will be able to structure Python packages, write tests, manage dependencies, and publish scientific software on PyPI.
  prerequisites: ['python-packaging-for-beginners']

slug: python-packaging
  name: Python Packaging
  url: https://carpentries-incubator.github.io/python_packaging
  domain: General Open Source | level: Intermediate | duration: 2min
  pathway: ['maintaining'] | isPartOf: (empty)
  description: This lesson teaches how to create and publish packages in Python.
  competencyRequired: (empty)
  keywords: ['english packaging pip python']
  teaches: (empty)
  prerequisites: ['collaborative-git-for-teams']

slug: python-packaging-for-beginners
  name: Python Packaging for Beginners
  url: https://intersect-training.org/packaging/
  domain: Research Software | level: Intermediate | duration: 14min
  pathway: ['maintaining'] | isPartOf: Python for Developers Series
  description: This lesson teaches the essential steps for packaging Python projects and publishing them on PyPI.
  competencyRequired: Python, setuptools
  keywords: ['Python', 'setuptools', 'PyPI', 'packaging']
  teaches: The student will be able to package Python projects and upload them to PyPI.
  prerequisites: ['modular-programming-with-python']

slug: r-packaging
  name: R Packaging
  url: https://carpentries-incubator.github.io/lesson-R-packaging/
  domain: Data Science | level: Beginner | duration: 2min
  pathway: ['maintaining'] | isPartOf: (empty)
  description: This workshop will provide you with the basics for writing your own packages in R.
  competencyRequired: (empty)
  keywords: ['lesson-materials lessons-page best-practices r']
  teaches: (empty)
  prerequisites: ['introduction-to-git']

slug: reproducible-computational-environments-using-containers
  name: Reproducible Computational Environments using Containers
  url: https://carpentries-incubator.github.io/docker-introduction/
  domain: Research Software | level: Beginner | duration: 25min
  pathway: ['maintaining'] | isPartOf: (empty)
  description: This session introduces the use of Docker containers for reproducible computational research.
  competencyRequired: (empty)
  keywords: ['docker english containers hacktoberfest']
  teaches: (empty)
  prerequisites: ['introduction-to-docker-for-research-note-this-is-now-called-introduction-to-docker-and-podman']

slug: reproducible-research
  name: Reproducible Research
  url: https://book.the-turing-way.org/reproducible-research/reproducible-research
  domain: Research Software | level: Intermediate | duration: 2min
  pathway: ['maintaining'] | isPartOf: The Turing Way
  description: This lesson covers the principles of reproducible research, including data management and version control.
  competencyRequired: Basic understanding of research methodologies and tools for reproducibility
  keywords: ['reproducible research', 'version control', 'data management', 'open science']
  teaches: The student will be able to apply best practices for reproducible research using Git for version control and managing research data.
  prerequisites: ['introduction-to-git']

slug: research-software-engineering-with-python-course
  name: Research Software Engineering with Python Course
  url: https://alan-turing-institute.github.io/rse-course/html/index.html
  domain: Research Software | level: Intermediate | duration: 13min
  pathway: ['maintaining'] | isPartOf: Research Software Engineering Course
  description: This course provides an overview of key skills for Research Software Engineers, including software design and version control.
  competencyRequired: Basic understanding of research software development
  keywords: ['research software', 'RSE', 'version control', 'testing', 'project management']
  teaches: The student will be able to apply software development best practices, use version control, write tests, and manage research software projects.
  prerequisites: ['modular-programming-with-python']

slug: security-best-practices-for-your-project
  name: Security Best Practices for Your Project
  url: https://opensource.guide/security-best-practices-for-your-project/
  domain: General Open Source | level: Intermediate | duration: 9min
  pathway: ['maintaining'] | isPartOf: Open Source Guides
  description: Strengthen your project's future by building trust through essential security practices.
  competencyRequired: GitHub, open source project experience
  keywords: ['security', 'MFA', 'code scanning', 'dependencies', 'vulnerability reporting']
  teaches: Implement essential security practices for open source projects
  prerequisites: ['best-practices-for-maintainers']

slug: social-coding-and-open-source-collaboration
  name: Social Coding and Inclusive Communication
  url: https://coderefinery.github.io/social-coding/
  domain: General Open Source | level: Beginner | duration: 6min
  pathway: ['getting-started'] | isPartOf: CodeRefinery Open Source Collaboration Series
  description: Understand the human side of open source, including respectful communication and the release early, often mindset.
  competencyRequired: Basic understanding of Git and GitHub
  keywords: ['social coding', 'GitHub', 'open source', 'collaboration', 'developer community']
  teaches: The student will be able to collaborate on open source projects and engage constructively with the developer community.
  prerequisites: ['how-to-contribute-to-open-source']

slug: starting-an-open-source-project
  name: Starting an Open Source Project
  url: https://opensource.guide/starting-a-project/
  domain: General Open Source | level: Beginner | duration: 16min
  pathway: ['maintaining'] | isPartOf: Open Source Guides
  description: Launching a successful open source project involves more than just code. Start your journey here.
  competencyRequired: (empty)
  keywords: ['starting', 'open source', 'launch']
  teaches: (empty)
  prerequisites: ['introduction-to-git']

slug: testing-and-test-driven-development
  name: Testing and Test-Driven Development
  url: https://coderefinery.github.io/testing/
  domain: General Open Source | level: Intermediate | duration: 6min
  pathway: ['maintaining'] | isPartOf: CodeRefinery Software Development Series
  description: This lesson covers how to write tests for your code and apply test-driven development using pytest.
  competencyRequired: Python, basic understanding of software development
  keywords: ['testing', 'test-driven development', 'Python', 'pytest']
  teaches: The student will be able to write unit tests and apply test-driven development practices using pytest.
  prerequisites: ['introduction-to-git']

slug: the-legal-side-of-open-source
  name: The Legal Side of Open Source
  url: https://opensource.guide/legal/
  domain: Institutional Policy | level: Intermediate | duration: 18min
  pathway: ['licensing'] | isPartOf: Open Source Guides
  description: Everything you've ever wondered about the legal side of open source, and a few things you didn't.
  competencyRequired: Open source basics, Understanding Software Licensing
  keywords: ['licensing', 'legal', 'contributor agreements', 'copyright', 'compliance']
  teaches: Navigate the legal aspects of open source licensing, contribution agreements, and compliance
  prerequisites: ['understanding-software-licensing']

slug: understanding-software-licensing
  name: Understanding Software Licensing
  url: https://intersect-training.org/software-licensing/
  domain: Institutional Policy | level: Beginner | duration: 5min
  pathway: ['getting-started'] | isPartOf: Open Source Essentials Series
  description: This lesson provides an overview of common open-source software licenses, their conditions, and how to choose the right one.
  competencyRequired: Understanding of software development and open source concepts
  keywords: ['software licenses', 'open source', 'legal', 'GPL', 'MIT']
  teaches: The student will be able to identify different types of software licenses and apply the correct license to their project.
  prerequisites: ['your-first-web-contribution']

slug: unit-testing-and-tdd-in-python
  name: Unit Testing and TDD in Python
  url: https://intersect-training.org/testing/instructor/
  domain: Research Software | level: Intermediate | duration: 5min
  pathway: ['maintaining'] | isPartOf: Software Quality Assurance Series
  description: This lesson covers how to write and run unit tests in Python and introduces test-driven development.
  competencyRequired: Python, basic understanding of software development
  keywords: ['testing', 'unit tests', 'Python', 'TDD']
  teaches: The student will be able to write and run unit tests in Python and understand the principles of test-driven development.
  prerequisites: ['modular-programming-with-python']

slug: what-is-open-source
  name: What is Open Source?
  url: https://opensource.guide/starting-a-project/#what-does-open-source-mean
  domain: General Open Source | level: Beginner | duration: 10min
  pathway: ['getting-started'] | isPartOf: Open Source Guides
  description: An introduction to the four freedoms of software, the benefits of FOSS in education and industry, and the core principles of transparency and community.
  competencyRequired: (empty)
  keywords: ['FOSS', 'open source', 'transparency', 'community']
  teaches: (empty)
  prerequisites: []

slug: writing-documentation-for-software-projects
  name: Writing Documentation for Software Projects
  url: https://intersect-training.org/Documentation/
  domain: General Open Source | level: Intermediate | duration: 5min
  pathway: ['contributing'] | isPartOf: Software Development Essentials
  description: This lesson teaches how to write effective software documentation, including API docs, user guides, and installation instructions.
  competencyRequired: Markdown, basic understanding of software development
  keywords: ['documentation', 'Sphinx', 'Markdown', 'API documentation']
  teaches: The student will be able to write comprehensive documentation for software projects using Sphinx and Markdown.
  prerequisites: ['best-practices-for-maintainers']

slug: your-first-web-contribution
  name: Your First Web Contribution
  url: https://github.com/firstcontributions/first-contributions
  domain: General Open Source | level: Beginner | duration: 15min
  pathway: ['getting-started'] | isPartOf: (empty)
  description: Build confidence by making a real open source contribution using only your web browser. No technical setup or Git installation required.
  competencyRequired: (empty)
  keywords: ['quick win', 'browser-based', 'contribution', 'first-timers']
  teaches: (empty)
  prerequisites: ['what-is-open-source']
```
