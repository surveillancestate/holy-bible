// Base Web Component Class
abstract class BaseComponent extends HTMLElement {
  protected shadow: ShadowRoot;
  private _connected = false;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this._connected = true;
    this.render();
    this.onConnect();
  }

  disconnectedCallback(): void {
    this._connected = false;
    this.onDisconnect();
  }

  protected abstract render(): void;
  
  protected onConnect(): void {
    // Override in subclass
  }

  protected onDisconnect(): void {
    // Override in subclass
  }

  protected querySelector<K extends keyof HTMLElementTagNameMap>(selector: K): HTMLElementTagNameMap[K] | null;
  protected querySelector(selector: string): Element | null;
  protected querySelector(selector: string): Element | null {
    return this.shadow.querySelector(selector);
  }

  protected querySelectorAll<K extends keyof HTMLElementTagNameMap>(selector: K): NodeListOf<HTMLElementTagNameMap[K]>;
  protected querySelectorAll(selector: string): NodeListOf<Element>;
  protected querySelectorAll(selector: string): NodeListOf<Element> {
    return this.shadow.querySelectorAll(selector);
  }

  protected dispatchCustomEvent<T>(name: string, detail: T, options?: CustomEventInit<T>): void {
    const event = new CustomEvent(name, {
      bubbles: true,
      composed: true,
      detail,
      ...options,
    });
    this.dispatchEvent(event);
  }
}

export { BaseComponent };
