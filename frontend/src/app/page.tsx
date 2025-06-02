import Counter from "./components/counter";
import JsonPlaceholder from "./components/jsonPlaceholder";

export default function Home() {
  return (
    <div className="h-screen w-full flex justify-center items-center">
      {/* <Counter /> */}
      <JsonPlaceholder />
    </div>
  );
}
