/**
 * The regions the alert source reports, and their names in both languages.
 *
 * `key` is the wire name the source uses and has to match it byte for byte.
 * Everything else is only ever shown to the user: `name` is the formal name,
 * used where the region has to be picked without ambiguity, and `short` is
 * what a bookmark is labelled with by default, because a bookmarks bar is
 * short on room. Either way the user can type a label of their own.
 *
 * A key the source stops sending reads as unknown, and a key it starts
 * sending that is not listed here is ignored. Neither breaks the extension.
 *
 * Listed in Ukrainian alphabetical order. Crimea is absent from the source,
 * so it is absent here.
 */
export const REGIONS = [
  {
    id: 'vinnytsia',
    key: 'Вінницька область',
    uk: { name: 'Вінницька область', short: 'Вінниця' },
    en: { name: 'Vinnytsia oblast', short: 'Vinnytsia' },
  },
  {
    id: 'volyn',
    key: 'Волинська область',
    uk: { name: 'Волинська область', short: 'Луцьк' },
    en: { name: 'Volyn oblast', short: 'Lutsk' },
  },
  {
    id: 'dnipropetrovsk',
    key: 'Дніпропетровська область',
    uk: { name: 'Дніпропетровська область', short: 'Дніпро' },
    en: { name: 'Dnipropetrovsk oblast', short: 'Dnipro' },
  },
  {
    id: 'donetsk',
    key: 'Донецька область',
    uk: { name: 'Донецька область', short: 'Донеччина' },
    en: { name: 'Donetsk oblast', short: 'Donetsk' },
  },
  {
    id: 'zhytomyr',
    key: 'Житомирська область',
    uk: { name: 'Житомирська область', short: 'Житомир' },
    en: { name: 'Zhytomyr oblast', short: 'Zhytomyr' },
  },
  {
    id: 'zakarpattia',
    key: 'Закарпатська область',
    uk: { name: 'Закарпатська область', short: 'Ужгород' },
    en: { name: 'Zakarpattia oblast', short: 'Uzhhorod' },
  },
  {
    id: 'zaporizhzhia',
    key: 'Запорізька область',
    uk: { name: 'Запорізька область', short: 'Запоріжжя' },
    en: { name: 'Zaporizhzhia oblast', short: 'Zaporizhzhia' },
  },
  {
    id: 'ivano-frankivsk',
    key: 'Івано-Франківська область',
    uk: { name: 'Івано-Франківська область', short: 'Франківськ' },
    en: { name: 'Ivano-Frankivsk oblast', short: 'Ivano-Frankivsk' },
  },
  {
    id: 'kyiv-city',
    key: 'м. Київ',
    uk: { name: 'м. Київ', short: 'Київ' },
    en: { name: 'Kyiv city', short: 'Kyiv' },
  },
  {
    id: 'kyiv-oblast',
    key: 'Київська область',
    uk: { name: 'Київська область', short: 'Київщина' },
    en: { name: 'Kyiv oblast', short: 'Kyiv obl.' },
  },
  {
    id: 'kirovohrad',
    key: 'Кіровоградська область',
    uk: { name: 'Кіровоградська область', short: 'Кропивницький' },
    en: { name: 'Kirovohrad oblast', short: 'Kropyvnytskyi' },
  },
  {
    id: 'luhansk',
    key: 'Луганська область',
    uk: { name: 'Луганська область', short: 'Луганщина' },
    en: { name: 'Luhansk oblast', short: 'Luhansk' },
  },
  {
    id: 'lviv',
    key: 'Львівська область',
    uk: { name: 'Львівська область', short: 'Львів' },
    en: { name: 'Lviv oblast', short: 'Lviv' },
  },
  {
    id: 'mykolaiv',
    key: 'Миколаївська область',
    uk: { name: 'Миколаївська область', short: 'Миколаїв' },
    en: { name: 'Mykolaiv oblast', short: 'Mykolaiv' },
  },
  {
    id: 'odesa',
    key: 'Одеська область',
    uk: { name: 'Одеська область', short: 'Одеса' },
    en: { name: 'Odesa oblast', short: 'Odesa' },
  },
  {
    id: 'poltava',
    key: 'Полтавська область',
    uk: { name: 'Полтавська область', short: 'Полтава' },
    en: { name: 'Poltava oblast', short: 'Poltava' },
  },
  {
    id: 'rivne',
    key: 'Рівненська область',
    uk: { name: 'Рівненська область', short: 'Рівне' },
    en: { name: 'Rivne oblast', short: 'Rivne' },
  },
  {
    id: 'sevastopol',
    key: 'Севастополь',
    uk: { name: 'Севастополь', short: 'Севастополь' },
    en: { name: 'Sevastopol', short: 'Sevastopol' },
  },
  {
    id: 'sumy',
    key: 'Сумська область',
    uk: { name: 'Сумська область', short: 'Суми' },
    en: { name: 'Sumy oblast', short: 'Sumy' },
  },
  {
    id: 'ternopil',
    key: 'Тернопільська область',
    uk: { name: 'Тернопільська область', short: 'Тернопіль' },
    en: { name: 'Ternopil oblast', short: 'Ternopil' },
  },
  {
    id: 'kharkiv',
    key: 'Харківська область',
    uk: { name: 'Харківська область', short: 'Харків' },
    en: { name: 'Kharkiv oblast', short: 'Kharkiv' },
  },
  {
    id: 'kherson',
    key: 'Херсонська область',
    uk: { name: 'Херсонська область', short: 'Херсон' },
    en: { name: 'Kherson oblast', short: 'Kherson' },
  },
  {
    id: 'khmelnytskyi',
    key: 'Хмельницька область',
    uk: { name: 'Хмельницька область', short: 'Хмельницький' },
    en: { name: 'Khmelnytskyi oblast', short: 'Khmelnytskyi' },
  },
  {
    id: 'cherkasy',
    key: 'Черкаська область',
    uk: { name: 'Черкаська область', short: 'Черкаси' },
    en: { name: 'Cherkasy oblast', short: 'Cherkasy' },
  },
  {
    id: 'chernivtsi',
    key: 'Чернівецька область',
    uk: { name: 'Чернівецька область', short: 'Чернівці' },
    en: { name: 'Chernivtsi oblast', short: 'Chernivtsi' },
  },
  {
    id: 'chernihiv',
    key: 'Чернігівська область',
    uk: { name: 'Чернігівська область', short: 'Чернігів' },
    en: { name: 'Chernihiv oblast', short: 'Chernihiv' },
  },
];

const BY_ID = new Map(REGIONS.map((region) => [region.id, region]));

export const regionById = (id) => BY_ID.get(id) ?? null;

const namesFor = (id, language) => {
  const region = BY_ID.get(id);
  if (!region) return null;
  return language === 'en' ? region.en : region.uk;
};

/** Formal name, for anywhere the region has to be identified exactly. */
export const regionName = (id, language) => namesFor(id, language)?.name ?? '';

/** Default bookmark label, shown until the user writes one of their own. */
export const regionShortName = (id, language) =>
  namesFor(id, language)?.short ?? '';
