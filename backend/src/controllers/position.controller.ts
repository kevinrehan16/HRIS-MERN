import type { Request, Response } from 'express';
import prisma from '../config/db.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createPosition = catchAsync(async (req: Request, res: Response) => {
  const { title, description } = req.body;
  const newPosition = await prisma.position.create({
    data: { title, description }
  });
  res.status(201).json({ success: true, data: newPosition });
});

// GET ALL
export const getPositions = catchAsync(async (req: Request, res: Response) => {
  const positions = await prisma.position.findMany({
    include: { 
      department: true,
      _count: { 
        select: { 
          employees: true 
        } 
      } 
    },
    orderBy: { createdAt: 'desc' }
  });
  res.status(200).json({ success: true, data: positions });
});