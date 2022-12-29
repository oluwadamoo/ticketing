import { Subjects, ExpirationCompleteEvent, Publisher } from "@damztickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}