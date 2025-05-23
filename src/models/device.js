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
        enum: ['AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST'],
        default: 'AVAILABLE',
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
