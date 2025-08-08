export interface Fandom {
  id: string;
  name: string;
  category: string;
  popularity: number; // 1-10 scale
  aliases: string[];
}

// Comprehensive AO3 Fandom Database - Based on actual AO3 popularity data
export const COMPREHENSIVE_FANDOMS: Fandom[] = [
  // **TOP TIER FANDOMS (Popularity 10)**
  {
    id: 'marvel-mcu',
    name: 'Marvel Cinematic Universe',
    category: 'Movies',
    popularity: 10,
    aliases: ['Marvel', 'MCU', 'Marvel Movies', 'Avengers', 'Iron Man', 'Captain America'],
  },
  {
    id: 'harry-potter',
    name: 'Harry Potter - J. K. Rowling',
    category: 'Books & Literature',
    popularity: 10,
    aliases: ['Harry Potter', 'HP', 'Hogwarts', 'Wizarding World'],
  },
  {
    id: 'supernatural',
    name: 'Supernatural (TV 2005)',
    category: 'TV Shows',
    popularity: 10,
    aliases: ['Supernatural', 'SPN', 'Winchester', 'Dean', 'Sam', 'Castiel'],
  },
  {
    id: 'my-hero-academia',
    name: 'My Hero Academia (Anime & Manga)',
    category: 'Anime & Manga',
    popularity: 10,
    aliases: ['MHA', 'BNHA', 'Boku no Hero', 'Deku', 'Bakugou', 'Todoroki'],
  },
  {
    id: 'bts',
    name: 'Bangtan Boys | BTS (Music)',
    category: 'Music & Bands',
    popularity: 10,
    aliases: ['BTS', 'Bangtan', 'Jimin', 'Jungkook', 'Taehyung', 'V', 'RM', 'Suga', 'Jin', 'J-Hope'],
  },

  // **MAJOR FANDOMS (Popularity 9)**
  {
    id: 'dc-comics',
    name: 'Batman - All Media Types',
    category: 'Comics',
    popularity: 9,
    aliases: ['DC Comics', 'Batman', 'Superman', 'Wonder Woman', 'Justice League'],
  },
  {
    id: 'star-wars',
    name: 'Star Wars - All Media Types',
    category: 'Movies',
    popularity: 9,
    aliases: ['Star Wars', 'Jedi', 'Sith', 'Force', 'Luke Skywalker'],
  },
  {
    id: 'haikyuu',
    name: 'Haikyuu!!',
    category: 'Anime & Manga',
    popularity: 9,
    aliases: ['Haikyuu', 'Haikyu', 'Volleyball', 'Hinata', 'Kageyama'],
  },
  {
    id: 'genshin-impact',
    name: 'Genshin Impact (Video Game)',
    category: 'Video Games',
    popularity: 9,
    aliases: ['Genshin', 'Zhongli', 'Childe', 'Diluc', 'Kaeya', 'Xiao'],
  },
  {
    id: 'teen-wolf',
    name: 'Teen Wolf (TV)',
    category: 'TV Shows',
    popularity: 9,
    aliases: ['Teen Wolf', 'Stiles', 'Derek Hale', 'Scott McCall', 'Sterek'],
  },
  {
    id: 'sherlock',
    name: 'Sherlock (TV)',
    category: 'TV Shows',
    popularity: 9,
    aliases: ['Sherlock BBC', 'Johnlock', 'Benedict Cumberbatch', 'Martin Freeman'],
  },
  {
    id: 'naruto',
    name: 'Naruto (Anime & Manga)',
    category: 'Anime & Manga',
    popularity: 9,
    aliases: ['Naruto', 'Sasuke', 'Sakura', 'Kakashi', 'NaruSasu'],
  },
  {
    id: 'the-untamed',
    name: 'The Untamed (TV)',
    category: 'TV Shows',
    popularity: 9,
    aliases: ['The Untamed', 'Wei Wuxian', 'Lan Wangji', 'Wangxian', 'CQL'],
  },

  // **VERY POPULAR FANDOMS (Popularity 8)**
  {
    id: 'original-work',
    name: 'Original Work',
    category: 'Original',
    popularity: 8,
    aliases: ['Original Fiction', 'Original Characters', 'OC', 'Original Story'],
  },
  {
    id: 'star-trek',
    name: 'Star Trek: The Original Series',
    category: 'TV Shows',
    popularity: 8,
    aliases: ['Star Trek', 'TOS', 'Kirk', 'Spock', 'Enterprise'],
  },
  {
    id: 'final-fantasy',
    name: 'Final Fantasy VII (Video Game)',
    category: 'Video Games',
    popularity: 8,
    aliases: ['FF7', 'Cloud Strife', 'Sephiroth', 'Tifa', 'Aerith', 'Final Fantasy'],
  },
  {
    id: 'minecraft',
    name: 'Minecraft (Video Game)',
    category: 'Video Games',
    popularity: 8,
    aliases: ['Minecraft', 'MCYT', 'Dream SMP'],
  },
  {
    id: 'lotr',
    name: 'Lord of the Rings - J. R. R. Tolkien',
    category: 'Books & Literature',
    popularity: 8,
    aliases: ['LOTR', 'Lord of the Rings', 'Tolkien', 'Middle Earth', 'Aragorn', 'Legolas'],
  },
  {
    id: 'doctor-who',
    name: 'Doctor Who',
    category: 'TV Shows',
    popularity: 8,
    aliases: ['Doctor Who', 'The Doctor', 'TARDIS', 'Tenth Doctor', 'Eleventh Doctor'],
  },
  {
    id: 'game-of-thrones',
    name: 'Game of Thrones (TV)',
    category: 'TV Shows',
    popularity: 8,
    aliases: ['Game of Thrones', 'GOT', 'Jon Snow', 'Daenerys', 'Tyrion'],
  },
  {
    id: 'voltron',
    name: 'Voltron: Legendary Defender',
    category: 'TV Shows',
    popularity: 8,
    aliases: ['Voltron', 'VLD', 'Keith', 'Lance', 'Shiro', 'Klance'],
  },
  {
    id: 'attack-on-titan',
    name: 'Shingeki no Kyojin | Attack on Titan (Anime)',
    category: 'Anime & Manga',
    popularity: 8,
    aliases: ['Attack on Titan', 'SNK', 'Eren', 'Levi', 'Mikasa', 'Ereri'],
  },
  {
    id: 'dragon-age',
    name: 'Dragon Age (Video Games)',
    category: 'Video Games',
    popularity: 8,
    aliases: ['Dragon Age', 'Hawke', 'Fenris', 'Anders', 'Cullen'],
  },
  {
    id: 'stranger-things',
    name: 'Stranger Things (TV 2016)',
    category: 'TV Shows',
    popularity: 8,
    aliases: ['Stranger Things', 'Eleven', 'Hawkins', 'Upside Down', 'Steve Harrington'],
  },
  {
    id: 'dream-smp',
    name: 'Video Blogging RPF',
    category: 'Other Media',
    popularity: 8,
    aliases: ['Dream SMP', 'MCYT', 'TommyInnit', 'Wilbur Soot', 'Technoblade'],
  },
  {
    id: 'fire-emblem',
    name: 'Fire Emblem: Three Houses (Video Game)',
    category: 'Video Games',
    popularity: 8,
    aliases: ['Fire Emblem', 'Three Houses', 'Byleth', 'Claude', 'Dimitri'],
  },
  {
    id: 'modao-zushi',
    name: 'Módào Zǔshī - Mòxiāng Tóngxiù',
    category: 'Books & Literature',
    popularity: 8,
    aliases: ['MDZS', 'Mo Dao Zu Shi', 'Wei Wuxian', 'Lan Wangji'],
  },

  // **POPULAR FANDOMS (Popularity 7)**
  {
    id: 'one-direction',
    name: 'One Direction (Music)',
    category: 'Music & Bands',
    popularity: 7,
    aliases: ['One Direction', '1D', 'Harry Styles', 'Louis Tomlinson', 'Larry'],
  },
  {
    id: 'nct',
    name: 'NCT (Music)',
    category: 'Music & Bands',
    popularity: 7,
    aliases: ['NCT', 'Neo Culture Technology', 'Taeyong', 'Mark', 'Haechan'],
  },
  {
    id: 'miraculous-ladybug',
    name: 'Miraculous Ladybug',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['Miraculous', 'Ladybug', 'Chat Noir', 'Marinette', 'Adrien'],
  },
  {
    id: 'bungou-stray-dogs',
    name: 'Bungou Stray Dogs (Anime & Manga)',
    category: 'Anime & Manga',
    popularity: 7,
    aliases: ['Bungou Stray Dogs', 'BSD', 'Dazai', 'Chuuya', 'Atsushi'],
  },
  {
    id: 'homestuck',
    name: 'Homestuck',
    category: 'Other Media',
    popularity: 7,
    aliases: ['Homestuck', 'MSPA', 'John Egbert', 'Dave Strider'],
  },
  {
    id: 'stargate',
    name: 'Stargate SG-1',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['Stargate', 'SG1', 'Jack O\'Neill', 'Daniel Jackson'],
  },
  {
    id: 'jojo',
    name: 'JoJo no Kimyou na Bouken | JoJo\'s Bizarre Adventure',
    category: 'Anime & Manga',
    popularity: 7,
    aliases: ['JoJo', 'JoJo\'s Bizarre Adventure', 'Jotaro', 'Dio'],
  },
  {
    id: 'merlin',
    name: 'Merlin (TV)',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['Merlin BBC', 'Arthur Pendragon', 'Merthur', 'Camelot'],
  },
  {
    id: 'good-omens',
    name: 'Good Omens - Neil Gaiman & Terry Pratchett',
    category: 'Books & Literature',
    popularity: 7,
    aliases: ['Good Omens', 'Aziraphale', 'Crowley', 'Ineffable'],
  },
  {
    id: 'pokemon',
    name: 'Pocket Monsters | Pokemon - All Media Types',
    category: 'Anime & Manga',
    popularity: 7,
    aliases: ['Pokemon', 'Pokémon', 'Ash', 'Pikachu', 'Team Rocket'],
  },
  {
    id: 'one-piece',
    name: 'One Piece (Anime & Manga)',
    category: 'Anime & Manga',
    popularity: 7,
    aliases: ['One Piece', 'Luffy', 'Zoro', 'Sanji', 'Straw Hat Pirates'],
  },
  {
    id: 'dangan-ronpa',
    name: 'Dangan Ronpa - All Media Types',
    category: 'Video Games',
    popularity: 7,
    aliases: ['Danganronpa', 'Dangan Ronpa', 'Makoto', 'Kyoko', 'Hope\'s Peak'],
  },
  {
    id: 'stray-kids',
    name: 'Stray Kids (Music)',
    category: 'Music & Bands',
    popularity: 7,
    aliases: ['Stray Kids', 'SKZ', 'Bang Chan', 'Lee Know', 'Changbin'],
  },
  {
    id: 'once-upon-a-time',
    name: 'Once Upon a Time (TV)',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['OUAT', 'Once Upon a Time', 'Emma Swan', 'Regina Mills'],
  },
  {
    id: 'undertale',
    name: 'Undertale (Video Game)',
    category: 'Video Games',
    popularity: 7,
    aliases: ['Undertale', 'Sans', 'Papyrus', 'Frisk', 'Chara'],
  },
  {
    id: 'transformers',
    name: 'Transformers - All Media Types',
    category: 'Movies',
    popularity: 7,
    aliases: ['Transformers', 'Autobots', 'Decepticons', 'Optimus Prime'],
  },
  {
    id: 'avatar',
    name: 'Avatar: The Last Airbender',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['ATLA', 'Avatar', 'Aang', 'Katara', 'Zuko', 'Sokka'],
  },
  {
    id: 'hetalia',
    name: 'Hetalia: Axis Powers',
    category: 'Anime & Manga',
    popularity: 7,
    aliases: ['Hetalia', 'APH', 'America', 'England', 'USUK'],
  },
  {
    id: 'exo',
    name: 'EXO (Music)',
    category: 'Music & Bands',
    popularity: 7,
    aliases: ['EXO', 'Baekhyun', 'Chanyeol', 'Sehun', 'Kai'],
  },
  {
    id: 'shadowhunters',
    name: 'The Shadowhunter Chronicles - Cassandra Clare',
    category: 'Books & Literature',
    popularity: 7,
    aliases: ['Shadowhunters', 'Mortal Instruments', 'Malec', 'Clary', 'Jace'],
  },
  {
    id: 'percy-jackson',
    name: 'Percy Jackson and the Olympians - Rick Riordan',
    category: 'Books & Literature',
    popularity: 7,
    aliases: ['Percy Jackson', 'PJO', 'Camp Half-Blood', 'Riordanverse'],
  },
  {
    id: 'the-witcher',
    name: 'The Witcher (TV)',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['Witcher', 'Geralt', 'Jaskier', 'Yennefer', 'Ciri'],
  },
  {
    id: 'jujutsu-kaisen',
    name: 'Jujutsu Kaisen (Anime)',
    category: 'Anime & Manga',
    popularity: 7,
    aliases: ['JJK', 'Jujutsu Kaisen', 'Yuji Itadori', 'Gojo Satoru', 'Megumi'],
  },
  {
    id: 'glee',
    name: 'Glee',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['Glee', 'Rachel Berry', 'Kurt Hummel', 'Blaine Anderson'],
  },
  {
    id: 'yuri-on-ice',
    name: 'Yuri!!! on Ice (Anime)',
    category: 'Anime & Manga',
    popularity: 7,
    aliases: ['Yuri on Ice', 'YOI', 'Yuuri', 'Victor', 'Victuuri'],
  },
  {
    id: 'seventeen',
    name: 'SEVENTEEN (Music)',
    category: 'Music & Bands',
    popularity: 7,
    aliases: ['SEVENTEEN', 'SVT', 'Seungcheol', 'Jeonghan', 'Joshua'],
  },
  {
    id: 'persona',
    name: 'Persona 5 (Video Game)',
    category: 'Video Games',
    popularity: 7,
    aliases: ['Persona 5', 'Joker', 'Phantom Thieves', 'Akechi', 'Ryuji'],
  },
  {
    id: 'overwatch',
    name: 'Overwatch (Video Game)',
    category: 'Video Games',
    popularity: 7,
    aliases: ['Overwatch', 'Tracer', 'Widowmaker', 'Mercy', 'Reaper76'],
  },
  {
    id: 'buffy',
    name: 'Buffy the Vampire Slayer (TV)',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['Buffy', 'Buffy TVS', 'Spike', 'Angel', 'Willow'],
  },
  {
    id: 'rwby',
    name: 'RWBY',
    category: 'Other Media',
    popularity: 7,
    aliases: ['RWBY', 'Ruby Rose', 'Weiss Schnee', 'Blake Belladonna', 'Yang'],
  },
  {
    id: 'the-100',
    name: 'The 100 (TV)',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['The 100', '100', 'Clarke Griffin', 'Bellamy Blake', 'Bellarke'],
  },
  {
    id: 'hannibal',
    name: 'Hannibal (TV)',
    category: 'TV Shows',
    popularity: 7,
    aliases: ['Hannibal', 'Will Graham', 'Hannigram', 'Mads Mikkelsen'],
  },

  // **SOLID FANDOMS (Popularity 6)**
  {
    id: 'mens-football-rpf',
    name: 'Men\'s Football RPF',
    category: 'Sports RPF',
    popularity: 6,
    aliases: ['Football RPF', 'Soccer RPF', 'Real Madrid', 'Barcelona'],
  },
  {
    id: 'sanders-sides',
    name: 'Sanders Sides (Web Series)',
    category: 'Other Media',
    popularity: 6,
    aliases: ['Sanders Sides', 'Thomas Sanders', 'Logan', 'Roman', 'Virgil'],
  },
  {
    id: 'criminal-minds',
    name: 'Criminal Minds (US TV)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['Criminal Minds', 'CM', 'Spencer Reid', 'Derek Morgan', 'Aaron Hotchner'],
  },
  {
    id: 'zelda',
    name: 'The Legend of Zelda & Related Fandoms',
    category: 'Video Games',
    popularity: 6,
    aliases: ['Zelda', 'Link', 'Princess Zelda', 'Breath of the Wild', 'BOTW'],
  },
  {
    id: 'hockey-rpf',
    name: 'Hockey RPF',
    category: 'Sports RPF',
    popularity: 6,
    aliases: ['Hockey RPF', 'NHL RPF', 'Sidney Crosby', 'Patrick Kane'],
  },
  {
    id: 'mass-effect',
    name: 'Mass Effect',
    category: 'Video Games',
    popularity: 6,
    aliases: ['Mass Effect', 'Shepard', 'Garrus', 'Tali', 'Liara'],
  },
  {
    id: 'johnnys',
    name: 'Johnny\'s Entertainment',
    category: 'Music & Bands',
    popularity: 6,
    aliases: ['Johnny\'s', 'Arashi', 'KAT-TUN', 'NEWS', 'Yamapi'],
  },
  {
    id: 'detroit-become-human',
    name: 'Detroit: Become Human (Video Game)',
    category: 'Video Games',
    popularity: 6,
    aliases: ['Detroit', 'Connor', 'Markus', 'Kara', 'Hank'],
  },
  {
    id: 'yu-gi-oh',
    name: 'Yu-Gi-Oh! - All Media Types',
    category: 'Anime & Manga',
    popularity: 6,
    aliases: ['Yu-Gi-Oh', 'Yugi', 'Kaiba', 'Duel Monsters'],
  },
  {
    id: 'critical-role',
    name: 'Critical Role (Web Series)',
    category: 'Other Media',
    popularity: 6,
    aliases: ['Critical Role', 'Vox Machina', 'Mighty Nein', 'Bells Hells'],
  },
  {
    id: 'ace-attorney',
    name: 'Gyakuten Saiban | Ace Attorney',
    category: 'Video Games',
    popularity: 6,
    aliases: ['Ace Attorney', 'Phoenix Wright', 'Miles Edgeworth', 'Narumitsu'],
  },
  {
    id: 'owl-house',
    name: 'The Owl House (Cartoon)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['Owl House', 'Luz', 'Amity', 'Lumity', 'Eda'],
  },
  {
    id: 'walking-dead',
    name: 'The Walking Dead (TV)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['Walking Dead', 'TWD', 'Rick Grimes', 'Daryl Dixon'],
  },
  {
    id: '911',
    name: '9-1-1 (TV)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['911', '9-1-1', 'Buck', 'Eddie', 'Buddie'],
  },
  {
    id: 'bleach',
    name: 'Bleach (Anime & Manga)',
    category: 'Anime & Manga',
    popularity: 6,
    aliases: ['Bleach', 'Ichigo', 'Rukia', 'Renji', 'Byakuya'],
  },
  {
    id: 'f1-rpf',
    name: 'Formula 1 RPF',
    category: 'Sports RPF',
    popularity: 6,
    aliases: ['Formula 1 RPF', 'F1 RPF', 'Lewis Hamilton', 'Max Verstappen'],
  },
  {
    id: 'tmnt',
    name: 'Teenage Mutant Ninja Turtles - All Media Types',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['TMNT', 'Ninja Turtles', 'Leonardo', 'Donatello', 'Raphael'],
  },
  {
    id: 'vampire-diaries',
    name: 'The Vampire Diaries (TV)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['TVD', 'Vampire Diaries', 'Damon', 'Stefan', 'Elena'],
  },
  {
    id: 'kingdom-hearts',
    name: 'Kingdom Hearts',
    category: 'Video Games',
    popularity: 6,
    aliases: ['Kingdom Hearts', 'Sora', 'Riku', 'Kairi', 'Axel'],
  },
  {
    id: 'les-mis',
    name: 'Les Misérables - All Media Types',
    category: 'Books & Literature',
    popularity: 6,
    aliases: ['Les Mis', 'Les Misérables', 'Enjolras', 'Grantaire', 'Jean Valjean'],
  },
  {
    id: 'magnus-archives',
    name: 'The Magnus Archives (Podcast)',
    category: 'Other Media',
    popularity: 6,
    aliases: ['Magnus Archives', 'TMA', 'Jon Sims', 'Martin Blackwood'],
  },
  {
    id: 'x-files',
    name: 'The X-Files',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['X-Files', 'Mulder', 'Scully', 'MSR', 'Fox Mulder'],
  },
  {
    id: 'fullmetal-alchemist',
    name: 'Fullmetal Alchemist - All Media Types',
    category: 'Anime & Manga',
    popularity: 6,
    aliases: ['FMA', 'Fullmetal Alchemist', 'Edward Elric', 'Roy Mustang'],
  },
  {
    id: 'fnaf',
    name: 'Five Nights at Freddy\'s',
    category: 'Video Games',
    popularity: 6,
    aliases: ['FNAF', 'Five Nights at Freddys', 'Freddy Fazbear'],
  },
  {
    id: 'ofmd',
    name: 'Our Flag Means Death (TV)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['OFMD', 'Blackbeard', 'Stede Bonnet', 'Gentlebeard', 'Ed Teach'],
  },
  {
    id: 'south-park',
    name: 'South Park',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['South Park', 'Stan', 'Kyle', 'Cartman', 'Kenny'],
  },
  {
    id: 'gravity-falls',
    name: 'Gravity Falls',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['Gravity Falls', 'Dipper', 'Mabel', 'Bill Cipher', 'Stanford'],
  },

  // Add Supergirl and other missing fandoms you mentioned
  {
    id: 'supergirl',
    name: 'Supergirl (TV 2015)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['Supergirl', 'Kara Danvers', 'Alex Danvers', 'Lena Luthor', 'SuperCorp'],
  },
  {
    id: 'lucifer',
    name: 'Lucifer (TV)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['Lucifer', 'Lucifer Morningstar', 'Chloe Decker', 'Deckerstar'],
  },
  {
    id: 'bridgerton',
    name: 'Bridgerton (TV)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['Bridgerton', 'Anthony Bridgerton', 'Kate Sharma', 'Daphne Bridgerton'],
  },
  {
    id: 'heartstopper',
    name: 'Heartstopper (TV)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['Heartstopper', 'Nick Nelson', 'Charlie Spring', 'Nick and Charlie'],
  },
  {
    id: 'wednesday',
    name: 'Wednesday (TV 2022)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['Wednesday', 'Wednesday Addams', 'Enid Sinclair', 'Wenclair'],
  },
  {
    id: 'arcane',
    name: 'Arcane: League of Legends (Cartoon 2021)',
    category: 'TV Shows',
    popularity: 8,
    aliases: ['Arcane', 'League of Legends', 'Vi', 'Jinx', 'Caitlyn', 'Jayce', 'Viktor'],
  },
  {
    id: 'gen-v',
    name: 'Gen V (TV 2023)',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['Gen V', 'The Boys Gen V', 'Marie Moreau', 'Jordan Li'],
  },
  {
    id: 'kpop-demon-hunters',
    name: 'K-Pop Demon Hunters (Web Series)',
    category: 'Other Media',
    popularity: 5,
    aliases: ['K-Pop Demon Hunters', 'KPDH', 'Kpop Demon Hunters'],
  },
  {
    id: 'kpop-demon-hunters-2025',
    name: 'KPop Demon Hunters (2025)',
    category: 'Other Media',
    popularity: 6,
    aliases: ['KPop Demon Hunters (2025)', 'KPDH 2025', 'Kpop Demon Hunters 2025'],
  },

  // Continue with more comprehensive fandoms...
  {
    id: 'ateez',
    name: 'ATEEZ (Music)',
    category: 'Music & Bands',
    popularity: 6,
    aliases: ['ATEEZ', 'Hongjoong', 'Seonghwa', 'Yunho', 'Yeosang'],
  },
  {
    id: 'enhypen',
    name: 'ENHYPEN (Music)',
    category: 'Music & Bands',
    popularity: 6,
    aliases: ['ENHYPEN', 'Heeseung', 'Jay', 'Jake', 'Sunghoon'],
  },
  {
    id: 'txt',
    name: 'TOMORROW X TOGETHER (Music)',
    category: 'Music & Bands',
    popularity: 6,
    aliases: ['TXT', 'Tomorrow X Together', 'Yeonjun', 'Soobin', 'Beomgyu'],
  },
  {
    id: 'aespa',
    name: 'aespa (Music)',
    category: 'Music & Bands',
    popularity: 6,
    aliases: ['aespa', 'Karina', 'Winter', 'Giselle', 'Ningning'],
  },
  {
    id: 'itzy',
    name: 'ITZY (Music)',
    category: 'Music & Bands',
    popularity: 6,
    aliases: ['ITZY', 'Yeji', 'Lia', 'Ryujin', 'Chaeryeong', 'Yuna'],
  },

  // Gaming fandoms
  {
    id: 'valorant',
    name: 'VALORANT (Video Game)',
    category: 'Video Games',
    popularity: 6,
    aliases: ['VALORANT', 'Sage', 'Jett', 'Phoenix', 'Sova'],
  },
  {
    id: 'league-of-legends',
    name: 'League of Legends',
    category: 'Video Games',
    popularity: 6,
    aliases: ['LoL', 'League', 'Ahri', 'Ezreal', 'Jinx', 'Vi'],
  },
  {
    id: 'among-us',
    name: 'Among Us (Video Game)',
    category: 'Video Games',
    popularity: 5,
    aliases: ['Among Us', 'Crewmate', 'Impostor', 'Sus'],
  },

  // More TV shows
  {
    id: 'house-md',
    name: 'House M.D.',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['House', 'House MD', 'Gregory House', 'Wilson'],
  },
  {
    id: 'ncis',
    name: 'NCIS',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['NCIS', 'Gibbs', 'Tony DiNozzo', 'Ziva David'],
  },
  {
    id: 'greys-anatomy',
    name: 'Grey\'s Anatomy',
    category: 'TV Shows',
    popularity: 6,
    aliases: ['Greys Anatomy', 'Meredith Grey', 'Derek Shepherd', 'MerDer'],
  },

  // Books and Literature
  {
    id: 'six-of-crows',
    name: 'Six of Crows Series - Leigh Bardugo',
    category: 'Books & Literature',
    popularity: 7,
    aliases: ['Six of Crows', 'Grishaverse', 'Shadow and Bone', 'Leigh Bardugo'],
  },
  {
    id: 'red-white-royal-blue',
    name: 'Red, White & Royal Blue - Casey McQuiston',
    category: 'Books & Literature',
    popularity: 7,
    aliases: ['Red White Royal Blue', 'RWRB', 'Alex Claremont-Diaz', 'Henry Fox-Mountchristen-Windsor'],
  },
  {
    id: 'all-for-the-game',
    name: 'All For The Game - Nora Sakavic',
    category: 'Books & Literature',
    popularity: 7,
    aliases: ['All For The Game', 'AFTG', 'Foxhole Court', 'Neil Josten'],
  },
];

// Search function that matches the current API
export function searchFandoms(query: string): Fandom[] {
  if (!query.trim()) {
    return COMPREHENSIVE_FANDOMS.sort((a, b) => b.popularity - a.popularity);
  }
  
  const lowerQuery = query.toLowerCase();
  return COMPREHENSIVE_FANDOMS.filter(fandom => 
    fandom.name.toLowerCase().includes(lowerQuery) ||
    fandom.aliases.some(alias => alias.toLowerCase().includes(lowerQuery)) ||
    fandom.category.toLowerCase().includes(lowerQuery)
  ).sort((a, b) => b.popularity - a.popularity);
}

// Get top fandoms for initial display
export function getTopFandoms(limit: number = 20): Fandom[] {
  return COMPREHENSIVE_FANDOMS
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

// Get fandoms by category
export function getFandomsByCategory(category: string): Fandom[] {
  return COMPREHENSIVE_FANDOMS
    .filter(fandom => fandom.category === category)
    .sort((a, b) => b.popularity - a.popularity);
}

// Get all unique categories
export function getFandomCategories(): string[] {
  return [...new Set(COMPREHENSIVE_FANDOMS.map(fandom => fandom.category))].sort();
}