"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";
import {
  IconBellRinging2,
  IconLogin,
  IconLogout,
  IconMail,
  IconMenu2,
  IconSearch,
  IconUser,
  IconUserCircle,
  IconUserPlus,
  IconX,
  IconBookmark,
  IconBookmarkFilled,
} from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import {
  useGetCurrentUserQuery,
  authApi,
  useSignOutMutation,
} from "../../redux/services/authApi";
import { useRouter } from "next/navigation";
import { removeAuthCookie } from "../../actions/auth";
import Button from "./Button";
import { useState, useEffect } from "react";
import HorizontalLine from "./HorizontalLine";
import {
  useSearchUsersQuery,
  useSearchBusinessesQuery,
  useSearchReviewsQuery,
} from "../../redux/services/searchApi";
import {
  SearchBusinessDTO,
  SearchReviewDTO,
  SearchUserDTO,
} from "@/app/redux/services/types";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/app/components/ui/avatar";
import NotificationBell from './NotificationBell';

export default function NavBar() {
  const pathname = usePathname();
  const isFixed = pathname !== "/";
  const router = useRouter();
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Pagination states for each search type
  const [usersPage, setUsersPage] = useState(1);
  const [businessesPage, setBusinessesPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const pageSize = 10; // Define your page size here

  // Accumulated results for infinite scrolling
  const [allUsers, setAllUsers] = useState<SearchUserDTO[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<SearchBusinessDTO[]>([]);
  const [allReviews, setAllReviews] = useState<SearchReviewDTO[]>([]);

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
  } = useSearchUsersQuery(
    { query: debouncedSearchQuery, page: usersPage, pageSize },
    { skip: !debouncedSearchQuery }
  );
  const {
    data: businessesData,
    isLoading: isLoadingBusinesses,
    isFetching: isFetchingBusinesses,
  } = useSearchBusinessesQuery(
    { query: debouncedSearchQuery, page: businessesPage, pageSize },
    { skip: !debouncedSearchQuery }
  );
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
    isFetching: isFetchingReviews,
  } = useSearchReviewsQuery(
    { query: debouncedSearchQuery, page: reviewsPage, pageSize },
    { skip: !debouncedSearchQuery }
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      // Reset pages and clear old results when search query changes
      if (searchQuery !== debouncedSearchQuery) {
        setUsersPage(1);
        setBusinessesPage(1);
        setReviewsPage(1);
        setAllUsers([]);
        setAllBusinesses([]);
        setAllReviews([]);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery, debouncedSearchQuery]);

  // Effect to accumulate results when new data arrives
  useEffect(() => {
    if (usersData?.items) {
      if (usersPage === 1) {
        setAllUsers(usersData.items);
      } else {
        setAllUsers((prev) => [...prev, ...usersData.items]);
      }
    }
  }, [usersData, usersPage]); // Add usersPage to dependencies

  useEffect(() => {
    if (businessesData?.items) {
      if (businessesPage === 1) {
        setAllBusinesses(businessesData.items);
      } else {
        setAllBusinesses((prev) => [...prev, ...businessesData.items]);
      }
    }
  }, [businessesData, businessesPage]); // Add businessesPage to dependencies

  useEffect(() => {
    if (reviewsData?.items) {
      if (reviewsPage === 1) {
        setAllReviews(reviewsData.items);
      } else {
        setAllReviews((prev) => [...prev, ...reviewsData.items]);
      }
    }
  }, [reviewsData, reviewsPage]); // Add reviewsPage to dependencies

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(e.target.value.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        setShowSearchResults(false);
        setSearchQuery("");
      }
    }
  };

  const handleResultClick = () => {
    setShowSearchResults(false);
    setSearchQuery(""); // Clear search query after selection
  };

  const handleBlur = () => {
    // Delay hiding results to allow click on result item
    setTimeout(() => {
      setShowSearchResults(false);
    }, 200);
  };

  const handleFocus = () => {
    if (searchQuery.length > 0) {
      setShowSearchResults(true);
    }
  };

  const {
    data: user,
    isLoading,
    refetch,
  } = useGetCurrentUserQuery(undefined, {
    pollingInterval: 1000, // Optional auto-refresh
    refetchOnMountOrArgChange: true,
  });

  const [signOut, { isLoading: isSigningOut }] = useSignOutMutation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setSearchOpen(false);
      }
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut().unwrap(); // Use unwrap to handle errors
      sessionStorage.removeItem("token"); // Ensure token is cleared from session storage
      dispatch(authApi.util.resetApiState()); // Explicitly reset RTK Query state
      await removeAuthCookie();
      console.log("User data after sign out attempt:", user); // Added for debugging
      router.push("/auth/login"); // Redirect to login page
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return (
    <div
      className={`top-0 w-full z-[999] bg-background h-24 text-text ${
        isFixed ? "fixed" : "relative"
      }`}
    >
      <div className="mx-24 flex flex-row justify-between items-center h-full">
        {user ? (
          <Link href="/home">
            <h1 className="font-heading text-text">TAQYIM</h1>
          </Link>
        ) : (
          <Link href="/">
            <h1 className="font-heading text-text">TAQYIM</h1>
          </Link>
        )}

        <div className="flex-1 mx-4 flex justify-center">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative flex items-center w-full max-w-lg mx-auto border-2 border-stone-800 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-stone-50"
          >
            <input
              type="text"
              placeholder="Search businesses, users, reviews..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full p-3 font-serif text-stone-900 placeholder-stone-500 bg-stone-50 focus:outline-none focus:ring-0 rounded-none"
            />
            <button
              type="submit"
              className="p-3 bg-stone-800 text-white rounded-none hover:bg-stone-700 transition-colors duration-200"
            >
              <IconSearch className="h-5 w-5" />
            </button>
            {showSearchResults && debouncedSearchQuery && (
              <div className="absolute z-10 w-full mt-2 top-full left-0 bg-background border-2 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-[80vh] overflow-y-auto overflow-x-hidden newspaper-scroll-bar py-4">
                {/* Search for keyword in reviews option */}
                {debouncedSearchQuery && (
                  <Link
                    href={`/search?q=${encodeURIComponent(
                      debouncedSearchQuery
                    )}&filter=reviews`}
                    className="block px-4 py-3 text-lg font-bold font-serif text-blue-600 hover:bg-stone-100 transition-colors duration-200 border-b border-stone-200"
                    onClick={handleResultClick}
                  >
                    Search for '{debouncedSearchQuery}' in reviews
                  </Link>
                )}
                <div className="space-y-4 px-4 pt-4">
                  {/* Only show users and businesses directly in dropdown, reviews are for dedicated page */}
                  {allUsers.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold font-serif text-stone-900 mb-2 border-b-2 border-stone-800 pb-1">
                        Users
                      </h3>
                      {allUsers.map((user) => (
                        <Link
                          href={`/profile/${user.userId}`}
                          key={user.userId}
                          className="flex items-center gap-3 py-2 hover:bg-stone-100 transition-colors duration-200 rounded-md"
                          onClick={handleResultClick}
                        >
                          <Avatar className="h-12 w-12 border-2 border-stone-800 flex-shrink-0">
                            <AvatarImage src={user.profilePic || undefined} />
                            <AvatarFallback className="font-serif text-stone-800 bg-stone-100">
                              {user.userName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold font-serif text-stone-900">
                              {user.userName}
                            </p>
                            <p className="text-sm text-stone-600 font-serif">
                              {user.email}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {allBusinesses.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold font-serif text-stone-900 mt-4 mb-2 border-b-2 border-stone-800 pb-1">
                        Businesses
                      </h3>
                      {allBusinesses.map((business) => (
                        <Link
                          href={`/business/${business.businessId}`}
                          key={business.businessId}
                          className="flex items-center gap-3 py-2 hover:bg-stone-100 transition-colors duration-200 rounded-md"
                          onClick={handleResultClick}
                        >
                          <Avatar className="h-12 w-12 border-2 border-stone-800 flex-shrink-0">
                            <AvatarFallback className="font-serif text-stone-800 bg-stone-100">
                              {business.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold font-serif text-stone-900">
                              {business.name}
                            </p>
                            <p className="text-sm text-stone-600 font-serif">
                              {business.category}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {!isLoadingUsers &&
                    !isLoadingBusinesses &&
                    allUsers.length === 0 &&
                    allBusinesses.length === 0 && (
                      <p className="text-center text-stone-500 font-serif py-4">
                        No direct profile or business matches found.
                      </p>
                    )}

                  {((usersData &&
                    usersPage * pageSize < usersData.totalCount) ||
                    (businessesData &&
                      businessesPage * pageSize <
                        businessesData.totalCount)) && (
                    <div className="text-center py-4">
                      <button
                        onClick={() => {
                          if (
                            usersData &&
                            usersPage * pageSize < usersData.totalCount
                          )
                            setUsersPage((prev) => prev + 1);
                          if (
                            businessesData &&
                            businessesPage * pageSize <
                              businessesData.totalCount
                          )
                            setBusinessesPage((prev) => prev + 1);
                        }}
                        className="px-4 py-2 bg-stone-800 text-white font-serif rounded-none hover:bg-stone-700 transition-colors duration-200 border-2 border-stone-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      >
                        Load More Profiles
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="flex items-center space-x-4 min-w-[100px] justify-end">
          {!isLoading && user && (
            <>
              <div className="relative group inline-block">
                <Link
                  href={`/profile/${user.userId}`}
                  className="text-text hover:text-secondary flex items-center space-x-2"
                >
                  <IconUserCircle size={24} />
                  <span className="hidden lg:inline">{user.userName}</span>
                </Link>

                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-32 bg-background border shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity duration-200 z-10 rounded">
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-background border-l border-t rotate-45"></div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-text hover:text-accent cursor-pointer rounded text-center"
                  >
                    Sign Out
                  </button>
                </div>
              </div>

              <NotificationBell />
              <Link href="/saved" className="text-text hover:text-secondary">
                <Button variant="none" size="sm">
                  <IconBookmark />
                </Button>
              </Link>
              <Button variant="none" size="sm" className="hover:text-secondary">
                <IconMail />
              </Button>
              <ThemeToggle />
            </>
          )}
          {!isLoading && !user && (
            <div className="flex flex-row items-center gap-x-5">
              <Link href="/auth/login" className="text-text hover:text-accent">
                Login
              </Link>
              <Link href="/auth/signup" className="text-text hover:text-accent">
                Sign Up
              </Link>
              <ThemeToggle />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="md:hidden flex flex-col">
        <div className="flex justify-between items-center h-16 px-4">
          <Link href={user ? "/home" : "/"}>
            <h1 className="font-heading text-text text-sm">TAQYIM</h1>
          </Link>

          <div className="flex items-center space-x-4">
            <Button
              variant="none"
              size="sm"
              onClick={() => setSearchOpen(!searchOpen)}
              className="hover:text-secondary"
            >
              <IconSearch size={20} />
            </Button>
            <Button
              variant="none"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hover:text-secondary"
            >
              {mobileMenuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="px-4 pb-4">
            <form className="w-full">
              <input
                type="text"
                placeholder="Search Reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 px-4 rounded-full text-text border border-text focus:outline-none focus:border-accent"
              />
            </form>
          </div>
        )}
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 bg-background border-t border-gray-200 px-4 py-4 text-left space-y-3 shadow-lg md:hidden">
            {!isLoading && user ? (
              <>
                <Link
                  href={`/profile/${user.userId}`}
                  className="flex items-center text-text hover:text-accent py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconUserCircle size={20} className="mr-2" />
                  {user.userName}
                </Link>

                <Link
                  href="/notifications"
                  className="flex items-center text-text hover:text-accent py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <NotificationBell />
                </Link>

                <Link
                  href="/messages"
                  className="flex items-center text-text hover:text-accent py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconMail size={20} className="mr-2" />
                  Messages
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center text-text hover:text-accent w-full py-2"
                >
                  <IconLogout size={20} className="mr-2" />
                  Sign Out
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className="text-sm text-text flex items-center">
                    <ThemeToggle />
                    Theme
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center text-text hover:text-accent py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconLogin size={20} className="mr-2" />
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex items-center text-text hover:text-accent py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <IconUserPlus size={20} className="mr-2" />
                  Sign Up
                </Link>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-2">
                  <span className="text-sm text-text flex items-center">
                    <ThemeToggle />
                    Theme
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <HorizontalLine />
    </div>
  );
}
