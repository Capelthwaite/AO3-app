export interface Fandom {
  id: string;
  name: string;
  category: string;
  popularity: number; // 1-10 scale for sorting
  aliases: string[]; // Alternative names for search
}

export const POPULAR_FANDOMS: Fandom[] = [
  // Books
  {
    id: 'harry-potter',
    name: 'Harry Potter - J. K. Rowling',
    category: 'Books & Literature',
    popularity: 10,
    aliases: ['Harry Potter', 'HP', 'Hogwarts', 'Wizarding World'],
  },
  {
    id: 'percy-jackson',
    name: 'Percy Jackson and the Olympians - Rick Riordan',
    category: 'Books & Literature',
    popularity: 8,
    aliases: ['Percy Jackson', 'PJO', 'Camp Half-Blood'],
  },
  {
    id: 'sherlock-holmes',
    name: 'Sherlock Holmes - Arthur Conan Doyle',
    category: 'Books & Literature',
    popularity: 9,
    aliases: ['Sherlock Holmes', 'Holmes', 'Watson'],
  },
  {
    id: 'good-omens',
    name: 'Good Omens - Neil Gaiman & Terry Pratchett',
    category: 'Books & Literature',
    popularity: 8,
    aliases: ['Good Omens', 'Aziraphale', 'Crowley'],
  },
  {
    id: 'six-of-crows',
    name: 'Six of Crows Series - Leigh Bardugo',
    category: 'Books & Literature',
    popularity: 7,
    aliases: ['Six of Crows', 'Grishaverse', 'Shadow and Bone'],
  },

  // Movies
  {
    id: 'marvel',
    name: 'Marvel Cinematic Universe',
    category: 'Movies',
    popularity: 10,
    aliases: ['Marvel', 'MCU', 'Avengers', 'Iron Man', 'Captain America'],
  },
  {
    id: 'star-wars',
    name: 'Star Wars - All Media Types',
    category: 'Movies',
    popularity: 9,
    aliases: ['Star Wars', 'Jedi', 'Sith', 'Force'],
  },
  {
    id: 'dc',
    name: 'DCU (Comics)',
    category: 'Movies',
    popularity: 8,
    aliases: ['DC', 'Batman', 'Superman', 'Wonder Woman', 'Justice League'],
  },
  {
    id: 'top-gun',
    name: 'Top Gun (Movies)',
    category: 'Movies',
    popularity: 7,
    aliases: ['Top Gun', 'Maverick', 'Rooster'],
  },

  // TV Shows
  {
    id: 'supernatural',
    name: 'Supernatural (TV 2005)',
    category: 'TV Shows',
    popularity: 9,
    aliases: ['Supernatural', 'SPN', 'Winchester', 'Dean', 'Sam'],
  },
  {
    id: 'teen-wolf',
    name: 'Teen Wolf (TV)',
    category: 'TV Shows',
    popularity: 8,
    aliases: ['Teen Wolf', 'Sterek', 'Scott McCall'],
  },
  {
    id: 'sherlock-bbc',
    name: 'Sherlock (TV)',
    category: 'TV Shows',
    popularity: 9,
    aliases: ['Sherlock BBC', 'Johnlock', 'Benedict Cumberbatch'],
  },
  {
    id: 'the-witcher',
    name: 'The Witcher (TV)',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['The Witcher', 'Geralt', 'Jaskier'],
  },
  {
    id: 'stranger-things',
    name: 'Stranger Things (TV 2016)',
    category: 'TV Shows',
    popularity: 8,
    aliases: ['Stranger Things', 'Hawkins', 'Eleven'],
  },
  {
    id: 'the-umbrella-academy',
    name: 'The Umbrella Academy (TV)',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['Umbrella Academy', 'Klaus', 'Five'],
  },

  // Anime & Manga
  {
    id: 'my-hero-academia',
    name: '僕のヒーローアカデミア | Boku no Hero Academia | My Hero Academia (Anime & Manga)',
    category: 'Anime & Manga',
    popularity: 9,
    aliases: ['My Hero Academia', 'MHA', 'BNHA', 'Deku', 'Bakugo'],
  },
  {
    id: 'naruto',
    name: 'Naruto (Anime & Manga)',
    category: 'Anime & Manga',
    popularity: 9,
    aliases: ['Naruto', 'Sasuke', 'Sakura', 'Kakashi'],
  },
  {
    id: 'haikyuu',
    name: 'Haikyuu!!',
    category: 'Anime & Manga',
    popularity: 8,
    aliases: ['Haikyuu', 'Volleyball', 'Kageyama', 'Hinata'],
  },
  {
    id: 'attack-on-titan',
    name: '進撃の巨人 | Shingeki no Kyojin | Attack on Titan (Anime)',
    category: 'Anime & Manga',
    popularity: 8,
    aliases: ['Attack on Titan', 'AOT', 'SNK', 'Eren', 'Levi'],
  },
  {
    id: 'demon-slayer',
    name: '鬼滅の刃 | Demon Slayer: Kimetsu no Yaiba (Anime)',
    category: 'Anime & Manga',
    popularity: 8,
    aliases: ['Demon Slayer', 'Kimetsu no Yaiba', 'Tanjiro'],
  },

  // K-Pop
  {
    id: 'bts',
    name: '방탄소년단 | Bangtan Boys | BTS',
    category: 'Music & Bands',
    popularity: 9,
    aliases: ['BTS', 'Bangtan', 'Jimin', 'Jungkook', 'V', 'RM'],
  },
  {
    id: 'stray-kids',
    name: 'Stray Kids (Band)',
    category: 'Music & Bands',
    popularity: 8,
    aliases: ['Stray Kids', 'SKZ', 'Bang Chan', 'Felix'],
  },

  // Video Games
  {
    id: 'genshin-impact',
    name: '原神 | Genshin Impact (Video Game)',
    category: 'Video Games',
    popularity: 8,
    aliases: ['Genshin Impact', 'Genshin', 'Diluc', 'Childe'],
  },
  {
    id: 'dream-smp',
    name: 'Dream SMP',
    category: 'Video Games',
    popularity: 7,
    aliases: ['Dream SMP', 'DSMP', 'Minecraft', 'Dream', 'Technoblade'],
  },

  // Additional Popular Fandoms
  {
    id: 'lord-of-the-rings',
    name: 'The Lord of the Rings - J. R. R. Tolkien',
    category: 'Books & Literature',
    popularity: 9,
    aliases: ['Lord of the Rings', 'LOTR', 'Hobbit', 'Middle Earth'],
  },
  {
    id: 'game-of-thrones',
    name: 'Game of Thrones (TV)',
    category: 'TV Shows',
    popularity: 8,
    aliases: ['Game of Thrones', 'GOT', 'ASOIAF', 'Jon Snow', 'Daenerys'],
  },
  {
    id: 'the-magnus-archives',
    name: 'The Magnus Archives (Podcast)',
    category: 'Podcasts',
    popularity: 7,
    aliases: ['Magnus Archives', 'TMA', 'Jonathan Sims'],
  },
];

