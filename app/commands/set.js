const db = require("../db.js");

const computeDelay = (expiryType, expiryTime) => {
  switch (expiryType) {
    case "ex":
      return expiryTime * 1000;
    case "px":
      return expiryTime;
    case "exat":
      return expiryTime * 1000 - Date.now();
    case "pxat":
      return expiryTime - Date.now();
    default:
      return null;
  }
};

const validateExpiryType = (expiryType, timeOptions) => {
  if (!expiryType && !timeOptions.includes(expiryType)) return null;
  if (!timeOptions.includes(expiryType)) {
    return `Error: Invalid expiryType. Allowed values are: ${timeOptions.join(
      ", "
    )}`;
  }
  return null;
};

const validateExpiryTime = (expiryTime) => {
  if (typeof expiryTime !== "number" || expiryTime <= 0) {
    return "Error: Invalid or missing expiryTime.";
  }
  return null;
};

const SET = async (query, connection) => {
  const timeOptions = ["ex", "px", "exat", "pxat", "keepttl"];
  const [key, value, expiryType, expiryTimeRaw] = query;

  const expiryTime = +expiryTimeRaw;

  const expiryTypeError = validateExpiryType(expiryType, timeOptions);
  if (expiryTypeError) {
    connection.write(expiryTypeError + "\r\n");
    return false;
  }

  if (expiryType === "keepttl") {
    const keyData = await db.get(key);
    if (keyData) {
      await db.set(key, { ...keyData, value });
    }
    return true;
  }

  // overwrite existing key and reset expiry
  if (!expiryType && !expiryTime) {
    const keyData = await db.get(key);
    await db.set(key, {
      ...keyData,
      value,
      expiryType: null,
      expiryTime: null,
    });
    connection.write("+OK\r\n");
    return true;
  }

  const expiryTimeError = validateExpiryTime(expiryTime);
  if (expiryTimeError) {
    connection.write(expiryTimeError + "\r\n");
    return false;
  }

  const delay = computeDelay(expiryType, expiryTime);
  if (delay === null || delay <= 0) {
    connection.write(
      "Error: Invalid delay computed or timestamp is in the past. \r\n"
    );
    return false;
  }

  setTimeout(async () => {
    console.log("expired");
    const keyData = await db.get(key);
    if (keyData?.expiryTime) {
      await db.delete(key);
    }
  }, delay);

  await db.set(key, { value, expiryType, expiryTime });
  connection.write("+OK\r\n");
  return true;
};

module.exports = SET;
