/**
 * KJV Bible API Server with Bun
 * 
 * A lightweight, modern Bible reading application built with:
 * - Bun runtime for fast performance
 * - Web Components for modular UI
 * - TypeScript for type safety
 * - King James Version (public domain)
 * 
 * @module server
 */

import { serve } from 'bun';
import { KJV_BOOKS, getBookByName, isValidChapter } from './data/kjv-books.js';

// ============================================================================
// Type Definitions
// ============================================================================

interface OAuthCallbackRequest {
  code: string;
  state: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'github' | 'apple' | 'local';
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

// ============================================================================
// Mock Database (Replace with real DB in production)
// ============================================================================

const users = new Map<string, User>();
const tokens = new Map<string, string>();

// Simple KJV Bible text data (sample - expand as needed)
const BIBLE_TEXT: Record<string, Record<number, string[]>> = {
  'Genesis': {
    1: [
      'In the beginning God created the heaven and the earth.',
      'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.',
      'And God said, Let there be light: and there was light.',
      'And God saw the light, that it was good: and God divided the light from the darkness.',
      'And God called the light Day, and the darkness he called Night. And the evening and the morning were the first day.',
      'And God said, Let there be a firmament in the midst of the waters, and let it divide the waters from the waters.',
      'And God made the firmament, and divided the waters which were under the firmament from the waters which were above the firmament: and it was so.',
      'And God called the firmament Heaven. And the evening and the morning were the second day.',
      'And God said, Let the waters under the heaven be gathered together unto one place, and let the dry land appear: and it was so.',
      'And God called the dry land Earth; and the gathering together of the waters called he Seas: and God saw that it was good.',
      'And God said, Let the earth bring forth grass, the herb yielding seed, and the fruit tree yielding fruit after his kind, whose seed is in itself, upon the earth: and it was so.',
      'And the earth brought forth grass, and herb yielding seed after his kind, and the tree yielding fruit, whose seed was in itself, after his kind: and God saw that it was good.',
      'And the evening and the morning were the third day.',
      'And God said, Let there be lights in the firmament of the heaven to divide the day from the night; and let them be for signs, and for seasons, and for days, and years:',
      'And let them be for lights in the firmament of the heaven to give light upon the earth: and it was so.',
      'And God made two great lights; the greater light to rule the day, and the lesser light to rule the night: he made the stars also.',
      'And God set them in the firmament of the heaven to give light upon the earth,',
      'And to rule over the day and over the night, and to divide the light from the darkness: and God saw that it was good.',
      'And the evening and the morning were the fourth day.',
      'And God said, Let the waters bring forth abundantly the moving creature that hath life, and fowl that may fly above the earth in the open firmament of heaven.',
      'And God created great whales, and every living creature that moveth, which the waters brought forth abundantly, after their kind, and every winged fowl after his kind: and God saw that it was good.',
      'And God blessed them, saying, Be fruitful, and multiply, and fill the waters in the seas, and let fowl multiply in the earth.',
      'And the evening and the morning were the fifth day.',
      'And God said, Let the earth bring forth the living creature after his kind, cattle, and creeping thing, and beast of the earth after his kind: and it was so.',
      'And God made the beast of the earth after his kind, and cattle after their kind, and every thing that creepeth upon the earth after his kind: and God saw that it was good.',
      'And God said, Let us make man in our image, after our likeness: and let them have dominion over the fish of the sea, and over the fowl of the air, and over the cattle, and over all the earth, and over every creeping thing that creepeth upon the earth.',
      'So God created man in his own image, in the image of God created he him; male and female created he them.',
      'And God blessed them, and God said unto them, Be fruitful, and multiply, and replenish the earth, and subdue it: and have dominion over the fish of the sea, and over the fowl of the air, and over every living thing that moveth upon the earth.',
      'And God said, Behold, I have given you every herb bearing seed, which is upon the face of all the earth, and every tree, in the which is the fruit of a tree yielding seed; to you it shall be for meat.',
      'And to every beast of the earth, and to every fowl of the air, and to every thing that creepeth upon the earth, wherein there is life, I have given every green herb for meat: and it was so.',
      'And God saw every thing that he had made, and, behold, it was very good. And the evening and the morning were the sixth day.'
    ],
    2: [
      'Thus the heavens and the earth were finished, and all the host of them.',
      'And on the seventh day God ended his work which he had made; and he rested on the seventh day from all his work which he had made.',
      'And God blessed the seventh day, and sanctified it: because that in it he had rested from all his work which God created and made.',
      'These are the generations of the heavens and of the earth when they were created, in the day that the LORD God made the earth and the heavens,',
      'And every plant of the field before it was in the earth, and every herb of the field before it grew: for the LORD God had not caused it to rain upon the earth, and there was not a man to till the ground.',
      'But there went up a mist from the earth, and watered the whole face of the ground.',
      'And the LORD God formed man of the dust of the ground, and breathed into his nostrils the breath of life; and man became a living soul.',
      'And the LORD God planted a garden eastward in Eden; and there he put the man whom he had formed.',
      'And out of the ground made the LORD God to grow every tree that is pleasant to the sight, and good for food; the tree of life also in the midst of the garden, and the tree of knowledge of good and evil.',
      'And a river went out of Eden to water the garden; and from thence it was parted, and became into four heads.',
      'The name of the first is Pison: that is it which compasseth the whole land of Havilah, where there is gold;',
      'And the gold of that land is good: there is bdellium and the onyx stone.',
      'And the name of the second river is Gihon: the same is it that compasseth the whole land of Ethiopia.',
      'And the name of the third river is Hiddekel: that is it which goeth toward the east of Assyria. And the fourth river is Euphrates.',
      'And the LORD God took the man, and put him into the garden of Eden to dress it and to keep it.',
      'And the LORD God commanded the man, saying, Of every tree of the garden thou mayest freely eat:',
      'But of the tree of the knowledge of good and evil, thou shalt not eat of it: for in the day that thou eatest thereof thou shalt surely die.',
      'And the LORD God said, It is not good that the man should be alone; I will make him an help meet for him.',
      'And out of the ground the LORD God formed every beast of the field, and every fowl of the air; and brought them unto Adam to see what he would call them: and whatsoever Adam called every living creature, that was the name thereof.',
      'And Adam gave names to all cattle, and to the fowl of the air, and to every beast of the field; but for Adam there was not found an help meet for him.',
      'And the LORD God caused a deep sleep to fall upon Adam, and he slept: and he took one of his ribs, and closed up the flesh instead thereof;',
      'And the rib, which the LORD God had taken from man, made he a woman, and brought her unto the man.',
      'And Adam said, This is now bone of my bones, and flesh of my flesh: she shall be called Woman, because she was taken out of Man.',
      'Therefore shall a man leave his father and his mother, and shall cleave unto his wife: and they shall be one flesh.',
      'And they were both naked, the man and his wife, and were not ashamed.'
    ]
  },
  'John': {
    1: [
      'In the beginning was the Word, and the Word was with God, and the Word was God.',
      'The same was in the beginning with God.',
      'All things were made by him; and without him was not any thing made that was made.',
      'In him was life; and the life was the light of men.',
      'And the light shineth in darkness; and the darkness comprehended it not.',
      'There was a man sent from God, whose name was John.',
      'The same came for a witness, to bear witness of the Light, that all men through him might believe.',
      'He was not that Light, but was sent to bear witness of that Light.',
      'That was the true Light, which lighteth every man that cometh into the world.',
      'He was in the world, and the world was made by him, and the world knew him not.',
      'He came unto his own, and his own received him not.',
      'But as many as received him, to them gave he power to become the sons of God, even to them that believe on his name:',
      'Which were born, not of blood, nor of the will of the flesh, nor of the will of man, but of God.',
      'And the Word was made flesh, and dwelt among us, (and we beheld his glory, the glory as of the only begotten of the Father,) full of grace and truth.',
      'John bare witness of him, and cried, saying, This was he of whom I spake, He that cometh after me is preferred before me: for he was before me.',
      'And of his fulness have all we received, and grace for grace.',
      'For the law was given by Moses, but grace and truth came by Jesus Christ.',
      'No man hath seen God at any time, the only begotten Son, which is in the bosom of the Father, he hath declared him.',
      'And this is the record of John, when the Jews sent priests and Levites from Jerusalem to ask him, Who art thou?',
      'And he confessed, and denied not; but confessed, I am not the Christ.',
      'And they asked him, What then? Art thou Elias? And he saith, I am not. Art thou that prophet? And he answered, No.',
      'Then said they unto him, Who art thou? that we may give an answer to them that sent us. What sayest thou of thyself?',
      'He said, I am the voice of one crying in the wilderness, Make straight the way of the Lord, as said the prophet Esaias.',
      'And they which were sent were of the Pharisees.',
      'And they asked him, and said unto him, Why baptizest thou then, if thou be not that Christ, nor Elias, neither that prophet?',
      'John answered them, saying, I baptize with water: but there standeth one among you, whom ye know not;',
      'He it is, who coming after me is preferred before me, whose shoe\'s latchet I am not worthy to unloose.',
      'These things were done in Bethabara beyond Jordan, where John was baptizing.',
      'The next day John seeth Jesus coming unto him, and saith, Behold the Lamb of God, which taketh away the sin of the world.',
      'This is he of whom I said, After me cometh a man which is preferred before me: for he was before me.',
      'And I knew him not: but that he should be made manifest to Israel, therefore am I come baptizing with water.',
      'And John bare record, saying, I saw the Spirit descending from heaven like a dove, and it abode upon him.',
      'And I knew him not: but he that sent me to baptize with water, the same said unto me, Upon whom thou shalt see the Spirit descending, and remaining on him, the same is he which baptizeth with the Holy Ghost.',
      'And I saw, and bare record that this is the Son of God.',
      'Again the next day after John stood, and two of his disciples;',
      'And looking upon Jesus as he walked, he saith, Behold the Lamb of God!',
      'And the two disciples heard him speak, and they followed Jesus.',
      'Then Jesus turned, and saw them following, and saith unto them, What seek ye? They said unto him, Rabbi, (which is to say, being interpreted, Master,) where dwellest thou?',
      'He saith unto them, Come and see. They came and saw where he dwelt, and abode with him that day: for it was about the tenth hour.',
      'One of the two which heard John speak, and followed him, was Andrew, Simon Peter\'s brother.',
      'He first findeth his own brother Simon, and saith unto him, We have found the Messias, which is, being interpreted, the Christ.',
      'And he brought him to Jesus. And when Jesus beheld him, he said, Thou art Simon the son of Jona: thou shalt be called Cephas, which is by interpretation, A stone.',
      'The day following Jesus would go forth into Galilee, and findeth Philip, and saith unto him, Follow me.',
      'Now Philip was of Bethsaida, the city of Andrew and Peter.',
      'Philip findeth Nathanael, and saith unto him, We have found him, of whom Moses in the law, and the prophets, did write, Jesus of Nazareth, the son of Joseph.',
      'And Nathanael said unto him, Can there any good thing come out of Nazareth? Philip saith unto him, Come and see.',
      'Jesus saw Nathanael coming to him, and saith of him, Behold an Israelite indeed, in whom is no guile!',
      'Nathanael saith unto him, Whence knowest thou me? Jesus answered and said unto him, Before that Philip called thee, when thou wast under the fig tree, I saw thee.',
      'Nathanael answered and saith unto him, Rabbi, thou art the Son of God; thou art the King of Israel.',
      'Jesus answered and said unto him, Because I said unto thee, I saw thee under the fig tree, believest thou? thou shalt see greater things than these.',
      'And he saith unto him, Verily, verily, I say unto you, Hereafter ye shall see heaven open, and the angels of God ascending and descending upon the Son of man.'
    ]
  }
};

/**
 * Generate a simple JWT-like token
 * 
 * ⚠️ SECURITY WARNING: This is a mock implementation for development only.
 * In production, use a proper JWT library (e.g., jsonwebtoken) with secure
 * signing algorithms and secret management.
 * 
 * @param userId - The user ID to encode in the token
 * @returns A base64-encoded token string
 */
function generateToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({ userId, iat: Date.now() })).toString('base64');
  const signature = Buffer.from(`${header}.${payload}.secret`).toString('base64');
  return `${header}.${payload}.${signature}`;
}

