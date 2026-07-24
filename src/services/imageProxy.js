const IMAGE_PROXY_ENDPOINT = '/api/image-proxy';

export const buildImageProxyUrl = (url) => {
  if (!url) {
    return '';
  }

  return `${IMAGE_PROXY_ENDPOINT}?url=${encodeURIComponent(url)}`;
};