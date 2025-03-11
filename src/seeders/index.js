import {db} from '@/configs'
import adminSeeder from './admin.seeder'
import chalk from 'chalk'
import permissionTypeSeeder from './permission-type.seeder'
import permissionGroupSeeder from './permission-group.seeder'
import permissionSeeder from './permission.seeder'
import roleSeeder from './role.seeder'
import userPermissionGroupSeeder from './user-permission-group.seeder'
import userPermissionSeeder from './user-permission.seeder'

async function seed() {
    await db.transaction(async function (session) {
        console.log(chalk.bold('Initializing data...'))
        await permissionTypeSeeder(session)
        await permissionGroupSeeder(session)
        await permissionSeeder(session)
        await roleSeeder(session)
        await adminSeeder(session)
        // User
        await userPermissionGroupSeeder(session)
        await userPermissionSeeder(session)
        console.log(chalk.bold('Data has been initialized!'))
    })
}

db.connect().then(seed).then(db.close)
