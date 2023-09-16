import db from "../db.js";

// Constants for responses
const NULL_BULK_STRING = "$-1\r\n";

/**
 * Retrieve the value of the specified key.
 * For more information: https://redis.io/commands/get/
 *
 * @param {object} connection - Connection object.
 * @param {array} data - Data array containing key as the first element.
 */
const GET = async (connection, data) => {
  const key = data.at(0);
  const result = await db.get(key);

  connection.write(result ? `+${result.value}\r\n` : NULL_BULK_STRING);
};

export default GET;
