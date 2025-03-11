import {UserPermissionGroup} from '@/models'

const permissionGroupData = [
    {
        name: 'Quản lý câu lạc bộ',
        code: 'club-management',
    }
]

async function userPermissionGroupSeeder(session) {
    for (const [position, item] of permissionGroupData.entries()) {
        const {code, ...rest} = item
        await UserPermissionGroup.findOneAndUpdate({code}, {$set: {...rest, position}}, {upsert: true, session})
    }
    await UserPermissionGroup.deleteMany({code: {$nin: permissionGroupData.map(({code}) => code)}}, {session})
}

export default userPermissionGroupSeeder
