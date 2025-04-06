# RagebaitResume

A professional resume analyzer that provides constructive feedback with a touch of humor. This application uses AI to analyze resumes and provide detailed insights to help users improve their resumes and stand out in job applications.

## Summary
RagebaitResume is an AI-powered resume analyzer that provides witty and constructive feedback on your resume, helping you identify areas for improvement while keeping the process engaging and entertaining.

## Dependencies
### Main Dependencies
- @headlessui/react: ^2.2.1
- @heroicons/react: ^2.2.0
- @supabase/supabase-js: ^2.49.4
- axios: ^1.8.4
- concurrently: ^8.2.2
- dotenv: ^16.4.7
- groq-sdk: ^0.19.0
- next: 15.2.4
- react: ^19.0.0
- react-dom: ^19.0.0
- react-hot-toast: ^2.5.2
- react-pdf: ^9.2.1

### Dev Dependencies
- @eslint/eslintrc: ^3
- @tailwindcss/postcss: ^4
- @types/node: ^20
- @types/react: ^19
- @types/react-dom: ^19
- eslint: ^9
- eslint-config-next: 15.2.4
- tailwindcss: ^4
- typescript: ^5

## Quick Install
Copy and paste these commands to install all dependencies:

```bash
# Install frontend dependencies
npm install @headlessui/react@^2.2.1 @heroicons/react@^2.2.0 @supabase/supabase-js@^2.49.4 axios@^1.8.4 concurrently@^8.2.2 dotenv@^16.4.7 groq-sdk@^0.19.0 next@15.2.4 react@^19.0.0 react-dom@^19.0.0 react-hot-toast@^2.5.2 react-pdf@^9.2.1 @eslint/eslintrc@^3 @tailwindcss/postcss@^4 @types/node@^20 @types/react@^19 @types/react-dom@^19 eslint@^9 eslint-config-next@15.2.4 tailwindcss@^4 typescript@^5

# Install backend dependencies
cd backend && npm install
```

## Features

- Drag-and-drop file upload for PDF, DOC, DOCX, and TXT files
- Three feedback intensity levels: Gentle, Balanced, and Direct
- Detailed feedback points with specific improvement suggestions
- Professional letter format with a summary of qualifications
- Score rating system with visual indicators

## Project Structure

The project consists of two main parts:
- **Frontend**: Next.js application (in the root directory)
- **Backend**: Express.js API (in the `/backend` directory)

## Setup and Installation

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A GROQ API key (get one from [console.groq.com](https://console.groq.com/))
- A Supabase account and project (create one at [supabase.com](https://supabase.com/))

### Installation Steps

1. Clone the repository:
   ```
   git clone <repository-url>
   cd resume-analyzer
   ```

2. Install frontend dependencies:
   ```
   npm install
   ```

3. Install backend dependencies:
   ```
   cd backend
   npm install
   cd ..
   ```

4. Configure environment variables:
   - Create a `.env.local` file in the root directory with:
     ```
     NEXT_PUBLIC_API_URL=/api
     BACKEND_URL=http://localhost:3001/api
     GROQ_API_KEY=your_groq_api_key_here
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

### Supabase Setup

1. Create a new project on [Supabase](https://supabase.com/)
2. Get your project URL and anon key from the project settings
3. Update your `.env.local` file with these values
4. Set up the database schema by either:
   - Running the SQL in `scripts/setup-supabase.sql` in the Supabase SQL editor
   - Or using our setup script: `npm run setup:supabase`

5. Start both frontend and backend together:
   ```
   npm run dev
   ```

   Or start them separately:
   - Frontend: `npm run dev:frontend`
   - Backend: `npm run dev:backend`

6. Open your browser and navigate to `http://localhost:3000`

## Troubleshooting

### "Failed to analyze resume" error

1. Make sure the backend server is running properly
   - Check if it's running at `http://localhost:3001`
   - Verify the GROQ API key in `backend/.env` is valid and not expired

2. Check the console for more detailed error messages
   - Frontend console (browser dev tools)
   - Backend console (terminal running the backend)

3. Verify that the resume file:
   - Is in a supported format (PDF, DOC, DOCX, or TXT)
   - Is not larger than 5MB
   - Is a valid resume document

### Connection Issues

1. Verify both frontend and backend are running:
   - Frontend should be at `http://localhost:3000`
   - Backend should be at `http://localhost:3001`

2. Check if there are any network issues:
   - CORS errors in the browser console
   - Network connection issues

3. Verify correct environment variables are set

### Supabase Database Issues

#### "public.resume_analyses does not exist" Error

If you encounter this error, it means the database table hasn't been created properly:

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the entire contents of the `scripts/setup-supabase.sql` file
4. Paste it into the SQL Editor and run the query
5. Check that the query executed successfully without errors

If you still encounter issues:

1. From the Supabase dashboard, go to Table Editor
2. Check if the `resume_analyses` table exists under the "public" schema
3. If it doesn't exist, you may need to manually create it with:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id uuid NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  resume_name text NOT NULL,
  job_position text,
  job_field text,
  intensity text NOT NULL,
  rejection_letter text NOT NULL,
  feedback_points jsonb NOT NULL,
  score integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

4. After creating the table, run the remaining SQL in the setup script to set up security policies
