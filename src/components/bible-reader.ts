// Bible Reader Web Component
import { BaseComponent } from './base-component.js';
import type { BibleBook } from '../data/kjv-books.js';

interface BibleReaderProps {
  book?: string;
  chapter?: number;
}

class BibleReaderComponent extends BaseComponent {
  private currentBook: string = 'Genesis';
  private currentChapter: number = 1;
  private books: BibleBook[] = [];

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return ['book', 'chapter'];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'book' && newValue) {
      this.currentBook = newValue;
    }
    if (name === 'chapter' && newValue) {
      this.currentChapter = parseInt(newValue, 10);
    }
    if (this._connected) {
      this.render();
    }
  }

  protected async onConnect(): Promise<void> {
    // Load books data
    try {
      const { KJV_BOOKS } = await import('../data/kjv-books.js');
      this.books = KJV_BOOKS;
    } catch (error) {
      console.error('Failed to load Bible books:', error);
    }
  }

  protected render(): void {
    const styles = `
      <style>
        :host {
          display: block;
          font-family: Georgia, serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #333;
        }

        .nav-controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        select, button {
          padding: 8px 12px;
          font-size: 14px;
          border: 1px solid #ccc;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }

        button:hover {
          background: #f0f0f0;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .reference {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }

        .verses {
          line-height: 1.8;
          font-size: 16px;
        }

        .verse {
          margin-bottom: 8px;
        }

        .verse-number {
          font-weight: bold;
          color: #666;
          font-size: 12px;
          vertical-align: super;
          margin-right: 4px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: #666;
        }
      </style>
    `;

    this.shadow.innerHTML = `
      ${styles}
      <div class="header">
        <div class="nav-controls">
          <select id="book-select">
            ${this.books.map(book => 
              `<option value="${book.name}" ${book.name === this.currentBook ? 'selected' : ''}>${book.name}</option>`
            ).join('')}
          </select>
          <button id="prev-chapter" ${this.currentChapter <= 1 ? 'disabled' : ''}>← Prev</button>
          <span class="reference">${this.currentBook} ${this.currentChapter}</span>
          <button id="next-chapter">Next →</button>
        </div>
      </div>
      <div class="content">
        <div class="loading">Loading chapter...</div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const bookSelect = this.querySelector('#book-select') as HTMLSelectElement;
    const prevBtn = this.querySelector('#prev-chapter') as HTMLButtonElement;
    const nextBtn = this.querySelector('#next-chapter') as HTMLButtonElement;

    if (bookSelect) {
      bookSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.navigateTo(target.value, 1);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentChapter > 1) {
          this.navigateTo(this.currentBook, this.currentChapter - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.navigateTo(this.currentBook, this.currentChapter + 1);
      });
    }
  }

  private navigateTo(book: string, chapter: number): void {
    this.currentBook = book;
    this.currentChapter = chapter;
    this.setAttribute('book', book);
    this.setAttribute('chapter', chapter.toString());
    this.render();
    // TODO: Load and display verses
  }
}

customElements.define('bible-reader', BibleReaderComponent);

export { BibleReaderComponent };
