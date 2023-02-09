require('dotenv').config({ path: '.env' });

const {
  PORT,
  NODE_ENV,
  SERVER_TIMEOUT_IN_MINUTES,
  DEV_RATE_LIMITER_TTL,
  DEV_RATE_LIMITER,
  PRD_RATE_LIMITER_TTL,
  PRD_RATE_LIMITER,
} = process.env;

const express = require('express')
  , app = express()
  , session = require('express-session')
  , bodyParser = require('body-parser')
  , fs = require('fs')
  , helmet = require('helmet')
  , rateLimit = require('express-rate-limit')
  , cors = require('cors')
  , morgan = require('morgan')
  , { loadCities } = require('./models/cities')


/////////////////////////////////////////////////////////////
///////////  Initiating SQL Database connection /////////////
/////////////////////////////////////////////////////////////
console.log('Initiating SQL Database connection..')
require('./config/database/sql').get()
  .then(async (pool) => {
    console.log('SQL Database connected successfully!')

    // const cities = await loadCities({ cityCode: 'CAI' })
    // console.table(cities)
  })
  .catch(error => {
    // Can't connect to DB
    console.log(`Couldn't establish database connection, Exiting process..`)
    // process.exit()
  })

app.use(helmet());

// Applying request rate limiter to prevent DOS attack
app.use(rateLimit({
  windowMs:
    NODE_ENV === 'development'
      ? Number(DEV_RATE_LIMITER_TTL) * 1000
      : Number(PRD_RATE_LIMITER_TTL) * 1000, // in minutes
  max: NODE_ENV === 'development' ? DEV_RATE_LIMITER : PRD_RATE_LIMITER, // limit each IP's requests per windowMs
  message: `Too many requests, please try again later.`,
}));

// Disable x-powered-by to increase security & to save bandwidth
app.disable('x-powered-by');

// Create a write stream (in append mode)
const accessLogStream = fs.createWriteStream('./access.log', {
  flags: 'a',
});

// Applying console logging service
app.use(
  NODE_ENV === 'development'
    ? morgan('dev')
    : morgan('combined', {
      stream: accessLogStream,
    })
);

// Parsing JSON request body
app.use(bodyParser.json({ limit: '1024mb' }));
app.use(bodyParser.urlencoded({ limit: '1024mb', extended: false }));

/** Support CORS for integrations **/
app.use(
  cors({
    // origin: "/.com$/",
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    allowedHeaders: [
      'X-Requested-With',
      'Content-Type',
      'Authorization',
      'Accept',
    ],
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);

// Using session key
app.use(
  session({
    secret: 'someSecretKey',
    resave: false,
    saveUninitialized: false,
  })
);

////////////////////////////////////////////////
///////////  Swagger documentation /////////////
////////////////////////////////////////////////
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger/swagger.json');
// app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Exposing public key
// app.use('/public', express.static(__dirname + '/public'));


// Handle any unhandledRejection for promises
process.on('unhandledRejection', (err, promise) => {
  throw err;
});

// Handle uncaughtException errors and ends the process
process.on('uncaughtException', (error) => {
  console.log(`** Exiting process **`, error);
  process.exit(1);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next({ status: 404, message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  //TODO log errors for analysis
  res.status(err.status || 500).send({
    status: false,
    message: err.message ? err.message : 'Internal server error',
    error: NODE_ENV === 'development' ? err : undefined,
  });
});

module.exports = { app, PORT, SERVER_TIMEOUT_IN_MINUTES };
