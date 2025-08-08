export interface FandomCharacters {
  fandomId: string;
  fandomName: string;
  topCharacters: string[];
  topPairings: string[];
}

// Top 5 characters and pairings for each major fandom
export const FANDOM_CHARACTERS: FandomCharacters[] = [
  // Harry Potter
  {
    fandomId: 'harry-potter',
    fandomName: 'Harry Potter - J. K. Rowling',
    topCharacters: ['Harry Potter', 'Hermione Granger', 'Draco Malfoy', 'Severus Snape', 'Ron Weasley'],
    topPairings: ['Draco Malfoy/Harry Potter', 'Hermione Granger/Draco Malfoy', 'James Potter/Lily Evans Potter', 'Sirius Black/Remus Lupin', 'Harry Potter/Severus Snape']
  },

  // Supernatural
  {
    fandomId: 'supernatural',
    fandomName: 'Supernatural (TV 2005)',
    topCharacters: ['Dean Winchester', 'Sam Winchester', 'Castiel', 'Bobby Singer', 'Gabriel'],
    topPairings: ['Castiel/Dean Winchester', 'Sam Winchester/Dean Winchester', 'Gabriel/Sam Winchester', 'Crowley/Dean Winchester', 'Castiel/Sam Winchester']
  },

  // Marvel MCU
  {
    fandomId: 'marvel-mcu',
    fandomName: 'Marvel Cinematic Universe',
    topCharacters: ['Tony Stark', 'Steve Rogers', 'Bucky Barnes', 'Natasha Romanov', 'Clint Barton'],
    topPairings: ['James "Bucky" Barnes/Steve Rogers', 'Tony Stark/Steve Rogers', 'Clint Barton/Natasha Romanov', 'James "Bucky" Barnes/Tony Stark', 'Pepper Potts/Tony Stark']
  },

  // The 100
  {
    fandomId: 'the-100',
    fandomName: 'The 100 (TV)',
    topCharacters: ['Clarke Griffin', 'Bellamy Blake', 'Octavia Blake', 'Lexa', 'Raven Reyes'],
    topPairings: ['Bellamy Blake/Clarke Griffin', 'Clarke Griffin/Lexa', 'Octavia Blake/Lincoln', 'Marcus Kane/Abby Griffin', 'John Murphy/Emori']
  },

  // Arcane
  {
    fandomId: 'arcane',
    fandomName: 'Arcane: League of Legends (Cartoon 2021)',
    topCharacters: ['Vi', 'Jinx', 'Caitlyn', 'Jayce', 'Viktor'],
    topPairings: ['Caitlyn/Vi', 'Jayce/Viktor', 'Jinx/Silco', 'Ekko/Jinx', 'Mel Medarda/Jayce']
  },

  // Supergirl
  {
    fandomId: 'supergirl',
    fandomName: 'Supergirl (TV 2015)',
    topCharacters: ['Kara Danvers', 'Lena Luthor', 'Alex Danvers', 'Maggie Sawyer', 'Mon-El'],
    topPairings: ['Kara Danvers/Lena Luthor', 'Alex Danvers/Maggie Sawyer', 'Kara Danvers/Mon-El', 'Alex Danvers/Kelly Olsen', 'Cat Grant/Kara Danvers']
  },

  // Gen V
  {
    fandomId: 'gen-v',
    fandomName: 'Gen V (TV 2023)',
    topCharacters: ['Marie Moreau', 'Jordan Li', 'Andre Anderson', 'Emma Meyer', 'Sam Riordan'],
    topPairings: ['Jordan Li/Marie Moreau', 'Andre Anderson/Cate Dunlap', 'Emma Meyer/Sam Riordan', 'Jordan Li/Andre Anderson', 'Marie Moreau/Emma Meyer']
  },

  // My Hero Academia
  {
    fandomId: 'my-hero-academia',
    fandomName: 'My Hero Academia (Anime & Manga)',
    topCharacters: ['Midoriya Izuku', 'Bakugou Katsuki', 'Todoroki Shouto', 'Kirishima Eijirou', 'Iida Tenya'],
    topPairings: ['Bakugou Katsuki/Midoriya Izuku', 'Kirishima Eijirou/Bakugou Katsuki', 'Midoriya Izuku/Todoroki Shouto', 'Todoroki Shouto/Bakugou Katsuki', 'Aizawa Shouta/Yamada Hizashi']
  },

  // Teen Wolf
  {
    fandomId: 'teen-wolf',
    fandomName: 'Teen Wolf (TV)',
    topCharacters: ['Stiles Stilinski', 'Derek Hale', 'Scott McCall', 'Lydia Martin', 'Isaac Lahey'],
    topPairings: ['Derek Hale/Stiles Stilinski', 'Scott McCall/Stiles Stilinski', 'Allison Argent/Scott McCall', 'Jackson Whittemore/Lydia Martin', 'Isaac Lahey/Scott McCall']
  },

  // Sherlock
  {
    fandomId: 'sherlock',
    fandomName: 'Sherlock (TV)',
    topCharacters: ['Sherlock Holmes', 'John Watson', 'Mycroft Holmes', 'Jim Moriarty', 'Greg Lestrade'],
    topPairings: ['Sherlock Holmes/John Watson', 'Mycroft Holmes/Greg Lestrade', 'Jim Moriarty/Sherlock Holmes', 'Irene Adler/Sherlock Holmes', 'John Watson/Mary Morstan']
  },

  // BTS
  {
    fandomId: 'bts',
    fandomName: 'Bangtan Boys | BTS (Music)',
    topCharacters: ['Park Jimin', 'Jeon Jungkook', 'Kim Taehyung | V', 'Min Yoongi | Suga', 'Kim Namjoon | RM'],
    topPairings: ['Jeon Jungkook/Park Jimin', 'Kim Taehyung | V/Park Jimin', 'Jung Hoseok | J-Hope/Min Yoongi | Suga', 'Jeon Jungkook/Kim Taehyung | V', 'Kim Namjoon | RM/Kim Seokjin | Jin']
  },

  // Haikyuu
  {
    fandomId: 'haikyuu',
    fandomName: 'Haikyuu!!',
    topCharacters: ['Hinata Shouyou', 'Kageyama Tobio', 'Tsukishima Kei', 'Oikawa Tooru', 'Kuroo Tetsurou'],
    topPairings: ['Hinata Shouyou/Kageyama Tobio', 'Iwaizumi Hajime/Oikawa Tooru', 'Akaashi Keiji/Bokuto Koutarou', 'Kuroo Tetsurou/Tsukishima Kei', 'Kozume Kenma/Kuroo Tetsurou']
  },

  // Genshin Impact
  {
    fandomId: 'genshin-impact',
    fandomName: 'Genshin Impact (Video Game)',
    topCharacters: ['Zhongli', 'Childe', 'Diluc', 'Kaeya', 'Xiao'],
    topPairings: ['Childe/Zhongli', 'Diluc/Kaeya', 'Albedo/Aether', 'Chongyun/Xingqiu', 'Razor/Bennett']
  },

  // Attack on Titan
  {
    fandomId: 'attack-on-titan',
    fandomName: 'Shingeki no Kyojin | Attack on Titan (Anime)',
    topCharacters: ['Levi Ackerman', 'Eren Yeager', 'Mikasa Ackerman', 'Armin Arlert', 'Erwin Smith'],
    topPairings: ['Levi Ackerman/Eren Yeager', 'Erwin Smith/Levi Ackerman', 'Eren Yeager/Mikasa Ackerman', 'Annie Leonhart/Armin Arlert', 'Jean Kirstein/Marco Bott']
  },

  // Star Wars
  {
    fandomId: 'star-wars',
    fandomName: 'Star Wars - All Media Types',
    topCharacters: ['Obi-Wan Kenobi', 'Anakin Skywalker', 'Luke Skywalker', 'Han Solo', 'Leia Organa'],
    topPairings: ['Obi-Wan Kenobi/Anakin Skywalker', 'Han Solo/Leia Organa', 'Finn/Poe Dameron', 'Rey/Ben Solo', 'Padmé Amidala/Anakin Skywalker']
  },

  // DC Comics
  {
    fandomId: 'dc-comics',
    fandomName: 'Batman - All Media Types',
    topCharacters: ['Bruce Wayne', 'Dick Grayson', 'Jason Todd', 'Tim Drake', 'Damian Wayne'],
    topPairings: ['Tim Drake/Jason Todd', 'Bruce Wayne/Clark Kent', 'Dick Grayson/Jason Todd', 'Roy Harper/Jason Todd', 'Stephanie Brown/Tim Drake']
  },

  // K-Pop Demon Hunters
  {
    fandomId: 'kpop-demon-hunters',
    fandomName: 'K-Pop Demon Hunters (Web Series)',
    topCharacters: ['Siyeon', 'JiU', 'SuA', 'Yoohyeon', 'Dami'],
    topPairings: ['JiU/SuA', 'Siyeon/Yoohyeon', 'Dami/Gahyeon', 'JiU/Yoohyeon', 'SuA/Siyeon']
  },

  // KPop Demon Hunters (2025)
  {
    fandomId: 'kpop-demon-hunters-2025',
    fandomName: 'KPop Demon Hunters (2025)',
    topCharacters: ['Rumi', 'Zoey', 'Mira', 'Jinu', 'Bobby'],
    topPairings: ['Jinu/Rumi', 'Mira/Rumi/Zoey', 'Mira/Zoey', 'Mystery/Zoey', 'Mira & Rumi & Zoey']
  }
];

