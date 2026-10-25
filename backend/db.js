const { Pool } = require('pg'); 

// createPool --> maintains a pool of active connections (shared across requests) instead of open/closing a new one for every single database query 
// process.env.xxx --> Looks for env-variables first otherwise the fall-back value is used 
const pool = new Pool({ 
    host: process.env.DB_HOST, 
    user: process.env.DB_USER, 
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME, 
    port: process.env.DB_PORT, 
    max: 10, 
    idleTimeoutMillis: 30000, 
    connectionTimeoutMillis: 2000, 
});

// I pg returnerar pool.query() automatiskt ett Promise 
module.exports = pool;