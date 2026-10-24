export const getStoreImageUrl = (uri: string, width: number): string => {
  const value = uri.trim();
  if (!value || !/^https?:\/\//i.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.hostname === 'res.cloudinary.com' && url.pathname.includes('/image/upload/')) {
      url.pathname = url.pathname.replace('/image/upload/', `/image/upload/f_auto,q_auto,w_${width}/`);
    }
    return url.toString();
  } catch {
    return value;
  }
};
