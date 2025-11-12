import app from '../src/app';

// Export the Express app as a serverless function for Vercel
export default app;

// Note: Vercel will handle incoming requests and pass them to the app
// The app.listen() from src/index.ts is not needed in serverless mode
