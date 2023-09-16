import db from "../db.js";

const NO_KEY_PROVIDED_ERROR = "-Error: No key provided\r\n";
const KEY_NOT_FOUND_ERROR = "-Error: Key not found\r\n";
const DELETED_SUCCESS = "+OK\r\n";

/**
 * Deletes one or more keys.
 * For more information: https://redis.io/commands/del/
 *
 * @param {object} connection - Connection object.
 * @param {array} data - Data array containing the keys to be deleted.
 */
const DEL = async (connection, data) => {
  if (!data || data.length === 0) {
    connection.write(NO_KEY_PROVIDED_ERROR);
    return;
  }

  let deletedKeys = 0;

  for (const key of data) {
    if (await db.has(key)) {
      await db.delete(key);
      deletedKeys++;
    }
  }

  if (data.length > 1) {
    connection.write(`:${deletedKeys}\r\n`);
  } else {
    connection.write(deletedKeys ? DELETED_SUCCESS : KEY_NOT_FOUND_ERROR);
  }
};

export default DEL;
