export function apiLogger(req, res, next) {
    const start = Date.now()

    const oldJson = res.json

    res.json = function (data) {
        const duration = Date.now() - start
        console.log(`\n[API] ${req.method} ${req.originalUrl}`)
        console.log('Query:', req.query)
        console.log('Body:', req.body)
        console.log('Status:', res.statusCode)
        console.log('Response:', data)
        console.log(`Time: ${duration}ms\n`)
        return oldJson.call(this, data)
    }

    next()
}
