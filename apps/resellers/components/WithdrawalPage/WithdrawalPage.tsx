"use client";

import { withdrawalService } from "@/services/withdrawal";
import { bankOptions, ewalletOptions } from "@/utils/constant";
import { withdrawalSchema, WithdrawalSchema } from "@/utils/schema";
import useUserDataStore from "@/utils/store/userDataStore";
import useTransactionStore from "@/utils/store/useTransactionStore";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Container,
  Select,
  Stack,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Controller, useForm } from "react-hook-form";

const WithdrawalPage = () => {
  const { userData, deductBalance } = useUserDataStore();
  const { addTransaction } = useTransactionStore();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WithdrawalSchema>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      withdrawalMethod: "bank",
      provider: "",
      amount: 0,
      accountNumber: "",
      accountName: "",
    },
  });

  const maxWithdrawalAmount =
    userData?.resellerProfile.reseller_withdrawable_earnings ?? 0;

  const selectedMethod = watch("withdrawalMethod");

  const onSubmit = async (values: WithdrawalSchema) => {
    try {
      const data = await withdrawalService.createWithdrawal(values);

      addTransaction(data);

      deductBalance(userData, values.amount);

      reset();
      notifications.show({
        title: "Success",
        message: "Withdrawal created successfully",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to create withdrawal",
        color: "red",
      });
    }
  };

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="md">
        Withdrawal Form
      </Title>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <Controller
            name="withdrawalMethod"
            control={control}
            render={({ field }) => (
              <Select
                label="Withdrawal Method"
                data={[
                  { value: "bank", label: "Bank" },
                  { value: "ewallet", label: "E-Wallet" },
                ]}
                {...field}
                error={errors.withdrawalMethod?.message}
              />
            )}
          />

          <Controller
            name="provider"
            control={control}
            render={({ field }) => (
              <Select
                label={
                  selectedMethod === "bank" ? "Select Bank" : "Select E-Wallet"
                }
                data={selectedMethod === "bank" ? bankOptions : ewalletOptions}
                {...field}
                error={errors.provider?.message}
              />
            )}
          />

          <Controller
            name="amount"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Amount"
                placeholder="Enter amount"
                type="number"
                {...field}
                error={errors.amount?.message}
              />
            )}
          />

          <Controller
            name="accountNumber"
            control={control}
            render={({ field }) => (
              <TextInput
                label={
                  selectedMethod === "bank"
                    ? "Bank Account Number"
                    : "E-Wallet Number"
                }
                placeholder="Enter account number"
                {...field}
                error={errors.accountNumber?.message}
              />
            )}
          />

          <Controller
            name="accountName"
            control={control}
            render={({ field }) => (
              <TextInput
                label="Account Name"
                placeholder="Enter account name"
                {...field}
                error={errors.accountName?.message}
              />
            )}
          />

          <Button
            disabled={isSubmitting || maxWithdrawalAmount === 0}
            type="submit"
          >
            {isSubmitting ? "Submitting..." : "Submit Withdrawal"}
          </Button>
        </Stack>
      </form>
    </Container>
  );
};

export default WithdrawalPage;
