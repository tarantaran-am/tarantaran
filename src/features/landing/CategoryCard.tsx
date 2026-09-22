import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  slug: string;
  name: string;
  count: string;
  photo: string;
  className?: string;
}

export function CategoryCard({ slug, name, count, photo, className = "" }: CategoryCardProps) {
  return (
    <Link
      href={`/catalog/${slug}`}
      className={`group relative block overflow-hidden rounded-[20px] bg-muted ${className}`}
      style={{ minHeight: 0 }}
    >
      <Image
        src={photo}
        alt={name}
        fill
        sizes="(min-width: 768px) 33vw, 100vw"
        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-black/12 to-transparent" />
      <div className="absolute right-0 bottom-0 left-0 p-5">
        <div className="text-[15px] leading-tight font-medium text-white">{name}</div>
        <div className="mt-1 text-[11px] text-white/60">{count}</div>
      </div>
      <div className="absolute top-4 right-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="rounded-full bg-background/95 p-1.5">
          <ArrowRight className="h-3.5 w-3.5 text-foreground" />
        </div>
      </div>
    </Link>
  );
}
