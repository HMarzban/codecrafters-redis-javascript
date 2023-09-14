const ECHO = () => {
  connection.write(`+${data.join(" ")}\r\n`);
};

module.exports = ECHO;
