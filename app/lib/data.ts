// Central content model for Lobelia Pearl.
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
  gallery?: string[];
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
    villas: 25,
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
    price: 62400,
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
    price: 50700,
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
    price: 40300,
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
    price: 54600,
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
    price: 67600,
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
    price: 38350,
    reviews: 67,
    image: "/photos/p03.jpg",
  },
  {
    slug: "the-pearl-house",
    name: "The Pearl House",
    destination: "diani",
    location: "Galu, Diani",
    badge: "New",
    rating: 5,
    beds: 4,
    baths: 4,
    guests: 8,
    price: 72800,
    reviews: 20,
    image: "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.18 PM.jpeg",
    gallery: [
      "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.18 PM.jpeg",
      "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.18 PM (1).jpeg",
      "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.18 PM (2).jpeg",
      "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.18 PM (3).jpeg",
      "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.19 PM.jpeg",
      "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.19 PM (1).jpeg",
      "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.19 PM (2).jpeg",
      "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.19 PM (3).jpeg",
      "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.19 PM (4).jpeg",
      "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.20 PM.jpeg",
      "/photos/diani/WhatsApp Image 2026-08-16 at 2.09.20 PM (1).jpeg",
    ],
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
      "Lobelia Pearl's concierge arranged a private chef and a dhow trip. Everything was handled before we even landed.",
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

// ——— Villa detail content ———————————————————————————————————————————————

export const VILLA_HOSTS: Record<string, string> = {
  "galu-beachfront-villa": "Amani",
  "tulia-courtyard-house": "Neema",
  "bahari-pool-retreat": "Hassan",
  "mwezi-garden-villa": "Zawadi",
  "pwani-white-house": "Imani",
  "kaya-lounge-house": "Baraka",
  "the-pearl-house": "Lobelia",
};

export const VILLA_HIGHLIGHTS = [
  {
    icon: "pool",
    title: "Private beachfront pool",
    body: "Infinity pool steps from the white-sand beach.",
  },
  {
    icon: "cottage",
    title: "2-bedroom guest cottage",
    body: "Independent annexe for extended family or staff.",
  },
  {
    icon: "clock",
    title: "Self check-in & 24/7 concierge",
    body: "Arrive any time; our team is on call throughout your stay.",
  },
] as const;

export const VILLA_AMENITIES = [
  "Fast Wi-Fi",
  "Private infinity pool",
  "Air conditioning",
  "Full chef's kitchen",
  "En-suite bathrooms",
  "Tropical garden",
  "Secure parking",
  "Daily housekeeping",
] as const;

export const TOTAL_AMENITIES = 32;

export const RATING_BARS = [
  { label: "Cleanliness", score: 4.9 },
  { label: "Location", score: 5.0 },
  { label: "Check-in", score: 4.8 },
  { label: "Value", score: 4.7 },
] as const;

export type VillaReview = {
  initial: string;
  name: string;
  date: string;
  accent: string;
  quote: string;
};

export const VILLA_REVIEWS: VillaReview[] = [
  {
    initial: "S",
    name: "Sofia M.",
    date: "May 2026",
    accent: "#2c8b83",
    quote:
      "Spotless, serene and impeccably designed. The guest cottage was perfect for my parents and the beach is genuinely 30 seconds away.",
  },
  {
    initial: "J",
    name: "James O.",
    date: "April 2026",
    accent: "#c0613a",
    quote:
      "Amani is a wonderful host — quick to respond and full of local tips. The pool at sunset is unreal.",
  },
  {
    initial: "L",
    name: "Lena B.",
    date: "March 2026",
    accent: "#a6864e",
    quote:
      "We were a group of eight and never felt crowded. The open-plan living spills right onto the terrace. Will be back.",
  },
  {
    initial: "D",
    name: "Daniel K.",
    date: "February 2026",
    accent: "#163a41",
    quote:
      "Best villa we've stayed in on the coast. The kitchen is a dream and the housekeeping team were lovely.",
  },
];

export const PEARL_HOUSE_REVIEWS: VillaReview[] = [
  { initial: "A", name: "Amara N.", date: "June 2026", accent: "#2c8b83", quote: "The house is even more beautiful in person. Every room opens to light, greenery and the most peaceful pool." },
  { initial: "M", name: "Michael T.", date: "June 2026", accent: "#c0613a", quote: "The dining space was made for long lunches. Our group of eight had plenty of room and the kitchen was exceptionally well equipped." },
  { initial: "N", name: "Nadia R.", date: "May 2026", accent: "#a6864e", quote: "A calm, beautifully designed base for Diani. The gardens are lush, the beds are comfortable and the team were wonderful." },
  { initial: "K", name: "Khalid S.", date: "May 2026", accent: "#163a41", quote: "We loved having breakfast by the pool and a proper gym for morning workouts. It feels private without being isolated." },
  { initial: "E", name: "Elena P.", date: "May 2026", accent: "#7b5ea7", quote: "The details make this place special: woven lights, huge windows, thoughtful service and a pool we barely left." },
  { initial: "J", name: "James W.", date: "April 2026", accent: "#2c8b83", quote: "Check-in was seamless and the concierge arranged a chef for our first night. The food and the setting were unforgettable." },
  { initial: "F", name: "Fatima A.", date: "April 2026", accent: "#c0613a", quote: "Our family had space to spread out while still gathering around one beautiful table. We would happily return." },
  { initial: "R", name: "Ruth K.", date: "April 2026", accent: "#a6864e", quote: "The photos are accurate, but they do not capture how peaceful the house feels in the early morning." },
  { initial: "D", name: "David L.", date: "March 2026", accent: "#163a41", quote: "Excellent for a group trip. The living areas are generous, the bathrooms are spotless and the pool is fantastic." },
  { initial: "S", name: "Sana M.", date: "March 2026", accent: "#7b5ea7", quote: "A very polished stay from start to finish. We appreciated the quick communication and the little welcome touches." },
  { initial: "T", name: "Tom B.", date: "March 2026", accent: "#2c8b83", quote: "The gym was a real surprise and the glass walls make the whole home feel connected to the tropical garden." },
  { initial: "L", name: "Lydia O.", date: "February 2026", accent: "#c0613a", quote: "We came for a quiet beach break and found a home that made staying in just as appealing as going out." },
  { initial: "P", name: "Peter G.", date: "February 2026", accent: "#a6864e", quote: "Beautiful architecture, brilliant housekeeping and a very comfortable week for our family." },
  { initial: "Y", name: "Yara H.", date: "February 2026", accent: "#163a41", quote: "The outdoor spaces are so well planned. We moved between the pool, dining table and shaded lounge all day." },
  { initial: "C", name: "Clara V.", date: "January 2026", accent: "#7b5ea7", quote: "A restful and stylish retreat with everything we needed. The house was immaculate when we arrived." },
  { initial: "B", name: "Brian E.", date: "January 2026", accent: "#2c8b83", quote: "The perfect place for celebrating together. The team helped arrange transport and made the whole stay effortless." },
  { initial: "I", name: "Irene Z.", date: "January 2026", accent: "#c0613a", quote: "The pool is gorgeous at sunset and the house stays wonderfully cool during the day. We slept so well." },
  { initial: "O", name: "Owen C.", date: "December 2025", accent: "#a6864e", quote: "Modern, welcoming and surrounded by palms. The Pearl House gave our friends trip a real sense of occasion." },
  { initial: "W", name: "Wanjiku N.", date: "December 2025", accent: "#163a41", quote: "Everything felt considered, from the lighting to the servingware. A genuinely memorable Diani stay." },
  { initial: "Z", name: "Zainab F.", date: "December 2025", accent: "#7b5ea7", quote: "We loved the balance of privacy and service. It is a beautiful home for slow days by the coast." },
];

export const getVillaReviews = (slug: string): VillaReview[] =>
  slug === "the-pearl-house" ? PEARL_HOUSE_REVIEWS : VILLA_REVIEWS;

export const CLEANING_FEE = 11050;
export const EXTRA_GUEST_FEE = 1500;
export const SERVICE_RATE = 0.12; // of the nightly subtotal
export const DEFAULT_NIGHTS = 5;

export const formatKES = (n: number) => `KES ${n.toLocaleString("en-KE")}`;

export const getVilla = (slug: string) => VILLAS.find((v) => v.slug === slug);

/** Gallery for a villa: its own hero photo plus its destination's gallery. */
export function villaGallery(v: Villa): string[] {
  const dest = getDestination(v.destination);
  const extra = dest ? dest.gallery : [];
  return (v.gallery ?? [v.image, ...extra]).slice(0, 5);
}

/** A two-paragraph description tailored to the villa. */
export function villaDescription(v: Villa): string[] {
  const place = v.location;
  return [
    `Discover a serene coastal escape at this stunning home in ${place}, blending modern architecture with tropical tranquillity. Expansive glass doors invite natural light and open onto lush greenery and a breathtaking private pool. The open-plan living and dining area flows seamlessly onto the terrace, where breezes and birdsong set a calming mood.`,
    `With ${v.beds} bedrooms and ${v.baths} bathrooms, there is space for up to ${v.guests} guests — perfect for families and groups who want privacy without compromise. Your dedicated concierge can arrange a private chef, transfers and excursions before you even arrive.`,
  ];
}

export const NAV_LINKS = [
  { label: "Stays", href: "/destinations/diani" },
  { label: "Destinations", href: "/#destinations" },
  { label: "Experiences", href: "/experiences" },
  { label: "Journal", href: "/journal" },
];

// Short marketing copy + tags used on the listing (search) cards.
export const VILLA_INFO: Record<string, { summary: string; tags: string[] }> = {
  "galu-beachfront-villa": {
    summary:
      "A 5-bedroom modernist estate where glass doors open to a private infinity pool and the white sand of Galu beach beyond.",
    tags: ["Beachfront", "Private pool", "Guest cottage"],
  },
  "tulia-courtyard-house": {
    summary:
      "A serene courtyard villa framed by cacti gardens and stepping-stone paths leading down to the sea.",
    tags: ["Ocean view", "Courtyard", "Chef"],
  },
  "bahari-pool-retreat": {
    summary:
      "Crisp white walls, a turquoise pool and a private beach cabana moments from the Watamu reef.",
    tags: ["Private pool", "Beach cabana", "Reef"],
  },
  "mwezi-garden-villa": {
    summary:
      "Garden suites, a private chef and lantern-lit dinners under the palms in leafy Kilifi.",
    tags: ["Private chef", "Garden", "Quiet"],
  },
  "pwani-white-house": {
    summary:
      "A brand-new whitewashed retreat with rooftop views over Malindi's old town and the ocean.",
    tags: ["New", "Rooftop", "Ocean view"],
  },
  "kaya-lounge-house": {
    summary:
      "A laid-back beach house with open lounges, hammocks and direct sand access in Diani.",
    tags: ["Beachfront", "Beach access", "Lounge"],
  },
  "the-pearl-house": {
    summary:
      "A bright, design-led four-bedroom retreat with a private pool, tropical gardens, alfresco dining and a dedicated gym in Galu.",
    tags: ["New", "Private pool", "Gym"],
  },
};

export const LISTING_FILTERS = [
  "Price",
  "Bedrooms",
  "Beachfront",
  "Private pool",
  "Superhost",
];

// ——— Experiences ———————————————————————————————————————————————————————

export type Experience = {
  title: string;
  place: string;
  blurb: string;
  image: string;
  duration: string;
  from: number;
};

export const EXPERIENCES: Experience[] = [
  {
    title: "Sunset dhow cruise",
    place: "Diani",
    blurb:
      "Glide along the reef on a hand-built dhow as the sky turns gold, sundowners in hand.",
    image: "/photos/p03.jpg",
    duration: "3 hours",
    from: 9100,
  },
  {
    title: "Private chef & Swahili feast",
    place: "Your villa",
    blurb:
      "A coastal tasting menu — swahili spices, fresh seafood — cooked in your own kitchen.",
    image: "/photos/p06.jpg",
    duration: "Evening",
    from: 15600,
  },
  {
    title: "Kisite marine snorkelling",
    place: "Wasini",
    blurb:
      "Snorkel coral gardens and spot dolphins in a protected marine park off the south coast.",
    image: "/photos/p16.jpg",
    duration: "Full day",
    from: 12350,
  },
  {
    title: "Mount Kenya foothills ride",
    place: "Nanyuki",
    blurb:
      "Ride horseback across the plains with the snow-capped mountain on the horizon.",
    image: "/photos/p21.jpg",
    duration: "Half day",
    from: 14300,
  },
  {
    title: "Crater lake & Hell's Gate",
    place: "Naivasha",
    blurb:
      "Cycle past zebra and giraffe beneath dramatic volcanic cliffs in the Rift Valley.",
    image: "/photos/p19.jpg",
    duration: "Full day",
    from: 11050,
  },
  {
    title: "Old town heritage walk",
    place: "Malindi",
    blurb:
      "Swahili history, spice markets and centuries-old dhow builders with a local guide.",
    image: "/photos/p05.jpg",
    duration: "2 hours",
    from: 5200,
  },
];

// ——— Journal ————————————————————————————————————————————————————————————

export type Article = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  date: string;
  read: string;
};

