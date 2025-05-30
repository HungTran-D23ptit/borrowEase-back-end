import {cache} from '@/configs'
import {abort} from '@/utils/helpers'

const otpThrottleCache = cache.create('otp-throttle')

export async function limitOtpSend(req, res, next) {
    const {email} = req.body
    const key = `otp:throttle:${email}`

    const lastSent = await otpThrottleCache.get(key)
    const now = Date.now()
    const cooldown = 60 * 1000 // 60 giây cooldown

    if (lastSent && now - lastSent < cooldown) {
        const remaining = Math.ceil((cooldown - (now - lastSent)) / 1000)
        return abort(429, `Vui lòng chờ ${remaining} giây để gửi lại mã OTP.`)
    }

    await otpThrottleCache.set(key, now, cooldown / 1000)
    next()
}
