import {USER_PERMISSION, USER_ROLE, UserPermission, UserRole} from '@/models'

const permissionCensor = [
    // Club
    {
        code: USER_PERMISSION.ACCEPT_MEMBER,
        description: 'Xem danh sách vai trò',
        permission_group_code: 'club-management',
        permission_type_code: 'create',
    }
]

const permissionData = [
    // Club
    {
        code: USER_PERMISSION.REMOVE_MEMBER,
        description: 'Xem danh sách vai trò',
        permission_group_code: 'club-management',
        permission_type_code: 'delete',
    },
    ...permissionCensor
]

async function userPermissionSeeder(session) {
    for (const item of permissionData) {
        const {code, ...rest} = item
        await UserPermission.findOneAndUpdate({code}, {$set: rest}, {upsert: true, session})
    }
    const permissionCodes = permissionData.map(({code}) => code)
    const permissionRemove = await UserPermission.find({code: {$nin: permissionCodes}}).distinct('_id').session(session)
    if (permissionRemove.length > 0) {
        await UserPermission.deleteMany({_id: {$in: permissionRemove}}, {session})
    }
    const managerPermissionCodes = permissionData.map(item => item.code)
    const managerClubPermission = await UserPermission.find({code: {$in: managerPermissionCodes}})
        .distinct('_id')
        .session(session)

    await UserRole.findOneAndUpdate(
        {code: USER_ROLE.MANAGER},
        {
            $set: {
                name: 'Quản lý hệ thống',
                code: USER_ROLE.MANAGER,
                description: 'Có các quyền quản lý câu lạc bộ',
                can_delete: false,
                permission_ids: managerClubPermission,
            },
        },
        {upsert: true, session}
    )

    const censorPermissionCodes = permissionCensor.map(item => item.code)
    const censorClubPermission = await UserPermission.find({code: {$in: censorPermissionCodes}})
        .distinct('_id')
        .session(session)
    await UserRole.findOneAndUpdate(
        {code: USER_ROLE.CENSOR},
        {
            $set: {
                name: 'Quản lý kiểm duyệt',
                code: USER_ROLE.CENSOR,
                description: 'Có các quyền kiểm duyệt',
                can_delete: false,
                permission_ids: censorClubPermission,
            },
        },
        {upsert: true, session}
    )
}

export default userPermissionSeeder
