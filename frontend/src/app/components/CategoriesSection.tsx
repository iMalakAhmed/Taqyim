import HorizontalLine from "./ui/HorizontalLine";

export default function CategoriesSection() {
  return (
    <div className="flex flex-col w-full h-full items-center justify-center font-heading text-text">
      <h1 className="text-accent text-3xl p-7">Categories</h1>
      <HorizontalLine />
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8 justify-center items-center px-4 text-xl sm:text-2xl w-full max-w-4xl md:pt-16 pt-8 text-center">
        <p className="underline-hover hover:text-accent">Restaurants</p>
        <p className="underline-hover hover:text-accent">Beauty & Health</p>
        <p className="underline-hover hover:text-accent">Sports</p>
        <p className="underline-hover hover:text-accent">Travel & Activities</p>
      </div>
    </div>
  );
}
