import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import attendanceRoutes from '../src/routes/attendance.routes.js';
import { errorMiddleware } from '../src/middlewares/error.middleware.js';

vi.mock('../src/middlewares/auth.middleware.js', () => ({
  protect: vi.fn((req: any, res: any, next: any) => {
    req.user = { id: 1, email: 'admin@test.com', role: 'ADMIN' };
    next();
  }),
  restrictTo: vi.fn(() => vi.fn((req: any, res: any, next: any) => next())),
}));

vi.mock('../src/services/attendance.service.js', () => ({
  getAdminAttendanceLogs: vi.fn(),
}));

vi.mock('../src/config/db.js', () => ({
  default: {
    employee: {
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    attendance: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      groupBy: vi.fn(),
    },
    overtimeRequest: {
      findFirst: vi.fn(),
    },
  },
}));

const prisma = await import('../src/config/db.js');
const attendanceService = await import('../src/services/attendance.service.js');

describe('Attendance Controller Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/attendance', attendanceRoutes);
    app.use(errorMiddleware);
  });

  it('should time in successfully', async () => {
    prisma.default.employee.findUnique.mockResolvedValue({ id: 1, schedule: { shiftStart: '08:00', gracePeriod: 15 } });
    prisma.default.attendance.findUnique.mockResolvedValue(null);
    prisma.default.attendance.create.mockImplementation(async ({ data }) => ({ id: 1, ...data }));

    const res = await request(app)
      .post('/attendance/time-in')
      .send({ employeeId: 1 });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Timed in');
    expect(prisma.default.attendance.create).toHaveBeenCalled();
  });

  it('should return 400 when time-in already exists for today', async () => {
    prisma.default.employee.findUnique.mockResolvedValue({ id: 1, schedule: { shiftStart: '08:00', gracePeriod: 15 } });
    prisma.default.attendance.findUnique.mockResolvedValue({ id: 1 });

    const res = await request(app)
      .post('/attendance/time-in')
      .send({ employeeId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Already timed in today!');
  });

  it('should time out successfully', async () => {
    const activeAttendance = {
      id: 1,
      employeeId: 1,
      timeIn: new Date('2026-05-13T08:00:00.000Z'),
      date: new Date('2026-05-13T13:00:00.000Z'),
      employee: { schedule: { shiftStart: '08:00', shiftEnd: '17:00', breakDuration: 60 } },
      remarks: 'On time'
    };

    prisma.default.attendance.findFirst.mockResolvedValue(activeAttendance);
    prisma.default.attendance.update.mockResolvedValue({ ...activeAttendance, timeOut: new Date('2026-05-13T17:30:00.000Z'), overtimeMinutes: 30, otStatus: 'PENDING' });

    const res = await request(app)
      .patch('/attendance/time-out')
      .send({ employeeId: 1 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overtimeMinutes).toBe(30);
    expect(prisma.default.attendance.update).toHaveBeenCalled();
  });

  it('should return 400 when time-out has no active time-in', async () => {
    prisma.default.attendance.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch('/attendance/time-out')
      .send({ employeeId: 999 });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('No active time-in found.');
  });

  it('should fetch attendance summary successfully', async () => {
    prisma.default.attendance.groupBy.mockResolvedValue([
      { status: 'PRESENT', _count: { id: 5 } },
      { status: 'LATE', _count: { id: 2 } },
    ]);
    prisma.default.employee.count.mockResolvedValue(10);

    const res = await request(app)
      .get('/attendance/summary');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.present).toBe(5);
    expect(res.body.data.late).toBe(2);
    expect(res.body.data.absent).toBe(3);
  });

  it('should approve overtime successfully', async () => {
    prisma.default.attendance.findUnique.mockResolvedValue({ id: 1, employee: { firstName: 'John' }, otStatus: 'PENDING', overtimeMinutes: 45 });
    prisma.default.attendance.update.mockResolvedValue({ id: 1, otStatus: 'APPROVED' });

    const res = await request(app)
      .patch('/attendance/approve-ot')
      .send({ attendanceId: 1, status: 'APPROVED', remarks: 'Good work' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('has been approved');
    expect(prisma.default.attendance.update).toHaveBeenCalled();
  });
});