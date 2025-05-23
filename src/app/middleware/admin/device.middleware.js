import {Device} from '@/models/'
import {abort} from '@/utils/helpers'

export async function checkDeviceExists(req, res, next) {

    const device = await Device.findOne({_id: req.params.id, deleted: false})
    if (!device) abort(404, 'Thiết bị không tồn tại')

    req.device = device
    next()
}
