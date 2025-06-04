import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function NavBar() {
  return (
    <div className=" top-0 w-full z-[999] bg-background h-24">
      <div className="mx-24 flex flex-row justify-between items-center h-full">
        <Link href="/">
          <h1 className="font-heading text-text">TAQYIM</h1>
        </Link>

        <input />

        <div className="flex-1 mx-4 flex justify-center">
          <form className="w-full max-w-lg">
            <input
              type="text"
              placeholder="Search Reviews..."
              className="w-full h-10 px-4 rounded-full text-text border border-text focus:outline-none focus:border-accent"
            />
          </form>
        </div>
        <div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
