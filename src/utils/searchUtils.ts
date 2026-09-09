import { Item } from '../types';

/**
 * Strips Croatian and European diacritics for seamless search (e.g., c matches č/ć, s matches š)
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
}

/**
 * Cleans conversational prefixes in Croatian or English
 * e.g. "gdje mi je bušilica" -> "bušilica"
 * "gdje sam spremio ključeve" -> "ključeve"
 * "gdje su zimske jakne" -> "zimske jakne"
 */
export function cleanSearchQuery(query: string): string {
  let cleaned = query.toLowerCase().trim();
  
  const prefixes = [
    'gdje mi je',
    'gdje su mi',
    'gdje je',
    'gdje su',
    'gdje se nalazi',
    'gdje se nalaze',
    'gdje sam stavio',
    'gdje sam stavila',
    'gdje sam spremio',
    'gdje sam spremila',
    'gdje sam ostavio',
    'gdje sam ostavila',
    'tražim',
    'trazim',
    'gdje stoji',
    'gdje stoje',
    'kamo sam stavio',
    'kamo sam stavila',
    'ima li',
    'pronadi',
    'pronađi',
    'where is',
    'where are',
    'where did i put'
  ];

  for (const prefix of prefixes) {
    if (cleaned.startsWith(prefix)) {
      cleaned = cleaned.slice(prefix.length).trim();
      break;
    }
  }

  // Remove trailing question marks or punctuation
  cleaned = cleaned.replace(/[?!.,;:]+$/, '').trim();

  return cleaned;
}

export function searchItems(items: Item[], rawQuery: string): Item[] {
  if (!rawQuery.trim()) return items;

  const query = cleanSearchQuery(rawQuery);
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

  if (queryWords.length === 0) return items;

  return items.filter(item => {
    const haystack = [
      item.name,
      item.description,
      item.roomName,
      item.container,
      item.containerCode || '',
      item.subLocation || '',
      item.category,
      item.notes || '',
      item.loanedTo || '',
      ...(item.tags || [])
    ].map(s => normalizeText(s)).join(' ');

    // Match if all query words are present in the searchable text
    return queryWords.every(word => haystack.includes(word));
  });
}
