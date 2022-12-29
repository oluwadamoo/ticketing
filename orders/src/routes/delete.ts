import { NotAuthorizedError, NotFoundError, } from '@damztickets/common'
import express, { Request, Response } from 'express'
import { param } from 'express-validator'
import mongoose from 'mongoose'
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher'
import { Order, OrderStatus } from '../models/order'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.delete('/api/orders/:orderId', [
    param('orderId')
        .not()
        .isEmpty()
        .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('A Valid OrderId must be provided')
],
    async (req: Request, res: Response) => {

        const { orderId } = req.params
        const order = await Order.findById(orderId).populate('ticket')

        if (!order) {
            throw new NotFoundError()
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError()
        }

        order.status = OrderStatus.Cancelled
        await order.save()

        // Publish order cancelled event
        new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            }
        })

        res.status(204).send(order)
    })

export { router as deleteOrderRouter }