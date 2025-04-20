import { AppShell, Box, Drawer, ScrollArea, Stack } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconDashboard,
  IconFingerprint,
  IconMenuOrder,
  IconReceipt2,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutModal from "./LogoutModal";
import classes from "./Navbar.module.css";

const data = [
  { link: "/dashboard", label: "Dashboard", icon: IconDashboard },
  { link: "/withdrawal", label: "Withdrawal", icon: IconReceipt2 },
  { link: "/orders", label: "Orders", icon: IconFingerprint },
  { link: "/re-order", label: "Re-Order", icon: IconMenuOrder },
];

type NavBarProps = {
  onLogout: () => void;
  opened: boolean;
  onClose: () => void;
};

const NavBar = ({ onLogout, opened, onClose }: NavBarProps) => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const links = data.map((item) => (
    <Link
      className={classes.link}
      data-active={item.link === pathname || undefined}
      href={item.link}
      key={item.label}
      onClick={onClose} // Close the drawer on navigation
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));

  if (isMobile) {
    // 📱 Mobile Drawer
    return (
      <Drawer
        opened={opened}
        onClose={onClose}
        title="Menu"
        padding="md"
        size="80%"
        withCloseButton
        zIndex={1001}
      >
        <ScrollArea h="100%">
          <Box className={classes.navbarMain}>{links}</Box>
          <Stack className={classes.footer} mt="lg">
            <LogoutModal onLogout={onLogout} />
          </Stack>
        </ScrollArea>
      </Drawer>
    );
  }

  // 🖥️ Desktop Sidebar
  return (
    <AppShell.Navbar>
      <div className={classes.navbarMain}>{links}</div>
      <Stack className={classes.footer} my="md">
        <LogoutModal onLogout={onLogout} />
      </Stack>
    </AppShell.Navbar>
  );
};

export default NavBar;
