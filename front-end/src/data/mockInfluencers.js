import SaraBImage from "../assets/images/SaraBlogs-Profile.jpg";
import LisaSImage from "../assets/images/Lisa-Profile.jpg";

export const influencerProfiles = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
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
];

export const getInfluencerById = (influencerId) =>
  influencerProfiles.find((influencer) => influencer.id === influencerId) || null;
