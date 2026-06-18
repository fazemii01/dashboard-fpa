import React from "react";
import { Sidebar } from "./sidebar.styles";
import { Avatar, Tooltip } from "@nextui-org/react";
import { HomeIcon } from "../icons/sidebar/home-icon";
import { PaymentsIcon } from "../icons/sidebar/payments-icon";
import { BalanceIcon } from "../icons/sidebar/balance-icon";
import { AccountsIcon } from "../icons/sidebar/accounts-icon";
import { CustomersIcon } from "../icons/sidebar/customers-icon";
import { ProductsIcon } from "../icons/sidebar/products-icon";
import { ReportsIcon } from "../icons/sidebar/reports-icon";
import { DevIcon } from "../icons/sidebar/dev-icon";
import { ViewIcon } from "../icons/sidebar/view-icon";
import { SettingsIcon } from "../icons/sidebar/settings-icon";
import { CollapseItems } from "./collapse-items";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { FilterIcon } from "../icons/sidebar/filter-icon";
import { useSidebarContext } from "../layout/layout-context";
import { ChangeLogIcon } from "../icons/sidebar/changelog-icon";
import { usePathname } from "next/navigation";

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarContext();

  return (
    <aside className="h-screen z-[20] sticky top-0">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
      ) : null}
      <div
        className={Sidebar({
          collapsed: collapsed,
        })}
      >
        <div className={Sidebar.Header()}>
          <div className="flex flex-col items-center gap-3 px-3 py-4 select-none w-full">
            <img
              src="/logo.png"
              alt="Logo Allia"
              className="w-36 h-auto object-contain max-h-16"
            />
            <div className="flex flex-col items-center text-center">
              <h3 className="text-xl font-extrabold text-default-900 leading-none tracking-wide">
                Allia
              </h3>
              <span className="text-[10px] text-default-500 font-bold uppercase tracking-widest mt-1.5">
                Fingerprint FPA
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>
            <SidebarMenu title="Main Menu">
              <SidebarItem
                title="Home"
                icon={<HomeIcon />}
                isActive={pathname === "/"}
                href="/"
              />
              <SidebarItem
                isActive={pathname === "/lembaga"}
                title="Lembaga"
                icon={<BalanceIcon />}
                href="/lembaga"
              />
              <SidebarItem
                isActive={pathname === "/users"}
                title="Users"
                icon={<AccountsIcon />}
                href="/users"
              />
              <SidebarItem
                isActive={pathname === "/permissions"}
                title="Permissions"
                icon={<SettingsIcon />}
                href="/permissions"
              />
              <SidebarItem
                isActive={pathname === "/payments"}
                title="Payments"
                icon={<PaymentsIcon />}
                href="/payments"
              />
              <SidebarItem
                isActive={pathname === "/invoices"}
                title="Invoices"
                icon={<PaymentsIcon />}
                href="/invoices"
              />
            </SidebarMenu>
          </div>
          <div className={Sidebar.Footer()}>
            <Tooltip content={"Settings"} color="primary">
              <div className="max-w-fit">
                <SettingsIcon />
              </div>
            </Tooltip>
            <Tooltip content={"Adjustments"} color="primary">
              <div className="max-w-fit">
                <FilterIcon />
              </div>
            </Tooltip>
            <Tooltip content={"Profile"} color="primary">
              <Avatar
                size="sm"
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </aside>
  );
};
