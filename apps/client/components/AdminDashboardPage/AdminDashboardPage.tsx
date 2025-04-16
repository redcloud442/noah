// "use client";

// import { useToast } from "@/hooks/use-toast";
// import { getTotalReferral } from "@/services/Bounty/Admin";
// import {
//   getAdminDashboard,
//   getAdminDashboardByDate,
// } from "@/services/Dasboard/Admin";
// import { logError } from "@/services/Error/ErrorLogs";
// import { useRole } from "@/utils/context/roleContext";
// import { formatDateToLocal } from "@/utils/function";
// import { createClientSide } from "@/utils/supabase/client";
// import { AdminDashboardData, AdminDashboardDataByDate } from "@/utils/types";
// import { format } from "date-fns";
// import { CalendarIcon } from "lucide-react";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import TableLoading from "../ui/";
// import { Button } from "../ui/button";
// import { Calendar } from "../ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

// type FormContextType = { dateFilter: { start: string; end: string } };

// const AdminDashboardPage = () => {
//   const supabaseClient = createClientSide();
//   const { teamMemberProfile, referral } = useRole();
//   const router = useRouter();
//   const { toast } = useToast();
//   const [adminDashboardByDate, setAdminDashboardByDate] =
//     useState<AdminDashboardDataByDate>();
//   const [adminDashboard, setAdminDashboard] = useState<AdminDashboardData>();
//   const [isLoading, setIsLoading] = useState(false);
//   const [totalReferral, setTotalReferral] = useState(0);
//   const filterMethods = useForm<FormContextType>({
//     defaultValues: { dateFilter: { start: undefined, end: undefined } },
//   });

//   const { getValues, control, handleSubmit, watch } = filterMethods;

//   const fetchAdminDashboardData = async () => {
//     try {
//       if (!teamMemberProfile) return;
//       setIsLoading(true);
//       const { dateFilter } = getValues();

//       const startDate = dateFilter.start
//         ? new Date(dateFilter.start)
//         : undefined;
//       const formattedStartDate = startDate ? formatDateToLocal(startDate) : "";

//       const endDate = dateFilter.end ? new Date(dateFilter.end) : undefined;

//       const formattedEndDate = endDate
//         ? formatDateToLocal(new Date(endDate.setHours(23, 59, 59, 999)))
//         : "";

//       const [data, totalReferral] = await Promise.all([
//         getAdminDashboardByDate({
//           dateFilter: { start: formattedStartDate, end: formattedEndDate },
//         }),
//         getTotalReferral(),
//       ]);

//       setAdminDashboardByDate(data);

//       setAdminDashboardByDate(data);

//       setTotalReferral(totalReferral);
//     } catch (e) {
//       if (e instanceof Error) {
//         await logError(supabaseClient, {
//           errorMessage: e.message,
//           stackTrace: e.stack,
//           stackPath: "components/AdminDashboardPage/AdminDashboardPage.tsx",
//         });
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleFetchAdminDashboardData = async () => {
//     try {
//       if (!teamMemberProfile) return;
//       setIsLoading(true);
//       const { dateFilter } = getValues();

//       const startDate = dateFilter.start
//         ? new Date(dateFilter.start)
//         : undefined;
//       const formattedStartDate = startDate ? formatDateToLocal(startDate) : "";

//       const endDate = dateFilter.end ? new Date(dateFilter.end) : undefined;
//       const formattedEndDate = endDate
//         ? formatDateToLocal(new Date(endDate.setHours(23, 59, 59, 999)))
//         : "";

//       const data = await getAdminDashboardByDate({
//         dateFilter: { start: formattedStartDate, end: formattedEndDate },
//       });

//       setAdminDashboardByDate(data);
//     } catch (e) {
//       if (e instanceof Error) {
//         await logError(supabaseClient, {
//           errorMessage: e.message,
//           stackTrace: e.stack,
//           stackPath: "components/AdminDashboardPage/AdminDashboardPage.tsx",
//         });
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAdminDashboardData();
//   }, [teamMemberProfile]);

//   useEffect(() => {
//     const fetchAdminDashboardData = async () => {
//       if (!teamMemberProfile) return;
//       const data = await getAdminDashboard();

//       setAdminDashboard(data);
//     };
//     fetchAdminDashboardData();
//   }, [teamMemberProfile]);

//   const handleCopyLink = async () => {
//     try {
//       await navigator.clipboard.writeText(referral.alliance_referral_link);
//       toast({ title: "Link copied!", description: "Link copied to clipboard" });
//     } catch (err) {}
//   };
//   const startDate = watch("dateFilter.start");
//   const endDate = watch("dateFilter.end");

//   return (
//     <div className="mx-auto w-full md:p-10 space-y-6">
//       {isLoading && <TableLoading />}
//       <div className="flex flex-wrap flex-col md:flex-row items-center justify-between">
//         <h1 className="Title">Admin Dashboard</h1>
//         <form
//           onSubmit={handleSubmit(handleFetchAdminDashboardData)}
//           className="flex flex-wrap items-center gap-4"
//         >
//           <Controller
//             name="dateFilter.start"
//             control={control}
//             render={({ field }) => (
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className="font-normal w-full md:w-auto justify-start rounded-md"
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {field.value
//                       ? format(new Date(field.value), "PPP")
//                       : "Select Start Date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-full md:w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={field.value ? new Date(field.value) : undefined}
//                     onSelect={(date: Date | undefined) =>
//                       field.onChange(date?.toISOString() || "")
//                     }
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             )}
//           />
//           <Controller
//             name="dateFilter.end"
//             control={control}
//             render={({ field }) => (
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     className="font-normal w-full md:w-auto justify-start rounded-md"
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {field.value
//                       ? format(new Date(field.value), "PPP")
//                       : "Select End Date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-full md:w-auto p-0">
//                   <Calendar
//                     mode="single"
//                     selected={field.value ? new Date(field.value) : undefined}
//                     onSelect={(date: Date | undefined) =>
//                       field.onChange(date?.toISOString() || "")
//                     }
//                     fromDate={startDate ? new Date(startDate) : undefined}
//                     disabled={(date) =>
//                       startDate ? date < new Date(startDate) : false
//                     }
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             )}
//           />
//           <Button
//             className="w-full md:w-auto rounded-md"
//             disabled={!startDate || !endDate}
//             type="submit"
//           >
//             Submit
//           </Button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboardPage;
