import HorizontalLine from "./ui/HorizontalLine";

export default function CategoriesSection() {
  return (
    <div className="flex flex-col w-full h-full items-center justify-center font-heading text-text">
      <h1 className="text-accent text-3xl p-7">Categories</h1>
      <HorizontalLine />
      <div className="flex flex-row justify-between px-4 text-2xl w-full max-w-4xl pt-16">
        <p className="underline-hover hover:text-accent">Restaurants</p>
        <p className="underline-hover hover:text-accent">Beauty & Health</p>
        <p className="underline-hover hover:text-accent">Sports</p>
        <p className="underline-hover hover:text-accent">Travel & Activities</p>
      </div>
    </div>
  );
}
