declare global {
  interface Window {
    __RUNTIME_CONFIG__: {
      VITE_API_BASE_URL: string;
    };
  }
}

export const config = {
  apiBaseUrl:
    window.__RUNTIME_CONFIG__?.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    '/api/v1',
};
