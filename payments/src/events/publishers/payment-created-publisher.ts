import { PaymentCreatedEvent, Publisher, Subjects } from '@damztickets/common'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}