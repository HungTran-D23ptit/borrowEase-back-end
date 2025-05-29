import * as deviceService from '@/app/services/device.service'
import { db } from '@/configs'

export async function getDevices(req, res) {
    const { page = 1, per_page = 10, status, type, search } = req.query
    const result = await deviceService.getDevices({ page, per_page, status, type, search })
    res.json(result)
}

export async function getDeviceById(req, res) {
    const { page = '1', per_page = '5' } = req.query
    const result = await deviceService.getDeviceById(req.params.id, {
        page,
        per_page,
    })

    res.json(result)
}

export async function createDevice(req, res) {
    await db.transaction(async (session) => {
        const device = await deviceService.createDevice(req.body, session)
        res.status(201).json({
            message: 'Thiết bị đã được tạo thành công.',
            data: device,
        })
    })
}

export async function updateDevice(req, res) {
    await db.transaction(async (session) => {
        const updated = await deviceService.updateDevice(req.params.id, req.body, session)
        res.json({
            message: 'Cập nhật thiết bị thành công.',
            data: updated,
        })
    })
}

export async function deleteDevice(req, res) {
    await db.transaction(async (session) => {
        const result = await deviceService.deleteDevice(req.params.id, session)
        res.json(result)
    })
}

export async function getDeviceTypes(req, res) {
    const types = await deviceService.getDeviceTypes()
    res.json({ types })
}

export async function getMostBorrowedDevices(req, res) {
    const { month, year, limit } = req.query
    const result = await deviceService.getMostBorrowedDevicesThisMonth({ month, year, limit })
    res.json(result)
}

export async function markDeviceMaintenance(req, res) {
    await db.transaction(async (session) => {
        const updated = await deviceService.markDeviceAsMaintenance(req.params.id, session)
        res.json({
            message: 'Thiết bị đã được chuyển sang trạng thái bảo trì.',
            data: updated,
        })
    })
}

export async function getTotalDevices(req, res) {
    const total = await deviceService.countTotalDevices()
    res.json({ total })
}

