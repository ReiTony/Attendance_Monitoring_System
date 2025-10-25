# Attendance Monitoring System - Frontend

This is a [Next.js](https://nextjs.org) project for an attendance monitoring system that tracks student attendance using RFID technology.

## Tech Stack

- **Framework**: Next.js 15.5.4 (with Turbopack)
- **UI Library**: Mantine 8.3.x
- **Styling**: Tailwind CSS 4.x
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Date Handling**: Day.js
- **Language**: TypeScript

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── add-student/              # Add new student page
│   │   ├── attendance-logs/          # View attendance records
│   │   ├── class-schedules/          # Manage class schedules
│   │   ├── class-seat-plan/          # Classroom seating arrangement
│   │   ├── home/                     # Home page
│   │   ├── login/                    # Teacher login
│   │   ├── record-attendance/        # Record attendance page
│   │   ├── register/                 # Teacher registration
│   │   ├── student/[student-id]/     # Student details & edit
│   │   ├── students-list/            # List all students
│   │   └── components/               # Reusable components
│   │       └── core/                 # Core components (AppShell, etc.)
│   ├── domain/                       # Domain models/entities
│   ├── dto/                          # Data Transfer Objects
│   ├── hooks/                        # Custom React hooks
│   │   ├── classSeatPlan/
│   │   ├── rfid/
│   │   └── student/
│   ├── services/                     # API service layer
│   ├── stores/                       # Zustand stores
│   └── utils/                        # Utility functions
├── public/                           # Static assets
├── Dockerfile                        # Docker configuration
└── package.json                      # Dependencies and scripts
```

## Getting Started

### Development Mode

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

To create a production build:

```bash
npm run build
npm start
```

## Running with Docker

### Build the Docker Image

```bash
docker build -t ams_frontend .
```

### Run the Docker Container

```bash
docker run -p 3000:3000 ams_frontend
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### Docker Build Details

The Dockerfile uses a multi-stage build process:

1. **deps**: Installs dependencies
2. **builder**: Builds the Next.js application
3. **runner**: Creates a minimal production image

## Available Scripts

- `npm run dev` - Starts the development server with Turbopack
- `npm run build` - Creates an optimized production build
- `npm start` - Starts the production server
- `npm run lint` - Runs ESLint for code quality checks

## Features

- 👨‍🎓 Student Management (Add, Edit, Delete, View)
- 📊 Attendance Logging and Tracking
- 📅 Class Schedule Management
- 🪑 Interactive Class Seat Plan
- 🔖 RFID Integration for Attendance Recording
- 👨‍🏫 Teacher Authentication (Login/Register)
- 📈 Attendance Reports and Analytics

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Mantine Documentation](https://mantine.dev/) - UI component library documentation.

## License

This project is part of an Attendance Monitoring System.
