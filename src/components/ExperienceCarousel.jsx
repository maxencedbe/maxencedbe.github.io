import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

const ExperienceCarousel = ({ items }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    containScroll: 'trimSnaps'
  });

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onInit();
    emblaApi.on('reInit', onInit);
    emblaApi.on('select', onSelect);

    function onInit() {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    }
  }, [emblaApi, onSelect]);

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-12">
      {/* Carousel Viewport - Added py-12 for deep shadow space */}
      <div className="overflow-hidden py-12 -my-12" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 px-6 sm:px-10 cursor-pointer"
            >
              <div className="glass-card group p-5 sm:p-6 h-full flex flex-row items-center gap-6 sm:gap-10">
                {/* SVG Border Effect */}
                <svg className="about-border" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <rect x="0" y="0" width="100%" height="100%" rx="20" ry="20"></rect>
                </svg>

                {/* Left: Icon */}
                <div className="flex-shrink-0 relative z-10">
                  {item.icon ? (
                    <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                      <img src={item.icon} alt={item.title} className="w-full h-full object-contain invert dark:invert-0" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-black/5">
                      <span className="text-2xl sm:text-4xl font-bold text-neutral-400">
                        {item.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Right: Info */}
                <div className="flex flex-col relative z-10 text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-black dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0">
                    {item.date}
                  </p>
                  <p className="text-sm sm:text-base text-neutral-700 dark:text-neutral-300 font-medium mt-1.5 sm:mt-2">
                    {item.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center
          bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-md
          text-neutral-900 dark:text-white transition-all duration-300 z-10
          ${!prevBtnEnabled ? 'opacity-0 pointer-events-none scale-90' : 'cursor-pointer hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white hover:scale-110'}
          hidden sm:flex
        `}
        onClick={scrollPrev}
        disabled={!prevBtnEnabled}
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <button
        className={`absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center
          bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-md
          text-neutral-900 dark:text-white transition-all duration-300 z-10
          ${!nextBtnEnabled ? 'opacity-0 pointer-events-none scale-90' : 'cursor-pointer hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white hover:scale-110'}
          hidden sm:flex
        `}
        onClick={scrollNext}
        disabled={!nextBtnEnabled}
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 
              ${index === selectedIndex ? 'w-6 bg-pink-500' : 'bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500'}
            `}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ExperienceCarousel;
