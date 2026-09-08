/**
 * Interface wording for the options page, in both languages.
 *
 * Not `_locales`: the standard message API picks a language from the browser
 * and keeps it, and this extension lets the user switch languages themselves,
 * which is the point for anyone reading English in a Ukrainian browser or the
 * other way round.
 */

export const STRINGS = {
  uk: {
    pageTitle: 'Повітряні тривоги — налаштування',

    languageHeading: 'Мова',

    regionsHeading: 'Області',
    regionsHint:
      'Кожна область — окрема закладка на панелі закладок. ' +
      'Назву можна змінити на свою: «Луцьк» замість «Волинська область».',
    labelPlaceholder: 'Своя назва',
    add: 'Додати область',
    remove: 'Прибрати',
    limitReached: 'Більше 10 закладок не можна',

    wordingHeading: 'Текст закладки',
    wordingHint: '{name} буде замінено назвою з попереднього блоку.',
    alertField: 'Тривога',
    clearField: 'Тривоги немає',
    unknownField: 'Немає даних',

    intervalHeading: 'Як часто оновлювати',
    intervalUnit: 'хвилин між перевірками',
    intervalHint:
      'Одна перевірка на всі закладки. ' +
      'Менше однієї хвилини браузер усе одно не дозволить.',

    previewHeading: 'Як це виглядатиме',
    previewHint: 'Три можливі стани для кожної закладки.',

    restore: 'Повернути типові',
    saved: 'Збережено',
    restored: 'Типові налаштування повернуто',

    sourceNote: 'Дані: {source} — відкритий доступ, без ключа та реєстрації.',
  },

  en: {
    pageTitle: 'Air Alerts in Bookmarks — Settings',

    languageHeading: 'Language',

    regionsHeading: 'Regions',
    regionsHint:
      'Each region is its own bookmark on the bookmarks toolbar. ' +
      'Give it any name you like — "Lutsk" instead of "Volyn oblast", say.',
    labelPlaceholder: 'Your own name',
    add: 'Add a region',
    remove: 'Remove',
    limitReached: 'Ten bookmarks is the limit',

    wordingHeading: 'Bookmark wording',
    wordingHint: '{name} is replaced with the name from the block above.',
    alertField: 'Alert',
    clearField: 'No alert',
    unknownField: 'No data',

    intervalHeading: 'How often it refreshes',
    intervalUnit: 'minutes between checks',
    intervalHint:
      'One check covers every bookmark. ' +
      'Browsers clamp anything below one minute.',

    previewHeading: 'How it will look',
    previewHint: 'The three states each bookmark can show.',

    restore: 'Restore defaults',
    saved: 'Saved',
    restored: 'Defaults restored',

    sourceNote: 'Data: {source} — open access, no key and no account.',
  },
};

export const t = (language, key, values = {}) => {
  const table = STRINGS[language] ?? STRINGS.uk;
  const template = table[key] ?? STRINGS.uk[key] ?? key;
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, () => value),
    template,
  );
};
