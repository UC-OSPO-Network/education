# UC OSPO Education Lesson & Pathways Website

Work regarding the education subgroup. This repository hosts the Astro-based website for the UC OSPO Education Lesson & Pathways.

- [Draft inventory of lessons](https://docs.google.com/spreadsheets/d/1JqM5OYX4f-T0jR-GJ5UeI7PnGJP6o4jtPRNtDJUGPmI/edit?gid=1792935546#gid=1792935546) - lessons pulled from existing Carpentries & Code Refinery.
- [Process we are following](https://docs.google.com/document/d/1D4tCqMkB6-QTdvCSR2N-6VZSSUUOQZ87Kl4UEsuHeRs/edit?tab=t.0#heading=h.yyzjiyx43ln0) - these are converted to issues in the GH project.
- [Meeting notes](https://docs.google.com/document/d/1-CJxDt05f9YoYfGB8-NC0zvQZbEJzHT1P7keRciMlrY/edit?tab=t.0#heading=h.vs4sjkl9adbl)

## 🚀 Project Structure (Astro)

This project was built with [Astro](https://astro.build/).

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).