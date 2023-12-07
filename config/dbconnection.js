import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const startTime = performance.now();
// Create the connection using the promise-based approach
const connection = await mysql.createConnection({
  host:'mysql-3395be8e-siddharthgohil07-1a55.a.aivencloud.com',
  user: 'avnadmin',
  password:"AVNS_Btp7vSyDm7lE2Vwnh-0",
  port:27353,
  database:'CLASSROOM',
});

const endTime = performance.now();

// Confirm the successful database connection
(async () => {
  try {
    await connection.query('SELECT 1');
    console.log('Connected to the database!');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  } finally {
    // Calculate and log the elapsed time
    const elapsedTimeInMs = endTime - startTime;
    console.log(`Connection attempt took ${elapsedTimeInMs.toFixed(2)} ms`);
  }
})();

export default connection;
