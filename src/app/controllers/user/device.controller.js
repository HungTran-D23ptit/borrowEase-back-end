import * as deviceService from '@/app/services/device.service'

export async function getDevices(req, res) {
    const { page = 1, per_page = 10, status, search } = req.query
    const result = await deviceService.getDevices({ page, per_page, status, search })
    res.json(result)
}

export async function getDeviceById(req, res) {
    const device = await deviceService.getDeviceById(req.params.id)
    res.json(device)
}



