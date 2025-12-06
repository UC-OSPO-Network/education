# Contributing to the UC OSPO Education Website

We welcome contributions to the UC OSPO Education Website! This project aims to provide a welcoming and accessible platform for learners interested in open source.

This guide will help you get started with contributing to this project.

## Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project, you agree to abide by its terms.

## How to Contribute

There are many ways to contribute, not just by writing code:

*   **Reporting Bugs:** If you find a bug, please open an [issue](https://github.com/UC-OSPO-Network/education/issues) and describe the problem in detail.
*   **Suggesting Enhancements:** Have an idea for a new feature or improvement? Open an [issue](https://github.com/UC-OSPO-Network/education/issues) to discuss it.
*   **Writing Documentation:** Improving our documentation (guides, explanations, examples) is always welcome.
*   **Submitting Code:**
    1.  **Fork** the repository.
    2.  **Clone** your forked repository to your local machine.
        ```bash
        git clone https://github.com/YOUR_GITHUB_USERNAME/education.git
        cd education
        ```
    3.  **Install dependencies**:
        ```bash
        npm install
        ```
    4.  **Create a new branch** for your feature or bug fix:
        ```bash
        git checkout -b feature/your-feature-name
        # or
        git checkout -b bugfix/issue-description
        ```
    5.  **Make your changes**.
    6.  **Run the development server** to preview your changes:
        ```bash
        npm run dev
        ```
    7.  **Test your changes**: Ensure everything works as expected and doesn't introduce new bugs.
    8.  **Commit your changes** with a clear and concise commit message. Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) guidelines (e.g., `feat: add new filter option`, `fix: correct typo on homepage`).
        ```bash
        git add .
        git commit -m "feat: your commit message"
        ```
    9.  **Push your branch** to your forked repository:
        ```bash
        git push origin feature/your-feature-name
        ```
    10. **Open a Pull Request (PR)** to the `main` branch of the original repository.
        *   Provide a clear title and description for your PR.
        *   Reference any related issues (e.g., `Closes #123` or `Fixes #123`).

## Development Setup

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/UC-OSPO-Network/education.git
    cd education
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    This will start a local server, usually at `http://localhost:4321`.

### Build for Production

To build the project for production, run:

```bash
npm run build
```

This will generate the static files in the `dist/` directory.

## Getting Help

If you have any questions or get stuck, please open an [issue](https://github.com/UC-OSPO-Network/education/issues), and we'll do our best to help you out!