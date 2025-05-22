import {db} from '@/configs'
import adminSeeder from './admin.seeder'
import chalk from 'chalk'

async function seed() {
    await db.transaction(async function (session) {
        console.log(chalk.bold('Initializing data...'))
        await adminSeeder(session)
        console.log(chalk.bold('Data has been initialized!'))
    })
}

db.connect().then(seed).then(db.close)
