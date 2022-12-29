import { NotAuthorizedError, NotFoundError, requireAuth } from '@damztickets/common'
import express, { Request, Response } from 'express'
import { param } from 'express-validator'
import mongoose from 'mongoose'
import { Order } from '../models/order'

const router = express.Router()

router.get('/api/orders/:orderId', requireAuth, [
    param('orderId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('A Valid OrderId must be provided')
], async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId)

    if (!order) {
        throw new NotFoundError()
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError()
    }
    res.send(order)
})

export { router as showOrderRouter }