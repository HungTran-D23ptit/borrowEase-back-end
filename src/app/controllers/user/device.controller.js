import * as deviceService from '@/app/services/device.service'

export async function getDevices(req, res) {
    const { page = 1, per_page = 10, status, search } = req.query
    const result = await deviceService.getDevices({ page, per_page, status, search })
    res.jsonify(result)
}

export async function getDeviceById(req, res) {
    const { page = '1', per_page = '5' } = req.query
    const result = await deviceService.getDeviceById(req.params.id, {
        page,
        per_page,
    })

    res.jsonify(result)
}

export async function recommendDevices(req, res) {
    const userId = req.currentUser._id
    const result = await deviceService.getRecommendedDevices(userId)
    res.jsonify(result)
}
