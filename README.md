# Community Skills Exchange

A full-stack web application developed as a Final Year Project for connecting people who want to teach, learn, and exchange skills within a community.

## Project Overview

Community Skills Exchange provides a platform where users can discover skills, share their own expertise, connect with other users, and manage their learning or teaching activities.

The application consists of a modern Next.js frontend and a Strapi backend with SQLite database support.

## Features

* User registration and authentication
* User login and logout
* User profiles
* Create and manage skills
* Browse available skills
* View individual skill details
* Search and explore community skills
* Booking system for skill exchanges
* User dashboard
* Profile management
* Reviews and ratings
* Protected routes
* FAQ page
* Terms and conditions
* Privacy policy
* Responsive user interface
* REST API powered by Strapi
* SQLite database for local data storage

## Technology Stack

### Frontend

* Next.js
* React
* JavaScript
* Tailwind CSS
* Shadcn/UI
* REST API
* ESLint

### Backend

* Strapi
* Node.js
* REST API
* SQLite
* JavaScript

### Development Tools

* Git
* GitHub
* Visual Studio Code
* npm

## Main Modules

### Authentication

Users can create accounts, log in, and access protected parts of the application.

### Skills

Users can create and manage skills they want to teach or share.

### Skill Discovery

Users can browse available skills and view detailed information about each skill.

### Booking

Users can request or manage skill exchange bookings through the platform.

### Reviews

Users can provide reviews after participating in a skill exchange.

### Dashboard

Authenticated users have access to a dashboard for managing their profile, skills, and activities.

## Getting Started

### Prerequisites

Make sure the following software is installed:

* Node.js
* npm
* Git

Check your versions:

```bash
node --version
npm --version
git --version
```

## Clone the Repository

```bash
git clone https://github.com/codeandayan/Community-Skills-Exchange-App.git
```

Enter the project directory:

```bash
cd Community-Skills-Exchange-App
```

## Backend Setup

Move into the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create your environment file from the example:

```bash
copy .env.example .env
```

Configure the required environment variables in `.env`.

Start the Strapi development server:

```bash
npm run develop
```

The Strapi backend will normally be available at:

```text
http://localhost:1337
```

The Strapi administration panel is normally available at:

```text
http://localhost:1337/admin
```

## Frontend Setup

Open another terminal and move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create the required environment configuration if your frontend uses environment variables.

Start the Next.js development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:3000
```

## Running the Complete Application

You need two development servers running at the same time.

### Terminal 1 — Strapi Backend

```bash
cd backend
npm install
npm run develop
```

Backend:

```text
http://localhost:1337
```

### Terminal 2 — Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

The frontend communicates with the Strapi backend through its REST API.

```text
User
  ↓
Next.js Frontend
  ↓
Strapi REST API
  ↓
SQLite Database
```

## Database

The backend uses SQLite for data storage during development.

The project includes the existing SQLite database used by the application:

```text
backend/.tmp/data.db
```

Do not expose database files containing sensitive or private information in public repositories.

## Environment Variables

Environment files containing secrets should not be committed to GitHub.

Use `.env.example` files to document required variables without exposing sensitive values.

Example:

```env
DATABASE_CLIENT=sqlite
HOST=0.0.0.0
PORT=1337
```

Use your actual project configuration when setting up the application locally.

## Git Workflow

After making changes:

```bash
git add .
git commit -m "Describe your changes"
git push
```

To get the latest changes on another computer:

```bash
git pull
```

## Project Status

This project was developed as a Final Year Project for a BS Software Engineering degree.

The application demonstrates full-stack web development using Next.js, React, Tailwind CSS, Strapi, REST APIs, authentication, database management, and Git-based version control.

## Future Improvements

Potential future improvements include:

* Real-time messaging
* Notifications
* Advanced skill search and filtering
* Improved booking management
* Email notifications
* Online meetings
* Skill verification
* Advanced recommendation system
* Deployment to a cloud platform
* Production database migration
* Automated testing

## Contributors

### Developer

**Code & Ayan**

Final Year BS Software Engineering Student

GitHub: `https://github.com/codeandayan`

## Academic Project

This application was developed as a Final Year Project for academic purposes.

**Project:** Community Skills Exchange

**Degree:** BS Software Engineering

**Year:** 2026
