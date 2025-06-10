"use client";

import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { usePathname } from "next/navigation";
import {
  IconBellRinging2,
  IconMail,
  IconUser,
  IconUserCircle,
  IconSearch,
  IconMenu2,
  IconX,
  IconLogin,
  IconUserPlus,
  IconLogout,
} from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { useGetCurrentUserQuery, authApi } from "../../redux/services/authApi";
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

  const { data: user, isLoading, refetch } = useGetCurrentUserQuery();

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
      await fetch("/api/auth/signout", {
        method: "POST",
      });
    } catch (err) {
      console.error("Error calling signout API:", err);
    }

    sessionStorage.removeItem("token");
    await removeAuthCookie();
    dispatch(authApi.util.resetApiState());
    router.push("/auth/login");
    setMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <div
      className={`top-0 w-full z-[999] bg-background text-text ${
        isFixed ? "fixed" : "relative"
      }`}
    >
      {/* Desktop Navbar */}
      <div className="hidden md:flex mx-4 md:mx-8 lg:mx-24 flex-row justify-between items-center h-24">
        {user ? (
          <Link href="/home" className="min-w-[100px]">
            <h1 className="font-heading text-text text-xl lg:text-2xl">
              TAQYIM
            </h1>
          </Link>
        ) : (
          <Link href="/" className="min-w-[100px]">
            <h1 className="font-heading text-text text-xl lg:text-2xl">
              TAQYIM
            </h1>
          </Link>
        )}

        <div className="flex-1 mx-4 flex justify-center">
          <form className="w-full max-w-lg relative">
            <input
              type="text"
              placeholder="Search Reviews..."
              className="w-full h-10 px-4 rounded-full text-text border border-text focus:outline-none focus:border-accent"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown} // Add onKeyDown handler
            />
            {showSearchResults && debouncedSearchQuery.length > 0 && (
              <div className="absolute mt-2 w-full bg-background border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto z-50">
                {allUsers.length > 0 && (
                  <div className="p-2 border-b border-gray-200">
                    <h3 className="font-bold text-lg">Users</h3>
                    {allUsers.map((userResult) => (
                      <Link
                        key={userResult.userId}
                        href={`/profile/${userResult.userId}`}
                        onClick={handleResultClick}
                        className="block p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {userResult.userName}
                      </Link>
                    ))}
                  </div>
                )}
                {allBusinesses.length > 0 && (
                  <div className="p-2 border-b border-gray-200">
                    <h3 className="font-bold text-lg">Businesses</h3>
                    {allBusinesses.map((businessResult) => (
                      <Link
                        key={businessResult.businessId}
                        href={`/Business/${businessResult.businessId}`}
                        onClick={handleResultClick}
                        className="block p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {businessResult.name}
                      </Link>
                    ))}
                  </div>
                )}
                {allReviews.length > 0 && (
                  <div className="p-2">
                    <h3 className="font-bold text-lg">Reviews</h3>
                    {allReviews.map((reviewResult) => (
                      <Link
                        key={reviewResult.reviewId}
                        href={`/reviews/${reviewResult.reviewId}`}
                        onClick={handleResultClick}
                        className="block p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        Review for {reviewResult.businessName} by{" "}
                        {reviewResult.userName}:{" "}
                        {reviewResult.comment.substring(0, 50)}...
                      </Link>
                    ))}
                  </div>
                )}
                {allUsers.length === 0 &&
                  allBusinesses.length === 0 &&
                  allReviews.length === 0 &&
                  debouncedSearchQuery.length > 0 &&
                  !isLoadingUsers &&
                  !isLoadingBusinesses &&
                  !isLoadingReviews && (
                    <div className="p-2 text-center text-gray-500">
                      No results found.
                    </div>
                  )}
                {(isLoadingUsers || isLoadingBusinesses || isLoadingReviews) &&
                  debouncedSearchQuery.length > 0 && (
                    <div className="p-2 text-center text-gray-500">
                      Loading...
                    </div>
                  )}
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

              <Button variant="none" size="sm" className="hover:text-secondary">
                <IconBellRinging2 />
              </Button>
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
            <form onSubmit={handleSearch} className="w-full">
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
                  <IconBellRinging2 size={20} className="mr-2" />
                  Notifications
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
