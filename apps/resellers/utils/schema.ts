import { z } from "zod";

// Zod schema for validation
export const withdrawalSchema = z.object({
  withdrawalMethod: z.enum(["bank", "ewallet"], {
    required_error: "Select a withdrawal method",
  }),
  provider: z.string().min(1, "Please select a provider"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  accountNumber: z.string().min(5, "Enter a valid account number"),
  accountName: z.string().min(3, "Enter a valid account name"),
});

export type WithdrawalSchema = z.infer<typeof withdrawalSchema>;

export const resellerOrdersSchema = z.object({
  take: z.coerce.number().min(1).max(100),
  skip: z.coerce.number().min(1),
  search: z.string().optional(),
  sortDirection: z.string().optional(),
  columnAccessor: z.string().optional(),
  dateFilter: z.object({
    start: z.string().optional(),
    end: z.string().optional(),
  }),
});

export type typeResellerOrdersSchema = z.infer<typeof resellerOrdersSchema>;
