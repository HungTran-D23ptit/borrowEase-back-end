import mongoose from 'mongoose'

const otpCodeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    type: {
        type: String,
        default: 'reset_password',
    },
})

otpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.model('OtpCode', otpCodeSchema)
