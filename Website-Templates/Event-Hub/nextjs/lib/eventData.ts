import type { EventItem } from "./eventHubApi";

export const starterEvents: EventItem[] = [
  {
    slug: "neon-pulse", title: "Neon Pulse Festival 2027", category: "Festival", date: "May 14-16, 2027", time: "5:00 PM",
    location: "Chase Center, San Francisco", price: 89,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85",
    description: "Three nights of boundary-pushing electronic music, immersive light, and unforgettable moments with the people who make the scene.",
    lineup: "Maya Chen · The Midnight · Solara · DJ Kairo", tag: "Selling fast",
  },
  {
    slug: "global-tech-summit", title: "Global Tech Summit 2027", category: "Conference", date: "June 8-10, 2027", time: "9:00 AM",
    location: "Moscone Center, San Francisco", price: 249,
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85",
    description: "Three days of ideas, practical workshops, and conversations with the people shaping what comes next in technology.",
    lineup: "Maya Chen · James Park · Amara Okafor", tag: "Early bird",
  },
  {
    slug: "city-lights-live", title: "City Lights Live", category: "Concert", date: "June 21, 2027", time: "7:30 PM",
    location: "The Warfield, San Francisco", price: 65,
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1400&q=85",
    description: "An intimate night of live music, big choruses, and a special one-night-only set in the heart of the city.",
    lineup: "The Midnight · Luna Grey · special guests", tag: "Just announced",
  },
  {
    slug: "summer-sessions", title: "Summer Sessions", category: "Festival", date: "July 10-11, 2027", time: "2:00 PM",
    location: "Fort Mason, San Francisco", price: 74,
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=85",
    description: "Golden-hour sets, waterfront food stalls, and two days of feel-good music at San Francisco's favorite summer party.",
    lineup: "Solara · Benji Blue · The Coastlines", tag: "Limited tickets",
  },
  {
    slug: "creative-minds", title: "Creative Minds: Design Week", category: "Workshop", date: "July 18, 2027", time: "10:00 AM",
    location: "The Midway, San Francisco", price: 45,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=85",
    description: "A hands-on day for curious creatives, with small-group workshops, inspiring speakers, and room to make something new.",
    lineup: "Avery Brooks · Lina Moreau · Omar Reyes", tag: "Workshop",
  },
  {
    slug: "afterglow", title: "Afterglow: Rooftop Sessions", category: "Concert", date: "August 2, 2027", time: "6:00 PM",
    location: "Charmaine's, San Francisco", price: 58,
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=85",
    description: "A rooftop sunset, a late-night skyline, and a carefully curated line-up of local artists. Come for the view; stay for the encore.",
    lineup: "DJ Kairo · Luna Grey · Niko Flores", tag: "Almost gone",
  },
];

export type EventSession = {
  time: string;
  track: string;
  title: string;
  speaker: string;
};

export type EventSpeaker = {
  name: string;
  role: string;
  image: string;
};

export const starterSessions: EventSession[] = [
  { time: "09:00 AM", track: "MAIN STAGE", title: "Opening Keynote: The Live Era", speaker: "Maya Chen · PulseLive" },
  { time: "10:15 AM", track: "STUDIO A", title: "Designing for Real-World Audiences", speaker: "James Park · Northstar" },
  { time: "11:30 AM", track: "MAIN STAGE", title: "Creative Teams That Break Boundaries", speaker: "Amara Okafor · FutureForm" },
  { time: "01:30 PM", track: "STUDIO B", title: "From First Note to Festival Set", speaker: "DJ Kairo · Independent artist" },
  { time: "03:00 PM", track: "MAIN STAGE", title: "Make Room for the Unexpected", speaker: "Lina Moreau · Common Ground" },
];

export const starterSpeakers: EventSpeaker[] = [
  { name: "Maya Chen", role: "Creative Director", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=420&q=85" },
  { name: "James Park", role: "Founder, Northstar", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=420&q=85" },
  { name: "Amara Okafor", role: "Artist & Speaker", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=420&q=85" },
  { name: "Lina Moreau", role: "Design Lead", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=420&q=85" },
];

export function withEventFallback(event: EventItem): EventItem {
  const fallback = starterEvents.find((item) => item.slug === event.slug)
    || starterEvents.find((item) => item.category === event.category)
    || starterEvents[0];
  return {
    ...fallback,
    ...event,
    image: typeof event.image === "string" && event.image.trim() ? event.image : fallback.image,
  };
}