// Function to get characters for selected fandoms
export function getCharactersForFandoms(fandomNames: string[]): string[] {
  const allCharacters: string[] = [];
  
  fandomNames.forEach(fandomName => {
    const fandomData = FANDOM_CHARACTERS.find(f => 
      f.fandomName === fandomName || 
      f.fandomId === fandomName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    );
    
    if (fandomData) {
      allCharacters.push(...fandomData.topCharacters, ...fandomData.topPairings);
    }
  });
  
  // Remove duplicates and return top 10
  return [...new Set(allCharacters)].slice(0, 10);
}

// Function to get pairings organized by fandom
export function getPairingsForFandoms(fandomNames: string[]): Array<{fandomName: string, pairings: string[]}> {
  const fandomPairings: Array<{fandomName: string, pairings: string[]}> = [];
  
  fandomNames.forEach(fandomName => {
    const fandomData = FANDOM_CHARACTERS.find(f => 
      f.fandomName === fandomName || 
      f.fandomId === fandomName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    );
    
    if (fandomData) {
      fandomPairings.push({
        fandomName: fandomData.fandomName,
        pairings: fandomData.topPairings.slice(0, 5) // Only actual pairings, not individual characters
      });
    }
  });
  
  return fandomPairings;
}

// Function to search pairings across selected fandoms
export function searchPairingsInFandoms(query: string, fandomNames: string[]): string[] {
  if (!query.trim()) return [];
  
  const allPairings: string[] = [];
  const lowerQuery = query.toLowerCase();
  
  fandomNames.forEach(fandomName => {
    const fandomData = FANDOM_CHARACTERS.find(f => 
      f.fandomName === fandomName || 
      f.fandomId === fandomName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    );
    
    if (fandomData) {
      // Search in pairings
      const matchingPairings = fandomData.topPairings.filter(pairing =>
        pairing.toLowerCase().includes(lowerQuery)
      );
      
      // Also create potential pairings if user types a character name
      const matchingCharacters = fandomData.topCharacters.filter(char =>
        char.toLowerCase().includes(lowerQuery)
      );
      
      // For each matching character, suggest pairings with other top characters
      matchingCharacters.forEach(matchingChar => {
        fandomData.topCharacters.forEach(otherChar => {
          if (matchingChar !== otherChar) {
            const pairing1 = `${matchingChar}/${otherChar}`;
            const pairing2 = `${otherChar}/${matchingChar}`;
            
            // Add both combinations, but prioritize existing popular pairings
            if (fandomData.topPairings.includes(pairing1)) {
              allPairings.push(pairing1);
            } else if (fandomData.topPairings.includes(pairing2)) {
              allPairings.push(pairing2);
            } else {
              // Add the combination if it doesn't exist in popular pairings
              allPairings.push(pairing1);
            }
          }
        });
      });
      
      allPairings.push(...matchingPairings);
    }
  });
  
  // Remove duplicates and return top 10
  return [...new Set(allPairings)].slice(0, 10);
}