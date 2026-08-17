import Image from "next/image";

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/logo-gli.jpeg"
      alt="GLI"
      width={160}
      height={48}
      className={`${className} rounded object-contain`}
      priority
    />
  );
}
