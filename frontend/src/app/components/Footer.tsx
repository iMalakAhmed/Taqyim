import TeamSection from "./TeamSection";

export default function Footer() {
  return (
    <footer className="w-full mt-16 bg-inverse text-text-inverse py-8 px-6 font-body">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        {/* About */}
        <div className="text-center md:text-left md:w-1/3 space-y-2">
          <h2 className="text-xl font-semibold">About This Project</h2>
          <p className="text-sm">
            A business review social media platform created for the 2025 GDG
            competition competition.
          </p>
        </div>

        {/* Quick Links */}
        <div className="text-center md:text-left md:w-1/3 space-y-2">
          <h2 className="text-xl font-semibold">Quick Links</h2>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="/home" className="hover:text-accent transition">
                Home
              </a>
            </li>
            <li>
              <a href="/categories" className="hover:text-accent transition">
                Categories
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:text-accent transition">
                Contact Us
              </a>
            </li>
            <li>
              <a href="/terms" className="hover:text-accent transition">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Team */}
        <div className="text-center md:text-left md:w-1/3 space-y-2">
          <h2 className="text-xl font-semibold">Our Team</h2>
          <TeamSection />
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-xs text-gray-500">
        © 2025 Business Review Project. All rights reserved.
      </div>
    </footer>
  );
}
