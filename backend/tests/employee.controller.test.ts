import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import employeeRoutes from '../src/routes/employee.routes.js';

// Mock the middlewares
vi.mock('../src/middlewares/auth.middleware.js', () => ({
  protect: vi.fn((req, res, next) => next()),
  restrictTo: vi.fn(() => vi.fn((req, res, next) => next())),
}));

// Mock the repository
vi.mock('../src/repositories/employee.repository.js', () => ({
  findEmployeeByEmail: vi.fn(),
  findEmployeeById: vi.fn(),
  createEmployee: vi.fn(),
  findAllEmployees: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));

// Mock Prisma
vi.mock('../src/config/db.js', () => ({
  prisma: {
    employee: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

// Mock password util
vi.mock('../src/utils/password.util.js', () => ({
  hashPassword: vi.fn(),
}));

// Mock the validation middleware
vi.mock('../src/middlewares/validate.middleware.js', () => ({
  validate: vi.fn(() => vi.fn((req, res, next) => next())),
}));

// Mock the schema
vi.mock('../src/schemas/auth.schema.js', () => ({
  updateEmployeeSchema: {},
}));

import * as EmployeeRepo from '../src/repositories/employee.repository.js';
import { prisma } from '../src/config/db.js';
import { hashPassword } from '../src/utils/password.util.js';
import { errorMiddleware } from '../src/middlewares/error.middleware.js';

describe('Employee Controller Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/employees', employeeRoutes);
    app.use(errorMiddleware);
  });

  describe('GET /employees', () => {
    it('should return employees successfully', async () => {
      const mockData = {
        employees: [{ id: 1, firstName: 'John', lastName: 'Doe' }],
        total: 1,
        totalPages: 1
      };
      EmployeeRepo.findAllEmployees.mockResolvedValue(mockData);

      const response = await request(app)
        .get('/employees')
        .query({ page: 1, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Employees fetched successfully!');
      expect(response.body.data).toEqual(mockData.employees);
      expect(response.body.pagination).toEqual({
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1
      });
    });

    it('should handle repository errors', async () => {
      EmployeeRepo.findAllEmployees.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/employees');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /employees/:id', () => {
    it('should update employee successfully', async () => {
      const mockEmployee = { id: 1, firstName: 'John', lastName: 'Doe' };
      const mockUpdatedEmployee = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com'
      };
      EmployeeRepo.findEmployeeById.mockResolvedValue(mockEmployee);
      hashPassword.mockResolvedValue('hashed');
      EmployeeRepo.updateEmployee.mockResolvedValue(mockUpdatedEmployee);

      const response = await request(app)
        .patch('/employees/1')
        .send({ firstName: 'Jane' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Employee Profile Updated Successfully!');
      expect(response.body.data.firstName).toBe('Jane');
    });

    it('should return 404 if employee not found', async () => {
      EmployeeRepo.findEmployeeById.mockResolvedValue(null);
      EmployeeRepo.updateEmployee.mockRejectedValue({ code: 'P2025' });

      const response = await request(app)
        .patch('/employees/999')
        .send({ firstName: 'Jane' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Something went very wrong!');
    });
  });

  describe('DELETE /employees/:id', () => {
    it('should delete employee successfully', async () => {
      const mockEmployee = { id: 1, firstName: 'John' };
      EmployeeRepo.findEmployeeById.mockResolvedValue(mockEmployee);
      EmployeeRepo.deleteEmployee.mockResolvedValue(undefined);

      const response = await request(app).delete('/employees/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Employee Deleted Successfully!');
    });

    it('should return 404 if employee not found', async () => {
      EmployeeRepo.findEmployeeById.mockResolvedValue(null);
      EmployeeRepo.deleteEmployee.mockRejectedValue({ code: 'P2025' });

      const response = await request(app).delete('/employees/999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Something went very wrong!');
    });
  });

  describe('PUT /employees/enroll-face/:id', () => {
    it('should enroll face successfully', async () => {
      const mockEmployee = { id: 1 };
      const mockUpdatedEmployee = { id: 1, faceDescriptor: [1, 2, 3] };
      EmployeeRepo.findEmployeeById.mockResolvedValue(mockEmployee);
      prisma.employee.update.mockResolvedValue(mockUpdatedEmployee);

      const response = await request(app)
        .put('/employees/enroll-face/1')
        .send({ faceDescriptor: [1, 2, 3] });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Face enrolled successfully!');
    });

    it('should return 404 if employee not found', async () => {
      EmployeeRepo.findEmployeeById.mockResolvedValue(null);
      prisma.employee.update.mockRejectedValue({ code: 'P2025' });

      const response = await request(app)
        .put('/employees/enroll-face/999')
        .send({ faceDescriptor: [1, 2, 3] });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Something went very wrong!');
    });

    it('should handle missing face data', async () => {
      const response = await request(app)
        .put('/employees/enroll-face/1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Face data is required');
    });
  });

  describe('GET /employees/with-face', () => {
    it('should return employees with face', async () => {
      const mockEmployees = [
        { id: 1, firstName: 'John', lastName: 'Doe', faceDescriptor: [1, 2, 3] }
      ];
      prisma.employee.findMany.mockResolvedValue(mockEmployees);

      const response = await request(app).get('/employees/with-face');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Employees fetched successfully');
      expect(response.body.data).toEqual(mockEmployees);
    });
  });
});