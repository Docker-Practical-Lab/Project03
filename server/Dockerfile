# Use the official Node.js LTS (Alpine) image for a small footprint
FROM node:24

# Set the working directory inside the container
WORKDIR /app

# Copy package files first so dependency layers are cached and only
# rebuilt when package.json / package-lock.json change
COPY package*.json ./

# Install the project's dependencies (express, mongoose, cors, dotenv,
# nodemon, ...) deterministically using the lockfile. nodemon is part of
# "dependencies", so it is available to the `npm run start` script.
RUN npm ci || npm install

# Copy the rest of the application source code into the container
COPY . .

# Document the port the application listens on
EXPOSE 5000

# Run the server in the foreground
CMD ["npm", "run", "start"]
