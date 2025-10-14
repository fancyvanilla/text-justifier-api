import {Router} from 'express'
import {generateToken, justifyText} from '../controllers/controllers'
import {verifyToken} from '../middlewares/auth'
import {usageGuard} from '../middlewares/usage'

const router = Router()

router.post('/token', generateToken)
router.post('/justify', verifyToken, usageGuard, justifyText)

export default router