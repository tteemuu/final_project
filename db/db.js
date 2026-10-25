import mysql from 'mysql2/promise';

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Adjust based on your needs
  queueLimit: 0
});

export default pool;

// Test the connection
pool.getConnection()
  .then((connection) => {
    console.log('✅ Database connected successfully!');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });