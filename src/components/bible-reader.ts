// Bible Reader Web Component
import { BaseComponent } from './base-component.js';
import type { BibleBook, BibleVerse, BibleChapter } from '../data/kjv-books.js';
import { KJV_BOOKS, getBookByName, isValidChapter, getNextReference, getPreviousReference } from '../data/kjv-books.js';

interface BibleReaderProps {
  book?: string;
  chapter?: number;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  data: BibleChapter | null;
}

class BibleReaderComponent extends BaseComponent {
  private currentBook: string = 'Genesis';
  private currentChapter: number = 1;
  private books: BibleBook[] = [];
  private state: LoadingState = {
    isLoading: false,
    error: null,
    data: null
  };
  private abortController: AbortController | null = null;

  constructor() {
    super();
  }

  static get observedAttributes(): string[] {
    return ['book', 'chapter'];
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (name === 'book' && newValue && newValue !== oldValue) {
      const book = getBookByName(newValue);
      if (book) {
        this.currentBook = book.name; // Use canonical name
      }
    }
    if (name === 'chapter' && newValue && newValue !== oldValue) {
      const chapter = parseInt(newValue, 10);
      if (!isNaN(chapter) && chapter > 0) {
        this.currentChapter = chapter;
      }
    }
    if (this._connected) {
      this.loadChapter();
    }
  }

  protected async onConnect(): Promise<void> {
    this.books = KJV_BOOKS;
    this.loadChapter();
  }

  disconnectedCallback(): void {
    this._connected = false;
    if (this.abortController) {
      this.abortController.abort();
    }
    super.disconnectedCallback?.();
  }

