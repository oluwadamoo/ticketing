import { Publisher, OrderCreatedEvent, Subjects } from "@damztickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
