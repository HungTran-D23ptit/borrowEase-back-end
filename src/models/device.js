import createModel from './base'

const Device = createModel('Device', 'devices', {
    name: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['Camera Recorder', 'Camera', 'Microphone', 'LED Studio Light', 'Computer', 'Projector', 'Other'],
    },
    description: {
        type: String,
        default: '',
    },
    image_url: {
        type: String,
        default: '',
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
    },
    status: {
        type: String,
        enum: ['NORMAL', 'MAINTENANCE'],
        default: 'NORMAL',
    },
    is_available: {
        type: Boolean,
        default: true,
    },
    last_borrowed_at: {
        type: Date,
        default: null,
    },
    deleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true
})

export default Device
