import { State } from '../types';

export class URLStateManager {
  static encodeState(state: State): string {
    const stateString = JSON.stringify(state);
    const encoded = btoa(stateString);
    return encoded;
  }

  static decodeState(encoded: string): State | null {
    try {
      const decoded = atob(encoded);
      const state = JSON.parse(decoded);
      return state;
    } catch (error) {
      console.error('Failed to decode state from URL:', error);
      return null;
    }
  }

  static saveStateToURL(state: State): void {
    const encoded = this.encodeState(state);
    const url = new URL(window.location.href);
    url.hash = `#${encoded}`;
    window.history.replaceState({}, '', url.toString());
  }

  static loadStateFromURL(): State | null {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    return this.decodeState(hash);
  }

  static getShareableURL(state: State): string {
    const encoded = this.encodeState(state);
    const url = new URL(window.location.href);
    url.hash = `#${encoded}`;
    return url.toString();
  }

  static clearURLState(): void {
    const url = new URL(window.location.href);
    url.hash = '';
    window.history.replaceState({}, '', url.toString());
  }
}
