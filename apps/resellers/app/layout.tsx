// app/layout.tsx
import { createClient } from "@/utils/supabase/server";
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import "mantine-datatable/styles.layer.css";
import "mantine-react-table/styles.css";
import PublicLayout from "../components/LayoutComponent/PublicLayout";
import { theme } from "../theme";

export const metadata = {
  title: "Noir Reseller",
  description: "Noir Reseller",
};

export default async function RootLayout({ children }: { children: any }) {
  const supabase = await createClient();

  const {
    data: { user: user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <Notifications />
          <PublicLayout user={user}>{children}</PublicLayout>
        </MantineProvider>
      </body>
    </html>
  );
}
