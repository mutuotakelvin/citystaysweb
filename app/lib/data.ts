// Central content model for City Stays.
// Real photography exists for Diani & Malindi; other locations reuse the
// curated library as tasteful placeholders until their shoots land.

export type Destination = {
  slug: string;
  name: string;
  region: "Coast" | "Inland";
  villas: number;
  tagline: string;
  blurb: string;
  hero: string;
  card: string;
  gallery: string[];
};

export type Villa = {
  slug: string;
  name: string;
  destination: string; // destination slug
  location: string; // display label
  badge: string;
  rating: number;
  beds: number;
  baths: number;
  guests: number;
  price: number;
  reviews: number;
  image: string;
};

export type Testimonial = {
  name: string;
  initial: string;
  stay: string;
  date: string;
  quote: string;
  accent: string;
};

export const HERO_SLIDES = [
  { place: "Diani", image: "/photos/p16.jpg", caption: "Galu Beach" },
  { place: "Malindi", image: "/photos/p05.jpg", caption: "Old town & ocean" },
  { place: "Naivasha", image: "/photos/p19.jpg", caption: "Rift Valley lakes" },
  { place: "Nanyuki", image: "/photos/p21.jpg", caption: "Foot of Mount Kenya" },
] as const;

export const DESTINATIONS: Destination[] = [
  {
    slug: "diani",
    name: "Diani",
    region: "Coast",
    villas: 24,
    tagline: "Powder-white sand and warm Indian Ocean",
    blurb:
      "Kenya's most celebrated beach — barefoot luxury, coral reefs a short swim away, and villas tucked into coastal forest.",
    hero: "/photos/p16.jpg",
    card: "/photos/p16.jpg",
    gallery: ["/photos/p05.jpg", "/photos/p19.jpg", "/photos/p07.jpg", "/photos/p09.jpg", "/photos/diani-1.jpg", "/photos/diani-4.jpg"],
  },
  {
    slug: "watamu",
    name: "Watamu",
    region: "Coast",
    villas: 18,
    tagline: "Marine park coves and turquoise lagoons",
    blurb:
      "A protected marine park, tidal pools and laid-back style. Watamu is the coast at its most unhurried.",
    hero: "/photos/p05.jpg",
    card: "/photos/p05.jpg",
    gallery: ["/photos/p16.jpg", "/photos/p21.jpg", "/photos/p12.jpg", "/photos/p06.jpg", "/photos/diani-7.jpg", "/photos/diani-9.jpg"],
  },
  {
    slug: "kilifi",
    name: "Kilifi",
    region: "Coast",
    villas: 12,
    tagline: "Creekside calm and bohemian villas",
    blurb:
      "Kilifi Creek, dhow sunsets and a creative community. Garden villas with private chefs and slow mornings.",
    hero: "/photos/p19.jpg",
    card: "/photos/p19.jpg",
    gallery: ["/photos/p21.jpg", "/photos/p05.jpg", "/photos/p10.jpg", "/photos/p13.jpg", "/photos/diani-3.jpg", "/photos/diani-11.jpg"],
  },
  {
    slug: "malindi",
    name: "Malindi",
    region: "Coast",
    villas: 9,
    tagline: "Swahili heritage and golden beaches",
    blurb:
      "Centuries of Swahili history meet long golden beaches. Malindi blends old-town character with beachfront ease.",
    hero: "/photos/p03.jpg",
    card: "/photos/p03.jpg",
    gallery: ["/photos/malindi-5.jpg", "/photos/malindi-8.jpg", "/photos/malindi-12.jpg", "/photos/malindi-2.jpg", "/photos/malindi-16.jpg", "/photos/malindi-20.jpg"],
  },
  {
    slug: "nanyuki",
    name: "Nanyuki",
    region: "Inland",
    villas: 7,
    tagline: "Highland air at the foot of Mount Kenya",
    blurb:
      "Cool highland mornings, the equator line and Mount Kenya on the horizon. Lodges and country homes with big skies.",
    hero: "/photos/p21.jpg",
    card: "/photos/p21.jpg",
    gallery: ["/photos/p19.jpg", "/photos/p05.jpg", "/photos/p08.jpg", "/photos/p11.jpg", "/photos/diani-6.jpg", "/photos/diani-12.jpg"],
  },
  {
    slug: "naivasha",
    name: "Naivasha",
    region: "Inland",
    villas: 8,
    tagline: "Rift Valley lakes and acacia plains",
    blurb:
      "A freshwater lake ringed by acacia, hippos at dusk and weekend escapes an easy drive from the city.",
    hero: "/photos/p19.jpg",
    card: "/photos/p19.jpg",
    gallery: ["/photos/p16.jpg", "/photos/p21.jpg", "/photos/p14.jpg", "/photos/p17.jpg", "/photos/diani-2.jpg", "/photos/diani-8.jpg"],
  },
  {
    slug: "nairobi",
    name: "Nairobi",
    region: "Inland",
    villas: 11,
    tagline: "The city of style, between safaris",
    blurb:
      "Leafy suburbs, design hotels and a national park on the doorstep. The perfect first and last night of any trip.",
    hero: "/photos/p12.jpg",
    card: "/photos/p12.jpg",
    gallery: ["/photos/p05.jpg", "/photos/p09.jpg", "/photos/p07.jpg", "/photos/p18.jpg", "/photos/malindi-3.jpg", "/photos/malindi-10.jpg"],
  },
];

