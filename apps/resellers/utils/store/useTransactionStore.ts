import { reseller_transaction_table } from "@prisma/client";
import { create } from "zustand";

interface TransactionStore {
  transactionData: reseller_transaction_table[] | null;

  setTransactionData: (
    transactionData: TransactionStore["transactionData"]
  ) => void;

  addTransaction: (transaction: reseller_transaction_table) => void;
}

const useTransactionStore = create<TransactionStore>((set) => ({
  transactionData: null,
  setTransactionData: (transactionData) => set({ transactionData }),
  addTransaction: (transaction) =>
    set((state) => ({
      transactionData: [...(state.transactionData || []), transaction],
    })),
}));

export default useTransactionStore;
