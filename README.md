# Directory Tree Management System

## Overview

This project implements a directory tree management system with a command-line style interface. Users can create, move, delete, and list directories in a hierarchical structure through a web interface. The system maintains directory structures with case-insensitive naming to prevent conflicts and supports full path operations for nested directories.

**NOTE**: This project does **NOT** create folders on the host machine and is intended to demonstrate my coding ability as an interview candidate.

## Features

- Create directories with nested paths
- Move directories and their contents
- Delete directories recursively
- List the entire directory structure
- Case-insensitive directory names to prevent conflicts

## Prerequisites

- Node.js (v18 or higher)
- npm (included with Node.js)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/[your-username]/directory-tree.git
cd directory-tree
```

2. Install dependencies:

```bash
npm install
```

## Running the Application

1. Start the development server:

```bash
npm run dev
```

2. Open your browser and navigate to http://localhost:3000

## Using the Application

Enter commands in the input field using the following format:

- CREATE path/to/directory
- MOVE source/path destination/path
- DELETE path/to/directory
- LIST

Examples:

```
CREATE movies/action
MOVE movies/action films/action
DELETE films/action
LIST
```

## Running Tests

Run the test suite:

```bash
npm test
```

Watch mode for development:

```bash
npm run test:watch
```

## Development Tools

- Next.js framework
- Jest and React Testing Library for testing
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- lint-staged for pre-commit checks
- Tailwind CSS for styling

## Tech Stack

- Next.js 15.1.2
- React 19
- TypeScript
- Tailwind CSS

**NOTE** All code changes will be automatically formatted and tested before committing to repo.
