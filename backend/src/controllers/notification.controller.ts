// controllers/notificationController.ts
import type { Request, Response } from 'express';
import { getNotification, markAsRead } from '../services/notification.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';

export const getNotifications = catchAsync(async (req: Request, res: Response) => {
  // Kunin ang employeeId mula sa authenticated user (galing sa auth middleware mo)
  const employeeId = req.user.id;
  
  // Optional query param: /notifications?unread=true
  const unreadOnly = req.query.unread === 'true';

  const notifications = await getNotification(employeeId, unreadOnly);

  sendResponse(res, 200, notifications, 'Notifications fetched successfully');
});

export const readAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const employeeId = req.user.id;
  await markAsRead(employeeId);
  
  sendResponse(res, 200, null, 'All notifications marked as read');
});