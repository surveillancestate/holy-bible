// KJV Bible Data Fetcher and Storage
// King James Version is in the public domain

interface BibleBook {
  name: string;
  testament: 'Old' | 'New';
  chapters: number;
  abbreviation?: string;
}

interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleChapter {
  book: string;
  chapter: number;
  verses: BibleVerse[];
}

const KJV_BOOKS: BibleBook[] = [
  // Old Testament
  { name: "Genesis", testament: "Old", chapters: 50, abbreviation: "Gen" },
  { name: "Exodus", testament: "Old", chapters: 40, abbreviation: "Exo" },
  { name: "Leviticus", testament: "Old", chapters: 27, abbreviation: "Lev" },
  { name: "Numbers", testament: "Old", chapters: 36, abbreviation: "Num" },
  { name: "Deuteronomy", testament: "Old", chapters: 34, abbreviation: "Deu" },
  { name: "Joshua", testament: "Old", chapters: 24, abbreviation: "Jos" },
  { name: "Judges", testament: "Old", chapters: 21, abbreviation: "Jdg" },
  { name: "Ruth", testament: "Old", chapters: 4, abbreviation: "Rut" },
  { name: "1 Samuel", testament: "Old", chapters: 31, abbreviation: "1Sa" },
  { name: "2 Samuel", testament: "Old", chapters: 24, abbreviation: "2Sa" },
  { name: "1 Kings", testament: "Old", chapters: 22, abbreviation: "1Ki" },
  { name: "2 Kings", testament: "Old", chapters: 25, abbreviation: "2Ki" },
  { name: "1 Chronicles", testament: "Old", chapters: 29, abbreviation: "1Ch" },
  { name: "2 Chronicles", testament: "Old", chapters: 36, abbreviation: "2Ch" },
  { name: "Ezra", testament: "Old", chapters: 10, abbreviation: "Ezr" },
  { name: "Nehemiah", testament: "Old", chapters: 13, abbreviation: "Neh" },
  { name: "Esther", testament: "Old", chapters: 10, abbreviation: "Est" },
  { name: "Job", testament: "Old", chapters: 42, abbreviation: "Job" },
  { name: "Psalms", testament: "Old", chapters: 150, abbreviation: "Psa" },
  { name: "Proverbs", testament: "Old", chapters: 31, abbreviation: "Pro" },
  { name: "Ecclesiastes", testament: "Old", chapters: 12, abbreviation: "Ecc" },
  { name: "Song of Solomon", testament: "Old", chapters: 8, abbreviation: "Son" },
  { name: "Isaiah", testament: "Old", chapters: 66, abbreviation: "Isa" },
  { name: "Jeremiah", testament: "Old", chapters: 52, abbreviation: "Jer" },
  { name: "Lamentations", testament: "Old", chapters: 5, abbreviation: "Lam" },
  { name: "Ezekiel", testament: "Old", chapters: 48, abbreviation: "Eze" },
  { name: "Daniel", testament: "Old", chapters: 12, abbreviation: "Dan" },
  { name: "Hosea", testament: "Old", chapters: 14, abbreviation: "Hos" },
  { name: "Joel", testament: "Old", chapters: 3, abbreviation: "Joe" },
  { name: "Amos", testament: "Old", chapters: 9, abbreviation: "Amo" },
  { name: "Obadiah", testament: "Old", chapters: 1, abbreviation: "Oba" },
  { name: "Jonah", testament: "Old", chapters: 4, abbreviation: "Jon" },
  { name: "Micah", testament: "Old", chapters: 7, abbreviation: "Mic" },
  { name: "Nahum", testament: "Old", chapters: 3, abbreviation: "Nah" },
  { name: "Habakkuk", testament: "Old", chapters: 3, abbreviation: "Hab" },
  { name: "Zephaniah", testament: "Old", chapters: 3, abbreviation: "Zep" },
  { name: "Haggai", testament: "Old", chapters: 2, abbreviation: "Hag" },
  { name: "Zechariah", testament: "Old", chapters: 14, abbreviation: "Zec" },
  { name: "Malachi", testament: "Old", chapters: 4, abbreviation: "Mal" },
  // New Testament
  { name: "Matthew", testament: "New", chapters: 28, abbreviation: "Mat" },
  { name: "Mark", testament: "New", chapters: 16, abbreviation: "Mar" },
  { name: "Luke", testament: "New", chapters: 24, abbreviation: "Luk" },
  { name: "John", testament: "New", chapters: 21, abbreviation: "Joh" },
  { name: "Acts", testament: "New", chapters: 28, abbreviation: "Act" },
  { name: "Romans", testament: "New", chapters: 16, abbreviation: "Rom" },
  { name: "1 Corinthians", testament: "New", chapters: 16, abbreviation: "1Co" },
  { name: "2 Corinthians", testament: "New", chapters: 13, abbreviation: "2Co" },
  { name: "Galatians", testament: "New", chapters: 6, abbreviation: "Gal" },
  { name: "Ephesians", testament: "New", chapters: 6, abbreviation: "Eph" },
  { name: "Philippians", testament: "New", chapters: 4, abbreviation: "Phi" },
  { name: "Colossians", testament: "New", chapters: 4, abbreviation: "Col" },
  { name: "1 Thessalonians", testament: "New", chapters: 5, abbreviation: "1Th" },
  { name: "2 Thessalonians", testament: "New", chapters: 3, abbreviation: "2Th" },
  { name: "1 Timothy", testament: "New", chapters: 6, abbreviation: "1Ti" },
  { name: "2 Timothy", testament: "New", chapters: 4, abbreviation: "2Ti" },
  { name: "Titus", testament: "New", chapters: 3, abbreviation: "Tit" },
  { name: "Philemon", testament: "New", chapters: 1, abbreviation: "Phm" },
  { name: "Hebrews", testament: "New", chapters: 13, abbreviation: "Heb" },
  { name: "James", testament: "New", chapters: 5, abbreviation: "Jam" },
  { name: "1 Peter", testament: "New", chapters: 5, abbreviation: "1Pe" },
  { name: "2 Peter", testament: "New", chapters: 3, abbreviation: "2Pe" },
  { name: "1 John", testament: "New", chapters: 5, abbreviation: "1Jo" },
  { name: "2 John", testament: "New", chapters: 1, abbreviation: "2Jo" },
  { name: "3 John", testament: "New", chapters: 1, abbreviation: "3Jo" },
  { name: "Jude", testament: "New", chapters: 1, abbreviation: "Jud" },
  { name: "Revelation", testament: "New", chapters: 22, abbreviation: "Rev" },
];

