import express from 'express'
import {asyncHandler} from '@/utils/helpers'
import * as profileController from '@/app/controllers/admin/profile.controller'
import validate from '@/app/middleware/admin/validate'
import * as profileRequest from '@/app/requests/admin/profile.request'
import { checkValidToken } from '@/app/middleware/admin/auth.middleware'

const router = express.Router()

router.get(
    '/', 
    asyncHandler(checkValidToken), 
    asyncHandler(profileController.getProfile))

router.put(
    '/', 
    asyncHandler(checkValidToken),
    asyncHandler(validate(profileRequest.updateProfile)),
    asyncHandler(profileController.updateProfile))
export default router 