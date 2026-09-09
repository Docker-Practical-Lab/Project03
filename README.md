# 🚀 MERN Stack - Dockerized Full Stack Application

> A **MongoDB + Express + React + Node.js** full stack application, fully containerized with **Docker Compose** so you can spin up the entire stack with a single command. 🐳

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [🧰 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [✅ Prerequisites](#-prerequisites)
- [🐳 Dockerfiles](#-dockerfiles)
- [🐙 Docker Compose](#-docker-compose)
- [🚀 Getting Started](#-getting-started)
- [🔗 Services & Ports](#-services--ports)
- [🔍 Key Docker Compose Concepts](#-key-docker-compose-concepts)
- [🛠 Useful Commands](#-useful-commands)
- [🧹 Cleaning Up](#-cleaning-up)

---

## ✨ Features

- 🖥️ **React + Vite** frontend with hot reload
- ⚙️ **Express** REST API
- 🍃 **MongoDB** database with persistent storage
- 🐳 Everything orchestrated by **Docker Compose**
- ⚡ One command to build, run, and connect all services
- 🔁 Automatic restart on failure (`restart: unless-stopped`)

---

## 🧰 Tech Stack

| Layer        | Technology                            | Role              |
| ------------ | ------------------------------------- | ----------------- |
| 🟢 **MongoDB** | `mongo:7`                           | Database          |
| ⚙️ **Express** | Node.js / Express 5 (`server`)      | REST API          |
| 🟦 **React**   | React 19 + Vite 8 (`client`)        | Frontend UI       |
| 🟨 **Node.js** | Node 24 (used by both apps)         | Runtime           |

---

## 📁 Project Structure

```
Project03/
├── 📁 client/                # React + Vite frontend
│   ├── Dockerfile            # Client image definition
│   ├── vite.config.js        # Dev server config + /api proxy
│   ├── package.json
│   └── ...
├── 📁 server/                # Express REST API
│   ├── Dockerfile            # Server image definition
│   ├── server.js             # Express application entry point
│   ├── User.js               # Mongoose model
│   ├── package.json
│   └── ...
├── 🐳 docker-compose.yml     # Orchestrates all 3 services
└── 📖 README.md              # This file
```
---

## ✅ Prerequisites

Make sure you have the following installed:

- [🐳 Docker](https://docs.docker.com/get-docker/) (Docker Desktop on Windows/macOS)
- [🐳 Docker Compose](https://docs.docker.com/compose/install/) (bundled with Docker Desktop)

> 💡 Verify with: `docker --version` and `docker compose version`

---

## 🐳 Dockerfiles

### ⚙️ Server — `server/Dockerfile`

```dockerfile
# Use the official Node.js image
FROM node:24

# Set the working directory inside the container
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install project dependencies deterministically from the lockfile
RUN npm ci || npm install

# Copy the rest of the application source code
COPY . .

# Document the port the application listens on
EXPOSE 5000

# Run the server in the foreground
CMD ["npm", "run", "start"]
```

### 🟦 Client — `client/Dockerfile`

```dockerfile
FROM node:24

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5173

CMD [ "npm", "run", "dev" ]
```
---

## 🐙 Docker Compose

A **`docker-compose.yml`** file defines and runs **multi-container Docker applications**. Instead of writing long `docker run` commands for every service, we describe all of them declaratively and Docker Compose takes care of the rest. 🎉

It manages three main things:

1. **🧩 Services** — the containers (mongodb, server, client)
2. **💾 Volumes** — persistent data storage
3. **🌐 Networks** — communication between containers

### `docker-compose.yml`

```yaml
name: project03

services:
  mongodb:
    image: mongo:7
    container_name: project03-mongodb
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - project03-net
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.runCommand('ping').ok"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  server:
    build:
      context: ./server
    container_name: project03-server
    restart: unless-stopped
    environment:
      PORT: 5000
      MONGODB_URI: mongodb://mongodb:27017/project03
    ports:
      - "5000:5000"
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - project03-net

  client:
    build:
      context: ./client
    container_name: project03-client
    restart: unless-stopped
    environment:
      API_PROXY_TARGET: http://server:5000
    ports:
      - "5173:5173"
    depends_on:
      - server
    networks:
      - project03-net

volumes:
  mongodb_data:

networks:
  project03-net:
    driver: bridge
```

### 🧩 What each service does

| Service   | Image / Build       | Purpose                                   | Ports        |
| --------- | ------------------- | ----------------------------------------- | ------------ |
| 🍃 mongodb | `mongo:7`          | Database with a **healthcheck**           | `27017`      |
| ⚙️ server  | `build: ./server`  | Express API, connects to MongoDB          | `5000→5000` |
| 🟦 client  | `build: ./client`  | Vite dev server, proxies `/api` to server | `5173→5173` |

> 🌐 **Cross-container communication** happens over the `project03-net` bridge network using **service names** (e.g. `mongodb`, `server`) instead of `localhost`.
---

## 🚀 Getting Started

### 1️⃣ Start the full stack

```bash
docker compose up --build
```

> 🏗️ `--build` forces a rebuild so Dockerfile changes are picked up.

### 2️⃣ Run in the background (detached)

```bash
docker compose up --build -d
```

### 3️⃣ Open the app

- 🌐 Frontend (React): **http://localhost:5173**
- ⚙️ Backend (Express): **http://localhost:5000**
- 🍃 MongoDB: **mongodb://localhost:27017**

---

## 🔗 Services & Ports

| Service   | Container Name       | Host → Container | URL                       |
| --------- | -------------------- | ---------------- | ------------------------- |
| 🟦 client | `project03-client`   | `5173 → 5173`    | http://localhost:5173     |
| ⚙️ server | `project03-server`   | `5000 → 5000`    | http://localhost:5000     |
| 🍃 mongodb| `project03-mongodb`  | `27017 → 27017`  | mongodb://localhost:27017 |

### 🔎 Quick API test

```bash
curl http://localhost:5000/
# → {"status":"ok","message":"Server is running"}
```
---

## 🔍 Key Docker Compose Concepts

### 🌐 Networks
All services are attached to a custom `project03-net` network, letting them reach each other by **service name**. This means the server connects to `mongodb://mongodb:27017`, and the client proxies `/api` to `http://server:5000`.

### 💾 Volumes
```yaml
volumes:
  mongodb_data:
```
The **named volume** `mongodb_data` is mounted at `/data/db` inside the MongoDB container, so your database **survives container restarts and rebuilds**. 🔒

### 💚 Healthchecks + `depends_on`
MongoDB runs a `mongosh ping` healthcheck. The server uses:
```yaml
depends_on:
  mongodb:
    condition: service_healthy
```
This ensures the server only boots **after** MongoDB is ready — preventing flaky "connection refused" errors. ✅

### ⌨️ `stdin_open: true` and `tty: true`
These optional container options keep an **interactive terminal** attached to the container:

- **⌨️ `stdin_open: true`** — Keeps the container's **standard input (stdin) open**, even when a terminal is not attached. Useful when you want to keep an interactive session available or send input to a long-running process.

- **🖥️ `tty: true`** — Allocates a **pseudo-TTY** (a virtual terminal) to the container. It enables things like **colored output** and lets **interactive commands** (e.g. `node`, `npm`, shell utilities) behave as if they were running in a regular terminal.

Example:
```yaml
services:
  server:
    build: ./server
    stdin_open: true
    tty: true
```

> ℹ️ These are handy during **development/debugging** but are usually omitted for production images.

---

## 🛠 Useful Commands

| Command                                  | Description                   |
| ---------------------------------------- | ----------------------------- |
| `docker compose up --build`              | Build & start all services    |
| `docker compose up -d`                   | Start in detached mode        |
| `docker compose ps`                      | Show running containers       |
| `docker compose logs -f server`          | Follow live logs of a service |
| `docker compose exec server sh`          | Open a shell inside a service |
| `docker compose down`                    | Stop & remove containers      |
| `docker compose down -v`                 | Stop & remove **volumes** too |
| `docker compose build`                   | Rebuild images                |
| `docker compose config`                  | Validate the compose file     |

---

## 🧹 Cleaning Up

Stop all containers and remove the network:

```bash
docker compose down
```

To **also delete the database data** (the named volume):

```bash
docker compose down -v
```

> ⚠️ `-v` deletes **all** persisted data, including the MongoDB volume. Use with caution! 🔥

---

## 📝 License

This is a Docker **practical lab** project. Feel free to experiment and extend it. 🧪