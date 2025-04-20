import type { WithdrawalSchema } from "../../schema/schema.js";
import prisma from "../../utils/prisma.js";

export const withdrawModel = async (
  params: WithdrawalSchema,
  resellerId: string
) => {
  const { provider, amount, accountNumber, accountName } = params;

  const data = await prisma.$transaction(async (tx) => {
    const amountMatch = await tx.$queryRaw<
      {
        reseller_withdrawable_earnings: number;
        reseller_non_withdrawable_earnings: number;
      }[]
    >`SELECT
     reseller_withdrawable_earnings,
     reseller_non_withdrawable_earnings
     FROM reseller_schema.reseller_table
     WHERE reseller_id = ${resellerId}::uuid
     FOR UPDATE`;

    if (amountMatch[0].reseller_withdrawable_earnings < amount) {
      throw new Error("Insufficient balance");
    }

    await tx.reseller_withdrawal_table.create({
      data: {
        reseller_withdrawal_amount: amount,
        reseller_withdrawal_bank_name: provider,
        reseller_withdrawal_account_number: accountNumber,
        reseller_withdrawal_account_name: accountName,
        reseller_withdrawal_status: "PENDING",
        reseller_withdrawal_reseller_id: resellerId,
      },
    });

    const data = await tx.reseller_transaction_table.create({
      data: {
        reseller_transaction_amount: amount,
        reseller_transaction_reseller_id: resellerId,
        reseller_transaction_type: "WITHDRAWAL",
        reseller_transaction_status: "ONGOING",
      },
    });

    await tx.reseller_table.update({
      where: { reseller_id: resellerId },
      data: {
        reseller_withdrawable_earnings: { decrement: amount },
      },
    });

    return {
      data,
    };
  });

  return data;
};
