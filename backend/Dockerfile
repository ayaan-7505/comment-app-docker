FROM node:18-alpine

WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm install

# Copy rest of backend code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