export const ARTICLES: Article[] = [
  {
    slug: "quietest-beaches-diani",
    title: "Where to find the quietest beaches in Diani",
    category: "Guides",
    excerpt:
      "Beyond the famous stretch of Galu lie coves you'll often have entirely to yourself. Here's where to walk at dawn.",
    image: "/photos/p03.jpg",
    date: "June 2026",
    read: "6 min read",
  },
  {
    slug: "weekend-in-nanyuki",
    title: "A weekend in Nanyuki, above the clouds",
    category: "Highlands",
    excerpt:
      "Cool mornings, the equator line and Mount Kenya on the horizon — why the highlands are the coast's perfect counterpoint.",
    image: "/photos/p21.jpg",
    date: "May 2026",
    read: "8 min read",
  },
  {
    slug: "how-we-verify-homes",
    title: "How we verify every Lobelia Pearl home",
    category: "Inside Lobelia Pearl",
    excerpt:
      "Every villa is visited in person before it's listed. A look at what our team checks — and why the photos always match.",
    image: "/photos/p05.jpg",
    date: "May 2026",
    read: "5 min read",
  },
  {
    slug: "best-private-chefs",
    title: "The coast's best private chefs",
    category: "Food",
    excerpt:
      "From Swahili biryani to fresh-caught crab, meet the chefs our concierge books again and again.",
    image: "/photos/p09.jpg",
    date: "April 2026",
    read: "7 min read",
  },
  {
    slug: "packing-for-the-coast",
    title: "Packing for the Kenyan coast",
    category: "Tips",
    excerpt:
      "Linen, reef-safe sunscreen and not much else. A short, sane packing list for a barefoot week by the sea.",
    image: "/photos/p07.jpg",
    date: "April 2026",
    read: "4 min read",
  },
  {
    slug: "naivasha-slow-weekends",
    title: "Naivasha: lakes, wine and slow weekends",
    category: "Highlands",
    excerpt:
      "Hippos at dusk, lakeside lunches and an easy drive from the city — the Rift Valley's gentlest escape.",
    image: "/photos/p19.jpg",
    date: "March 2026",
    read: "6 min read",
  },
];

export const villasFor = (slug: string) =>
  VILLAS.filter((v) => v.destination === slug);

export const getDestination = (slug: string) =>
  DESTINATIONS.find((d) => d.slug === slug);
