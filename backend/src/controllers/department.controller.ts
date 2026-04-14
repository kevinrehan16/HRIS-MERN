import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';

// CREATE
export const createDepartment = catchAsync(async (req: Request, res: Response) => {
  const { name, description } = req.body;
  
  const department = await prisma.department.create({ data: { name, description } });

  res.status(201).json({ success: true, data: department });
});

// GET ALL
export const getDepartments = catchAsync(async (req: Request, res: Response) => {
  const departments = await prisma.department.findMany({
    include: { 
      positions: {
        select: {
          id: true,
          title: true // Title lang ang kukunin dito
        }
      },
      _count: { 
        select: {  
          employees: true 
        } 
      } 
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ success: true, data: departments });
});