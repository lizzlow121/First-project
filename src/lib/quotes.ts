import { dayOfYear } from "./utils";

const FALLBACK_QUOTES = [
  { q: "The only way to define your limits is by going beyond them.", a: "Arthur C. Clarke" },
  { q: "It never gets easier, you just get better.", a: "Unknown" },
  { q: "Pain is temporary. Quitting lasts forever.", a: "Lance Armstrong" },
  { q: "The body achieves what the mind believes.", a: "Napoleon Hill" },
  { q: "Champions aren't made in the gyms. Champions are made from something they have deep inside them — a desire, a dream, a vision.", a: "Muhammad Ali" },
  { q: "Train hard, turn up, run your best, and the rest will take care of itself.", a: "Ron Clarke" },
  { q: "If it doesn't challenge you, it doesn't change you.", a: "Fred DeVito" },
  { q: "The difference between the impossible and the possible lies in a person's determination.", a: "Tommy Lasorda" },
  { q: "You have to wonder at times what you're doing out there. Over the years, I've given myself a thousand reasons to keep running, but it always comes back to where it started.", a: "Michael Flanagan" },
  { q: "Hard days are the best because that's when champions are made.", a: "Gabby Douglas" },
  { q: "Believe in yourself, take on your challenges, dig deep within yourself to conquer fears.", a: "Chantal Sutherland" },
  { q: "The road to athletic greatness is not marked by perfection, but the ability to constantly learn, adapt, and overcome adversity.", a: "Nike" },
  { q: "Obstacles don't have to stop you. If you run into a wall, don't turn around and give up. Figure out how to climb it.", a: "Michael Jordan" },
  { q: "Mental will is a muscle that needs exercise, just like muscles of the body.", a: "Lynn Jennings" },
  { q: "When you feel like quitting, think about why you started.", a: "Unknown" },
  { q: "Today I will do what others won't, so tomorrow I can accomplish what others can't.", a: "Jerry Rice" },
  { q: "You don't have to be great to start, but you have to start to be great.", a: "Zig Ziglar" },
  { q: "Every champion was once a contender that refused to give up.", a: "Rocky Balboa" },
  { q: "The more difficult the victory, the greater the happiness in winning.", a: "Pelé" },
  { q: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
  { q: "You miss 100% of the shots you don't take.", a: "Wayne Gretzky" },
  { q: "Most people give up just when they're about to achieve success.", a: "Ross Perot" },
  { q: "Ask yourself: 'Can I give more?' The answer is usually: 'Yes.'", a: "Paul Tergat" },
  { q: "There will be a day when you can no longer do this. Today is not that day.", a: "Unknown" },
  { q: "Push harder than yesterday if you want a different tomorrow.", a: "Vincent Williams Jr." },
  { q: "Someone who is busier than you is running right now.", a: "Unknown" },
  { q: "Don't count the days, make the days count.", a: "Muhammad Ali" },
  { q: "Run when you can, walk if you have to, crawl if you must; just never give up.", a: "Dean Karnazes" },
  { q: "No matter how slow you go, you are still lapping everybody on the couch.", a: "Unknown" },
  { q: "The miracle isn't that I finished. The miracle is that I had the courage to start.", a: "John Bingham" },
  { q: "Strength does not come from physical capacity. It comes from an indomitable will.", a: "Mahatma Gandhi" },
  { q: "I hated every minute of training, but I said, 'Don't quit. Suffer now and live the rest of your life as a champion.'", a: "Muhammad Ali" },
  { q: "You are braver than you believe, stronger than you seem, and smarter than you think.", a: "A.A. Milne" },
  { q: "One run can change your day. Many runs will change your life.", a: "Unknown" },
  { q: "Somewhere in the world, someone is training when you are not. When you race him, he will win.", a: "Tom Fleming" },
  { q: "Rest is not quitting; the fabric of the body repairs itself during rest.", a: "John Muir" },
  { q: "First, master the fundamentals.", a: "Larry Bird" },
  { q: "Do today what others won't, so tomorrow you can do what others can't.", a: "Unknown" },
  { q: "The harder you work for something, the greater you'll feel when you achieve it.", a: "Unknown" },
  { q: "Discipline is choosing between what you want now and what you want most.", a: "Abraham Lincoln" },
];

export interface Quote {
  q: string;
  a: string;
}

export async function getDailyQuote(): Promise<Quote> {
  try {
    const res = await fetch("https://zenquotes.io/api/today", { next: { revalidate: 3600 * 12 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.q) {
        return { q: data[0].q, a: data[0].a };
      }
    }
  } catch {
    // Fall through to static fallback
  }
  return FALLBACK_QUOTES[dayOfYear() % FALLBACK_QUOTES.length];
}
