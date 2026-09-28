"use client";

import { memo, useState } from "react";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Checkbox,
  ScrollShadow,
} from "@heroui/react";
import { DISCLAIMER_STORAGE_KEY, IS_BROWSER } from "@/utils/constants";

const MODAL_SIZE = "3xl";
const DISCLAIMER_CONTENT = {
  title: "SnapFlix Disclaimer & Terms",
  paragraphs: [
    {
      id: "welcome",
      content:
        "Welcome to SnapFlix - a private entertainment streaming catalog. Please read this disclaimer carefully before using this platform.",
    },
    {
      id: "purpose",
      content: "SnapFlix is a proprietary platform developed for",
      emphasis: "catalog discovery and media indexing.",
      continuation:
        "This platform is private and is not meant to promote or encourage digital piracy in any form.",
    },
    {
      id: "content-source",
      content:
        "All content displayed on SnapFlix (including but not limited to movies, images, posters, and related information) is sourced from",
      emphasis: "third-party providers through APIs or embedding.",
      continuation:
        "SnapFlix does not host, store, or distribute any media files on its servers. The platform merely indexes content that is available on the internet.",
    },
    {
      id: "responsibility",
      content:
        "By using SnapFlix, you acknowledge that SnapFlix bears no responsibility for user actions, content accuracy, or any direct or indirect damages arising from the use of this website. Users are solely responsible for their actions while using this service. Intellectual property rights are respected, and legitimate requests from copyright holders for content removal will be honored.",
    },
    {
      id: "usage",
      content:
        "Any unauthorized downloading, redistribution of content, or commercial reproduction is strictly prohibited. By using SnapFlix, you agree to these private terms and acknowledge that",
      emphasis: "you use the service under these terms.",
    },
  ],
};

interface DisclaimerParagraphProps {
  content: string;
  emphasis?: string;
  continuation?: string;
}

const DisclaimerParagraph: React.FC<DisclaimerParagraphProps> = memo(
  ({ content, emphasis, continuation }) => (
    <p>
      {content}
      {emphasis && (
        <>
          {" "}
          <strong>{emphasis}</strong>
        </>
      )}
      {continuation && ` ${continuation}`}
    </p>
  ),
);

DisclaimerParagraph.displayName = "DisclaimerParagraph";

const Disclaimer: React.FC = () => {
  const [hasAgreed, setHasAgreed] = useLocalStorage<boolean>({
    key: DISCLAIMER_STORAGE_KEY,
    defaultValue: false,
    getInitialValueInEffect: false,
  });

  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);

  const shouldShowModal = !hasAgreed && IS_BROWSER;

  const [isOpen, { close }] = useDisclosure(shouldShowModal);

  const handleContinue = () => {
    close();
    setHasAgreed(true);
  };

  if (hasAgreed || !IS_BROWSER) {
    return null;
  }

  return (
    <Modal
      hideCloseButton
      isOpen={isOpen}
      placement="center"
      backdrop="blur"
      size={MODAL_SIZE}
      isDismissable={false}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-base uppercase sm:text-lg">
          {DISCLAIMER_CONTENT.title}
        </ModalHeader>

        <ModalBody>
          <ScrollShadow hideScrollBar className="space-y-4 text-sm sm:text-base">
            {DISCLAIMER_CONTENT.paragraphs.map((paragraph) => (
              <DisclaimerParagraph
                key={paragraph.id}
                content={paragraph.content}
                emphasis={paragraph.emphasis}
                continuation={paragraph.continuation}
              />
            ))}
          </ScrollShadow>
        </ModalBody>

        <ModalFooter className="flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Checkbox
            size="sm"
            color="primary"
            isSelected={hasAcceptedTerms}
            onValueChange={setHasAcceptedTerms}
            classNames={{ label: "text-xs text-default-500 sm:text-sm" }}
          >
            I have read and agree to the disclaimer & terms.
          </Checkbox>
          <Button
            className="w-full sm:w-auto"
            isDisabled={!hasAcceptedTerms}
            color="primary"
            variant="shadow"
            onPress={handleContinue}
          >
            Continue
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Disclaimer;
