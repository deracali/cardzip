const giftCardLogoDomains: Record<string, string> = {
  amazon: 'amazon.com',
  apple: 'apple.com',
  itunes: 'apple.com',
  googleplay: 'play.google.com',
  google: 'google.com',
  steam: 'steampowered.com',
  xbox: 'xbox.com',
  playstation: 'playstation.com',
  sonyplaystation: 'playstation.com',
  psn: 'playstation.com',
  netflix: 'netflix.com',
  spotify: 'spotify.com',
  sephora: 'sephora.com',
  walmart: 'walmart.com',
  target: 'target.com',
  nike: 'nike.com',
  adidas: 'adidas.com',
  razer: 'razer.com',
  goldrazer: 'razer.com',
  goldrazor: 'razer.com',
  nintendo: 'nintendo.com',
  roblox: 'roblox.com',
  riotgames: 'riotgames.com',
  epicgames: 'epicgames.com',
  twitch: 'twitch.tv',
  disneyplus: 'disneyplus.com',
  disney: 'disney.com',
  footlocker: 'footlocker.com',
};

export const getGiftCardLogoUrls = (name: string, catalogLogo?: string): string[] => {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const matchedBrand = Object.keys(giftCardLogoDomains).find((brand) => normalizedName.includes(brand));
  const domain = matchedBrand ? giftCardLogoDomains[matchedBrand] : null;
  const onlineLogo = domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : null;
  return [...new Set([onlineLogo, catalogLogo].filter((url): url is string => Boolean(url)))];
};
