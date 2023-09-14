const isCommand = (message) => {
  const normalized = message.at(0).toLowerCase();

  if (normalized === "echo") {
    return true;
  }
  if (normalized === "ping") {
    return true;
  }
  if (normalized === "set") {
    return true;
  }
  if (normalized === "get") {
    return true;
  }
  if (normalized === "del") {
    return true;
  }
  if (normalized === "ttl") {
    return true;
  }
  if (normalized === "exit") {
    return true;
  }

  return false;
};

const getCommand = (req) => {
  const [length, ...data] = req;
  const dataNoLengths = data.filter((x) => x.charAt(0) !== "$");

  if (isCommand(dataNoLengths)) {
    return {
      command: dataNoLengths[0].toLowerCase(),
      data: dataNoLengths.slice(1),
    };
  }
  return {
    command: "error",
    data: "error",
  };
};

module.exports = {
  getCommand,
  isCommand,
};
