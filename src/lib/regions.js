/**
 * The regions the alert source reports, and their names in both languages.
 *
 * `sourceId` is the id the source gives the oblast (or Kyiv) itself; the
 * districts and communities inside it are listed in `subregions.js`.
 * Everything else is only ever shown to the user: `name` is the formal name,
 * used where the region has to be picked without ambiguity, and `short` is
 * what a bookmark is labelled with by default, because a bookmarks bar is
 * short on room. Either way the user can type a label of their own.
 *
 * Listed in Ukrainian alphabetical order. The source reports Sevastopol only
 * as part of Crimea, so that is what the Sevastopol bookmark follows.
 */
export const REGIONS = [
  {
    id: 'vinnytsia',
    sourceId: '4',
    uk: { name: 'Вінницька область', short: 'Вінниця' },
    en: { name: 'Vinnytsia oblast', short: 'Vinnytsia' },
  },
  {
    id: 'volyn',
    sourceId: '8',
    uk: { name: 'Волинська область', short: 'Луцьк' },
    en: { name: 'Volyn oblast', short: 'Lutsk' },
  },
  {
    id: 'dnipropetrovsk',
    sourceId: '9',
    uk: { name: 'Дніпропетровська область', short: 'Дніпро' },
    en: { name: 'Dnipropetrovsk oblast', short: 'Dnipro' },
  },
  {
    id: 'donetsk',
    sourceId: '28',
    uk: { name: 'Донецька область', short: 'Донеччина' },
    en: { name: 'Donetsk oblast', short: 'Donetsk' },
  },
  {
    id: 'zhytomyr',
    sourceId: '10',
    uk: { name: 'Житомирська область', short: 'Житомир' },
    en: { name: 'Zhytomyr oblast', short: 'Zhytomyr' },
  },
  {
    id: 'zakarpattia',
    sourceId: '11',
    uk: { name: 'Закарпатська область', short: 'Ужгород' },
    en: { name: 'Zakarpattia oblast', short: 'Uzhhorod' },
  },
  {
    id: 'zaporizhzhia',
    sourceId: '12',
    uk: { name: 'Запорізька область', short: 'Запоріжжя' },
    en: { name: 'Zaporizhzhia oblast', short: 'Zaporizhzhia' },
  },
  {
    id: 'ivano-frankivsk',
    sourceId: '13',
    uk: { name: 'Івано-Франківська область', short: 'Франківськ' },
    en: { name: 'Ivano-Frankivsk oblast', short: 'Ivano-Frankivsk' },
  },
  {
    id: 'kyiv-city',
    sourceId: '31',
    uk: { name: 'м. Київ', short: 'Київ' },
    en: { name: 'Kyiv city', short: 'Kyiv' },
  },
  {
    id: 'kyiv-oblast',
    sourceId: '14',
    uk: { name: 'Київська область', short: 'Київщина' },
    en: { name: 'Kyiv oblast', short: 'Kyiv obl.' },
  },
  {
    id: 'kirovohrad',
    sourceId: '15',
    uk: { name: 'Кіровоградська область', short: 'Кропивницький' },
    en: { name: 'Kirovohrad oblast', short: 'Kropyvnytskyi' },
  },
  {
    id: 'luhansk',
    sourceId: '16',
    uk: { name: 'Луганська область', short: 'Луганщина' },
    en: { name: 'Luhansk oblast', short: 'Luhansk' },
  },
  {
    id: 'lviv',
    sourceId: '27',
    uk: { name: 'Львівська область', short: 'Львів' },
    en: { name: 'Lviv oblast', short: 'Lviv' },
  },
  {
    id: 'mykolaiv',
    sourceId: '17',
    uk: { name: 'Миколаївська область', short: 'Миколаїв' },
    en: { name: 'Mykolaiv oblast', short: 'Mykolaiv' },
  },
  {
    id: 'odesa',
    sourceId: '18',
    uk: { name: 'Одеська область', short: 'Одеса' },
    en: { name: 'Odesa oblast', short: 'Odesa' },
  },
  {
    id: 'poltava',
    sourceId: '19',
    uk: { name: 'Полтавська область', short: 'Полтава' },
    en: { name: 'Poltava oblast', short: 'Poltava' },
  },
  {
    id: 'rivne',
    sourceId: '5',
    uk: { name: 'Рівненська область', short: 'Рівне' },
    en: { name: 'Rivne oblast', short: 'Rivne' },
  },
  {
    id: 'sevastopol',
    sourceId: '9999',
    uk: { name: 'Севастополь', short: 'Севастополь' },
    en: { name: 'Sevastopol', short: 'Sevastopol' },
  },
  {
    id: 'sumy',
    sourceId: '20',
    uk: { name: 'Сумська область', short: 'Суми' },
    en: { name: 'Sumy oblast', short: 'Sumy' },
  },
  {
    id: 'ternopil',
    sourceId: '21',
    uk: { name: 'Тернопільська область', short: 'Тернопіль' },
    en: { name: 'Ternopil oblast', short: 'Ternopil' },
  },
  {
    id: 'kharkiv',
    sourceId: '22',
    uk: { name: 'Харківська область', short: 'Харків' },
    en: { name: 'Kharkiv oblast', short: 'Kharkiv' },
  },
  {
    id: 'kherson',
    sourceId: '23',
    uk: { name: 'Херсонська область', short: 'Херсон' },
    en: { name: 'Kherson oblast', short: 'Kherson' },
  },
  {
    id: 'khmelnytskyi',
    sourceId: '3',
    uk: { name: 'Хмельницька область', short: 'Хмельницький' },
    en: { name: 'Khmelnytskyi oblast', short: 'Khmelnytskyi' },
  },
  {
    id: 'cherkasy',
    sourceId: '24',
    uk: { name: 'Черкаська область', short: 'Черкаси' },
    en: { name: 'Cherkasy oblast', short: 'Cherkasy' },
  },
  {
    id: 'chernivtsi',
    sourceId: '26',
    uk: { name: 'Чернівецька область', short: 'Чернівці' },
    en: { name: 'Chernivtsi oblast', short: 'Chernivtsi' },
  },
  {
    id: 'chernihiv',
    sourceId: '25',
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
