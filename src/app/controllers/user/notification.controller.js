import * as NotificationService from '@/app/services/notification.service'

export async function getNotifications(req, res) {
    const result = await NotificationService.getNotifications(req.currentUser._id, req.query)
    res.jsonify(result)
}

export async function getUnreadCount(req, res) {
    const result = await NotificationService.countUnread(req.currentUser._id)
    res.jsonify(result)
}

export async function markNotificationAsRead(req, res) {
    const result = await NotificationService.markAsRead(req.currentUser._id, req.params.id)
    res.jsonify(result)
}

export async function markAllRead(req, res) {
    const result = await NotificationService.markAllAsRead(req.currentUser._id)
    res.jsonify(result)
}

export async function deleteNotification(req, res) {
    const result = await NotificationService.deleteNotification(req.currentUser._id, req.params.id)
    res.jsonify(result)
}
