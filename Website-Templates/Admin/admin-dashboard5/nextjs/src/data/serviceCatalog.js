import { GraduationCap, Phone, Tv, Wifi, Zap } from 'lucide-react'

export const billServices = [
  { name: 'Airtime', icon: Phone, sub: 'Instant top-ups' },
  { name: 'Data', icon: Wifi, sub: 'Stay connected' },
  { name: 'Electricity', icon: Zap, sub: 'Keep the lights on', active: true },
  { name: 'Pay TV', icon: Tv, sub: 'Never miss a moment' },
  { name: 'WAEC PINs', icon: GraduationCap, sub: 'Access your results' },
]

export const giftCardBrands = [
  { name: 'iTunes', icon: '🎵', active: true },
  { name: 'Steam', icon: '🎮', active: false },
  { name: 'Amazon', icon: '🛒', active: false },
  { name: 'Google Play', icon: '▶️', active: false },
]

export const esimDestinations = [
  { name: 'United States', code: 'US', network: 'AT&T / T-Mobile · 4G / 5G', price: '₦4,500', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', network: 'EE / O2 · 4G / 5G', price: '₦3,800', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', network: 'Rogers / Bell · 4G / 5G', price: '₦5,200', flag: '🇨🇦' },
  { name: 'United Arab Emirates', code: 'AE', network: 'du / Etisalat · 4G / 5G', price: '₦6,500', flag: '🇦🇪' },
  { name: 'France', code: 'FR', network: 'Orange / SFR · 4G / 5G', price: '₦3,500', flag: '🇫🇷' },
  { name: 'South Africa', code: 'ZA', network: 'Vodacom / MTN · 4G / 5G', price: '₦4,200', flag: '🇿🇦' },
]
