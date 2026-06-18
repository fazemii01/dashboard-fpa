import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  NavbarItem,
} from "@nextui-org/react";
import React from "react";
import { NotificationIcon } from "../icons/navbar/notificationicon";

export const NotificationsDropdown = () => {
  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <NavbarItem>
          <NotificationIcon />
        </NavbarItem>
      </DropdownTrigger>
      <DropdownMenu className="w-80" aria-label="Notification Actions">
        <DropdownSection title="Notifikasi">
          <DropdownItem
            key="empty"
            className="text-center text-default-400 py-6 cursor-default hover:bg-transparent"
            isReadOnly
          >
            Tidak ada notifikasi baru
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};
