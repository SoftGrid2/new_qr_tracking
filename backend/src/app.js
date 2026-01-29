import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import productRoutes from './routes/product.routes.js';
import scanRoutes from './routes/scan.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import authRoutes from './routes/auth.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import qrRoutes from './routes/qr.routes.js';

dotenv.config();

const app = express();

// app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }));
// Convert comma-separated origins from .env into an array
const allowedOrigins = process.env.FRONTEND_URL
	? process.env.FRONTEND_URL.split(",").map(origin => origin.trim())
	: [];

console.log("✅ Allowed CORS Origins:", allowedOrigins);

const corsOptions = {
	origin: (origin, callback) => {
		// Allow requests with no origin (like Postman, curl)
		if (!origin) return callback(null, true);

		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		} else {
			console.warn(`❌ CORS blocked request from: ${origin}`);
			// Block the request
			return callback(new Error("Not allowed by CORS"));
		}
	},
	credentials: true, // allow cookies or auth headers
};

// Apply CORS globally
app.use(cors(corsOptions));

// logs printing in console

// color of status selector for morgan
const colorByStatus = (status) => {
	if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // red
	if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // yellow
	if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // cyan
	return `\x1b[32m${status}\x1b[0m`; // green
};

// color of method selector for morgan
const colorByMethod = (method) => {
	switch (method) {
		case "GET":
			return `\x1b[32m${method}\x1b[0m`; // green
		case "POST":
			return `\x1b[34m${method}\x1b[0m`; // blue
		case "PUT":
			return `\x1b[33m${method}\x1b[0m`; // yellow
		case "DELETE":
			return `\x1b[31m${method}\x1b[0m`; // red
		default:
			return `\x1b[37m${method}\x1b[0m`; // white
	}
};


morgan.token("colored-status", (req, res) => colorByStatus(res.statusCode));
morgan.token("colored-method", (req) => colorByMethod(req.method));


// app.use(morgan("dev"));
app.use(morgan('\x1b[90m[:date[iso]]\x1b[0m [:colored-status] :colored-method	\x1b[36m:url\x1b[0m \x1b[35m:response-time ms\x1b[0m'));



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/qr', qrRoutes);

// app.use((err, req, res, next) => {
//   console.error(err);
//   res
//     .status(err.status || 500)
//     .json({ message: err.message || 'Internal server error' });
// });


// 404 handler logs your missing endpoints
app.use((req, res) => {
	const red = "\x1b[31m";
	const yellow = "\x1b[33m";
	const grey = "\x1b[90m";
	const reset = "\x1b[0m";

	console.log(
		`${grey}[${new Date().toISOString()}]${reset} ` +
		`[${red}${res.statusCode}${reset}] ` +
		`${yellow}${req.method}` +
		`	${red}${req.originalUrl} ` +
		`${red}<-- * Endpoint Not Found${reset}`
	);

	res.status(404).json({
		status: false,
		message: "Endpoint Not Found",
	});
});


// ----- 500 (error handler) -----
app.use((err, req, res, next) => {
	const status = err.status || err.statusCode || 500;

	const red = "\x1b[31m";
	const yellow = "\x1b[33m";
	const grey = "\x1b[90m";
	const reset = "\x1b[0m";

	// single, efficient write
	const line =
		`${grey}[${new Date().toISOString()}]${reset} ` +
		`[${colorByStatus(status)}] ` +
		`${colorByMethod(req.method)} ${req.originalUrl} ` +
		`${red}<-- * Server Error${reset}\n`;
	process.stderr.write(line);

	// minimal details in prod; full stack in dev
	if (process.env.NODE_ENV !== "production") {
		process.stderr.write((err.stack || String(err)) + "\n");
	}

	if (!res.headersSent) {
		res.status(status).json({ success: false, message: "Internal Server Error" });
	} else {
		next(err); // if headers already sent, delegate
	}
});

export default app;
