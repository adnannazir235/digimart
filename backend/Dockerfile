FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production deps (modern way)
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]