# Sarvavihar E-commerce Deployment Guide

## Overview

This guide provides instructions for deploying the Sarvavihar e-commerce application on Vercel. The application consists of two parts:

1. **Frontend**: React application
2. **Backend**: Node.js/Express API

## Prerequisites

- A Vercel account
- GitHub repositories for both frontend and backend
- MongoDB Atlas account with a configured cluster

## Backend Deployment

1. **Push your code to GitHub** (if not already done)

2. **Set up environment variables in Vercel**:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Secret key for JWT token generation
   - `JWT_REFRESH_SECRET`: Secret key for refresh tokens
   - `JWT_EXPIRE`: Token expiration time (e.g., "15m")
   - `JWT_REFRESH_EXPIRE`: Refresh token expiration (e.g., "7d")
   - `FRONTEND_URL`: URL of your deployed frontend (e.g., "https://sarvavihar-frontend.vercel.app")

3. **Deploy to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Import your backend repository
   - Configure the project:
     - Build Command: `npm install`
     - Output Directory: Leave empty
     - Install Command: `npm install`
     - Development Command: `npm run dev`
   - Add the environment variables
   - Deploy

## Frontend Deployment

1. **Update API URL**:
   - Create or update `.env` file with:
     ```
     REACT_APP_API_URL=https://your-backend-url.vercel.app
     ```

2. **Push your code to GitHub** (if not already done)

3. **Deploy to Vercel**:
   - Go to [Vercel](https://vercel.com)
   - Import your frontend repository
   - Configure the project:
     - Framework Preset: Create React App
     - Build Command: `npm run build`
     - Output Directory: `build`
     - Install Command: `npm install`
     - Development Command: `npm start`
   - Add the environment variables:
     - `REACT_APP_API_URL`: URL of your deployed backend
   - Deploy

## Troubleshooting

### "Failed to load products" error

1. **Check CORS configuration**:
   - Ensure the backend has proper CORS settings with the frontend URL
   - Verify the `FRONTEND_URL` environment variable is set correctly

2. **API URL configuration**:
   - Confirm the `REACT_APP_API_URL` is set correctly in the frontend
   - Make sure it points to the deployed backend URL, not localhost

3. **Network requests**:
   - Use browser developer tools to check for network errors
   - Verify API endpoints are being called with the correct URL

4. **Database connection**:
   - Ensure MongoDB Atlas connection is working
   - Check backend logs for database connection issues

5. **Vercel logs**:
   - Check deployment logs in Vercel for both frontend and backend
   - Look for any build or runtime errors

## Redeployment

After making changes to your code:

1. Push changes to GitHub
2. Vercel will automatically redeploy if you've set up automatic deployments
3. Alternatively, trigger a manual redeployment from the Vercel dashboard