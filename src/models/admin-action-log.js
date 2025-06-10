import createModel, {ObjectId} from './base'

const AdminActionLog = createModel(
    'AdminActionLog',
    'admin_action_log',
    {
        admin_id: {
            type: ObjectId,
            required: true,
            ref: 'Admin',
        },
        action: {
            type: String,
            required: true,
        },
        target_type: {
            type: String,
            required: true,
        },
        target_id: {
            type: ObjectId,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        created_at: {
            type: Date,
            required: true,
            default: () => new Date(),
        },
    },
    {
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                delete ret.__v
                return ret
            },
        },
        indexes: [{fields: {admin_id: 1, created_at: -1}}, {fields: {target_type: 1, target_id: 1}}],
    }
)

export default AdminActionLog
