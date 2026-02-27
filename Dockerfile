# Use Node.js 20 LTS as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Setup Environment
ENV NODE_ENV=production

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build
RUN npm run migrate

# Expose the port your app runs on (adjust if needed)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
