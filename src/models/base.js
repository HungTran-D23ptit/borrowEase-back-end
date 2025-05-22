import mongoose from 'mongoose'

export default function createModel(name, collection, definition, options) {
    const schema = new mongoose.Schema(definition, {
        timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'},
        versionKey: false,
        id: false,
        toJSON: {getters:true, virtuals: true},
        ...(options ?? {}),
    })

    return mongoose.model(name, schema, collection)
}

export const {ObjectId} = mongoose.Types

// Trạng thái tài khoản
export const STATUS_ACCOUNT = {
    ACTIVE: 'ACTIVE',
    DE_ACTIVE: 'DE_ACTIVE',
}
