import prisma from '../config/db.js';
export declare const sendNotification: (employeeId: number, title: string, message: string, tx?: typeof prisma) => import("@prisma/client").Prisma.Prisma__NotificationClient<{
    id: number;
    createdAt: Date;
    employeeId: number;
    message: string;
    title: string;
    isRead: boolean;
}, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
export declare const getNotification: (employeeId: number, unreadOnly?: boolean) => import("@prisma/client").Prisma.PrismaPromise<{
    id: number;
    createdAt: Date;
    employeeId: number;
    message: string;
    title: string;
    isRead: boolean;
}[]>;
export declare const markAsRead: (id: number, employeeId: number) => Promise<boolean>;
export declare const markAsAllRead: (employeeId: number) => import("@prisma/client").Prisma.PrismaPromise<import("@prisma/client").Prisma.BatchPayload>;
//# sourceMappingURL=notification.service.d.ts.map