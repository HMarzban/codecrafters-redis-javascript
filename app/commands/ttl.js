const db = require("../db");

const TTL = async (connection, data) => {
  const key = data.at(0);

  if (!(await db.has(key))) {
    connection.write(`-2\r\n`);
    return;
  }

  const result = await db.get(key);

  if (result.ttx < Date.now()) {
    connection.write(`-2\r\n`);
    return;
  }
  const remaingTime = parseFloat((result.ttx - Date.now()) / 1000).toFixed(0);

  connection.write(`+${remaingTime}\r\n`);
};

module.exports = TTL;
