export type PaymentResponse = {
  paymentIntent: string;
  paymentIntentStatus: string;
  order_id: string;
  order_number: string;
  order_status: string;
  order_total: number;
};

export type PaymentMethodResponse = {
  data: {
    paymentMethod: string;
    paymentMethodStatus: string;
    nextAction: {
      redirect: {
        url: string;
        return_url: string;
      };
    };
  };
};

export type PaymentRedirectResponse = {
  orderStatus: "PAID" | "CANCELED" | "PENDING";
};
