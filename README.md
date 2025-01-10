# AstraInsights

AstraInsights is a web application designed to analyze and visualize social media engagement data. The project is built using a Next.js frontend, Node.js backend, Langflow and Datastax Astra DB.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Learn More](#learn-more)
- [Deploy on Vercel](#deploy-on-vercel)

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/socialpulse.git
cd socialpulse
```

2. Install dependencies for both frontend and backend:

```bash
cd frontend
npm install
# or
yarn install

cd ../backend
npm install
# or
yarn install
```

### Running the Development Server

1. Start the backend server:

```bash
cd backend
npm run dev
# or
yarn dev
```

2. Start the frontend server:

```bash
cd frontend
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the frontend result.

## Project Structure

```
backend/
    .env
    .gitignore
    config.js
    index.js
    package.json
    secure-connect-engagement-db/
        ca.crt
        cert
        cert.pfx
        config.json
        cqlshrc
        identity.jks
        key
        trustStore.jks
dataset.csv
frontend/
    .env
    .gitignore
    .next/
        app-build-manifest.json
        ...
    components.json
    next-env.d.ts
    next.config.mjs
    package.json
    postcss.config.mjs
    public/
    README.md
    src/
        app/
        ...
    tailwind.config.ts
    tsconfig.json
    vercel.json
README.md
social_media_data.csv
social_media_engagement_data.csv
```

## Environment Variables

### Backend

Create a `.env` file in the `backend` directory and add the following environment variables:

```
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASS=your_database_password
```

### Frontend

Create a `.env` file in the `frontend` directory and add the following environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Available Scripts

### Backend

- `npm run dev` or `yarn dev`: Runs the backend server in development mode.
- `npm run start` or `yarn start`: Runs the backend server in production mode.

### Frontend

- `npm run dev` or `yarn dev`: Runs the frontend server in development mode.
- `npm run build` or `yarn build`: Builds the frontend for production.
- `npm run start` or `yarn start`: Runs the frontend server in production mode.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Screenshots

Here are some screenshots of the application:

### AstraInsights

![Project Thumbnail](https://github.com/avengers2405/SocialPulse/blob/master/images/Project%20Thumbnail.png)

### UI

![UI](https://github.com/avengers2405/SocialPulse/blob/master/images/landing.png)

### Upload Custom Dataset

![Upload](https://github.com/avengers2405/SocialPulse/blob/master/images/upload.png)

### Chat

![Chat](https://github.com/avengers2405/SocialPulse/blob/master/images/in%20action.png)
