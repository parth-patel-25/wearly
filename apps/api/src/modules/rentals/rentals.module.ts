import { Module } from "@nestjs/common";
import { PaymentsModule } from "../../core/payments/payments.module.js";
import { RentalActionsController } from "./rental-actions.controller.js";
import { RentalHandoverController } from "./rental-handover.controller.js";
import { RentalHandoverService } from "./rental-handover.service.js";
import { RentalLifecycleService } from "./rental-lifecycle.service.js";
import { RentalListService } from "./rental-list.service.js";
import { RentalMaintenanceService } from "./rental-maintenance.js";
import { RentalMeetupService } from "./rental-meetup.service.js";
import { RentalPaymentService } from "./rental-payments.service.js";
import { RentalReadService } from "./rental-read.service.js";
import { RentalReturnService } from "./rental-return.service.js";
import { RentalsController } from "./rentals.controller.js";
import { RentalsService } from "./rentals.service.js";

@Module({
  controllers: [
    RentalsController,
    RentalActionsController,
    RentalHandoverController,
  ],
  imports: [PaymentsModule],
  providers: [
    RentalHandoverService,
    RentalLifecycleService,
    RentalListService,
    RentalMaintenanceService,
    RentalMeetupService,
    RentalPaymentService,
    RentalReadService,
    RentalReturnService,
    RentalsService,
  ],
})
export class RentalsModule {}
