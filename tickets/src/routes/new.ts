import { Router, Request, Response } from 'express'
import { body } from 'express-validator'
import { validateRequest, requireAuth } from '@damztickets/common'
import { Ticket } from '../models/ticket'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = Router()

router.post('/api/tickets', requireAuth, [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be greater than zero')

], validateRequest, async (req: Request, res: Response) => {

    const { title, price } = req.body

    const ticket = Ticket.build({
        title,
        price,
        userId: req.currentUser!.id
    })

    await ticket.save()

    await new TicketCreatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        title: ticket.title,
        userId: ticket.userId,
        price: ticket.price,
        version: ticket.version
    })

    res.status(201).send(ticket)
})


export { router as createTicketRouter }