const Banner = () => {
  return (
      <div className="sticky top-0 z-50 bg-warning border-b border-warning/20">
        <div className="w-full py-1.5 md:py-2 text-center px-4">
          <span className="text-xs md:text-sm font-medium text-warning-foreground">
            Vorläufige KI-basierte Version
          </span>
        </div>
      </div>
  );
};

export default Banner;
