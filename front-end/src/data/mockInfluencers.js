import SaraBImage from "../assets/images/SaraBlogs-Profile.jpg";
import LisaSImage from "../assets/images/Lisa-Profile.jpg";
import JasonImage from "../assets/images/AhmedFit-Profile.jpg";

export const influencerProfiles = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    role: "Fashion & Lifestyle",
    rating: "4.9",
    engagement: "8.5%",
    age: "28",
    followers: "45.2K",
    imageSrc: SaraBImage,
    location: "Cairo, Egypt",
    bio: "Fashion creator focused on wearable styling, seasonal edits, and brand storytelling for modern women.",
    niches: ["Fashion", "Lifestyle", "Styling"],
    platforms: ["Instagram", "TikTok", "YouTube"],
    audience: "Women 24-34 interested in fashion trends and everyday styling.",
  },
  {
    id: "mia-carter",
    name: "Mia Carter",
    email: "mia.carter@email.com",
    role: "Lifestyle & Travel",
    rating: "4.8",
    engagement: "10.5%",
    age: "25",
    followers: "38.2K",
    imageSrc: LisaSImage,
    location: "Dubai, UAE",
    bio: "Lifestyle and travel influencer creating polished short-form content, product integrations, and campaign recaps.",
    niches: ["Lifestyle", "Travel", "Short-form Video"],
    platforms: ["Instagram", "TikTok"],
    audience: "Young adults 20-30 following travel inspiration and curated lifestyle content.",
  },
  {
    id: "jason-creator",
    name: "Jason Lee",
    email: "jason.creator@email.com",
    role: "Fitness & Tech",
    rating: "4.7",
    engagement: "9.2%",
    age: "27",
    followers: "48.6K",
    imageSrc: JasonImage,
    location: "Riyadh, Saudi Arabia",
    bio: "Fitness and tech lifestyle creator producing practical product reviews, short-form tutorials, and energetic campaign content.",
    niches: ["Fitness", "Tech", "Lifestyle"],
    platforms: ["Instagram", "TikTok", "YouTube"],
    audience: "Young adults 18-34 interested in fitness routines, creator tech, and lifestyle upgrades.",
  },
];

export const getInfluencerById = (influencerId) =>
  influencerProfiles.find((influencer) => influencer.id === influencerId) || null;
