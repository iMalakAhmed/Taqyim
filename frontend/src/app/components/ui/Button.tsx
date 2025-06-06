import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

const baseStyles =
  "inline-flex items-center justify-center rounded-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white font-body";

const variants = {
  primary: "bg-primary hover:bg-accent/90 focus:ring-accent",
  secondary: "bg-secondary hover:bg-accent/90 focus:ring-accent",
  outline:
    "border border-gray-300 text-gray-800 hover:bg-gray-100 bg-transparent focus:ring-gray-300",
};

const sizes = {
  sm: "text-sm font-medium  px-3 py-1.5 gap-1.5",
  md: "text-base font-medium  px-4 py-2 gap-2",
  lg: "text-xl font-bold  px-10 py-3 gap-2.5",
  xl: "text-2xl font-bold px-12 py-5 gap-2.5",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className,
  disabled = false,
  type = "button",
  iconLeft,
  iconRight,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {iconLeft && <span className="mr-2">{iconLeft}</span>}
      {children}
      {iconRight && <span className="ml-2">{iconRight}</span>}
    </button>
  );
}
