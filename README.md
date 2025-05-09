# Fiszki (AI-powered Flashcards)

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

Fiszki is a web application that enables efficient creation and use of educational flashcards with the help of artificial intelligence. The application allows users to quickly generate high-quality flashcards based on input text and then use them in a learning process that utilizes spaced repetition.

The application is aimed at learners who want to maximize the effectiveness of their knowledge acquisition process while minimizing the time needed to prepare educational materials. The MVP focuses on the basic functionality of generating, managing, and using text-based flashcards.

## Tech Stack

### Frontend

- Astro 5 - For fast, efficient pages with minimal JavaScript
- React 19 - For interactive components
- TypeScript 5 - For static typing and better IDE support
- Tailwind 4 - For styling
- Shadcn/ui - For accessible React components

### Backend

- Supabase - Comprehensive backend solution providing:
  - PostgreSQL database
  - SDK for Backend-as-a-Service
  - Built-in user authentication

### AI Integration

- Openrouter.ai - Communication with AI models from OpenAI, Anthropic, Google, and others

### CI/CD & Hosting

- GitHub Actions - For CI/CD pipelines
- DigitalOcean - For hosting via Docker image

## Getting Started Locally

### Prerequisites

- Node.js v22.14.0 (as specified in .nvmrc)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/fiszki.git
cd fiszki
```

2. Use the correct Node.js version

```bash
# If you use nvm
nvm use
```

3. Install dependencies

```bash
npm install
```

4. Setup environment variables

```bash
# Create a .env file based on .env.example (if available)
cp .env.example .env
# Edit .env with your Supabase and OpenRouter credentials
```

5. Start the development server

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint to check code
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier

## Project Scope

### MVP Features

1. User account system

   - Registration, login, and account management
   - Secure user data storage
   - Password reset

2. AI flashcard generation

   - Text input by user
   - Generation of up to 5 flashcard suggestions
   - Preview, edit, and accept generated flashcards

3. Manual flashcard creation

   - Simple form with text fields for front and back
   - Character limits: title up to 100 characters, content up to 1000 characters

4. Flashcard management

   - Browse all user flashcards
   - View, edit, and delete individual flashcards

5. Learning system
   - Integration with open-source spaced repetition algorithm
   - Flashcard presentation according to review schedule
   - Learning progress evaluation

### Out of Scope for MVP

- Custom advanced repetition algorithms
- Multiple format imports (PDF, DOCX, etc.)
- Flashcard sharing between users
- Mobile applications
- Multimedia flashcards (images, audio, video)
- Categorization/tagging
- Statistics and detailed learning progress analysis
- Flashcard export to other formats
- Social features (comments, sharing, etc.)

## Project Status

This project is currently in MVP development phase. The core features are being implemented with a focus on creating a functional and efficient learning tool.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
