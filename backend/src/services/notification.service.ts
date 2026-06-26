// services/notificationService.ts
import prisma from '../config/db.js';

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