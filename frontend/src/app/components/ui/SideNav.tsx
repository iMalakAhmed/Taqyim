"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useGetCurrentUserQuery } from "@/app/redux/services/authApi";
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
import VerticalLine from "./VerticalLine";
import { useGetSavedReviewsQuery } from "@/app/redux/services/savedReviewApi";

export default function SideNav() {
  const pathname = usePathname();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { data: currentUser, isLoading } = useGetCurrentUserQuery();

  const { data: savedReviews } = useGetSavedReviewsQuery(
    currentUser?.userId ?? 0,
    {
      skip: !currentUser?.userId,
    }
  );

  if (
    isLoading ||
    !currentUser ||
    pathname === "/" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register"
  )
    return null;

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
    <>
      {/* Desktop Left Sidebar */}
      <nav className="hidden md:flex fixed top-24 left-0 h-full w-96 bg-background flex-col font-heading text-2xl shadow">
        <VerticalLine className="absolute top-0 right-0 h-full" />
        <ul className="space-y-4 mt-8 ml-20 flex-grow overflow-auto">
          {mainNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            const isSaved = href === "/saved";
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
                  {isSaved && savedReviews && (
                    <span className="ml-2 text-xs text-primary">
                      ({savedReviews.length})
                    </span>
                  )}
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
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-background border-t border-gray-300 z-50 flex justify-around items-center py-2 px-4">
        {mainNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <a
              key={href}
              href={href}
              className={`flex flex-col items-center text-xs ${
                isActive ? "text-accent font-bold" : "text-text"
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </a>
          );
        })}
        <button
          onClick={() => setShowModal(true)}
          className="flex flex-col items-center text-xs text-text hover:text-accent"
        >
          <IconPencilPlus size={20} />
          <span>Post</span>
        </button>
      </nav>

      {showModal && <CreateReview onCancel={() => setShowModal(false)} />}
    </>
  );
}
