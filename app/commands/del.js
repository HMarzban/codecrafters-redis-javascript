const db = require("../db");

const DEL = async (connection, data) => {
  const key = data.at(0);
  if (await db.has(key)) await db.delete(key);

  connection.write(`+OK\r\n`);
};

module.exports = DEL;
