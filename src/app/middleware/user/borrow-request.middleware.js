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