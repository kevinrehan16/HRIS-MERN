// services/notificationService.ts
import prisma from '../config/db.js';
import { AppError } from '@/utils/AppError.js';
import { catchAsync } from '@/utils/catchAsync.js';

export const sendNotification = async (
  employeeId: number, 
  title: string, 
  message: string, 
  tx: any = prisma // Optional: Para ma-include sa existing transaction
) => {
  const client = tx || prisma;
  return await client.notification.create({
    data: {
      employeeId,
      title,
      message,
      isRead: false
    }
  });
};

export const getNotification = async (employeeId: number, unreadOnly: boolean = false) => {
    const notifications = await prisma.notification.findMany({
        where: {
            employeeId,
            ...(unreadOnly ? { isRead: false } : {})
        },
        orderBy: { id: 'desc' }
    });
    
    return notifications;
}

export const markAsRead = async (id: number, employeeId: number) => {
  
  const notification = await prisma.notification.update({
    where: { 
        id: id,
        employeeId: employeeId
    },
    data: { 
        isRead: true 
    }
  });

  return notification;
};

export const markAsAllRead = async (employeeId: number) => {
  return await prisma.notification.updateMany({
    where: { employeeId, isRead: false },
    data: { isRead: true }
  });
};