import prisma from '../config/db.js';
export const sendNotification = (employeeId, title, message, tx = prisma) => tx.notification.create({ data: { employeeId, title, message, isRead: false } });
export const getNotification = (employeeId, unreadOnly = false) => prisma.notification.findMany({
    where: { employeeId, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { id: 'desc' },
});
export const markAsRead = async (id, employeeId) => {
    const result = await prisma.notification.updateMany({ where: { id, employeeId, isRead: false }, data: { isRead: true } });
    return result.count > 0;
};
export const markAsAllRead = (employeeId) => prisma.notification.updateMany({ where: { employeeId, isRead: false }, data: { isRead: true } });
//# sourceMappingURL=notification.service.js.map