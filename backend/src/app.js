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



app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/qr', qrRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Internal server error' });
});

export default app;
