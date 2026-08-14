import { getNotification, markAsRead, markAsAllRead } from '../services/notification.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import { sendResponse } from '../utils/sendResponse.js';
import { AppError } from '../utils/AppError.js';
export const getNotifications = catchAsync(async (req, res) => {
    const notifications = await getNotification(req.user.id, req.query.unread === 'true');
    sendResponse(res, 200, notifications, 'Notifications retrieved.');
});
export const readNotification = catchAsync(async (req, res) => {
    const updated = await markAsRead(Number(req.params.id), req.user.id);
    if (!updated)
        throw new AppError('Notification not found or already read.', 404);
    sendResponse(res, 200, null, 'Notification marked as read.');
});
export const readAllNotifications = catchAsync(async (req, res) => {
    const result = await markAsAllRead(req.user.id);
    sendResponse(res, 200, { updated: result.count }, 'Notifications marked as read.');
});
//# sourceMappingURL=notification.controller.js.map