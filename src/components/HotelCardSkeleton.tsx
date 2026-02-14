export default function HotelCardSkeleton() {
  return (
    <div className="bg-surface rounded-2xl border border-border-custom overflow-hidden">
      <div className="h-48 skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded skeleton" />
        <div className="h-4 w-1/2 rounded skeleton" />
        <div className="flex gap-2 mt-3">
          <div className="h-6 w-16 rounded-full skeleton" />
          <div className="h-6 w-20 rounded-full skeleton" />
        </div>
        <div className="h-4 w-1/3 rounded skeleton mt-3" />
      </div>
    </div>
  );
}
