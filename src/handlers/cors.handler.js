import cors from 'cors'
import { APP_URL_CLIENT, OTHER_URLS_CLIENT } from '@/configs'

const isDev = process.env.NODE_ENV !== 'production'

export const corsOptions = {
    origin: isDev
        ? true
        : [
            OTHER_URLS_CLIENT,
            ...APP_URL_CLIENT,
            'https://borrow-ease-manage.netlify.app',
            'http://10.0.2.2:8080',
        ],
    credentials: true,
}

const corsHandler = cors(corsOptions)

export default corsHandler
