import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const startTime = process.hrtime();

// Create the connection using the promise-based approach
const connection = await mysql.createConnection({
  host: 'mysql-3395be8e-siddharthgohil07-1a55.a.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_Btp7vSyDm7lE2Vwnh-0',
  port: 27353,
  database: 'CLASSROOM',
});

const endTime = process.hrtime();

// Confirm the successful database connection
(async () => {
  try {
    await connection.query('SELECT 1');
    console.log('Connected to the database!');
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  } finally {
    // Calculate and log the elapsed time
    const elapsedTimeInMs = calculateElapsedTime(startTime, endTime);
    console.log(`Connection attempt took ${elapsedTimeInMs.toFixed(2)} ms`);
  }
})();

export default connection;

function calculateElapsedTime(startTime, endTime) {
  const NS_PER_SEC = 1e9;
  const NS_TO_MS = 1e6;

  const elapsedTimeInNs = (endTime[0] - startTime[0]) * NS_PER_SEC + (endTime[1] - startTime[1]);
  const elapsedTimeInMs = elapsedTimeInNs / NS_TO_MS;

  return elapsedTimeInMs;
}