/**
 * Exchange OAuth code for user info
 * 
 * ⚠️ MOCK IMPLEMENTATION: This is a placeholder for development.
 * In production, implement the full OAuth flow:
 * 1. Send the code to the provider's token endpoint
 * 2. Get the access token
 * 3. Use the access token to fetch user info from the provider's API
 * 
 * @param provider - The OAuth provider ('google' or 'github')
 * @param code - The authorization code from the provider
 * @returns A User object
 */
async function exchangeOAuthCode(provider: 'google' | 'github' | 'apple', code: string): Promise<User> {
  // Mock implementation - replace with real OAuth flow in production
  const mockUser: User = {
    id: `user_${Date.now()}`,
    email: `user@example.com`,
    name: provider === 'google' ? 'Google User' : provider === 'github' ? 'GitHub User' : 'Apple User',
    avatar: undefined,
    provider: provider,
  };

  // TODO: Implement real OAuth token exchange
  if (provider === 'google') {
    // const response = await fetch('https://oauth2.googleapis.com/token', { ... });
    // const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { ... });
  } else if (provider === 'github') {
    // const response = await fetch('https://github.com/login/oauth/access_token', { ... });
    // const userInfo = await fetch('https://api.github.com/user', { ... });
  } else if (provider === 'apple') {
    // Apple requires JWT verification and POST request to token endpoint
    // const jwt = generateAppleJWT(); // Generate JWT with private key
    // const response = await fetch('https://appleid.apple.com/auth/token', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    //   body: new URLSearchParams({
    //     client_id: APPLE_CLIENT_ID,
    //     client_secret: jwt,
    //     code: code,
    //     grant_type: 'authorization_code',
    //     redirect_uri: APPLE_CALLBACK_URL,
    //   }),
    // });
    // const userInfo = await fetch('https://appleid.apple.com/auth/userinfo', { ... });
  }

  return mockUser;
}

