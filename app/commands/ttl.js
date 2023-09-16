import db from "../db.js";

// Constants for error responses
const KEY_NOT_FOUND = `-2\r\n`;
const KEY_NO_EXPIRE = `-1\r\n`;

/**
 * Get the time-to-live of a key.
 * For more information: https://redis.io/commands/ttl/
 *
 * @param {object} connection - Connection object.
 * @param {array} data - Data array containing key as the first element.
 */
const TTL = async (connection, data) => {
  const key = data.at(0);

  // Check if the key exists in the database
  if (!(await db.has(key))) {
    connection.write(KEY_NOT_FOUND);
    return;
  }

  const result = await db.get(key);

  // Check if the key has an expiration time set
  if (!result.ttx || result.ttx < Date.now()) {
    connection.write(KEY_NO_EXPIRE);
    return;
  }

  // Calculate remaining time in seconds
  const remainingTime = Math.round((result.ttx - Date.now()) / 1000);

  connection.write(`+${remainingTime}\r\n`);
};

export default TTL;
