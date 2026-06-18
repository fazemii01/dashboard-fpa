import { Input, Navbar, NavbarContent } from "@nextui-org/react";
import React, { useState, useEffect } from "react";
import { SearchIcon } from "../icons/searchicon";
import { BurguerButton } from "./burguer-button";
import { NotificationsDropdown } from "./notifications-dropdown";
import { UserDropdown } from "./user-dropdown";
import { apiRequest } from "@/helpers/api";

interface Props {
  children: React.ReactNode;
}

export const NavbarWrapper = ({ children }: Props) => {
  const [lembagaName, setLembagaName] = useState<string | null>(null);

  useEffect(() => {
    apiRequest("/auth/me")
      .then((data) => {
        if (data && data.lembaga_name) {
          setLembagaName(data.lembaga_name);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
      <Navbar
        isBordered
        className="w-full"
        classNames={{
          wrapper: "w-full max-w-full",
        }}
      >
        <NavbarContent className="md:hidden flex items-center gap-3">
          <BurguerButton />
          {lembagaName && (
            <div className="flex flex-col select-none">
              <span className="text-[9px] text-default-400 font-semibold uppercase tracking-wider leading-none">Lembaga</span>
              <span className="text-xs font-bold text-default-800 truncate max-w-[140px] mt-0.5">
                {lembagaName}
              </span>
            </div>
          )}
        </NavbarContent>
        <NavbarContent className="w-full max-md:hidden flex items-center gap-4">
          {lembagaName && (
            <div className="flex flex-col gap-0.5 min-w-[150px] max-w-[250px] border-r border-divider pr-4 select-none">
              <span className="text-[10px] text-default-400 font-bold uppercase tracking-wider">Lembaga</span>
              <span className="text-sm font-bold text-default-800 truncate">{lembagaName}</span>
            </div>
          )}
          <Input
            startContent={<SearchIcon />}
            isClearable
            className="w-full"
            classNames={{
              input: "w-full",
              mainWrapper: "w-full",
            }}
            placeholder="Search..."
          />
        </NavbarContent>
        <NavbarContent
          justify="end"
          className="w-fit data-[justify=end]:flex-grow-0"
        >
          <NotificationsDropdown />

          <NavbarContent>
            <UserDropdown />
          </NavbarContent>
        </NavbarContent>
      </Navbar>
      {children}
    </div>
  );
};
