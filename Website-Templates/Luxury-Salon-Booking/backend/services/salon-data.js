export const services = [
  { id: "signature-silk-blowout", name: "Signature Silk Blowout", category: "Hair", description: "Cleanse, gloss + sculpted finish with our heat-safe ritual.", duration: "60 min", price: 85, image: "/images/salon/silk-blowout.jpg", badge: "Most booked", active: true },
  { id: "rose-quartz-manicure", name: "Rose Quartz Manicure", category: "Nails", description: "Sculpt, cuticle care + soft shine in a clean room.", duration: "45 min", price: 65, image: "/images/salon/nail-ritual.jpg", badge: "", active: true },
  { id: "lumiere-glow-facial", name: "Lumière Glow Facial", category: "Skincare", description: "Double cleanse, lymphatic sculpt + LED brightening.", duration: "75 min", price: 140, image: "/images/salon/glow-facial.jpg", badge: "New", active: true },
  { id: "deep-calm-massage", name: "Deep Calm Massage", category: "Massage", description: "Warm oil, deep tissue + aromatherapy wind-down.", duration: "60 min", price: 120, image: "/images/salon/deep-tissue.jpg", badge: "", active: true },
];

export const stylists = ["Maya R.", "Jonas K.", "Sofia M."];
export const defaultStylists = [
  { id: "maya-r", name: "Maya R.", role: "Colorist & blowout specialist", bio: "Known for dimensional color and soft, polished finishes.", image: "", active: true },
  { id: "jonas-k", name: "Jonas K.", role: "Senior stylist", bio: "Precision cuts and effortless styling tailored to your routine.", image: "", active: true },
  { id: "sofia-m", name: "Sofia M.", role: "Skin & wellness artist", bio: "Restorative facials and calm, results-led skin rituals.", image: "", active: true },
];
export const appointmentTimes = ["9:00 AM", "10:30 AM", "12:00 PM", "2:15 PM", "4:00 PM", "5:30 PM"];
export const appointmentStatuses = ["Requested", "Confirmed", "Completed", "Cancelled"];
