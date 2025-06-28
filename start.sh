#!/bin/bash

# Start MongoDB
echo "Starting MongoDB..."
mongod --dbpath ~/mongodb/data/db &

# Wait a bit for MongoDB to start
echo "Waiting for MongoDB to start..."
sleep 5

echo "Starting backend server..."
cd backend && npm install && npm run dev &

echo "Starting frontend server..."
cd ../frontend && npm install && ng serve &

echo "All services are starting up..."
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:4200"

# Wait for all background processes to finish
wait
