require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const morgan = require("morgan");
const winston = require("winston");
const dbConnection = require("./Config/dbConfig");
const initialRoutes = require("./routes/initialRoute.routes");
const userRoutes = require("./routes/userRoute.routes");
const loanRoutes = require("./routes/loanRoute.routes");
const paymentRoutes = require("./routes/paymentRoute.routes");

const app = express();

const port = process.env.SERVER_PORT || 3000;

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}] ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console({
            silent: process.env.NODE_ENV === 'production'
        }),
        new winston.transports.File({ filename: 'server.log' })
    ]
});

const allowedOrigins = [process.env.CLIENT_URL];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};



app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

app.use(process.env.PICTURE_URL, express.static(path.join(__dirname, `public/${process.env.PICTURE_URL} `)));
app.use(process.env.INITIALROUTES, initialRoutes);
app.use(process.env.USERROUTES, userRoutes);
app.use(process.env.LOANROUTES, loanRoutes);
app.use(process.env.PAYMENTROUTES, paymentRoutes);

app.get("/", (req, res) => {
    res.send("Server Working");
});

app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

async function connectToDatabase() {
    try {
        await dbConnection.execute("SELECT 'test'");
        logger.info("Database connection established");
        return true;
    } catch (err) {
        logger.error("Failed to connect to the database", err.message);
        return false;
    }
}

async function start() {
    const dbConnected = await connectToDatabase();

    if (dbConnected) {
        app.listen(port, () => {
            logger.info('Server running');
        });
    } else {
        app.listen(port, () => {
            logger.warn(`Server running  with limited functionality due to database connection failure`);
        });
    }
}

start();