#!/bin/bash

# Check if Docker is running
echo "Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "Starting MongoDB..."
docker-compose up -d

echo "Starting backend server..."
cd backend && npm install && npm run dev &

echo "Starting frontend server..."
cd ../frontend && npm install && ng serve &

echo "All services are starting up..."
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:4200"
echo "MongoDB: http://localhost:27017"

# Wait for all background processes to finish
wait
