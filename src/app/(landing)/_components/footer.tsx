import { ThemeToggle } from "@/components/theme-toggle";

export const Footer = () => {
  return (
    <footer className="px-4 py-6">
      <div className="container flex items-center p-0">
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
};
