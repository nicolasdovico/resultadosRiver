import axios, { AxiosRequestConfig } from 'axios';

// Use internal URL for SSR in Docker, and public URL for browser
const isServer = typeof window === 'undefined';
const baseURL = isServer 
  ? (process.env.API_URL || 'http://backend')
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

export const AXIOS_INSTANCE = axios.create({
  baseURL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

export const customInstance = <T>(
  urlOrConfig: string | AxiosRequestConfig,
  options?: AxiosRequestConfig,
): Promise<T> => {
  const source = axios.CancelToken.source();
  
  let config: AxiosRequestConfig;
  if (typeof urlOrConfig === 'string') {
    config = { ...options, url: urlOrConfig };
  } else {
    config = { ...urlOrConfig, ...options };
  }

  // Ensure the URL is correctly formed by prefixing with /api if it doesn't already have it
  // This is needed because Orval generates URLs like /v1/... but Laravel routes are under /api/v1/...
  if (config.url && !config.url.startsWith('/api')) {
    config.url = `/api${config.url}`;
  }

  // Orval passes 'body' in options for RequestInit compatibility, but Axios expects 'data'
  if ((config as any).body && !config.data) {
    try {
      // If it's a string, try to parse it if it looks like JSON, otherwise use as is
      if (typeof (config as any).body === 'string') {
        config.data = JSON.parse((config as any).body);
      } else {
        config.data = (config as any).body;
      }
    } catch (e) {
      config.data = (config as any).body;
    }
  }
  
  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - axios cancel token issue
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};
