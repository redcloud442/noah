import { Button, Group, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLogout } from "@tabler/icons-react";

type LogoutModalProps = {
  onLogout?: () => void;
};

const LogoutModal = ({ onLogout }: LogoutModalProps) => {
  const [opened, { open, close }] = useDisclosure(false);

  const handleLogout = () => {
    onLogout?.();
    close();
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Confirm Logout"
        centered
        withCloseButton={false}
      >
        <Text mb="md">Are you sure you want to log out?</Text>

        <Group justify="flex-end">
          <Button variant="default" onClick={close}>
            Cancel
          </Button>
          <Button color="red" onClick={handleLogout}>
            Logout
          </Button>
        </Group>
      </Modal>

      <Button
        leftSection={<IconLogout size={16} />}
        variant="transparent"
        color="red"
        fw={700}
        justify="flex-start"
        onClick={open}
      >
        Logout
      </Button>
    </>
  );
};

export default LogoutModal;
