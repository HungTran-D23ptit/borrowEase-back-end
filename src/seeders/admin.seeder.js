import Admin from '@/models/admin.js'

async function adminSeeder(session) {
    const name = 'Tran Duy Hung'
    const phone = '0904071148'
    const email = 'donghaopho431@gmail.com'
    const password = '12345678'
    const role = 'admin'

    await Admin.findOneAndUpdate(
        {email},
        {
            $set: {
                name,
                phone,
                email,
                password,
                role,
            },
        },
        {upsert: true, session}
    )
}

export default adminSeeder
