import 'dotenv/config'
import sourceMapSupport from 'source-map-support'
import {spawn} from 'child_process'
import {db} from './configs'
import createApp from '.'
import executeScheduledTasks from './tasks'
import {getInterfaceIp} from './utils/helpers'

sourceMapSupport.install()

const host = process.env.HOST || '0.0.0.0'
const port = parseInt(process.env.PORT, 10) || 3456

const app = createApp()
db.connect()
    .then(() => console.log('Database connection successful!'))
    .catch((err) => {
        console.error('Database connection failed:', err && err.message ? err.message : err)
    })
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})
app.listen(port, host, async function () {
    let displayHostname = host
    if (['0.0.0.0', '::'].includes(host)) {
        if (host === '0.0.0.0') {
            displayHostname = await getInterfaceIp('IPv4')
        } else {
            displayHostname = await getInterfaceIp('IPv6')
        }
    }
    if (host.includes(':')) {
        displayHostname = `[${displayHostname}]`
    }
    console.log(`Server is running on http://${displayHostname}:${port} in ${app.settings.env} mode.`)
})
executeScheduledTasks()
if (process.env.__ESLINT__ === 'true') {
    const command = 'npm'
    const args = ['run', 'lint:fix', '--silent']
    const options = {stdio: 'inherit', shell: true}
    const eslintProcess = spawn(command, args, options)

    eslintProcess.on('close', function (code) {
        if (code !== 0) process.exit(1)
    })
}
