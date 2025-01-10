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
git clone https://github.com/avengers2405/AstraInsights.git
cd AstraInsights
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
    package-lock.json
    secure-connect-engagement-db.zip    
frontend/
    public/
        next.svg
        vercel.svg
    src/
        app/
            chat/
                ChatInterface.css
                page.tsx
            home/
                page.tsx
            connect/
                page.tsx
        components/ui/
            alert.tsx
            button.tsx
            dialog.tsx
        lib/
            utils.ts
    .env
    .gitignore
    components.json
    next.config.mjs
    package-lock.json
    package.json
    postcss.config.mjs
    README.md
    tailwind.config.ts
    tsconfig.json
images/
    ...
README.md
```

## Environment Variables

### Backend

Create a `.env` file in the `backend` directory and add the following environment variables:

```
ASTRA_DB_SECURE_BUNDLE_PATH='./secure-connect-engagement-db'
ASTRA_DB_APPLICATION_TOKEN='your-astra-db-application-token'
ASTRA_DB_ENDPOINT='your-astra-db-endpoint'
LANGFLOW_APPLICATION_TOKEN='your-langflow-application-token'
LANGFLOW_URL='your-langflow-url-endpoint'
LANGFLOW_ID='your-langflow-id'
LANGFLOW_FLOW_ID='your-langflow-flow-id'
OPENAI_KEY='your-openai-key
GROQ_KEY='your-groq-key'
```

### Frontend

Create a `.env` file in the `frontend` directory and add the following environment variables:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deployed on Vercel and Render:

Checkout our deployed project at: [AstraInsights](https://social-pulse-git-master-akshits-projects-bfecfb3b.vercel.app/)

## Screenshots

Here are some screenshots of the application:

### AstraInsights

![Project Thumbnail](https://github.com/avengers2405/AstraInsights/blob/master/images/Project%20Thumbnail.png)

### UI

![UI](https://github.com/avengers2405/AstraInsights/blob/master/images/landing.png)

### Upload Custom Dataset

![Upload](https://github.com/avengers2405/AstraInsights/blob/master/images/upload.png)

### Chat

![Chat](https://github.com/avengers2405/AstraInsights/blob/master/images/in%20action.png)
