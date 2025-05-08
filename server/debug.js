const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envFile = `.env.development.local`;
console.log(`Loading environment variables from: ${envFile}`);
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

async function checkRoutes() {
  try {
    console.log('Checking routes files...');
    
    // Path to routes directory
    const routesDir = path.join(__dirname, 'src', 'routes');
    
    // Read the routes directory
    const routeFiles = fs.readdirSync(routesDir);
    console.log('Route files:', routeFiles);
    
    // Check the index.ts file
    const indexPath = path.join(routesDir, 'index.ts');
    if (fs.existsSync(indexPath)) {
      console.log('index.ts exists, checking contents...');
      const content = fs.readFileSync(indexPath, 'utf8');
      console.log(content.slice(0, 500) + '...');  // Print first 500 chars for brevity
    }
    
    console.log('Routes check complete');
  } catch (error) {
    console.error('Error checking routes:', error);
  }
}

async function checkMiddlewares() {
  try {
    console.log('Checking middleware files...');
    
    // Path to middlewares directory
    const middlewaresDir = path.join(__dirname, 'src', 'middlewares');
    
    // Read the middlewares directory
    const middlewareFiles = fs.readdirSync(middlewaresDir);
    console.log('Middleware files:', middlewareFiles);
    
    console.log('Middlewares check complete');
  } catch (error) {
    console.error('Error checking middlewares:', error);
  }
}

async function checkControllers() {
  try {
    console.log('Checking controller files...');
    
    // Path to controllers directory
    const controllersDir = path.join(__dirname, 'src', 'controllers');
    
    // Read the controllers directory
    const controllerFiles = fs.readdirSync(controllersDir);
    console.log('Controller files:', controllerFiles);
    
    console.log('Controllers check complete');
  } catch (error) {
    console.error('Error checking controllers:', error);
  }
}

async function testWebhookRoute() {
  try {
    console.log('Testing webhook route...');
    
    // Import the webhook route
    const webhookRoutePath = path.join(__dirname, 'src', 'routes', 'webhook.route.ts');
    if (fs.existsSync(webhookRoutePath)) {
      console.log('webhook.route.ts exists, checking contents...');
      const content = fs.readFileSync(webhookRoutePath, 'utf8');
      console.log(content);
    } else {
      console.log('webhook.route.ts does not exist');
    }
    
    console.log('Webhook route test complete');
  } catch (error) {
    console.error('Error testing webhook route:', error);
  }
}

async function runTests() {
  console.log('Running tests...');
  
  await checkRoutes();
  await checkMiddlewares();
  await checkControllers();
  await testWebhookRoute();
  
  console.log('All tests complete');
}

runTests(); 