export const VILLAS: Villa[] = [
  {
    slug: "galu-beachfront-villa",
    name: "Galu Beachfront Villa",
    destination: "diani",
    location: "Galu, Diani",
    badge: "Beachfront",
    rating: 4.97,
    beds: 5,
    baths: 5,
    guests: 10,
    price: 480,
    reviews: 128,
    image: "/photos/p05.jpg",
  },
  {
    slug: "tulia-courtyard-house",
    name: "Tulia Courtyard House",
    destination: "diani",
    location: "Diani",
    badge: "Ocean View",
    rating: 4.9,
    beds: 4,
    baths: 4,
    guests: 8,
    price: 390,
    reviews: 74,
    image: "/photos/p19.jpg",
  },
  {
    slug: "bahari-pool-retreat",
    name: "Bahari Pool Retreat",
    destination: "watamu",
    location: "Watamu",
    badge: "Private pool",
    rating: 4.88,
    beds: 3,
    baths: 3,
    guests: 6,
    price: 310,
    reviews: 56,
    image: "/photos/p16.jpg",
  },
  {
    slug: "mwezi-garden-villa",
    name: "Mwezi Garden Villa",
    destination: "kilifi",
    location: "Kilifi",
    badge: "Private chef",
    rating: 4.95,
    beds: 4,
    baths: 4,
    guests: 9,
    price: 420,
    reviews: 91,
    image: "/photos/p21.jpg",
  },
  {
    slug: "pwani-white-house",
    name: "Pwani White House",
    destination: "malindi",
    location: "Malindi",
    badge: "New",
    rating: 4.99,
    beds: 5,
    baths: 5,
    guests: 10,
    price: 520,
    reviews: 43,
    image: "/photos/p01.jpg",
  },
  {
    slug: "kaya-lounge-house",
    name: "Kaya Lounge House",
    destination: "diani",
    location: "Diani",
    badge: "Beachfront",
    rating: 4.85,
    beds: 3,
    baths: 3,
    guests: 6,
    price: 295,
    reviews: 67,
    image: "/photos/p03.jpg",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Sofia Marchetti",
    initial: "S",
    stay: "Galu Beachfront Villa",
    date: "May 2026",
    quote:
      "The villa was even more beautiful than the photos. Waking up to the pool and the sound of the ocean is something we still talk about.",
    accent: "#2c8b83",
  },
  {
    name: "James Okoth",
    initial: "J",
    stay: "Tulia Courtyard House",
    date: "Apr 2026",
    quote:
      "City Stays' concierge arranged a private chef and a dhow trip. Everything was handled before we even landed.",
    accent: "#c0613a",
  },
  {
    name: "Lena Brandt",
    initial: "L",
    stay: "Bahari Pool Retreat",
    date: "Mar 2026",
    quote:
      "Effortless from search to check-in. The verified-host badge gave us total confidence booking from abroad.",
    accent: "#a6864e",
  },
];

export const NAV_LINKS = [
  { label: "Destinations", href: "/#destinations" },
  { label: "Experiences", href: "/#why" },
  { label: "Journal", href: "/#stories" },
  { label: "Become a Host", href: "/#cta" },
];

export const villasFor = (slug: string) =>
  VILLAS.filter((v) => v.destination === slug);

export const getDestination = (slug: string) =>
  DESTINATIONS.find((d) => d.slug === slug);
