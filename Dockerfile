# Build Stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm install

# Copy source code and Prisma schema
COPY . .
RUN npx prisma generate
RUN npm run build

# Run Stage
FROM node:18-alpine

WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built app from the build stage
COPY --from=build /app/dist ./dist
# Copy Prisma client from build stage
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/server.js"]
