"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useGetCurrentUserQuery } from "@/app/redux/services/authApi";
import VerticalLine from "./VerticalLine";
import {
  IconBallFootball,
  IconBookmark,
  IconBurger,
  IconChevronDown,
  IconCompass,
  IconHeartHandshake,
  IconHome,
  IconPencilPlus,
  IconPlaneDeparture,
} from "@tabler/icons-react";
import Button from "./Button";
import CreateReview from "../CreateReview";

export default function SideNav() {
  const pathname = usePathname();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { data: currentUser, isLoading } = useGetCurrentUserQuery();

  // Don't render if user is not logged in or loading
  if (isLoading || !currentUser || pathname === "/") return null;

  const mainNavItems = [
    { href: "/home", label: "Home", icon: IconHome },
    { href: "/explore", label: "Explore", icon: IconCompass },
    { href: "/saved", label: "Saved", icon: IconBookmark },
  ];

  const categories = [
    { href: "/restaurants", label: "Restaurants", icon: IconBurger },
    {
      href: "/beauty-health",
      label: "Beauty & Health",
      icon: IconHeartHandshake,
    },
    { href: "/sports", label: "Sports", icon: IconBallFootball },
    {
      href: "/travel-activities",
      label: "Travel & Activities",
      icon: IconPlaneDeparture,
    },
  ];

  return (
    <nav className="fixed top-24 left-0 h-full w-96 bg-background flex flex-col font-heading text-2xl">
      <VerticalLine className="absolute top-0 right-0 h-full" />

      <ul className="space-y-4 mt-8 ml-20 flex-grow overflow-auto">
        {mainNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li
              key={href}
              className={`flex items-center space-x-3 group cursor-pointer ${
                isActive ? "font-bold text-accent" : "text-text"
              }`}
            >
              <Icon
                size={20}
                className={`transition-colors ${
                  isActive ? "text-accent" : "text-text group-hover:text-accent"
                }`}
              />
              <a
                href={href}
                className={`transition-colors flex-1 ${
                  isActive ? "text-accent" : "group-hover:text-accent"
                }`}
              >
                {label}
              </a>
            </li>
          );
        })}

        <li
          className="flex items-center space-x-2 font-bold text-primary cursor-pointer select-none"
          onClick={() => setCategoriesOpen((open) => !open)}
        >
          <span>Categories</span>
          <IconChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              categoriesOpen ? "rotate-180" : ""
            }`}
          />
        </li>

        {categoriesOpen && (
          <ul className="ml-6 space-y-4 mt-2">
            {categories.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <li
                  key={href}
                  className={`flex items-center space-x-3 group cursor-pointer ${
                    isActive ? "font-bold text-accent" : "text-text"
                  }`}
                >
                  <Icon
                    size={20}
                    className={`transition-colors ${
                      isActive
                        ? "text-accent"
                        : "text-text group-hover:text-accent"
                    }`}
                  />
                  <a
                    href={href}
                    className={`transition-colors flex-1 ${
                      isActive ? "text-accent" : "group-hover:text-accent"
                    }`}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </ul>

      <div className="mb-32 ml-20 py-4">
        <Button
          className="px-18 font-heading"
          size="lg"
          onClick={() => setShowModal(true)}
        >
          <IconPencilPlus />
          POST
        </Button>
      </div>

      {showModal && <CreateReview onCancel={() => setShowModal(false)} />}
    </nav>
  );
}
