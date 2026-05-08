if (typeof window === 'undefined') {
  // Hard polyfill for Node environments where localStorage might be a read-only Proxy (Node v25+)
  const mockStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  };

  try {
    // Attempt to delete if it exists as a broken proxy
    if ((global as any).localStorage) {
      try {
        delete (global as any).localStorage;
      } catch (e) {
        // If delete fails, it's non-configurable. Try defineProperty anyway.
      }
    }

    if (!(global as any).localStorage) {
      Object.defineProperty(global, 'localStorage', {
        value: mockStorage,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  } catch (error) {
    console.error("Critical failure polyfilling localStorage:", error);
  }
}

export {};
