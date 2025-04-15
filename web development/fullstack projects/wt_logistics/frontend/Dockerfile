# Use official Node.js image
FROM node:18

# Set work directory
WORKDIR /app

# Accept build-time environment variable
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG IS_DOCKER
ENV IS_DOCKER=$IS_DOCKER

# Copy and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the frontend code
COPY . .

# Build the app
RUN npm run build

# Expose default Next.js port
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start"]
