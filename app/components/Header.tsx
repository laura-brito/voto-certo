"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  DarkThemeToggle,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from "flowbite-react";

export const Header: React.FC = () => {
  const pathname = usePathname();

  return (
    <Navbar
      fluid
      rounded
      className="border-gray-200 bg-white px-4 py-2.5 shadow-md lg:px-6 dark:bg-gray-800"
    >
      <NavbarBrand as={Link} href="/">
        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
          Voto Certo
        </span>
      </NavbarBrand>

      <div className="flex items-center space-x-2 md:order-2 md:space-x-4">
        <DarkThemeToggle />
        <NavbarToggle />
      </div>

      <NavbarCollapse>
        <NavbarLink
          as={Link}
          href="/proposicoes"
          active={pathname === "/proposicoes"}
        >
          Proposições
        </NavbarLink>
        <NavbarLink
          as={Link}
          href="/deputados"
          active={pathname === "/deputados"}
        >
          Deputados
        </NavbarLink>
        <NavbarLink as={Link} href="/sobre" active={pathname === "/sobre"}>
          Sobre
        </NavbarLink>
      </NavbarCollapse>
    </Navbar>
  );
};
