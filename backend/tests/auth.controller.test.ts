import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../src/config/db.js', () => ({
  __esModule: true,
  default: {
    employee: {
      findFirst: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../src/utils/password.util.js', () => ({
  __esModule: true,
  hashPassword: vi.fn(),
}));

vi.mock('../src/utils/sendResponse.js', () => ({
  __esModule: true,
  sendResponse: vi.fn(),
}));

vi.mock('bcrypt', () => ({
  __esModule: true,
  compare: vi.fn(),
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  __esModule: true,
  sign: vi.fn(),
  default: {
    sign: vi.fn(),
  },
}));

const prismaModule = await import('../src/config/db.js');
const { hashPassword } = await import('../src/utils/password.util.js');
const { sendResponse } = await import('../src/utils/sendResponse.js');
const bcrypt = await import('bcrypt');
const jwt = await import('jsonwebtoken');
const { register, login, logout, getMyProfile } = await import('../src/controllers/auth.controller.js');

const createMockResponse = () => {
  const res: any = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.cookie = vi.fn(() => res);
  return res as unknown as any;
};

describe('auth.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'testjwtsecret';
    process.env.NODE_ENV = 'test';
  });

  it('register should create a new employee and respond with safe data', async () => {
    const req: any = {
      body: {
        employeeId: 'EMP001',
        email: 'test@example.com',
        password: 'secret',
        firstName: 'John',
        lastName: 'Doe',
        gender: 'MALE',
        civilStatus: 'SINGLE',
        contactNo: '09171234567',
        departmentId: 1,
        positionId: 1,
        scheduleId: 1,
        employmentType: 'FULL_TIME',
        basicSalary: 20000,
        allowance: 1000,
        leaveCredits: 8,
        birthDate: '2024-01-01',
      },
    };

    (prismaModule.default.employee.findFirst as any).mockResolvedValue(null);
    (hashPassword as any).mockResolvedValue('hashed-secret');

    const createdEmployee = {
      id: 1,
      employeeId: 'EMP001',
      role: 'EMPLOYEE',
      firstName: 'John',
      lastName: 'Doe',
      middleName: null,
      extensionName: null,
      email: 'test@example.com',
      password: 'hashed-secret',
      birthDate: new Date('2024-01-01'),
      gender: 'MALE',
      civilStatus: 'SINGLE',
      contactNo: '09171234567',
      tinNo: null,
      sssNo: null,
      philhealthNo: null,
      pagibigNo: null,
      departmentId: 1,
      positionId: 1,
      scheduleId: 1,
      status: 'ACTIVE',
      employmentType: 'FULL_TIME',
      basicSalary: 20000,
      allowance: 1000,
      leaveCredits: 8,
      createdAt: new Date(),
    };

    (prismaModule.default.employee.create as any).mockResolvedValue(createdEmployee);

    const res = createMockResponse();

    await register(req, res, vi.fn());

    expect(hashPassword).toHaveBeenCalledWith('secret');
    expect(prismaModule.default.employee.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        employeeId: 'EMP001',
        role: 'EMPLOYEE',
        email: 'test@example.com',
        password: 'hashed-secret',
        status: 'ACTIVE',
        birthDate: expect.any(Date),
        gender: 'MALE',
        civilStatus: 'SINGLE',
        contactNo: '09171234567',
        employmentType: 'FULL_TIME',
        basicSalary: 20000,
        allowance: 1000,
        leaveCredits: 8,
      }),
    });

    expect(sendResponse).toHaveBeenCalledWith(
      res,
      201,
      expect.objectContaining({
        id: 1,
        employeeId: 'EMP001',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      }),
      'Employee created successfully!'
    );
  });

  it('register should return 400 when email already exists and not create employee', async () => {
    const req: any = {
      body: {
        employeeId: 'EMP002',
        email: 'duplicate@example.com',
        password: 'secret',
        firstName: 'Jane',
        lastName: 'Smith',
      },
    };

    (prismaModule.default.employee.findFirst as any).mockResolvedValue({
      email: 'duplicate@example.com',
      employeeId: 'OTHER001',
    });

    const res = createMockResponse();

    await register(req, res, vi.fn());

    expect(sendResponse).toHaveBeenCalledWith(res, 400, '', 'Email is already registered.');
    expect(prismaModule.default.employee.create).not.toHaveBeenCalled();
  });

  it('register should return 400 when employeeId already exists and not create employee', async () => {
    const req: any = {
      body: {
        employeeId: 'EMP003',
        email: 'unique@example.com',
        password: 'secret',
        firstName: 'Alex',
        lastName: 'Johnson',
      },
    };

    (prismaModule.default.employee.findFirst as any).mockResolvedValue({
      email: 'other@example.com',
      employeeId: 'EMP003',
    });

    const res = createMockResponse();

    await register(req, res, vi.fn());

    expect(sendResponse).toHaveBeenCalledWith(res, 400, '', 'Employee ID is already registered.');
    expect(prismaModule.default.employee.create).not.toHaveBeenCalled();
  });

  it('login should return 401 when credentials are invalid', async () => {
    const req: any = { body: { email: 'noone@example.com', password: 'wrong' } };
    (prismaModule.default.employee.findUnique as any).mockResolvedValue(null);

    const res = createMockResponse();

    await login(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid email or password',
    });
  });

  it('login should sign token, set cookie, and send success response', async () => {
    const req: any = { body: { email: 'user@example.com', password: 'password' } };
    const employee = {
      id: 10,
      email: 'user@example.com',
      password: 'hashed-password',
      role: 'EMPLOYEE',
      firstName: 'User',
      lastName: 'Example',
    };

    (prismaModule.default.employee.findUnique as any).mockResolvedValue(employee);
    (bcrypt as any).default.compare.mockResolvedValue(true);
    (jwt as any).default.sign.mockReturnValue('signed-token');

    const res = createMockResponse();
    const next = vi.fn();

    await login(req, res, next);

    expect((bcrypt as any).default.compare).toHaveBeenCalledWith('password', 'hashed-password');
    expect((jwt as any).default.sign).toHaveBeenCalledWith(
      {
        id: 10,
        email: 'user@example.com',
        role: 'EMPLOYEE',
        firstName: 'User',
        lastName: 'Example',
      },
      'testjwtsecret',
      { expiresIn: '1d' }
    );

    expect(res.cookie).toHaveBeenCalledWith(
      'token',
      'signed-token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
      })
    );

    expect(sendResponse).toHaveBeenCalledWith(
      res,
      200,
      { id: 10, email: 'user@example.com', role: 'EMPLOYEE' },
      'Login Successful!'
    );
  });

  it('logout should clear token cookie and return success JSON', async () => {
    const res = createMockResponse();
    const req: any = {};

    await logout(req, res, vi.fn());

    expect(res.cookie).toHaveBeenCalledWith(
      'token',
      '',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
      })
    );

    const cookieOptions = (res.cookie as any).mock.calls[0][2];
    expect(cookieOptions.expires.getTime()).toBe(new Date(0).getTime());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Logged out successfully',
    });
  });

  it('getMyProfile should return profile with leaveSummary and remove leaves', async () => {
    const req: any = { user: { id: 5 } };
    const user = {
      id: 5,
      employeeId: 'EMP005',
      firstName: 'Leave',
      lastName: 'User',
      middleName: null,
      email: 'leave.user@example.com',
      leaveCredits: 8,
      status: 'ACTIVE',
      leaves: [
        { startDate: '2024-05-01', endDate: '2024-05-02' },
        { startDate: '2024-05-05', endDate: '2024-05-07' },
      ],
      department: { name: 'HR' },
      position: { title: 'Staff' },
      schedule: {
        name: 'Day',
        shiftStart: '08:00',
        shiftEnd: '17:00',
        gracePeriod: 15,
      },
      basicSalary: 25000,
      allowance: 1000,
      address: '123 Main St',
      birthDate: new Date('1990-01-01'),
      civilStatus: 'SINGLE',
      contactNo: '09171234567',
      dateHired: new Date('2022-01-01'),
      dateResigned: null,
      employmentType: 'FULL_TIME',
      extensionName: null,
      gender: 'FEMALE',
      pagibigNo: '12345',
      philhealthNo: '67890',
      sssNo: '11111',
      tinNo: '22222',
      createdAt: new Date('2022-01-01'),
    };

    (prismaModule.default.employee.findUnique as any).mockResolvedValue(user);
    const res = createMockResponse();

    await getMyProfile(req, res, vi.fn());

    expect(sendResponse).toHaveBeenCalledWith(
      res,
      200,
      expect.objectContaining({
        id: 5,
        employeeId: 'EMP005',
        email: 'leave.user@example.com',
        leaveCredits: 8,
        leaveSummary: {
          total: 8,
          used: 5,
          left: 3,
        },
      }),
      'Fetch my profile informations.'
    );

    const sentData = (sendResponse as any).mock.calls[0][2];
    expect(sentData.leaves).toBeUndefined();
  });

  it('getMyProfile should return 404 when employee is not found', async () => {
    const req: any = { user: { id: 99 } };
    (prismaModule.default.employee.findUnique as any).mockResolvedValue(null);

    const res = createMockResponse();

    await getMyProfile(req, res, vi.fn());

    expect(sendResponse).toHaveBeenCalledWith(res, 404, null, 'Employee not found.');
  });
});
