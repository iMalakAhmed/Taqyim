interface VerticalLineProps {
  className?: string;
}

export default function VerticalLine({ className = "" }: VerticalLineProps) {
  return <div className={`w-px  bg-text ${className}`} />;
}
