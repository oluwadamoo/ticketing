import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';



const buildTicket = () => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })

    return ticket

}
it('fetches orders for a particular user', async () => {
    // Create three tickets
    const ticket1 = await buildTicket().save()
    const ticket2 = await buildTicket().save()
    const ticket3 = await buildTicket().save()

    const userOne = global.signin()
    const userTwo = global.signin()
    // Create one order as User #1
    await request(app).post('/api/orders').set('Cookie', userOne).send({ ticketId: ticket1.id })

    // Create two orders as User #2
    const { body: orderOne } = await request(app).post('/api/orders').set('Cookie', userTwo).send({ ticketId: ticket2.id })
    const { body: orderTwo } = await request(app).post('/api/orders').set('Cookie', userTwo).send({ ticketId: ticket3.id })

    // Make request to get orders for User #2
    const response = await request(app)
        .get('/api/orders')
        .set('Cookie', userTwo)
        .expect(200)


    // Make sure we only got the orders for User #2
    expect(response.body.length).toEqual(2)
    expect(response.body[0].id).toEqual(orderOne.id)
    expect(response.body[1].id).toEqual(orderTwo.id)
})