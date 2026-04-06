import type { Request, Response } from 'express';
import * as EmployeeRepo from '../repositories/employee.repository.js';
import { sendResponse } from '../utils/sendResponse.js';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/appError.js';

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
    // 1. Kunin ang pagination params (default: page 1, limit 10)
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;

    const search = req.query.search as string;
    const deptId = req.query.deptId as string;

    // 2. Ipasa ang params sa Repo
    const { employees, total, totalPages } = await EmployeeRepo.findAllEmployees(page, limit, search, deptId); 

    // 3. Ipadala ang data kasama ang pagination metadata
    res.status(200).json({
        success: true,
        message: "Employees fetched successfully!",
        data: employees,
        pagination: {
            total,
            page,
            limit,
            totalPages
        }
    });
});

// 3. UPDATE (Using Repository)
export const updateEmployeeProfile = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    // Check muna kung exist bago i-update (Enterprise safety check)
    const updatedEmployee = await EmployeeRepo.updateEmployee(Number(id), req.body);
    
    sendResponse(res, 200, updatedEmployee, "Employee Profile Updated Successfully!");
});

// 4. DELETE (Using Repository)
export const deleteEmployee = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    await EmployeeRepo.deleteEmployee(Number(id));

    sendResponse(res, 200, null, "Employee Deleted Successfully!");
});