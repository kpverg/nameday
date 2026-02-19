
export interface MyPerson {
  id: string;
  name: string;
  relation: string;
  birthday: string | null;
  groupName?: string;
  assocName?: string;
  isFromMyPeople?: boolean;
  phoneNumber?: string | null;
}

/**
 * Checks if a member of "My People" celebrates on a specific date.
 * Celebration occurs if:
 * 1. Their birthday matches the date (formatted as DD/MM/YY or DD/MM)
 * 2. Or if their name matches the namedays of that date (handled by existing logic)
 */
export const getMyPeopleCelebratingOnDate = (
  date: Date,
  myPeople: MyPerson[]
): MyPerson[] => {
  const day = date.getDate();
  const month = date.getMonth() + 1; // 1-based
  const year = date.getFullYear() % 100; // 2-digit year for matching YY

  return myPeople.filter((person) => {
    if (!person.birthday) return false;

    // Support formats: "21/1/26", "21/01/2026", "21/1"
    const parts = person.birthday.split('/');
    if (parts.length < 2) return false;

    const bDay = parseInt(parts[0], 10);
    const bMonth = parseInt(parts[1], 10);
    const bYearStr = parts[2];

    const dateMatches = bDay === day && bMonth === month;

    if (dateMatches) {
      if (bYearStr) {
        // If year is provided, it must match or be a yearly recurring event
        // Users often enter birthdays/namedays with years for specific reminders
        const bYear = parseInt(bYearStr, 10);
        // Match if year is the same (e.g. 26 matches 2026) or full year matches
        if (bYear === year || bYear === date.getFullYear()) {
          return true;
        }
        // If it's a birthday, it might be recurring every year regardless of the birth year
        // But the user specifically mentioned "21/1/26", so we prioritize the exact match
        // Or we treat it as "this is the date they celebrate"
        return true; 
      }
      return true;
    }

    return false;
  });
};

/**
 * Formats a "My People" member for display (e.g., "Ιωάννης γιος Κώστα")
 */
export const formatMyPersonCelebration = (person: MyPerson): string => {
  let parts = [person.name];
  if (person.relation) parts.push(person.relation);
  if (person.assocName) parts.push(person.assocName);
  return parts.join(' ');
};
