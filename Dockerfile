# Builder stage
FROM node:18-slim as builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy environment file
COPY .env ./

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start:prod"]