/**
 * Get Bible chapter from data store
 * 
 * @param bookName - The name of the Bible book
 * @param chapter - The chapter number
 * @returns BibleChapter object or null if not found
 */
function getBibleChapter(bookName: string, chapter: number): BibleChapter | null {
  const bookData = BIBLE_TEXT[bookName];
  if (!bookData) {
    return null;
  }
  
  const verses = bookData[chapter];
  if (!verses) {
    return null;
  }
  
  return {
    book: bookName,
    chapter,
    verses: verses.map((text, index) => ({
      book: bookName,
      chapter,
      verse: index + 1,
      text
    }))
  };
}

/**
 * Start the Bun HTTP server
 * 
 * Configures routes for:
 * - Static file serving (HTML, CSS, TS/JS)
 * - API endpoints (/api/*)
 * - CORS support
 * - SPA routing fallback
 */
const server = serve({
  port: Bun.env.PORT || 3000,
  
  /**
   * Main request handler
   */
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve static files from public directory
    if (path === '/' || path === '/index.html') {
      try {
        const file = Bun.file('./public/index.html');
        return new Response(file, {
          headers: { 'Content-Type': 'text/html' },
        });
      } catch {
        return new Response('Not found', { status: 404 });
      }
    }

    // Serve CSS files
    if (path.startsWith('/src/styles/')) {
      try {
        const file = Bun.file(`.${path}`);
        return new Response(file, {
          headers: { 'Content-Type': 'text/css' },
        });
      } catch {
        return new Response('Not found', { status: 404 });
      }
    }

    // Serve TypeScript/JavaScript files (serve .ts directly, Bun handles transpilation)
    if (path.startsWith('/src/components/') || path.startsWith('/src/data/') || path.startsWith('/src/auth/')) {
      try {
        const file = Bun.file(`.${path}`);
        return new Response(file, {
          headers: { 'Content-Type': 'application/javascript' },
        });
      } catch {
        return new Response('Not found', { status: 404 });
      }
    }

    // API Routes
    if (path.startsWith('/api/')) {
      return handleApiRequest(req, path, corsHeaders);
    }

    // Default: serve index.html for SPA routing
    try {
      const file = Bun.file('./public/index.html');
      return new Response(file, {
        headers: { 'Content-Type': 'text/html' },
      });
    } catch {
      return new Response('Not found', { status: 404 });
    }
  },
});

