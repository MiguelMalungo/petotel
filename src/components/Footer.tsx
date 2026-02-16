import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-border-custom bg-surface-alt mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/media/petotel_logo.png"
              alt="PetOtel Logo"
              width={24}
              height={24}
              className="w-6 h-6 object-contain"
            />
            <span className="font-semibold text-foreground">
              Pet<span className="text-accent">Otel</span>
            </span>
          </div>
          <p className="text-sm text-text-secondary text-center">
            Pet-friendly hotel booking. Travel with your furry friends.
          </p>
          <p className="text-xs text-warm-gray">
            Powered by LiteAPI
          </p>
        </div>
      </div>
    </footer>
  );
}
