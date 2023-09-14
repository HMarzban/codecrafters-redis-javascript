const ECHO = (connection, data) => {
  connection.write(`+${data.join(" ")}\r\n`);
};

module.exports = ECHO;
