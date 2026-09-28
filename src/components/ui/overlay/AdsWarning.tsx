"use client";

import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ScrollShadow,
  Link,
} from "@heroui/react";
import { ADS_WARNING_STORAGE_KEY, IS_BROWSER } from "@/utils/constants";

const AdsWarning: React.FC = () => {
  const [seen, setSeen] = useLocalStorage<boolean>({
    key: ADS_WARNING_STORAGE_KEY,
    getInitialValueInEffect: false,
  });
  const [opened, handlers] = useDisclosure(!seen && IS_BROWSER);

  const handleSeen = () => {
    handlers.close();
    setSeen(true);
  };

  if (seen) return null;

  return (
    <Modal
      hideCloseButton
      isOpen={opened}
      placement="center"
      backdrop="blur"
      size="3xl"
      isDismissable={false}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-lg uppercase sm:text-xl">
          Before you watch
        </ModalHeader>
        <ModalBody>
          <ScrollShadow hideScrollBar className="space-y-4">
            <p className="text-center">
              Third-party streams may show pop-ups. An ad-blocker like{" "}
              <Link
                showAnchorIcon
                isExternal
                color="danger"
                href="https://ublockorigin.com/"
                underline="hover"
                className="font-medium"
              >
                uBlock Origin
              </Link>{" "}
              or{" "}
              <Link
                showAnchorIcon
                isExternal
                color="success"
                href="https://adguard.com/"
                underline="hover"
                className="font-medium"
              >
                AdGuard
              </Link>
              {" "}keeps playback clean.
            </p>
          </ScrollShadow>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button color="primary" variant="shadow" onPress={handleSeen}>
            Okay, I understand
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AdsWarning;