/**
 * Get a book by name (case-insensitive)
 */
function getBookByName(name: string): BibleBook | undefined {
  return KJV_BOOKS.find(book => 
    book.name.toLowerCase() === name.toLowerCase() ||
    book.abbreviation?.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Validate if a chapter number is valid for a given book
 */
function isValidChapter(bookName: string, chapter: number): boolean {
  const book = getBookByName(bookName);
  if (!book) return false;
  return chapter >= 1 && chapter <= book.chapters;
}

/**
 * Get the next book and chapter (for navigation)
 */
function getNextReference(bookName: string, chapter: number): { book: string; chapter: number } | null {
  const bookIndex = KJV_BOOKS.findIndex(b => b.name === bookName);
  if (bookIndex === -1) return null;
  
  const book = KJV_BOOKS[bookIndex];
  if (chapter < book.chapters) {
    return { book: bookName, chapter: chapter + 1 };
  } else if (bookIndex < KJV_BOOKS.length - 1) {
    return { book: KJV_BOOKS[bookIndex + 1].name, chapter: 1 };
  }
  return null; // End of Bible
}

/**
 * Get the previous book and chapter (for navigation)
 */
function getPreviousReference(bookName: string, chapter: number): { book: string; chapter: number } | null {
  const bookIndex = KJV_BOOKS.findIndex(b => b.name === bookName);
  if (bookIndex === -1) return null;
  
  if (chapter > 1) {
    return { book: bookName, chapter: chapter - 1 };
  } else if (bookIndex > 0) {
    const prevBook = KJV_BOOKS[bookIndex - 1];
    return { book: prevBook.name, chapter: prevBook.chapters };
  }
  return null; // Start of Bible
}

export { 
  KJV_BOOKS, 
  getBookByName, 
  isValidChapter,
  getNextReference,
  getPreviousReference,
  type BibleBook, 
  type BibleVerse,
  type BibleChapter
};
