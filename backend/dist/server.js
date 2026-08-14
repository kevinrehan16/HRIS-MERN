import express, {} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
// import MIDDLEWARES
import { errorMiddleware } from './middlewares/error.middleware.js';
// import ROUTES HERE // Gagawa tayo nito mamaya
import { ROUTES } from './config/constants.js';
import { initAbsentJob } from './jobs/absentJob.js';
import authRoutes from './routes/auth.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import departmentRoutes from './routes/department.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import leaveRoutes from './routes/leave.routes.js';
import leaveRequestRoutes from './routes/leaveRequest.routes.js';
import payrollRoutes from './routes/payroll.routes.js';
import payrollPeriodRoutes from './routes/payrollPeriod.routes.js';
import positionRoutes from './routes/position.routes.js';
import holidayRoutes from './routes/holiday.routes.js';
import attendanceCorrectionRoutes from './routes/attendanceCorrection.routes.js';
import scheduleRoutes from './routes/schedule.routes.js';
import documents from './routes/document.routes.js';
import notifications from './routes/notification.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// 1. Standard Enterprise Middlewares
app.use(cors({
    origin: 'http://localhost:5173', // Dapat specific URL ng frontend mo
    credentials: true, // KRITIKAL: Ito ang nagpapahintulot sa Cookies
}));
app.use(express.json()); // Para makabasa ng JSON bodies
app.use(cookieParser());
initAbsentJob(); // Simulan ang cron job para sa automated absent generation
// 2. Health Check (Optional pero recommended para sa Uptime monitoring)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});
// Routes
app.use(ROUTES.AUTH, authRoutes);
app.use(ROUTES.EMPLOYEES, employeeRoutes);
app.use(ROUTES.DEPARTMENTS, departmentRoutes);
app.use(ROUTES.ATTENDANCE, attendanceRoutes);
app.use(ROUTES.LEAVE, leaveRoutes);
app.use(ROUTES.LEAVE_REQUEST, leaveRequestRoutes);
app.use(ROUTES.PAYROLL, payrollRoutes);
app.use(ROUTES.PAYROLL_PERIODS, payrollPeriodRoutes);
app.use(ROUTES.POSITIONS, positionRoutes);
app.use(ROUTES.HOLIDAYS, holidayRoutes);
app.use(ROUTES.ATTENDANCE_CORRECTION, attendanceCorrectionRoutes);
app.use(ROUTES.SCHEDULE, scheduleRoutes);
app.use(ROUTES.DOCUMENT, documents);
app.use(ROUTES.NOTIFICATION, notifications);
app.use(ROUTES.DASHBOARD, dashboardRoutes);
// Global Error Handler - Dapat itong laging nasa HULI ng lahat ng routes/middleware
app.use(errorMiddleware);
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
// Graceful Shutdown - Importante sa Enterprise para hindi ma-hang ang DB connections
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});
//# sourceMappingURL=server.js.map