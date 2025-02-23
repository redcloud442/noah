export const createCheckoutToken = async (amount: number) => {
  const res = await paymentService.create({
    amount,
  });

  return res;
};
