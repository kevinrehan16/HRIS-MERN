import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';

// CREATE
export const createDepartment = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;
  
  const department = await prisma.department.create({ data: { name } });

  res.status(201).json({ success: true, data: department });
});

// GET ALL
export const getDepartments = catchAsync(async (req: Request, res: Response) => {
  const departments = await prisma.department.findMany({
    include: { _count: { select: { employees: true } } }
  });

  res.status(200).json({ success: true, data: departments });
});