import Link from "next/link"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface LinkedMenuItemProps {
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  cursor?: string;
}

export function LinkedMenuItem({ 
  href, 
  children, 
  onClick,
  className = "",
  cursor = "pointer"
}: LinkedMenuItemProps) {
  // If onClick is provided but no href, use a regular DropdownMenuItem with onClick
  if (onClick && !href) {
    return (
      <DropdownMenuItem 
        onClick={onClick} 
        className={`hover:cursor-${cursor} ${className}`}
      >
        {children}
      </DropdownMenuItem>
    );
  }

  // If href is provided, use Link + asChild pattern
  return (
    <DropdownMenuItem asChild className={`hover:cursor-${cursor} ${className}`}>
      <Link href={href || "#"} onClick={onClick}>
        {children}
      </Link>
    </DropdownMenuItem>
  );
}