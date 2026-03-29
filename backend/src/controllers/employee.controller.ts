import type { Request, Response } from 'express';
import * as EmployeeRepo from '../repositories/employee.repository.js';
import { sendResponse } from '../utils/sendResponse.js';
import { catchAsync } from '../utils/catchAsync.js';

// 1. REGISTER (Clean with Repository)
export const registerEmployee = catchAsync(async (req: Request, res: Response) => {
    const existing = await EmployeeRepo.findEmployeeByEmail(req.body.email);
    if (existing) {
        // Gumamit tayo ng return dito para hindi na tumuloy ang code
        throw new AppError("Email already registered in the system", 400);
    }

    const newEmployee = await EmployeeRepo.createEmployee(req.body);
    sendResponse(res, 201, newEmployee, "Employee Registered!");
});

// 2. GET ALL (Enterprise standard - with relations)
export const getAllEmployees = catchAsync(async (req: Request, res: Response) => {
    // Dapat ilipat natin itong Prisma call sa EmployeeRepo.findAll()
    const employees = await EmployeeRepo.findAllEmployees(); 
    sendResponse(res, 200, employees, "Employees fetched successfully!");
});

// 3. UPDATE (Using Repository)
export const updateEmployeeProfile = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Check muna kung exist bago i-update (Enterprise safety check)
    const updatedEmployee = await EmployeeRepo.updateEmployee(Number(id), req.body);
    
    sendResponse(res, 200, updatedEmployee, "Employee Profile Updated Successfully!");
});