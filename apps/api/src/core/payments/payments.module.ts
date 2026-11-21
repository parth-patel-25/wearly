import { Module } from "@nestjs/common";
import { PAYMENT_PROVIDER } from "./payment-provider.js";
import { PlaceholderPaymentProvider } from "./placeholder-payment-provider.js";

/**
 * Binds the payment interface to the placeholder implementation.
 *
 * To connect a real provider, add its class here and change the `useClass`.
 * Nothing in the rentals module needs to change.
 */
@Module({
  exports: [PAYMENT_PROVIDER],
  providers: [
    PlaceholderPaymentProvider,
    { provide: PAYMENT_PROVIDER, useExisting: PlaceholderPaymentProvider },
  ],
})
export class PaymentsModule {}
