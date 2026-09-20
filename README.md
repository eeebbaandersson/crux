# CRUX — Bouldering Tracker

<p>
<img src="images/app-preview.png" alt="CRUX - Bouldering Tracker Preview" width="1000">
</p>



CRUX is a minimalist, dark-themed Vue.js web application designed to log, filter, and keep track of bouldering climbs, active projects, and session stats. Built with a **mobile-first approach** for quick and seamless logging right at the gym.

🔗 **Live Frontend Demo:** [eeebbaandersson.github.io/crux/](https://eeebbaandersson.github.io/crux/)

⚠️ **Note on Live Demo –** The GitHub Pages version runs purely client-side using `localStorage`. To run the full-stack version, follow the local setup instructions below.

---

## ✨ Features

* **Log & Edit Climbs:** Add new climbs or update existing ones with gym name, date, grade, attempts count, style, status, and optional notes.
* **Auto-Calculated Flashes:** Logs with 1 attempt and `Send` status automatically get tagged and tracked as a **Flash**.
* **Filter System:** Instantly filter logged problems by **Status** (*Flash, Send, Project, Reset*), **Grade**, or **Style** (*Dyno, Overhang, Roof, Slab, Vertical*).
* **Live Stats Counter:** Hero dashboard displaying total Flashes, total Sends, and active Projects.
* **User Profile & Settings:** Manage username, favorite climbing style, and view total "Unfinished Business" (reset routes).
* **Full-stack Integration** RESTful API connected to a PostgreSQL database with offline `localStorage` fallback.
* **Responsive Layout:** Designed for desktop and mobile, with specific Safari/iOS optimizations.


## 🛠️ Tech Stack

* **Frontend:** Vue.js 3 (via CDN), HTML5, CSS3, `localStorage` fallback
* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (running via Docker)
* **Hosting:** GitHub Pages (Frontend Demo)


## 💻 Quick Local Setup

Follow these steps to run the full application locally with the Express API and PostgreSQL database.

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running in the background)

### 1. Start the Database &  Run Schema
1. Ensure Docker Desktop is running.
2. In the project root, start the PostgreSQL container and run the schema.sql file:
```bash
    docker-compose up -d
    docker exec -i crux-db-container psql -U postgres -d bouldering_db < schema.sql
```

### 2. Environment Variables
Create a `.env` file in the root directory with the following values:
```env
    PORT=3000
    DB_HOST=localhost
    DB_USER=postgres
    DB_PASSWORD=secret
    DB_NAME=bouldering_db
    DB_PORT=5432
```

### 3. Install Dependencies & Run Backend
Navigate to the backend directory and run:
```bash
    npm install
    npm run dev 
    # or
    node server.js
```
- The server runs at `http://localhost:3000`. 
- You can test the connection at `http://localhost:3000/api/health`.

### 4. Launch Frontend
Open `index.html` using **Live Server** in VS Code (or open the file directly in browser). The app connects to `http://localhost:3000/api/problems` with automatic `localStorage` fallback.


## 🚀 Upcoming Features

* **Full Cloud Deployment:** Host backend API and PostgreSQL on cloud plattform. 
* **User Authentication:** Implement registration/login system as well as account handling.
* **Climbing Session Management:** Start a new session and group every climb during that time to a specific date and gym.
* **Advanced Analytics:** Dynamic progress charts over time (grade progression and style breakdown graphs).