import { useLocale } from './useLocale.js';

const ExperienceRow = ({ itemsEn, itemsFr, items }) => {
  const locale = useLocale();
  const currentItems = itemsEn && itemsFr ? (locale === 'fr' ? itemsFr : itemsEn) : (items || []);

  return (
    <div className="max-w-[900px] mx-auto flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-black/10 dark:divide-white/10">
      {currentItems.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center text-center py-6 sm:py-0 sm:px-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2">
            {item.icon ? (
              item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity duration-300">
                  <img src={item.icon} alt={item.title} className={`w-full h-full object-contain invert dark:invert-0 ${item.logoClass || ""}`} />
                </a>
              ) : (
                <img src={item.icon} alt={item.title} className={`w-full h-full object-contain invert dark:invert-0 ${item.logoClass || ""}`} />
              )
            ) : (
              <div className="w-full h-full rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-black/5">
                <span className="text-2xl font-bold text-neutral-400">{item.title.charAt(0)}</span>
              </div>
            )}
          </div>
          <h3 data-locale-fade className="text-lg font-bold text-black dark:text-white leading-snug">{item.title}</h3>
          <p data-locale-fade className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{item.date}</p>
          <p data-locale-fade className="text-sm text-neutral-700 dark:text-neutral-300 font-medium mt-2">{item.role}</p>
        </div>
      ))}
    </div>
  );
};

export default ExperienceRow;
