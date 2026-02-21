// Greek to Greeklish conversion map
export const greekToGreeklish = (str: string): string => {
  if (!str) return '';
  // First, remove accents
  const normalized = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const map: { [key: string]: string } = {
    Θ: 'Th',
    θ: 'th',
    Χ: 'Ch',
    χ: 'ch',
    Ψ: 'Ps',
    ψ: 'ps',
    Α: 'A',
    α: 'a',
    Β: 'V',
    β: 'v',
    Γ: 'G',
    γ: 'g',
    Δ: 'D',
    δ: 'd',
    Ε: 'E',
    ε: 'e',
    Ζ: 'Z',
    ζ: 'z',
    Η: 'I',
    η: 'i',
    Ι: 'I',
    ι: 'i',
    Κ: 'K',
    κ: 'k',
    Λ: 'L',
    λ: 'l',
    Μ: 'M',
    μ: 'm',
    Ν: 'N',
    ν: 'n',
    Ξ: 'X',
    ξ: 'x',
    Ο: 'O',
    ο: 'o',
    Π: 'P',
    π: 'p',
    Ρ: 'R',
    ρ: 'r',
    Σ: 'S',
    σ: 's',
    ς: 's',
    Τ: 'T',
    τ: 't',
    Υ: 'Y',
    υ: 'y',
    Φ: 'F',
    φ: 'f',
    Ω: 'O',
    ω: 'o',
  };

  let result = '';
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    result += map[char] || char;
  }
  return result.toLowerCase();
};

// Greeklish to Greek conversion
export const greeklishToGreek = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/th/g, 'θ')
    .replace(/ts/g, 'τς')
    .replace(/ch/g, 'χ')
    .replace(/ph/g, 'φ')
    .replace(/ou/g, 'ου')
    .replace(/a/g, 'α')
    .replace(/b/g, 'β')
    .replace(/g/g, 'γ')
    .replace(/d/g, 'δ')
    .replace(/e/g, 'ε')
    .replace(/z/g, 'ζ')
    .replace(/h/g, 'η')
    .replace(/i/g, 'ι')
    .replace(/k/g, 'κ')
    .replace(/l/g, 'λ')
    .replace(/m/g, 'μ')
    .replace(/n/g, 'ν')
    .replace(/o/g, 'ο')
    .replace(/p/g, 'π')
    .replace(/r/g, 'ρ')
    .replace(/s/g, 'σ')
    .replace(/t/g, 'τ')
    .replace(/u/g, 'υ')
    .replace(/v/g, 'β')
    .replace(/w/g, 'ω')
    .replace(/y/g, 'υ')
    .replace(/x/g, 'ξ')
    .replace(/c/g, 'κ')
    .replace(/f/g, 'φ')
    .replace(/j/g, 'τζ')
    .replace(/q/g, 'κ')
    .replace(/ /g, '');
};

const normalizeCache = new Map<string, string>();
export const normalizeGreekName = (name: string): string => {
  if (!name) return '';
  if (normalizeCache.has(name)) return normalizeCache.get(name)!;
  const result = name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/ς$/, 'σ'); // Replace final ς with σ for better matching
  normalizeCache.set(name, result);
  return result;
};

const stripCache = new Map<string, string>();
export const stripEnding = (str: string) => {
  if (stripCache.has(str)) return stripCache.get(str)!;
  const result = str.replace(/[ςσ]$/, '');
  stripCache.set(str, result);
  return result;
};

const matchCache = new Map<string, boolean>();
export const namesMatch = (contactName: string, namedayName: string): boolean => {
  const key = `${contactName}|${namedayName}`;
  if (matchCache.has(key)) return matchCache.get(key)!;

  let normalizedContact = normalizeGreekName(contactName);
  let normalizedNameday = normalizeGreekName(namedayName);

  if (!normalizedContact || !normalizedNameday) {
    matchCache.set(key, false);
    return false;
  }

  const contactStripped = stripEnding(normalizedContact);
  const namedayStripped = stripEnding(normalizedNameday);

  // Exact match (with or without final sigma)
  if (normalizedContact === normalizedNameday || contactStripped === namedayStripped) {
    matchCache.set(key, true);
    return true;
  }

  // Check if contact name is within the nameday name (for compound names)
  const contactWords = normalizedContact.split(/\s+/);
  const namedayWords = normalizedNameday.split(/\s+/);

  // Check if any word in contact name matches any word in nameday
  const wordMatch = contactWords.some(cWord => {
    const cWordStripped = stripEnding(cWord);
    return namedayWords.some(nWord => {
      const nWordStripped = stripEnding(nWord);
      return (
        cWord === nWord ||
        cWordStripped === nWordStripped ||
        (cWord.length >= 4 && nWord.startsWith(cWord)) ||
        (nWord.length >= 4 && cWord.startsWith(nWord)) ||
        (cWordStripped.length >= 4 &&
          nWordStripped.startsWith(cWordStripped)) ||
        (nWordStripped.length >= 4 && cWordStripped.startsWith(nWordStripped))
      );
    });
  });

  if (wordMatch) {
    matchCache.set(key, true);
    return true;
  }

  // Check Greeklish matching
  const contactGreeklish = greekToGreeklish(contactName);
  const namedayGreeklish = greekToGreeklish(namedayName);

  // Compare without spaces
  if (
    contactGreeklish.replace(/\s+/g, '') ===
    namedayGreeklish.replace(/\s+/g, '')
  ) {
    matchCache.set(key, true);
    return true;
  }

  // Check if greeklish contact name starts with or is contained in nameday greeklish
  const contactGreeklishWords = contactGreeklish.split(/\s+/).filter(w => w);
  const namedayGreeklishWords = namedayGreeklish.split(/\s+/).filter(w => w);

  const greeklishMatch = contactGreeklishWords.some(cWord => {
    return namedayGreeklishWords.some(nWord => {
      return (
        cWord === nWord ||
        (cWord.length >= 4 && nWord.startsWith(cWord)) ||
        (nWord.length >= 4 && cWord.startsWith(nWord))
      );
    });
  });

  matchCache.set(key, greeklishMatch);
  return greeklishMatch;
};
