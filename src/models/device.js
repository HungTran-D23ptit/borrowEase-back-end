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
    status: {
        type: String,
        enum: ['AVAILABLE', 'BORROWED', 'BROKEN', 'LOST'],
        default: 'AVAILABLE',
    },
    location: {
        type: String,
        default: '',
    },
    deleted: {
        type: Boolean,
        default: false,
    },
})

export default Device
