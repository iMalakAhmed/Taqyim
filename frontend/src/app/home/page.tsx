import Feed from "../components/Feed";
import Recommendations from "../components/Recommendations";

export default function HomePage() {
  return (
    <main className="w-full min-h-screen bg-background text-text pt-24 p-96">
      <div className="flex flex-row">
        <Feed />
        {/* <Recommendations /> */}
      </div>
    </main>
  );
}
