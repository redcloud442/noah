export type PaymentResponse = {
  paymentIntent: string;
  paymentIntentStatus: string;
  order_id: string;
  order_number: string;
  order_status: string;
  order_total: number;
};
