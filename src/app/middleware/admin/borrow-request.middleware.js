import {BorrowRequest} from '@/models'
import {abort} from '@/utils/helpers'

export async function checkBorrowRequestExists(req, res, next) {
    const request = await BorrowRequest.findById(req.params.id)
    if (!request) {
        abort(404, 'Đơn mượn không tồn tại')
    }
    req.borrowRequest = request
    next()
}

export async function checkCanApproveRequest(req, res, next) {
    await Promise.resolve()
    if (req.borrowRequest.status !== 'PENDING') {
        abort(400, 'Chỉ có thể duyệt đơn đang chờ xử lý')
    }
    next()
}
