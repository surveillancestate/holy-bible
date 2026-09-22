// Table of Contents Web Component for KJV Bible
import { BaseComponent } from './base-component.js';
import type { BibleBook } from '../data/kjv-books.js';
import { KJV_BOOKS } from '../data/kjv-books.js';

class TableOfContentsComponent extends BaseComponent {
  private books: BibleBook[] = [];
  private darkMode: boolean = false;

  constructor() {
    super();
    this.loadSettings();
  }

  private loadSettings(): void {
    const savedDarkMode = localStorage.getItem('bible-dark-mode');
    if (savedDarkMode === 'true') {
      this.darkMode = true;
    }
  }

  protected async onConnect(): Promise<void> {
    this.books = KJV_BOOKS;
    this.render();
  }

  protected render(): void {
    const darkBg = this.darkMode ? '#1a202c' : '#ffffff';
    const darkText = this.darkMode ? '#e2e8f0' : '#1a202c';
    const darkBorder = this.darkMode ? '#4a5568' : '#e2e8f0';
    const darkHover = this.darkMode ? '#2d3748' : '#f7fafc';
    const oldTestamentAccent = this.darkMode ? '#d69e2e' : '#fef3c7';
    const newTestamentAccent = this.darkMode ? '#63b3ed' : '#dbeafe';

    const styles = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background: ${darkBg};
          color: ${darkText};
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .toc-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 2px solid ${darkBorder};
        }

