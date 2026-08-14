import type { Response } from 'express';
import { getNotification, markAsRead, markAsAllRead } from '../services/notification.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';

type AuthenticatedRequest = { user: { id: number }; params: { id: string }; query: { unread?: string } };

export const getNotifications = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const notifications = await getNotification(req.user.id, req.query.unread === 'true');
  sendResponse(res, 200, notifications, 'Notifications retrieved.');
});

export const readNotification = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const updated = await markAsRead(Number(req.params.id), req.user.id);
  if (!updated) throw new AppError('Notification not found or already read.', 404);
  sendResponse(res, 200, null, 'Notification marked as read.');
});

export const readAllNotifications = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await markAsAllRead(req.user.id);
  sendResponse(res, 200, { updated: result.count }, 'Notifications marked as read.');
});