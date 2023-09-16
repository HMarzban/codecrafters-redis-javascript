// Constants for response format
const BULK_STRING_FORMAT = `+{data}\r\n`;

/**
 * Returns the given string.
 * For more information: https://redis.io/commands/echo/
 *
 * @param {object} connection - Connection object.
 * @param {array} data - Data array containing the string to be echoed.
 */
const ECHO = (connection, data) => {
  const responseData = data.join(" ");
  connection.write(BULK_STRING_FORMAT.replace("{data}", responseData));
};

export default ECHO;
