// controllers/notificationController.ts
import type { Request, Response } from 'express';
import { getNotification, markAsRead, markAsAllRead } from '../services/notification.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '@/utils/AppError.js';

export const getNotifications = catchAsync(async (req: Request, res: Response) => {
  // Kunin ang employeeId mula sa authenticated user (galing sa auth middleware mo)
  const employeeId = req.user.id;
  
  // Optional query param: /notifications?unread=true
  const unreadOnly = req.query.unread === 'true';

  const notifications = await getNotification(employeeId, unreadOnly);

  sendResponse(res, 200, notifications, 'Notifications fetched successfully');
});

export const readNotification = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const employeeId = req.user.id; // Galing sa protect middleware mo

  // Tawagin ang service
  try {
      await markAsRead(Number(id), employeeId);
      sendResponse(res, 200, null, 'Notification marked as read');
  } catch (error) {
      // Kung nag-error (halimbawa, not found), dito mo i-handle
      return next(new AppError('Notification not found or access denied', 404));
  }
});

export const readAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const employeeId = req.user.id;
  await markAsAllRead(employeeId);
  
  sendResponse(res, 200, null, 'All notifications marked as read');
});