        .toc-header h2 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: ${darkText};
        }

        .toc-header p {
          font-size: 15px;
          color: ${this.darkMode ? '#a0aec0' : '#718096'};
          margin: 0;
        }

        .testament-section {
          margin-bottom: 40px;
        }

        .testament-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding: 12px 16px;
          border-radius: 8px;
          background: ${this.darkMode ? '#2d3748' : '#f7fafc'};
        }

        .testament-badge {
          display: inline-block;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-radius: 16px;
        }

        .testament-badge.old {
          background: ${oldTestamentAccent};
          color: ${this.darkMode ? '#744210' : '#92400e'};
        }

        .testament-badge.new {
          background: ${newTestamentAccent};
          color: ${this.darkMode ? '#1a365d' : '#1e40af'};
        }

        .testament-title {
          font-size: 20px;
          font-weight: 600;
          color: ${darkText};
          margin: 0;
        }

        .book-count {
          font-size: 13px;
          color: ${this.darkMode ? '#a0aec0' : '#718096'};
          margin-left: auto;
        }

        .books-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }

        .book-card {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          background: ${darkBg};
          border: 1px solid ${darkBorder};
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          color: ${darkText};
        }

        .book-card:hover {
          background: ${darkHover};
          border-color: ${this.darkMode ? '#718096' : '#a0aec0'};
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .book-card:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }

        .book-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: ${this.darkMode ? '#4a5568' : '#e2e8f0'};
          color: ${this.darkMode ? '#a0aec0' : '#718096'};
          font-size: 13px;
          font-weight: 600;
          margin-right: 12px;
          flex-shrink: 0;
        }

        .book-info {
          flex: 1;
          min-width: 0;
        }

        .book-name {
          font-size: 15px;
          font-weight: 600;
          color: ${darkText};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0 0 4px 0;
        }

        .book-chapters {
          font-size: 12px;
          color: ${this.darkMode ? '#a0aec0' : '#718096'};
          margin: 0;
        }

        .quick-nav {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .quick-nav-btn {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          background: ${this.darkMode ? '#4a5568' : '#e2e8f0'};
          color: ${darkText};
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quick-nav-btn:hover {
          background: ${this.darkMode ? '#718096' : '#cbd5e0'};
          transform: translateY(-1px);
        }

        .quick-nav-btn.primary {
          background: #4299e1;
          color: white;
        }

        .quick-nav-btn.primary:hover {
          background: #3182ce;
        }

        /* Search box */
        .search-container {
          max-width: 500px;
          margin: 0 auto 32px auto;
          position: relative;
        }

        .search-input {
          width: 100%;
          padding: 14px 20px 14px 44px;
          font-size: 16px;
          font-family: inherit;
          background: ${darkBg};
          color: ${darkText};
          border: 2px solid ${darkBorder};
          border-radius: 12px;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .search-input:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          color: ${this.darkMode ? '#a0aec0' : '#718096'};
          pointer-events: none;
        }

        .no-results {
          text-align: center;
          padding: 40px 20px;
          color: ${this.darkMode ? '#a0aec0' : '#718096'};
          font-size: 16px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          :host {
            padding: 16px;
          }

          .toc-header h2 {
            font-size: 24px;
          }

          .books-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 10px;
          }

          .book-card {
            padding: 12px 14px;
          }

          .book-number {
            width: 28px;
            height: 28px;
            font-size: 12px;
          }

          .book-name {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .books-grid {
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          }

          .testament-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .book-count {
            margin-left: 0;
          }
        }
      </style>
    `;

    const oldTestamentBooks = this.books.filter(b => b.testament === 'Old');
    const newTestamentBooks = this.books.filter(b => b.testament === 'New');

    this.shadow.innerHTML = `
      ${styles}
      
      <div class="toc-header">
        <h2>📖 Table of Contents</h2>
        <p>Navigate through all 66 books of the Bible</p>
      </div>

      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          class="search-input" 
          id="book-search" 
          placeholder="Search for a book..." 
          aria-label="Search for a Bible book"
        />
      </div>

      <div class="quick-nav">
        <button class="quick-nav-btn primary" id="genesis-btn">📖 Start Reading (Genesis)</button>
        <button class="quick-nav-btn" id="old-testament-btn">Old Testament</button>
        <button class="quick-nav-btn" id="new-testament-btn">New Testament</button>
      </div>

      <section class="testament-section" id="old-testament">
        <div class="testament-header">
          <span class="testament-badge old">Old Testament</span>
          <h3 class="testament-title">Hebrew Scriptures</h3>
          <span class="book-count">${oldTestamentBooks.length} books</span>
        </div>
        <div class="books-grid" id="old-testament-grid">
          ${oldTestamentBooks.map((book, index) => this.renderBookCard(book, index + 1)).join('')}
        </div>
      </section>

      <section class="testament-section" id="new-testament">
        <div class="testament-header">
          <span class="testament-badge new">New Testament</span>
          <h3 class="testament-title">Christian Scriptures</h3>
          <span class="book-count">${newTestamentBooks.length} books</span>
        </div>
        <div class="books-grid" id="new-testament-grid">
          ${newTestamentBooks.map((book, index) => this.renderBookCard(book, index + 1)).join('')}
        </div>
      </section>
    `;

    this.attachEventListeners();
  }

  private renderBookCard(book: BibleBook, number: number): string {
    return `
      <a href="/?book=${encodeURIComponent(book.name)}&chapter=1" class="book-card" data-book-name="${book.name.toLowerCase()}">
        <span class="book-number">${number}</span>
        <div class="book-info">
          <h4 class="book-name">${book.name}</h4>
          <p class="book-chapters">${book.chapters} chapter${book.chapters !== 1 ? 's' : ''}</p>
        </div>
      </a>
    `;
  }

  private attachEventListeners(): void {
    // Search functionality
    const searchInput = this.shadow.querySelector('#book-search') as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.filterBooks(target.value);
      });
    }

    // Quick navigation buttons
    const genesisBtn = this.shadow.querySelector('#genesis-btn') as HTMLButtonElement;
    if (genesisBtn) {
      genesisBtn.addEventListener('click', () => {
        window.location.href = '/?book=Genesis&chapter=1';
      });
    }

    const oldTestamentBtn = this.shadow.querySelector('#old-testament-btn') as HTMLButtonElement;
    if (oldTestamentBtn) {
      oldTestamentBtn.addEventListener('click', () => {
        document.getElementById('old-testament')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    const newTestamentBtn = this.shadow.querySelector('#new-testament-btn') as HTMLButtonElement;
    if (newTestamentBtn) {
      newTestamentBtn.addEventListener('click', () => {
        document.getElementById('new-testament')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  private filterBooks(searchTerm: string): void {
    const term = searchTerm.toLowerCase().trim();
    const allBookCards = this.shadow.querySelectorAll('.book-card');

    if (term === '') {
      allBookCards.forEach(card => {
        (card as HTMLElement).style.display = 'flex';
      });
      return;
    }

    let visibleCount = 0;
    allBookCards.forEach(card => {
      const bookName = card.getAttribute('data-book-name') || '';
      if (bookName.includes(term)) {
        (card as HTMLElement).style.display = 'flex';
        visibleCount++;
      } else {
        (card as HTMLElement).style.display = 'none';
      }
    });

    // Show/hide no results message
    let noResultsMsg = this.shadow.querySelector('.no-results');
    if (visibleCount === 0) {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('div');
        noResultsMsg.className = 'no-results';
        noResultsMsg.textContent = 'No books found matching your search.';
        this.shadow.appendChild(noResultsMsg);
      }
    } else if (noResultsMsg) {
      noResultsMsg.remove();
    }
  }
}

customElements.define('table-of-contents', TableOfContentsComponent);

export { TableOfContentsComponent };
