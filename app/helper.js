const validCommands = ["echo", "ping", "set", "get", "del", "ttl", "exit"];

export const isCommand = (message) => {
  const normalized = message.at(0).toLowerCase();
  return validCommands.includes(normalized);
};

export const getCommand = (req) => {
  const dataNoLengths = req.slice(1).filter((x) => x.charAt(0) !== "$");

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
