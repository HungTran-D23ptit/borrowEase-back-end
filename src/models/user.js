import createModel, { STATUS_ACCOUNT, LOGIN_PROVIDER } from './base'
import bcrypt from 'bcrypt'

const User = createModel(
    'User',
    'users',
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            lowercase: true,
            required: true,
        },
        phone: {
            type: String,
        },
        gender: {
            type: String,
            default: ''
        },
        dob: {
            type: Date,
            default: ''
        },
        address: {
            type: String,
            default: ''
        },
        department: {
            type: String,
            default: ''
        },
        avatar: {
            type: String,
            default: '',
        },
        password: {
            type: String,
            required: true,
            set(value) {
                const salt = bcrypt.genSaltSync(10)
                return bcrypt.hashSync(value, salt)
            },
        },
        login_provider: {
            type: String,
            enum: Object.values(LOGIN_PROVIDER),
            default: LOGIN_PROVIDER.LOCAL,
        },
        status: {
            type: String,
            enum: Object.values(STATUS_ACCOUNT),
            required: true,
            default: STATUS_ACCOUNT.ACTIVE,
        },
        deleted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    {
        toJSON: {
            virtuals: true,
            transform(doc, ret) {
                // eslint-disable-next-line no-unused-vars
                const {password, deleted, ...result} = ret
                return result
            },
        },
        methods: {
            verifyPassword(password) {
                return bcrypt.compareSync(password, this.password)
            },
        },
        virtuals: {
            permissions: {
                set(value) {
                    this._permissions = value
                },
                get() {
                    return this._permissions
                },
            },
        },
    }
)

export default User