  private async loadChapter(): Promise<void> {
    // Cancel any pending request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    this.state = { isLoading: true, error: null, data: null };
    this.render();

    try {
      const response = await fetch(`/api/bible/${encodeURIComponent(this.currentBook)}/${this.currentChapter}`, {
        signal: this.abortController.signal
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Chapter not found`);
        }
        throw new Error(`Failed to load chapter: ${response.status}`);
      }

      const data: BibleChapter = await response.json();
      this.state = { isLoading: false, error: null, data };
      this.render();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      console.error('Failed to load chapter:', error);
      this.state = { 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load chapter',
        data: null 
      };
      this.render();
    }
  }

  protected render(): void {
    const styles = `
      <style>
        :host {
          display: block;
          font-family: Georgia, 'Times New Roman', serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
          flex-wrap: wrap;
          gap: 12px;
        }

        .nav-controls {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }

        .book-select-container {
          position: relative;
        }

        select, button {
          padding: 10px 14px;
          font-size: 15px;
          font-family: inherit;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        select:hover, button:hover:not(:disabled) {
          background: #f7fafc;
          border-color: #a0aec0;
        }

        select:focus, button:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }

        button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .reference {
          font-size: 22px;
          font-weight: 600;
          color: #2d3748;
          min-width: 200px;
          text-align: center;
        }

        .content {
          min-height: 200px;
        }

        .verses {
          line-height: 2;
          font-size: 17px;
          color: #1a202c;
        }

        .verse {
          margin-bottom: 12px;
          padding: 8px 0;
          transition: background-color 0.15s ease;
        }

        .verse:hover {
          background-color: #f7fafc;
          border-radius: 4px;
        }

        .verse-number {
          font-weight: 700;
          color: #718096;
          font-size: 13px;
          vertical-align: super;
          margin-right: 6px;
          user-select: none;
        }

        .verse-text {
          display: inline;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: #718096;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e2e8f0;
          border-top-color: #4299e1;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          color: #e53e3e;
          text-align: center;
        }

        .error-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .retry-btn {
          margin-top: 16px;
          background: #4299e1;
          color: white;
          border: none;
        }

        .retry-btn:hover {
          background: #3182ce;
        }

        .testament-badge {
          display: inline-block;
          padding: 3px 8px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-radius: 12px;
          margin-left: 8px;
        }

        .testament-badge.old {
          background: #fef3c7;
          color: #92400e;
        }

        .testament-badge.new {
          background: #dbeafe;
          color: #1e40af;
        }

        /* Keyboard navigation hint */
        .keyboard-hint {
          font-size: 12px;
          color: #a0aec0;
          margin-top: 8px;
          text-align: center;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          :host {
            padding: 12px;
          }

          .header {
            flex-direction: column;
            align-items: stretch;
          }

          .nav-controls {
            justify-content: center;
          }

          .reference {
            text-align: center;
            min-width: auto;
          }

          select, button {
            padding: 8px 12px;
            font-size: 14px;
          }

          .verses {
            font-size: 16px;
            line-height: 1.8;
          }
        }
      </style>
    `;

    const currentBookData = getBookByName(this.currentBook);
    const testamentClass = currentBookData?.testament === 'New' ? 'new' : 'old';
    const testamentLabel = currentBookData?.testament || '';

    this.shadow.innerHTML = `
      ${styles}
      <div class="header">
        <div class="nav-controls">
          <div class="book-select-container">
            <select id="book-select" aria-label="Select Bible book">
              <optgroup label="Old Testament">
                ${this.books.filter(b => b.testament === 'Old').map(book => 
                  `<option value="${book.name}" ${book.name === this.currentBook ? 'selected' : ''}>${book.name}</option>`
                ).join('')}
              </optgroup>
              <optgroup label="New Testament">
                ${this.books.filter(b => b.testament === 'New').map(book => 
                  `<option value="${book.name}" ${book.name === this.currentBook ? 'selected' : ''}>${book.name}</option>`
                ).join('')}
              </optgroup>
            </select>
          </div>
          <button id="prev-chapter" ${!this.canGoPrevious() ? 'disabled' : ''} aria-label="Previous chapter">
            ← Prev
          </button>
          <span class="reference">
            ${this.currentBook} ${this.currentChapter}
            <span class="testament-badge ${testamentClass}">${testamentLabel}</span>
          </span>
          <button id="next-chapter" ${!this.canGoNext() ? 'disabled' : ''} aria-label="Next chapter">
            Next →
          </button>
        </div>
      </div>
      <div class="content">
        ${this.renderContent()}
      </div>
      <p class="keyboard-hint">💡 Tip: Use Left/Right arrow keys to navigate chapters</p>
    `;

    this.attachEventListeners();
    this.setupKeyboardNavigation();
  }

  private renderContent(): string {
    if (this.state.isLoading) {
      return `
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading chapter...</p>
        </div>
      `;
    }

    if (this.state.error) {
      return `
        <div class="error">
          <div class="error-icon">⚠️</div>
          <p>${this.state.error}</p>
          <button class="retry-btn" id="retry-btn">Try Again</button>
        </div>
      `;
    }

    if (this.state.data && this.state.data.verses.length > 0) {
      return `
        <div class="verses">
          ${this.state.data.verses.map(v => `
            <div class="verse" data-verse="${v.verse}">
              <span class="verse-number">${v.verse}</span>
              <span class="verse-text">${this.escapeHtml(v.text)}</span>
            </div>
          `).join('')}
        </div>
      `;
    }

    return `
      <div class="loading">
        <p>No content available for this chapter.</p>
      </div>
    `;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private canGoPrevious(): boolean {
    return getPreviousReference(this.currentBook, this.currentChapter) !== null;
  }

  private canGoNext(): boolean {
    return getNextReference(this.currentBook, this.currentChapter) !== null;
  }

  private attachEventListeners(): void {
    const bookSelect = this.shadow.querySelector('#book-select') as HTMLSelectElement;
    const prevBtn = this.shadow.querySelector('#prev-chapter') as HTMLButtonElement;
    const nextBtn = this.shadow.querySelector('#next-chapter') as HTMLButtonElement;
    const retryBtn = this.shadow.querySelector('#retry-btn') as HTMLButtonElement;

    if (bookSelect) {
      bookSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.navigateTo(target.value, 1);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.canGoPrevious()) {
          const prev = getPreviousReference(this.currentBook, this.currentChapter);
          if (prev) {
            this.navigateTo(prev.book, prev.chapter);
          }
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.canGoNext()) {
          const next = getNextReference(this.currentBook, this.currentChapter);
          if (next) {
            this.navigateTo(next.book, next.chapter);
          }
        }
      });
    }

    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this.loadChapter();
      });
    }
  }

  private setupKeyboardNavigation(): void {
    this.shadow.host.addEventListener('keydown', (e: KeyboardEvent) => {
      // Don't interfere with typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (this.canGoPrevious()) {
            const prev = getPreviousReference(this.currentBook, this.currentChapter);
            if (prev) {
              this.navigateTo(prev.book, prev.chapter);
            }
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (this.canGoNext()) {
            const next = getNextReference(this.currentBook, this.currentChapter);
            if (next) {
              this.navigateTo(next.book, next.chapter);
            }
          }
          break;
      }
    });
  }

  private navigateTo(book: string, chapter: number): void {
    if (!isValidChapter(book, chapter)) {
      console.error('Invalid chapter:', book, chapter);
      return;
    }

    this.currentBook = book;
    this.currentChapter = chapter;
    this.setAttribute('book', book);
    this.setAttribute('chapter', chapter.toString());
    
    // Scroll to top smoothly
    this.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    this.loadChapter();
    
    // Update URL without page reload (optional, for bookmarking)
    const url = new URL(window.location.href);
    url.searchParams.set('book', book);
    url.searchParams.set('chapter', chapter.toString());
    window.history.pushState({ book, chapter }, '', url.toString());
  }
}

customElements.define('bible-reader', BibleReaderComponent);

export { BibleReaderComponent };
