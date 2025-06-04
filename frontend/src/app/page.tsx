import Counter from "./components/counter";
import JsonPlaceholder from "./components/jsonPlaceholder";
import ThemeToggle from "./components/themeToggle";

export default function Home() {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      {/* <Counter /> */}
      {/* <JsonPlaceholder /> */}
      <div className="min-h-screen bg-background text-text font-body p-6">
        <header className="mb-8">
          <ThemeToggle />
          <h1 className="text-4xl font-heading font-bold text-primary">
            Welcome to the App
          </h1>
          <p className="text-xl text-secondary mt-2">
            This is a sample interface using custom Tailwind configuration.
          </p>
        </header>

        <main className="space-y-6">
          <button className="px-4 py-2 bg-accent text-white font-bold rounded-md hover:opacity-90">
            Click Me
          </button>

          <section className="bg-mint-500 bg-opacity-10 p-4 rounded-lg">
            <h2 className="text-2xl font-heading">Typography Scale</h2>
          </section>
        </main>
      </div>
    </div>
  );
}
