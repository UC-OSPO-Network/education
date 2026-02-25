import { getSheetData } from '../src/lib/getSheetData.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Generate Standardized Learning Objectives for All Lessons
 * 
 * This script creates Learning Objectives following the pattern:
 * "After this lesson, the learner should be able to..."
 * with 3-5 specific, measurable outcomes using Bloom's taxonomy verbs.
 */

// Bloom's Taxonomy Verbs by Level
const BLOOMS_VERBS = {
    beginner: ['identify', 'describe', 'explain', 'list', 'recognize', 'define', 'recall', 'understand'],
    intermediate: ['apply', 'demonstrate', 'implement', 'analyze', 'compare', 'use', 'illustrate', 'classify'],
    advanced: ['evaluate', 'create', 'design', 'synthesize', 'assess', 'develop', 'formulate', 'construct']
};

// Learning Objectives Database - Comprehensive LOs for all lessons
const LEARNING_OBJECTIVES = {
    // Community & Collaboration
    'Building Community': [
        'Explain the importance of fostering an inclusive and welcoming community in open source projects',
        'Identify effective communication strategies for engaging with contributors and users',
        'Demonstrate conflict resolution techniques to maintain a healthy project environment',
        'Apply best practices for encouraging contributor engagement and collaboration',
        'Recognize the key elements that make a community sustainable and thriving'
    ],

    'Leadership and Governance': [
        'Design transparent governance structures for open source projects',
        'Evaluate different leadership models and their applicability to various project contexts',
        'Create project policies that support long-term sustainability and community growth',
        'Demonstrate effective decision-making processes in open source communities',
        'Assess the impact of governance choices on project health and contributor satisfaction'
    ],

    'Social Coding and Open Source Collaboration': [
        'Explain the concept of social coding and its role in modern software development',
        'Demonstrate collaboration workflows using GitHub and other social coding platforms',
        'Identify norms and best practices for effective participation in open source communities',
        'Apply social coding tools to contribute to collaborative projects',
        'Recognize the benefits of community engagement in software development'
    ],

    'Writing Documentation for Software Projects': [
        'Identify the role and benefits of documentation in research and software projects',
        'Describe different types of documentation (README, API reference, tutorials) and their purposes',
        'Apply best practices for writing clear, accessible, and user-friendly documentation',
        'Use tools and formats commonly used for documentation (Markdown, reStructuredText, Sphinx)',
        'Implement strategies for keeping documentation up to date and involving community contributors'
    ],

    'Making Good Pull Requests': [
        'Identify the purpose and workflow of a pull request in collaborative development',
        'Describe the key elements of a well-structured PR (clear description, relevant changes)',
        'Apply best practices for communicating effectively in PR discussions',
        'Recognize common mistakes to avoid when submitting a PR',
        'Demonstrate how to break large changes into smaller, reviewable PRs'
    ],

    'Issue Tracking with GitHub': [
        'Identify the purpose of issue tracking in software and project management',
        'Describe common components of an issue (title, description, labels, assignee)',
        'Create clear, actionable issues that facilitate collaboration',
        'Apply best practices for prioritizing and organizing issues',
        'Demonstrate how issue tracking supports project planning and sustainability'
    ],

    'Collaborative Git for Teams': [
        'Demonstrate collaborative Git usage including branching, merging, and conflict resolution',
        'Apply Git workflows for team collaboration and code management',
        'Identify best practices for managing branches in collaborative projects',
        'Resolve merge conflicts effectively in team environments',
        'Implement Git workflows that support continuous integration and delivery'
    ],

    'Collaboration in Open Research Projects': [
        'Apply Git and GitHub for collaborative research and code sharing',
        'Demonstrate best practices for managing contributions in open science projects',
        'Identify strategies for fostering transparency and reproducibility in research outputs',
        'Implement collaborative workflows that support open science principles',
        'Recognize the importance of version control in research reproducibility'
    ],

    // Python Packaging
    'Python Packaging': [
        'Identify the purpose and benefits of packaging Python code for distribution',
        'Describe the basic structure of a Python package (setup.py, pyproject.toml, __init__.py)',
        'Apply tools like setuptools, pip, and twine to build and distribute packages',
        'Implement best practices for versioning and dependency management',
        'Demonstrate how to publish a package to the Python Package Index (PyPI)'
    ],

    'Python Packaging for Beginners': [
        'Create and configure virtual environments for Python projects',
        'Use task runners to manage environments and execute code',
        'Build and install a Python package from source',
        'Implement basic tests for Python packages',
        'Explain the process of publishing a package on PyPI'
    ],

    'R Packaging': [
        'Understand what an R package is and why it is useful for code organization',
        'Identify the tools used to create and manage R packages',
        'Build, install, and attach custom R packages',
        'Apply licensing best practices to new R packages',
        'Create a battery of basic tests for R package validation'
    ],

    // Git & Version Control
    'Introduction to Git': [
        'Explain the concept of version control and its importance in software development',
        'Demonstrate how to initialize and manage Git repositories',
        'Apply basic Git commands to track changes and manage project history',
        'Identify the benefits of distributed version control systems',
        'Use Git to collaborate on projects and maintain code history'
    ],

    'How to Contribute to Open Source': [
        'Identify the key terms and processes important for new open source contributors',
        'Explain the typical workflow for contributing to open source projects',
        'Demonstrate how to find projects that align with personal interests and skills',
        'Apply best practices for making first contributions to open source',
        'Recognize the importance of community guidelines and codes of conduct'
    ],

    // DevOps & CI/CD
    'Continuous Integration and Delivery with GitHub Actions': [
        'Distinguish between Continuous Integration (CI), Continuous Delivery, and Continuous Deployment',
        'Identify types of breaking changes in different development contexts',
        'Configure a basic CI pipeline using GitHub Actions for code testing and packaging',
        'Apply CI/CD principles to automate workflows beyond code testing',
        'Demonstrate how to use matrix strategies to test across multiple environments',
        'Automate building and publishing artifacts using GitHub Actions'
    ],

    'CI/CD for Research Software with GitLab CI': [
        'Explain the principles of CI/CD in the context of research software development',
        'Configure GitLab CI pipelines to automate testing and deployment',
        'Apply CI/CD practices to improve research software quality and reproducibility',
        'Demonstrate how to integrate automated testing into research workflows',
        'Identify best practices for CI/CD in scientific computing environments'
    ],

    // Testing
    'Unit Testing and TDD in Python': [
        'Identify the purpose and benefits of testing in software development',
        'Describe different types of tests (unit tests, integration tests, functional tests)',
        'Apply testing frameworks like pytest to write and run tests',
        'Demonstrate test-driven development (TDD) practices in Python',
        'Implement testing strategies that integrate with continuous integration workflows'
    ],

    // Maintaining & Sustaining
    'Starting an Open Source Project': [
        'Define the purpose and goals of a new open source project',
        'Identify the foundational steps for launching a successful open source project',
        'Apply best practices for choosing an appropriate open source license',
        'Demonstrate how to set up version control and create a contributor-friendly environment',
        'Recognize the importance of documentation and community guidelines from the start'
    ],

    'Finding Users for Your Project': [
        'Identify strategies to attract and grow a user base for open source projects',
        'Apply techniques to improve project discoverability and visibility',
        'Demonstrate how to engage with communities and leverage social platforms for outreach',
        'Recognize the importance of user feedback in project development',
        'Implement marketing and communication strategies for open source projects'
    ],

    'Metrics': [
        'Identify key metrics for evaluating open source project health and success',
        'Explain the importance of tracking and analyzing project activity and community growth',
        'Apply tools and practices to monitor project metrics effectively',
        'Demonstrate how to use metrics to make informed decisions about project direction',
        'Recognize the relationship between metrics and project sustainability'
    ],

    'Best Practices for Maintainers': [
        'Identify essential practices for sustainable open source project maintenance',
        'Demonstrate effective strategies for managing contributions and community engagement',
        'Apply documentation practices to improve project accessibility and onboarding',
        'Implement communication strategies that foster a welcoming project environment',
        'Recognize the importance of setting boundaries and preventing maintainer burnout'
    ],

    'Effective Code Review': [
        'Identify the purpose and benefits of code review in collaborative software development',
        'Describe the typical workflow for conducting effective code reviews',
        'Apply best practices for giving constructive, actionable feedback',
        'Demonstrate how to prepare code for review to facilitate efficient feedback',
        'Recognize how code review maintains project standards and improves code quality'
    ],

    'Python Package Development Best Practices': [
        'Apply best practices for structuring Python packages for scientific software',
        'Demonstrate how to write comprehensive tests and manage dependencies',
        'Implement version control workflows for collaborative package development',
        'Create clear documentation using tools like Read The Docs',
        'Configure continuous integration for automated testing and deployment'
    ],

    'Building Better Research Software': [
        'Explain FAIR principles (Findable, Accessible, Interoperable, Reusable) for research software',
        'Apply practices to ensure reproducibility in research code',
        'Demonstrate how to create reproducible environments for research software',
        'Implement code annotation and documentation practices for research projects',
        'Design software structures that support testing and long-term maintenance'
    ],

    'Reproducible Research': [
        'Explain the principles and importance of reproducible research',
        'Apply best practices for data management and version control in research',
        'Demonstrate how to use Git and other tools to ensure research reproducibility',
        'Identify strategies for documenting research workflows and methodologies',
        'Recognize ethical considerations in reproducible research practices'
    ],

    'Intermediate Research Software Development Skills (Python) Lesson Material': [
        'Apply intermediate software development skills to research projects using Python',
        'Demonstrate collaborative development practices in research environments',
        'Implement testing, documentation, and version control for research software',
        'Design reliable and maintainable research software following best practices',
        'Recognize the importance of code quality and sustainability in research'
    ],

    'Introduction to Docker for Research  NOTE THIS IS NOW CALLED Introduction to Docker and Podman': [
        'Explain what containers are and how they differ from virtual machines',
        'Demonstrate how to create and manage Docker containers',
        'Apply Docker to ensure reproducibility in research software',
        'Identify use cases for containerization in scientific computing',
        'Create Docker images for software development and deployment'
    ],

    'Research Software Engineering with Python  Course': [
        'Apply software engineering best practices to research software development',
        'Demonstrate version control, testing, and project management skills',
        'Implement design patterns and software architecture principles in research code',
        'Create sustainable and maintainable research software projects',
        'Recognize the role of Research Software Engineers in modern research'
    ],

    'Intermediate Python Development': [
        'Apply intermediate Python development skills including virtual environments and packaging',
        'Demonstrate collaborative development using Git feature branch workflows',
        'Implement comprehensive testing strategies using pytest',
        'Design modular software following Model-View-Controller architecture',
        'Create well-documented, maintainable Python projects following community standards'
    ],

    'Modular Programming with Python': [
        'Explain the principles of modular programming and its benefits',
        'Demonstrate how to write reusable, single-purpose functions',
        'Apply strategies to limit side effects and improve code testability',
        'Implement command line interfaces to improve code versatility',
        'Recognize how modular design supports parallelization and collaboration'
    ],

    'Testing and Test-Driven Development': [
        'Explain the principles and benefits of test-driven development (TDD)',
        'Demonstrate how to write unit tests using pytest',
        'Apply TDD practices to improve code quality and design',
        'Implement automated testing strategies for software projects',
        'Recognize the role of testing in continuous integration workflows'
    ],

    'Reproducible Computational Environments using Containers': [
        'Explain the concept of containerization and its role in reproducible research',
        'Demonstrate how to create and manage Docker containers for research environments',
        'Apply containerization to ensure computational reproducibility',
        'Identify best practices for sharing reproducible environments',
        'Recognize the benefits of containers for research collaboration'
    ],

    // Licensing
    'Understanding Software Licensing': [
        'Identify different types of open source software licenses and their implications',
        'Explain the legal and practical considerations of software licensing',
        'Apply appropriate licenses to software projects based on project goals',
        'Recognize the differences between permissive and copyleft licenses',
        'Demonstrate how to properly attribute and comply with open source licenses'
    ],

    // Additional Lessons
    'Reproducibility Principles and Practices': [
        'Identify key principles and practices for ensuring research reproducibility',
        'Explain the benefits of reproducible research for collaboration and validation',
        'Apply tools and workflows that support reproducible research practices',
        'Recognize which reproducibility practices to adopt for different project types',
        'Demonstrate how reproducibility practices improve research quality and impact'
    ],

    'Responsible Data Science': [
        'Identify ethical considerations in data science and research',
        'Explain principles of responsible data collection, use, and sharing',
        'Apply best practices for data privacy and security',
        'Recognize potential biases and fairness issues in data science',
        'Demonstrate responsible practices in data science workflows'
    ],

    'Introduction to Unix Command Line': [
        'Explain the purpose and benefits of using the Unix command line',
        'Demonstrate basic Unix commands for file and directory management',
        'Apply command line tools to navigate and manipulate files',
        'Identify common Unix utilities and their use cases',
        'Recognize the importance of command line skills for software development'
    ],

    'Introduction to Version Control with Git.': [
        'Explain the concept of version control and its importance',
        'Demonstrate how to initialize and manage Git repositories',
        'Apply basic Git commands to track changes and manage history',
        'Identify best practices for commit messages and repository organization',
        'Recognize the benefits of version control for collaboration'
    ],

    'Reproducible Research for Teams with GitHub': [
        'Apply GitHub workflows for collaborative reproducible research',
        'Demonstrate how to use GitHub features for team coordination',
        'Implement version control practices that support reproducibility',
        'Identify strategies for managing research code and data with teams',
        'Recognize the importance of documentation in team-based research'
    ],

    'Python Basics': [
        'Explain fundamental Python programming concepts and syntax',
        'Demonstrate how to write and execute basic Python programs',
        'Apply Python data types, variables, and control structures',
        'Identify common Python libraries and their use cases',
        'Recognize best practices for writing clean, readable Python code'
    ],

    'R Basics': [
        'Explain fundamental R programming concepts and syntax',
        'Demonstrate how to work with R data structures and functions',
        'Apply R for basic data analysis and visualization',
        'Identify common R packages and their applications',
        'Recognize best practices for R programming and data analysis'
    ],

    'Overview of Databases and Data Storage': [
        'Identify different types of databases and data storage systems',
        'Explain the principles of database design and data organization',
        'Recognize use cases for different database technologies',
        'Describe the relationship between databases and data-driven applications',
        'Apply basic concepts of data modeling and schema design'
    ],

    'Introduction to SQL for Querying Databases': [
        'Explain the purpose and structure of SQL for database queries',
        'Demonstrate how to write basic SQL queries to retrieve data',
        'Apply SQL commands for filtering, sorting, and aggregating data',
        'Identify best practices for writing efficient SQL queries',
        'Recognize the role of SQL in data analysis and management'
    ],

    'Principles of Data Visualization from PErception to Statistical Graphics': [
        'Identify principles of effective data visualization based on human perception',
        'Explain how to choose appropriate visualization types for different data',
        'Apply best practices for creating clear and informative visualizations',
        'Recognize common pitfalls and misleading practices in data visualization',
        'Demonstrate how to design visualizations that communicate insights effectively'
    ],

    'Intermediate Python: next-level Data Visualization': [
        'Apply advanced Python libraries for data visualization',
        'Demonstrate how to create complex, multi-layered visualizations',
        'Implement interactive visualizations using Python tools',
        'Identify best practices for publication-quality graphics',
        'Recognize when to use different visualization techniques'
    ],

    'Intermediate R: Next-level Data Visualization': [
        'Apply advanced R packages for sophisticated data visualization',
        'Demonstrate how to create publication-quality graphics using ggplot2',
        'Implement customized visualizations for complex data',
        'Identify best practices for effective visual communication',
        'Recognize advanced visualization techniques for different data types'
    ],

    'Developing Your Data Science Portfolio': [
        'Identify key components of an effective data science portfolio',
        'Demonstrate how to showcase projects and skills effectively',
        'Apply best practices for documenting and presenting data science work',
        'Create a professional online presence for career development',
        'Recognize the importance of storytelling in portfolio development'
    ],

    'Julia Basics': [
        'Explain fundamental Julia programming concepts and syntax',
        'Demonstrate how to write and execute basic Julia programs',
        'Apply Julia for numerical computing and data analysis',
        'Identify Julia\'s advantages for scientific computing',
        'Recognize when Julia is an appropriate choice for projects'
    ],

    'Intermediate Python': [
        'Apply intermediate Python programming techniques',
        'Demonstrate object-oriented programming in Python',
        'Implement error handling and debugging strategies',
        'Identify advanced Python features and their applications',
        'Recognize best practices for writing maintainable Python code'
    ],

    'Intermediate R': [
        'Apply intermediate R programming techniques',
        'Demonstrate functional programming concepts in R',
        'Implement efficient data manipulation using tidyverse',
        'Identify advanced R features for data analysis',
        'Recognize best practices for R package development'
    ],

    'Overview of Remote and High Performance Computing (HPC)': [
        'Explain the concepts of remote computing and high-performance computing',
        'Identify use cases for HPC in research and data science',
        'Recognize the architecture and components of HPC systems',
        'Describe the benefits and challenges of using HPC resources',
        'Apply basic concepts for accessing and using remote computing resources'
    ],

    'Introduction to Remote Computing': [
        'Demonstrate how to connect to and use remote computing resources',
        'Apply SSH and other tools for remote access',
        'Identify best practices for working on remote systems',
        'Recognize security considerations for remote computing',
        'Implement file transfer and job submission on remote systems'
    ],

    'Introduction to Desktop GIS with QGIS': [
        'Explain the fundamentals of Geographic Information Systems (GIS)',
        'Demonstrate how to use QGIS for spatial data visualization and analysis',
        'Apply basic GIS operations including data import, styling, and querying',
        'Identify common GIS data formats and their characteristics',
        'Create maps and perform spatial analysis using QGIS'
    ],

    'Spatial SQL with SpatiaLite': [
        'Explain the concepts of spatial databases and spatial SQL',
        'Demonstrate how to use SpatiaLite for spatial data queries',
        'Apply spatial SQL functions for geographic analysis',
        'Identify use cases for spatial databases in research',
        'Implement spatial joins and geometric operations'
    ],

    'Geocoding': [
        'Explain the concept of geocoding and its applications',
        'Demonstrate how to convert addresses to geographic coordinates',
        'Apply geocoding tools and services for spatial data enrichment',
        'Identify challenges and limitations of geocoding',
        'Recognize best practices for geocoding accuracy and quality'
    ],

    'Coordinate Reference Systems': [
        'Explain what coordinate reference systems (CRS) are and why they matter',
        'Identify different types of coordinate systems and their applications',
        'Demonstrate how to transform data between coordinate systems',
        'Recognize common CRS issues and how to resolve them',
        'Apply appropriate CRS choices for different geographic analyses'
    ],

    'Introduction to Basic Statistics with R': [
        'Explain fundamental statistical concepts and terminology',
        'Demonstrate how to perform basic statistical analyses in R',
        'Apply descriptive statistics and hypothesis testing',
        'Identify appropriate statistical tests for different data types',
        'Recognize assumptions and limitations of statistical methods'
    ]
};

