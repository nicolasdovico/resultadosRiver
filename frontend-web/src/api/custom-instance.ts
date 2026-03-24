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
  if (config.url && !config.url.startsWith('/api')) {
    config.url = `/api${config.url}`;
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
