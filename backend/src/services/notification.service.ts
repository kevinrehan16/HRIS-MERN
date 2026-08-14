import prisma from '../config/db.js';

export const sendNotification = (employeeId: number, title: string, message: string, tx: typeof prisma = prisma) =>
  tx.notification.create({ data: { employeeId, title, message, isRead: false } });

export const getNotification = (employeeId: number, unreadOnly = false) =>
  prisma.notification.findMany({
    where: { employeeId, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { id: 'desc' },
  });

export const markAsRead = async (id: number, employeeId: number) => {
  const result = await prisma.notification.updateMany({ where: { id, employeeId, isRead: false }, data: { isRead: true } });
  return result.count > 0;
};

export const markAsAllRead = (employeeId: number) =>
  prisma.notification.updateMany({ where: { employeeId, isRead: false }, data: { isRead: true } });