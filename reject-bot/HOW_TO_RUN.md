# How to Run the Reject-Bot Application

The application consists of two parts that need to run simultaneously:
1. Backend server (Express.js)
2. Frontend server (Next.js)

## Running on Windows

### Option 1: Run using Batch files (Recommended)

1. Start the backend server first:
   - Double-click the `start-backend.bat` file
   - A new command prompt will open
   - Wait until you see: `Backend server running on http://localhost:3001`

2. Start the frontend server in another window:
   - Double-click the `start-frontend.bat` file
   - A new command prompt will open
   - Wait until you see: `Ready in XXXX ms`

3. Open your browser and navigate to:
   - http://localhost:3002

### Option 2: Run using PowerShell scripts

1. Start the backend server first:
   - Right-click `start-backend.ps1` and select "Run with PowerShell"
   - Wait until you see: `Backend server running on http://localhost:3001`

2. Start the frontend server in another window:
   - Right-click `start-frontend.ps1` and select "Run with PowerShell"
   - Wait until you see: `Ready in XXXX ms`

3. Open your browser and navigate to:
   - http://localhost:3002

### Option 3: Run manually

1. Start the backend server first:
   - Open Command Prompt
   - Run: `cd C:\Users\surya\HACKATHON\reject-bot\backend`
   - Run: `npm run dev`
   - Wait until you see: `Backend server running on http://localhost:3001`

2. Start the frontend server in another window:
   - Open another Command Prompt
   - Run: `cd C:\Users\surya\HACKATHON\reject-bot`
   - Run: `npm run dev:frontend`
   - Wait until you see: `Ready in XXXX ms`

3. Open your browser and navigate to:
   - http://localhost:3002

## Troubleshooting

### Port Already in Use

If you see an error like `Error: listen EADDRINUSE: address already in use :::3001`:

1. Find the process using the port:
   - Open Command Prompt as administrator
   - Run: `netstat -ano | findstr :3001`
   - Note the PID (last column)

2. Kill the process:
   - Run: `taskkill /PID <PID> /F`
   - Try starting the server again

### Connection Refused

If the frontend shows `ECONNREFUSED` errors:

1. Make sure the backend server is running
2. Check that it's listening on port 3001
3. Verify your `.env.local` file has:
   ```
   BACKEND_URL=http://localhost:3001
   ``` 