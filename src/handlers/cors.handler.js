import cors from 'cors'
import {APP_URL_CLIENT, OTHER_URLS_CLIENT} from '@/configs'

export const corsOptions = {
    origin: [
        OTHER_URLS_CLIENT, 
        ...APP_URL_CLIENT,
        'https://borrowease-frontend.netlify.app',
        'http://localhost:8000'
    ],
    credentials: true,
}

const corsHandler = cors(corsOptions)

export default corsHandler