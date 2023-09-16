import db from "../db.js";

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

const handleDBSet = async (key, value, setBehaviour) => {
  const keyExists = await db.has(key);

  if (
    !setBehaviour ||
    (setBehaviour === "nx" && !keyExists) ||
    (setBehaviour === "xx" && keyExists)
  ) {
    await db.set(key, value);
    return true;
  }

  return false; // Handle cases that don't match any of the conditions.
};

//Syntax:
// SET key value [NX | XX] [GET] [EX seconds | PX milliseconds | EXAT unix-time-seconds | PXAT unix-time-milliseconds | KEEPTTL]
// URL: https://redis.io/commands/set/
const SET = async (connection, query) => {
  // Constants
  const timeOptions = ["ex", "px", "exat", "pxat", "keepttl"];
  const setBehaviourOptions = ["nx", "xx"];
  const getBehaviourOptions = ["get"];

  // Default Values
  let key, value, setBehaviour, getBehaviour, expiryType, expiryTimeRaw;

  // First two are always key and value
  [key, value, ...query] = query;

  query = query.map((item) => item.toLowerCase());

  // Check for SET behaviours NX or XX
  if (setBehaviourOptions.includes(query[0])) {
    setBehaviour = query.shift();
  }

  // Check for GET behaviour
  if (getBehaviourOptions.includes(query[0])) {
    getBehaviour = query.shift();
  }

  // Check for timeOptions
  if (timeOptions.includes(query[0])) {
    expiryType = query.shift();
    if (["ex", "px", "exat", "pxat"].includes(expiryType)) {
      expiryTimeRaw = query.shift();
    }
  }

  const expiryTime = +expiryTimeRaw;

  const expiryTypeError = validateExpiryType(expiryType, timeOptions);
  if (expiryTypeError) {
    connection.write(expiryTypeError + "\r\n");
    return false;
  }

  if (expiryType === "keepttl") {
    const keyData = await db.get(key);
    if (keyData) {
      handleDBSet(key, { ...keyData, value }, setBehaviour);
    }
    if (getBehaviour && keyData) {
      connection.write(`+"${value}"\r\n`);
    } else {
      connection.write("+OK\r\n");
    }
    return true;
  }

  // overwrite existing key and reset expiry
  if (!expiryType && !expiryTime) {
    const keyData = await db.get(key);

    handleDBSet(
      key,
      {
        ...keyData,
        value,
        expiryType: null,
        expiryTime: null,
      },
      setBehaviour
    );
    if (getBehaviour && keyData) {
      connection.write(`+${keyData.value}\r\n`);
    } else {
      connection.write("+OK\r\n");
    }
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
    console.info("expired");
    const data = await db.get(key);
    if (data?.expiryTime) {
      await db.delete(key);
    }
  }, delay);

  if (getBehaviour) {
    const keyData = await db.get(key);
    handleDBSet(
      key,
      { value, expiryType, expiryTime, ttx: Date.now() + delay },
      setBehaviour
    );

    if (keyData) {
      connection.write(`+${keyData.value}\r\n`);
    }
    return true;
  } else {
    handleDBSet(
      key,
      { value, expiryType, expiryTime, ttx: Date.now() + delay },
      setBehaviour
    );
  }

  connection.write("+OK\r\n");
  return true;
};

export default SET;