/**
 * Handle API requests
 * 
 * Routes:
 * - POST /api/auth/callback - OAuth callback handler
 * - GET  /api/user/me - Get current user
 * - GET  /api/bible/:book/:chapter - Get Bible chapter
 */
async function handleApiRequest(req: Request, path: string, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    // POST /api/auth/callback - Handle OAuth callback
    if (path === '/api/auth/callback' && req.method === 'POST') {
      const body: OAuthCallbackRequest & { provider?: string } = await req.json();
      const { code, state, provider: providerFromBody } = body;

      // Validate state (prevent CSRF)
      // In production, verify state matches what was sent in the OAuth request

      // Determine provider from request body or default to google
      const provider: 'google' | 'github' | 'apple' = (providerFromBody as 'google' | 'github' | 'apple') || 'google';

      // Exchange code for user info
      const user = await exchangeOAuthCode(provider, code);

      // Store user and generate token
      users.set(user.id, user);
      const token = generateToken(user.id);
      tokens.set(token, user.id);

      return Response.json({ user, token }, { headers: corsHeaders });
    }

    // GET /api/user/me - Get current user
    if (path === '/api/user/me' && req.method === 'GET') {
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
      }

      const token = authHeader.split(' ')[1];
      const userId = tokens.get(token);

      if (!userId) {
        return Response.json({ error: 'Invalid token' }, { status: 401, headers: corsHeaders });
      }

      const user = users.get(userId);
      if (!user) {
        return Response.json({ error: 'User not found' }, { status: 404, headers: corsHeaders });
      }

      return Response.json({ user }, { headers: corsHeaders });
    }

    // GET /api/bible/:book/:chapter - Get Bible chapter
    if (path.match(/^\/api\/bible\/[^/]+\/\d+$/) && req.method === 'GET') {
      const parts = path.split('/');
      const book = decodeURIComponent(parts[3]);
      const chapter = parseInt(parts[4], 10);

      // Validate book and chapter
      if (!isValidChapter(book, chapter)) {
        return Response.json(
          { error: 'Invalid book or chapter' }, 
          { status: 404, headers: corsHeaders }
        );
      }

      // Get chapter from data store
      const chapterData = getBibleChapter(book, chapter);
      
      if (!chapterData) {
        return Response.json(
          { error: 'Chapter not available' }, 
          { status: 404, headers: corsHeaders }
        );
      }

      return Response.json(chapterData, { headers: corsHeaders });
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Start the server
console.log(`📖 KJV Bible server running at http://localhost:${server.port}`);
