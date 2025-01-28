# QuickTest

This project is an [NX](https://nx.dev/) monorepo that includes a React.js application (frontend) and a NestJS application (backend). The database used is Postgres, and TypeORM is utilized as the ORM (Object-Relational Mapping) tool.

React.js App: Located in apps/frontend
NestJS App: Located in apps/backend

Docker has been configured to streamline the development and deployment processes.

## Prerequisites

Ensure the following tools are installed on your system:

Node.js (v22.12.0)
Docker
Docker Compose (v2.30.3-desktop.1 or later)
NX CLI (optional for local development):

## Links

- Swagger: [http://localhost:3001/testbox-documentation](http://localhost:3001/testbox-documentation)
- Adminer (client for DB): [http://localhost:8080](http://localhost:8080)
- Maildev: [http://localhost:1080](http://localhost:1080)

## Setup

Install all the dependencies needed for the project.

```bash
npm install
```

For the database either, you can setup everything in your system or you can use docker.

1. Sytem setup: [Install Postgresql](https://www.postgresql.org/download/)

After successful seeding, you can set the env variable for the apps:

```bash
cp apps/backend/.env.example apps/backend/.env.dev
cp apps/frontend/.env.example apps/frontend/.env
```

update this variables to desired values.

Now, you can run the backend and frontend or you can use the nx to run multiple apps at once.

Start Backend

```bash
npx nx run quick-test-backend:dev
```

Start Frontend

```bash
npx nx run quick-test-frontend:dev
```

Or, run both the app at once:

```bash
npx nx run-many --target=dev
```

Or, you can use the predefined script in _package.json_. It will run both the apps.

```bash
npm run dev

## Hosting

Note: Before going for hosting, check if the backend app has _.env.production_ and frontend app has _.env_ files.

For hosting, quick-test is using Docker

# Docker Setup:
   1. [Install docker](https://www.docker.com/)
   2. Create docker image of the database: (Here -d will create and start the containers in the background, allowing you to continue using your terminal for other tasks.)

### Using Docker

Building image for both the apps:

```bash
docker compose build
```

Run the apps:

```bash
docker compose up -d
```