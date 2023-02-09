const { app, PORT, SERVER_TIMEOUT_IN_MINUTES } = require("../index.js");

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

const onError = (err, { portNumber, application }) => {
  if (err.code === "EADDRINUSE") {
    console.log(
      `----- Port ${portNumber} is busy, trying with port ${
        portNumber + 1
      } -----`
    );
    startServer(application, portNumber + 1);
  } else {
    console.log(err);
  }
};

var startServer = (application, portNumber) => {
  portNumber = normalizePort(portNumber);
  let server = application
    .listen(portNumber, () => {
      console.log(`
      *********************************************
      Server is now running on port: ${portNumber}
      Server Response Timeout set for (${Number(
        SERVER_TIMEOUT_IN_MINUTES
      ).toString()}) Minutes

      *********************************************`);
    })
    .on("error", (err) => {
      onError(err, { portNumber, application });
    });

  server.setTimeout(SERVER_TIMEOUT_IN_MINUTES * 60 * 1000);
};

startServer(app, PORT);
