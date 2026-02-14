export default function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-border-custom rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-accent rounded-full animate-spin" />
      </div>
      <p className="text-text-secondary text-sm">{message}</p>
    </div>
  );
}
