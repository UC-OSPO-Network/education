# UC OSPO Education Lesson & Pathways Website

Work regarding the education subgroup. This repository hosts the Astro-based website for the UC OSPO Education Lesson & Pathways.

- [Draft inventory of lessons](https://docs.google.com/spreadsheets/d/1JqM5OYX4f-T0jR-GJ5UeI7PnGJP6o4jtPRNtDJUGPmI/edit?gid=1792935546#gid=1792935546) - lessons pulled from existing Carpentries & Code Refinery.
- [Process we are following](https://docs.google.com/document/d/1D4tCqMkB6-QTdvCSR2N-6VZSSUUOQZ87Kl4UEsuHeRs/edit?tab=t.0#heading=h.yyzjiyx43ln0) - these are converted to issues in the GH project.
- [Meeting notes](https://docs.google.com/document/d/1-CJxDt05f9YoYfGB8-NC0zvQZbEJzHT1P7keRciMlrY/edit?tab=t.0#heading=h.vs4sjkl9adbl)

## ✨ Features

- **Comprehensive Lesson Library**: Browse open source education lessons from The Carpentries, CodeRefinery, and other sources
- **Learning Pathways**: Curated sequences of lessons organized by topic and skill level
- **Keystatic Integration**: Built-in Admin UI for managing lessons and pathways content
- **Legacy Data Import**: Migration scripts available to import content from Google Sheets
- **Advanced Search & Filtering**: Find lessons by topic, source, duration, and difficulty level
- **Responsive Design**: Optimized experience across desktop, tablet, and mobile devices
- **Automated Quality Checks**: Built-in validation for data quality, links, and build integrity

## 🚀 Getting Started

This project was built with [Astro](https://astro.build/).

### Prerequisites

- Node.js (version 20 or higher)
- npm (Node Package Manager)
- Git for version control
- Basic familiarity with:
  - Command line interface
  - Astro framework (helpful but not required)
  - TypeScript (for contributing to the codebase)

### Installation

1.  **Clone the project:**
    ```bash
    git clone https://github.com/UC-OSPO-Network/education.git
    ```
2.  **Go to the project directory:**
    ```bash
    cd education
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running Validation Checks

The project includes automated validation scripts to ensure data quality and build integrity:

```bash
# Run TypeScript type checking
npx astro check

# Build the site
npm run build
```

These checks run automatically on pull requests via GitHub Actions.

### Run Locally

To run the project locally in development mode:

```bash
npm run dev
```

This will start a local development server, usually at `http://localhost:4321`.

### Deployment

This project is configured for deployment to GitHub Pages via GitHub Actions:
- **Production**: Automatically deploys from the `main` branch to GitHub Pages
- **PR Previews**: Pull requests automatically generate preview deployments via Vercel

The deployment workflow runs validation checks, builds the site, and publishes to GitHub Pages whenever changes are pushed to main.

## 📝 Usage

### Browsing Lessons

Visit the live site to explore the lesson library:
1. **Browse by Category**: Navigate through different topics and skill areas
2. **Search**: Use the search functionality to find specific lessons
3. **Filter**: Narrow results by source, duration, difficulty, or topic
4. **Learning Pathways**: Follow curated sequences of lessons

### Updating Content

### Updating Content

**1. Keystatic (Primary Source)**
- This project uses [Keystatic](https://keystatic.com/) for managing rich markdown content like lessons and pathways.
- **Local Access**: When running the dev server (`npm run dev`), visit `http://localhost:4321/keystatic` to access the Admin UI.
- **GitHub Integration**: In production, content is managed directly via GitHub PRs, but you can use the local UI to generate the commits.

**2. Google Sheets (Legacy/Migration)**
- The [lesson inventory spreadsheet](https://docs.google.com/spreadsheets/d/1JqM5OYX4f-T0jR-GJ5UeI7PnGJP6o4jtPRNtDJUGPmI/edit?gid=1792935546#gid=1792935546) was used for initial content population.
- **Note**: This sheet is **NOT** automatically synced during the build. It serves as a historical reference.
- **Manual Import**: If you need to re-import from Sheets (warning: overwrites local changes), run:
  ```bash
  npm run migrate:lessons
  ```

## 🗺️ Roadmap (Optional)

[TODO: Outline the future plans for this project. What's in the backlog, what's next? Refer to the Roadmap section in the README Guide.]
- Research user needs for new product features
- Develop initial product requirements document

## Community & Contributing

We welcome contributions! Please see our guides below:

*   **[Contributing Guide](CONTRIBUTING.md)**: How to get started with contributing to this project.
*   **[Code of Conduct](CODE_OF_CONDUCT.md)**: Expectations for behavior within our community.
*   **[Code of Conduct Guide](docs/CODE_OF_CONDUCT_GUIDE.md)**: A guide for understanding and adapting our Code of Conduct.
*   **[License](LICENSE)**: Project licensing information.
*   **[Contributing Guide (Template Guide)](docs/CONTRIBUTING_GUIDE.md)**: A guide for understanding and adapting our Contributing Guide.
*   **[License Guide](docs/LICENSE_GUIDE.md)**: A guide for understanding and choosing a license.
*   **[README Guide](docs/README_GUIDE.md)**: A guide for writing a great README.

## ❓ FAQ (Optional)

[TODO: Add frequently asked questions and their answers here.]

## 📞 Contact

Have questions or suggestions? Reach out through:
- **GitHub Issues**: [https://github.com/UC-OSPO-Network/education/issues](https://github.com/UC-OSPO-Network/education/issues)
- **GitHub Discussions**: For general questions and community discussion
- **Meeting Notes**: Check our [meeting notes](https://docs.google.com/document/d/1-CJxDt05f9YoYfGB8-NC0zvQZbEJzHT1P7keRciMlrY/edit?tab=t.0#heading=h.vs4sjkl9adbl) for information about joining education subgroup meetings

## 🙏 Attribution

This project builds upon and integrates content from:
- **[The Carpentries](https://carpentries.org/)**: Open source lessons for teaching foundational coding and data science skills
- **[CodeRefinery](https://coderefinery.org/)**: Training materials for research software development
- **[Astro](https://astro.build/)**: Modern web framework for building fast, content-focused websites
- **[PapaParse](https://www.papaparse.com/)**: CSV parsing library for data integration
- **[Fuse.js](https://fusejs.io/)**: Lightweight fuzzy-search library for lesson discovery

Special thanks to all contributors and the open source education community.

## 👀 Want to learn more about Astro?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).