export const FANDOM_CATEGORIES = [
  'All Categories',
  'Books & Literature',
  'Movies',
  'TV Shows',
  'Anime & Manga',
  'Music & Bands',
  'Video Games',
  'Podcasts',
];

export function searchFandoms(query: string): Fandom[] {
  if (!query.trim()) {
    return POPULAR_FANDOMS.sort((a, b) => b.popularity - a.popularity);
  }

  const searchTerm = query.toLowerCase();
  const matches = POPULAR_FANDOMS.filter(fandom => {
    const nameMatch = fandom.name.toLowerCase().includes(searchTerm);
    const aliasMatch = fandom.aliases.some(alias => 
      alias.toLowerCase().includes(searchTerm)
    );
    return nameMatch || aliasMatch;
  });

  // Sort by popularity, then by how early the match appears
  return matches.sort((a, b) => {
    const aEarlyMatch = Math.min(
      a.name.toLowerCase().indexOf(searchTerm),
      ...a.aliases.map(alias => alias.toLowerCase().indexOf(searchTerm)).filter(i => i >= 0)
    );
    const bEarlyMatch = Math.min(
      b.name.toLowerCase().indexOf(searchTerm),
      ...b.aliases.map(alias => alias.toLowerCase().indexOf(searchTerm)).filter(i => i >= 0)
    );

    if (aEarlyMatch !== bEarlyMatch) {
      return aEarlyMatch - bEarlyMatch; // Earlier matches first
    }
    return b.popularity - a.popularity; // Then by popularity
  });
}

export function getFandomById(id: string): Fandom | undefined {
  return POPULAR_FANDOMS.find(fandom => fandom.id === id);
}

export function getTopFandoms(count: number = 10): Fandom[] {
  return POPULAR_FANDOMS
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, count);
}