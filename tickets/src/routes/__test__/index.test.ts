import request from 'supertest'
import { app } from '../../app'


const createTicket = (title: string, price: number) => {
    return request(app).post(`/api/tickets/`).set('Cookie', global.signin()).send({
        title: title,
        price: price
    })

}
it('can fetch a list of tickets', async () => {
    await createTicket('title', 20)
    await createTicket('title1', 24)
    await createTicket('title2', 24)
    await createTicket('title3', 24)

    const response = await request(app).get('/api/tickets').send().expect(200)

    expect(response.body.length).toEqual(4)
})
