import { TicketUpdatedEvent } from "@damztickets/common"
import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../../models/ticket"
import { natsWrapper } from "../../../nats-wrapper"
import { TicketUpdatedListener } from "../ticket-updated-listener"

const setup = async () => {
    // Create an instance of the listener
    const listener = new TicketUpdatedListener(natsWrapper.client)

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })

    await ticket.save()

    // Create a fake data event
    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'new concert',
        price: 100,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, msg, ticket }
}


it('finds, updates and save a ticket', async () => {
    const { msg, data, listener, ticket } = await setup()

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
    const { listener, data, msg } = await setup()

    // Call the onMessage function with data object + message object
    await listener.onMessage(data, msg)

    // Write assertion to make sure ack function is called
    expect(msg.ack).toHaveBeenCalled()
})

it('does not call ack if the event has a skipped version number', async () => {
    let { msg, data, listener, ticket } = await setup()

    data.version = 10;

    try {
        await listener.onMessage(data, msg)

    } catch (err) {
        return
    }

    expect(msg.ack).not.toHaveBeenCalled()

})