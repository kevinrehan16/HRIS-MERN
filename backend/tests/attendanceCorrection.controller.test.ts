import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import attendanceCorrectionRoutes from '../src/routes/attendanceCorrection.routes.js';
import { errorMiddleware } from '../src/middlewares/error.middleware.js';

vi.mock('../src/middlewares/auth.middleware.js', () => ({
  protect: vi.fn((req: any, res: any, next: any) => {
    req.user = { id: 1, email: 'admin@test.com', role: 'ADMIN' };
    next();
  }),
  restrictTo: vi.fn(() => vi.fn((req: any, res: any, next: any) => next())),
}));

vi.mock('../src/config/db.js', () => ({
  default: {
    attendanceCorrection: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    attendance: {
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const prisma = await import('../src/config/db.js');

const getPrisma = () => (prisma as any).default;

describe('Attendance Correction Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    vi.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use('/attendance-correction', attendanceCorrectionRoutes);
    app.use(errorMiddleware);
  });

  it('should fetch correction requests', async () => {
    const mockRequests = [
      { id: 1, status: 'PENDING', employee: { firstName: 'Jane', lastName: 'Doe', employeeId: 'EMP001' }, attendance: { timeIn: new Date().toISOString(), timeOut: null, date: new Date().toISOString() } }
    ];
    getPrisma().attendanceCorrection.findMany.mockResolvedValue(mockRequests);

    const res = await request(app).get('/attendance-correction/corrections');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockRequests);
    expect(getPrisma().attendanceCorrection.findMany).toHaveBeenCalled();
  });

  it('should create a correction request successfully', async () => {
    const mockCreated = { id: 1, attendanceId: 5, type: 'BOTH', reason: 'Wrong time', status: 'PENDING' };
    getPrisma().attendanceCorrection.create.mockResolvedValue(mockCreated);

    const res = await request(app)
      .post('/attendance-correction/corrections')
      .send({ attendanceId: 5, requestedTimeIn: '2026-05-13T08:30:00Z', requestedTimeOut: '2026-05-13T17:30:00Z', reason: 'Wrong time' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(mockCreated);
    expect(getPrisma().attendanceCorrection.create).toHaveBeenCalled();
  });

  it('should approve a correction request successfully', async () => {
    const correction = {
      id: 1,
      attendanceId: 7,
      requestedTimeIn: new Date('2026-05-13T08:30:00Z'),
      requestedTimeOut: new Date('2026-05-13T17:30:00Z'),
      status: 'PENDING',
      attendance: { id: 7, timeIn: new Date('2026-05-13T08:00:00Z'), timeOut: new Date('2026-05-13T17:00:00Z') },
      employee: { schedule: { shiftStart: '08:00', shiftEnd: '17:00', gracePeriod: 15 } },
    };
    getPrisma().attendanceCorrection.findUnique.mockResolvedValue(correction);
    getPrisma().$transaction.mockResolvedValue([{}, {}]);

    const res = await request(app)
      .patch('/attendance-correction/corrections/1/approve')
      .send({ adminRemarks: 'Approved' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Attendance and Overtime recomputed and approved!');
    expect(getPrisma().$transaction).toHaveBeenCalled();
  });

  it('should return 404 when approving a missing correction request', async () => {
    getPrisma().attendanceCorrection.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .patch('/attendance-correction/corrections/999/approve')
      .send({ adminRemarks: 'Approved' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Request not found');
  });

  it('should reject a correction request successfully', async () => {
    getPrisma().attendanceCorrection.update.mockResolvedValue({ id: 1, status: 'REJECTED' });

    const res = await request(app)
      .patch('/attendance-correction/corrections/1/reject')
      .send({ adminRemarks: 'Denied' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Correction request rejected successfully');
    expect(getPrisma().attendanceCorrection.update).toHaveBeenCalled();
  });
});