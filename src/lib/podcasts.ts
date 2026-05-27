import type { Podcast } from "@/types";
import { dayOfYear } from "./utils";

const PODCASTS: Podcast[] = [
  {
    name: "Rich Roll Podcast",
    host: "Rich Roll",
    description: "Ultra-endurance athlete and wellness advocate explores limits of human potential.",
    url: "https://www.richroll.com/podcast/",
    category: "endurance",
  },
  {
    name: "WHOOP Podcast",
    host: "WHOOP",
    description: "Science of recovery, sleep, and strain with world-class athletes.",
    url: "https://www.whoop.com/thelocker/podcast/",
    category: "mindset",
  },
  {
    name: "Brute Strength",
    host: "Michael Cazayoux",
    description: "Functional fitness, Hyrox, and CrossFit training for competitive athletes.",
    url: "https://brutestrengthtraining.com/podcast/",
    category: "hyrox",
  },
  {
    name: "Strength Running Podcast",
    host: "Jason Fitzgerald",
    description: "Injury prevention, training plans, and performance for runners.",
    url: "https://strengthrunning.com/podcast/",
    category: "endurance",
  },
  {
    name: "Marathon Training Academy",
    host: "Angie & Trevor Spencer",
    description: "Practical training tips for marathoners of all levels.",
    url: "https://marathontrainingacademy.com/podcast",
    category: "endurance",
  },
  {
    name: "Some Work, All Play",
    host: "David & Megan Roche",
    description: "Trail and ultrarunning training philosophy with joy and science.",
    url: "https://www.swaprunning.com/podcast",
    category: "endurance",
  },
  {
    name: "Huberman Lab",
    host: "Andrew Huberman",
    description: "Neuroscience of performance, sleep, focus, and recovery.",
    url: "https://hubermanlab.com/",
    category: "mindset",
  },
  {
    name: "The Triathlon Podcast",
    host: "Various",
    description: "Triathlon training, racing strategy, and athlete stories.",
    url: "https://thetricast.com/",
    category: "endurance",
  },
  {
    name: "Spartan Up!",
    host: "Joe De Sena",
    description: "OCR racing, Spartan events, and resilience mindset.",
    url: "https://www.spartan.com/blogs/unbreakable/podcast",
    category: "hyrox",
  },
  {
    name: "Ali on the Run",
    host: "Ali Feller",
    description: "Running community, race recaps, and athlete interviews.",
    url: "https://aliontherun.com/podcast/",
    category: "endurance",
  },
  {
    name: "The Performance Nutritionist",
    host: "Various",
    description: "Sports nutrition science for endurance and strength athletes.",
    url: "https://theperformancenutritionpodcast.com/",
    category: "nutrition",
  },
  {
    name: "Ben Greenfield Life",
    host: "Ben Greenfield",
    description: "Biohacking, performance, and longevity for athletes.",
    url: "https://bengreenfieldlife.com/podcast/",
    category: "mindset",
  },
  {
    name: "Endurance Innovation",
    host: "Dr. Steven Ingham",
    description: "Sports science and performance research for endurance athletes.",
    url: "https://enduranceinnovation.co.uk/podcast",
    category: "endurance",
  },
  {
    name: "The Movement Fix",
    host: "Dr. Ryan DeBell",
    description: "Mobility, injury prevention, and movement quality for athletes.",
    url: "https://themovementfix.com/podcast/",
    category: "strength",
  },
  {
    name: "Hurdle",
    host: "Emily Abbate",
    description: "How athletes overcame obstacles to reach their potential.",
    url: "https://emilyabbate.com/podcast/",
    category: "mindset",
  },
];

export function getDailyPodcast(): Podcast {
  return PODCASTS[dayOfYear() % PODCASTS.length];
}

export function getPodcastsByCategory(category: Podcast["category"]): Podcast[] {
  return PODCASTS.filter((p) => p.category === category);
}
