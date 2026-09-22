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
  private fontSize: number = 17;
  private darkMode: boolean = false;
  private selectedVerse: string | null = null;

  constructor() {
    super();
    this.loadSettings();
  }

  static get observedAttributes(): string[] {
    return ['book', 'chapter'];
  }

  private loadSettings(): void {
    const savedFontSize = localStorage.getItem('bible-font-size');
    const savedDarkMode = localStorage.getItem('bible-dark-mode');
    
    if (savedFontSize) {
      this.fontSize = parseInt(savedFontSize, 10);
    }
    if (savedDarkMode === 'true') {
      this.darkMode = true;
    }
  }

  private saveSettings(): void {
    localStorage.setItem('bible-font-size', this.fontSize.toString());
    localStorage.setItem('bible-dark-mode', this.darkMode.toString());
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
    const darkBg = this.darkMode ? '#1a202c' : '#ffffff';
    const darkText = this.darkMode ? '#e2e8f0' : '#1a202c';
    const darkBorder = this.darkMode ? '#4a5568' : '#e2e8f0';
    const darkHover = this.darkMode ? '#2d3748' : '#f7fafc';
    const verseHover = this.darkMode ? '#2d3748' : '#f7fafc';

    const styles = `
      <style>
        :host {
          display: block;
          font-family: Georgia, 'Times New Roman', serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: ${darkBg};
          color: ${darkText};
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid ${darkBorder};
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
          border: 1px solid ${this.darkMode ? '#4a5568' : '#cbd5e0'};
          border-radius: 6px;
          background: ${darkBg};
          color: ${darkText};
          cursor: pointer;
          transition: all 0.2s ease;
        }

        select:hover, button:hover:not(:disabled) {
          background: ${darkHover};
          border-color: ${this.darkMode ? '#718096' : '#a0aec0'};
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
          color: ${darkText};
          min-width: 200px;
          text-align: center;
        }

        .content {
          min-height: 200px;
        }

        .verses {
          line-height: 2;
          font-size: ${this.fontSize}px;
          color: ${darkText};
        }

        .verse {
          margin-bottom: 12px;
          padding: 8px 12px;
          transition: background-color 0.15s ease;
          border-radius: 4px;
          cursor: pointer;
        }

        .verse:hover {
          background-color: ${verseHover};
        }

        .verse.selected {
          background-color: ${this.darkMode ? '#4299e133' : '#dbeafe'};
          border-left: 3px solid #4299e1;
        }

        .verse-number {
          font-weight: 700;
          color: ${this.darkMode ? '#a0aec0' : '#718096'};
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
          color: ${this.darkMode ? '#a0aec0' : '#718096'};
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid ${this.darkMode ? '#4a5568' : '#e2e8f0'};
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
          color: ${this.darkMode ? '#fc8181' : '#e53e3e'};
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
          background: ${this.darkMode ? '#d69e2e' : '#fef3c7'};
          color: ${this.darkMode ? '#744210' : '#92400e'};
        }

        .testament-badge.new {
          background: ${this.darkMode ? '#63b3ed' : '#dbeafe'};
          color: ${this.darkMode ? '#1a365d' : '#1e40af'};
        }

        /* Settings controls */
        .settings-controls {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .settings-btn {
          padding: 8px 12px;
          font-size: 18px;
          background: transparent;
          border: 1px solid ${this.darkMode ? '#4a5568' : '#cbd5e0'};
          color: ${darkText};
        }

        .settings-btn:hover {
          background: ${darkHover};
        }

        .font-controls {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .font-btn {
          padding: 6px 10px;
          font-size: 14px;
          font-weight: bold;
        }

        /* Keyboard navigation hint */
        .keyboard-hint {
          font-size: 12px;
          color: ${this.darkMode ? '#718096' : '#a0aec0'};
          margin-top: 8px;
          text-align: center;
        }

        /* Verse action tooltip */
        .verse-action-tooltip {
          position: fixed;
          background: ${this.darkMode ? '#2d3748' : '#1a202c'};
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 13px;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .verse-action-tooltip.visible {
          opacity: 1;
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
            font-size: ${this.fontSize - 1}px;
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
          <div class="settings-controls">
            <div class="font-controls">
              <button class="font-btn settings-btn" id="font-decrease" aria-label="Decrease font size">A-</button>
              <button class="font-btn settings-btn" id="font-increase" aria-label="Increase font size">A+</button>
            </div>
            <button class="settings-btn" id="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark/light mode">
              ${this.darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </div>
      <div class="content">
        ${this.renderContent()}
      </div>
      <p class="keyboard-hint">💡 Tip: Use Left/Right arrow keys to navigate chapters • Click verses to select</p>
      <div class="verse-action-tooltip" id="verse-tooltip"></div>
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
          ${this.state.data.verses.map(v => {
            const verseKey = `${this.currentBook} ${this.currentChapter}:${v.verse}`;
            const isSelected = this.selectedVerse === verseKey ? 'selected' : '';
            return `
            <div class="verse ${isSelected}" data-verse="${v.verse}" data-reference="${verseKey}">
              <span class="verse-number">${v.verse}</span>
              <span class="verse-text">${this.escapeHtml(v.text)}</span>
            </div>
          `;
          }).join('')}
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
    const fontDecreaseBtn = this.shadow.querySelector('#font-decrease') as HTMLButtonElement;
    const fontIncreaseBtn = this.shadow.querySelector('#font-increase') as HTMLButtonElement;
    const themeToggleBtn = this.shadow.querySelector('#theme-toggle') as HTMLButtonElement;

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

    if (fontDecreaseBtn) {
      fontDecreaseBtn.addEventListener('click', () => {
        this.fontSize = Math.max(12, this.fontSize - 2);
        this.saveSettings();
        this.render();
      });
    }

    if (fontIncreaseBtn) {
      fontIncreaseBtn.addEventListener('click', () => {
        this.fontSize = Math.min(32, this.fontSize + 2);
        this.saveSettings();
        this.render();
      });
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        this.darkMode = !this.darkMode;
        this.saveSettings();
        this.render();
      });
    }

    // Verse click handling for selection
    this.shadow.addEventListener('click', (e: Event) => {
      const target = e.target as HTMLElement;
      const verseEl = target.closest('.verse') as HTMLElement;
      
      if (verseEl) {
        const reference = verseEl.dataset.reference;
        if (reference) {
          this.selectedVerse = reference;
          this.showTooltip(`Selected ${reference}`, e.clientX, e.clientY);
          this.render();
          
          // Copy to clipboard on double-click
          verseEl.addEventListener('dblclick', () => {
            this.copyVerseToClipboard(reference);
          });
        }
      }
    });
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

  private showTooltip(message: string, x: number, y: number): void {
    const tooltip = this.shadow.querySelector('#verse-tooltip') as HTMLElement;
    if (tooltip) {
      tooltip.textContent = message;
      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y - 40}px`;
      tooltip.classList.add('visible');
      
      setTimeout(() => {
        tooltip.classList.remove('visible');
      }, 2000);
    }
  }

  private async copyVerseToClipboard(reference: string): Promise<void> {
    if (!this.state.data) return;
    
    const verseData = this.state.data.verses.find(v => 
      `${this.currentBook} ${this.currentChapter}:${v.verse}` === reference
    );
    
    if (verseData) {
      const text = `${reference} - ${verseData.text}`;
      try {
        await navigator.clipboard.writeText(text);
        this.showTooltip('Copied to clipboard!', window.event?.clientX || 0, window.event?.clientY || 0);
      } catch (err) {
        console.error('Failed to copy:', err);
        this.showTooltip('Failed to copy', window.event?.clientX || 0, window.event?.clientY || 0);
      }
    }
  }
}

customElements.define('bible-reader', BibleReaderComponent);

export { BibleReaderComponent };
