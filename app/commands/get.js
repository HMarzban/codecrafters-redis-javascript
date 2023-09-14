const db = require("../db");

const GET = async (connection, data) => {
  const key = data.at(0);
  const result = await db.get(key);

  if (result) connection.write(`+${result.value}\r\n`);
  else connection.write("$-1\r\n");
};

module.exports = GET;