async function generateLearningObjectives() {
    console.log('🎓 Generating Standardized Learning Objectives...\n');

    // Fetch lesson data
    const lessons = await getSheetData();
    console.log(`📊 Loaded ${lessons.length} lessons from Google Sheets\n`);

    // Process each lesson
    const results = lessons.map(lesson => {
        const lessonName = lesson.name;
        const currentLO = lesson['Learning Objectives'] || '';

        // Get predefined Learning Objectives or keep existing if well-formatted
        let newLO = '';

        if (LEARNING_OBJECTIVES[lessonName]) {
            // Use our comprehensive Learning Objectives
            const objectives = LEARNING_OBJECTIVES[lessonName];
            newLO = 'After this lesson, the learner should be able to:\n' +
                objectives.map(obj => `- ${obj.charAt(0).toUpperCase() + obj.slice(1)}`).join('\n');
        } else if (currentLO && currentLO.trim() !== '') {
            // Keep existing if it exists (will be reviewed later)
            newLO = currentLO;
        } else {
            // Mark as needing manual review
            newLO = '[NEEDS REVIEW] After this lesson, the learner should be able to:\n- [To be defined based on lesson content]';
        }

        return {
            'Lesson Name': lessonName,
            'Topic': lesson.Topic || '',
            'Educational Level': lesson.educationalLevel || '',
            'URL': lesson.url || '',
            'Current Learning Objectives': currentLO,
            'New Learning Objectives': newLO,
            'Status': LEARNING_OBJECTIVES[lessonName] ? 'Generated' : (currentLO ? 'Existing' : 'Needs Review')
        };
    });

    // Generate CSV
    const csvHeaders = Object.keys(results[0]).join(',');
    const csvRows = results.map(row =>
        Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    const outputPath = join(process.cwd(), 'scripts', 'output', 'learning-objectives-complete.csv');
    writeFileSync(outputPath, csvContent, 'utf-8');

    console.log(`✅ Generated Learning Objectives CSV: ${outputPath}\n`);

    // Generate summary statistics
    const stats = {
        total: results.length,
        generated: results.filter(r => r.Status === 'Generated').length,
        existing: results.filter(r => r.Status === 'Existing').length,
        needsReview: results.filter(r => r.Status === 'Needs Review').length
    };

    console.log('📈 Summary Statistics:');
    console.log(`   Total Lessons: ${stats.total}`);
    console.log(`   Generated New LOs: ${stats.generated}`);
    console.log(`   Kept Existing LOs: ${stats.existing}`);
    console.log(`   Needs Manual Review: ${stats.needsReview}`);
    console.log(`   Completion Rate: ${((stats.generated + stats.existing) / stats.total * 100).toFixed(1)}%\n`);

    // Generate summary markdown
    const summaryMd = generateSummaryMarkdown(results, stats);
    const summaryPath = join(process.cwd(), 'scripts', 'output', 'learning-objectives-summary.md');
    writeFileSync(summaryPath, summaryMd, 'utf-8');

    console.log(`✅ Generated Summary Document: ${summaryPath}\n`);

    return results;
}

function generateSummaryMarkdown(results, stats) {
    let md = `# Learning Objectives Summary

## Overview

This document contains standardized Learning Objectives for all ${stats.total} lessons in the UC OSPO Education repository.

**Status:**
- ✅ Generated New Learning Objectives: ${stats.generated}
- 📝 Kept Existing Learning Objectives: ${stats.existing}
- ⚠️ Needs Manual Review: ${stats.needsReview}
- **Completion Rate: ${((stats.generated + stats.existing) / stats.total * 100).toFixed(1)}%**

## Format

All Learning Objectives follow this standardized format:

\`\`\`
After this lesson, the learner should be able to:
- [Bloom's taxonomy verb] [specific, measurable outcome]
- [Bloom's taxonomy verb] [specific, measurable outcome]
- [Bloom's taxonomy verb] [specific, measurable outcome]
\`\`\`

## Learning Objectives by Topic

`;

    // Group by topic
    const byTopic = {};
    results.forEach(r => {
        const topic = r.Topic || 'Other';
        if (!byTopic[topic]) byTopic[topic] = [];
        byTopic[topic].push(r);
    });

    // Generate sections by topic
    Object.keys(byTopic).sort().forEach(topic => {
        if (!topic || topic === '') return;

        md += `\n### ${topic}\n\n`;

        byTopic[topic].forEach(lesson => {
            md += `#### ${lesson['Lesson Name']}\n\n`;
            md += `**Educational Level:** ${lesson['Educational Level'] || 'Not specified'}  \n`;
            md += `**URL:** [View Lesson](${lesson.URL})  \n`;
            md += `**Status:** ${lesson.Status}\n\n`;
            md += `${lesson['New Learning Objectives']}\n\n`;
            md += `---\n\n`;
        });
    });

    return md;
}

// Run the script
generateLearningObjectives()
    .then(() => {
        console.log('✅ Learning Objectives generation complete!\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error generating Learning Objectives:', error);
        process.exit(1);
    });
