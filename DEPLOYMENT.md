# Sarvavihar E-commerce Deployment Guide

## Overview

This guide provides instructions for deploying the Sarvavihar e-commerce application on Vercel or Render. The application consists of two parts:

1. **Frontend**: React application
2. **Backend**: Node.js/Express API

## Prerequisites

- A Vercel account
- GitHub repositories for both frontend and backend
- MongoDB Atlas account with a configured cluster

## Backend Deployment

### Vercel Deployment

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

### Render Deployment

1. **Push your code to GitHub** (if not already done)

2. **Deploy to Render**:
   - Go to [Render](https://render.com)
   - Click "New" > "Web Service"
   - Connect your GitHub repository
   - Configure the project:
     - Name: `sarvavihar-backend` (or your preferred name)
     - Runtime: Node
     - Build Command: `npm install`
     - Start Command: `node server.js` (or your entry point)
   - Add the environment variables:
     - `MONGODB_URI`: Your MongoDB Atlas connection string
     - `JWT_SECRET`: Secret key for JWT token generation
     - `JWT_REFRESH_SECRET`: Secret key for refresh tokens
     - `JWT_EXPIRE`: Token expiration time (e.g., "15m")
     - `JWT_REFRESH_EXPIRE`: Refresh token expiration (e.g., "7d")
     - `FRONTEND_URL`: URL of your deployed frontend
     - `PORT`: 10000 (Render will use this port)
   - Click "Create Web Service"

## Frontend Deployment

1. **Update API URL**:
   - Create or update `.env` file with:
     ```
     REACT_APP_API_URL=https://your-backend-url.vercel.app
     ```

2. **Push your code to GitHub** (if not already done)

### Vercel Deployment

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

### Render Deployment

3. **Deploy to Render**:
   - Go to [Render](https://render.com)
   - Click "New" > "Static Site"
   - Connect your GitHub repository
   - Configure the project:
     - Name: `sarvavihar-frontend` (or your preferred name)
     - Build Command: `npm install && npm run build`
     - Publish Directory: `build`
   - Add the environment variables:
     - `REACT_APP_API_URL`: URL of your deployed backend
   - Click "Create Static Site"

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

5. **Deployment logs**:
   - Check deployment logs in Vercel or Render for both frontend and backend
   - Look for any build or runtime errors

### Build Failures on Render

If your build fails on Render:

1. Check the build logs for specific error messages
2. Ensure that all dependencies are properly listed in package.json
3. Verify that the Node.js version is compatible
   - We've included a `.node-version` file specifying Node.js 18.18.0
   - Alternatively, you can set the `NODE_VERSION` environment variable in Render
4. Make sure the build and start commands are correct

## Redeployment

After making changes to your code:

1. Push changes to GitHub
2. Vercel or Render will automatically redeploy if you've set up automatic deployments
3. Alternatively, trigger a manual redeployment from the Vercel or Render dashboard