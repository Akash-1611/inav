FROM node:18-alpine

WORKDIR /app

# Install Expo CLI
RUN npm install -g expo-cli

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 19000
EXPOSE 19001
EXPOSE 19002

# Start the Expo development server
CMD ["npx", "expo", "start", "--tunnel"]

