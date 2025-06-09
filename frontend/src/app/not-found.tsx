import Link from "next/link";
import HorizontalLine from "./components/ui/HorizontalLine";
import AnimatedNewspaper from "./components/ui/AnimatedNewspaper";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-text py-24 flex flex-col items-center font-serif">
      <HorizontalLine />
      <h1 className="text-5xl font-heading font-bold my-3">Oh no!</h1>
      <h2 className="text-3xl font-heading font-bold mb-6 text-primary">
        404 - Page Not Found
      </h2>
      <HorizontalLine />

      {/* Container relative to position the clear paragraph absolutely */}
      <div className="relative w-full max-w-5xl mt-8 px-4 h-[400px]">
        {/* Newspaper columns - blurred and filling entire container */}

        <AnimatedNewspaper />

        {/* Clear paragraph, centered and on top */}
        <p className="absolute top-1/2 left-1/2 max-w-3xl -translate-x-1/2 -translate-y-1/2 text-center text-lg text-black z-20 px-6 py-4 bg-white bg-opacity-90 rounded shadow-md">
          In an unexpected turn of events, the page you’re searching for has
          gone missing from our records — lost to the annals of cyberspace or
          never penned in the first place. Rest assured, our diligent reporters
          are investigating this enigma, but until then, we invite you to{" "}
          <span className="text-accent hover:cursor-pointer">
            <Link href="/home" className="">
              return to safer ground.{" "}
            </Link>
          </span>
        </p>
      </div>
    </div>
  );
}
