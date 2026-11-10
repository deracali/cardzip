const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const API_BASE_URL = (configuredApiUrl || 'https://cardzip-server-hvg6.onrender.com').replace(/\/$/, '');