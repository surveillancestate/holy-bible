# KJV Bible App

A modern, lightweight Bible reader application built with pure TypeScript, Bun, and Web Components. Features the King James Version (KJV) of the Bible, which is in the public domain.

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript/TypeScript runtime
- **Language**: Pure TypeScript (no frameworks)
- **UI**: Web Components (Custom Elements + Shadow DOM)
- **Styling**: Vanilla CSS with CSS Custom Properties
- **Authentication**: Custom OAuth solution (Google & GitHub)

## Project Structure

```
/workspace
├── public/                 # Static files
│   └── index.html         # Main HTML file
├── src/
│   ├── auth/              # Authentication module
│   │   └── auth-service.ts
│   ├── components/        # Web Components
│   │   ├── base-component.ts
│   │   ├── bible-reader.ts
│   │   └── login-button.ts
│   ├── data/              # Bible data
│   │   └── kjv-books.ts
│   ├── styles/            # Global styles
│   │   └── main.css
│   └── server.ts          # Bun server
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your system

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables (optional, for OAuth):
   ```bash
   cp .env.example .env
   # Edit .env with your OAuth credentials
   ```

### Development

Run the development server with hot reload:

```bash
bun run dev
```

The app will be available at `http://localhost:3000`

### Production

Build and run for production:

```bash
bun run build
bun run start
```

## Features

- 📖 All 66 books of the KJV Bible
- 🔍 Easy navigation between books and chapters
- 🔐 OAuth authentication (Google & GitHub)
- 📱 Responsive design for mobile devices
- ⚡ Fast loading with Bun runtime
- 🎨 Clean, modern UI with Web Components

## OAuth Setup

To enable OAuth sign-in:

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/callback`
6. Set `GOOGLE_CLIENT_ID` in your `.env` file

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/auth/callback`
4. Copy Client ID and Client Secret
5. Set `GITHUB_CLIENT_ID` in your `.env` file

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## API Endpoints

- `GET /` - Serve main HTML page
- `GET /api/bible/:book/:chapter` - Get Bible chapter text
- `POST /api/auth/callback` - Handle OAuth callback
- `GET /api/user/me` - Get current authenticated user

## Browser Support

Modern browsers with Web Components support:
- Chrome 67+
- Firefox 63+
- Safari 11+
- Edge 79+

## License

The King James Version (KJV) Bible text is in the **public domain**.

This application code is provided as-is for educational and personal use.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using pure TypeScript, Bun, and Web Components
