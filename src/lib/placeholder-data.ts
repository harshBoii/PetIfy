
import { Timestamp } from "firebase/firestore";

export interface Pet {
  _id: any;
  id: string;
  name: string;
  type: 'Dog' | 'Cat' | 'Bird' | 'Rabbit' | 'Other';
  breed: string;
  age: string;
  gender: 'Male' | 'Female' | 'Unknown';
  location: string;
  listingType: 'Adoption' | 'Sale' | 'Foster' | 'Stray';
  imageUrl: string;
  description: string;
  price?: number;
  healthRecords?: string[];
  vaccinations?: string[];
  ownerId?: string;
  createdAt?: any;
  reporterContact?: string;
}

export const pets: Omit<Pet, 'id' | 'createdAt' | 'ownerId'>[] = [
  {
      name: "Buddy",
      type: "Dog",
      breed: "Golden Retriever",
      age: "2 years",
      gender: "Male",
      location: "Sunnyvale, CA",
      listingType: "Adoption",
      imageUrl: "https://placehold.co/600x400.png",
      description: "Buddy is a friendly and energetic Golden Retriever looking for a forever home. He loves to play fetch and go on long walks. Great with kids and other dogs.",
      _id: undefined
  },
  {
      name: "Lucy",
      type: "Cat",
      breed: "Siamese",
      age: "1 year",
      gender: "Female",
      location: "San Francisco, CA",
      listingType: "Adoption",
      imageUrl: "https://placehold.co/600x400.png",
      description: "Lucy is a beautiful and affectionate Siamese cat. She loves to cuddle and is great with children and other pets. Enjoys sunny spots and laser pointers.",
      _id: undefined
  },
  {
      name: "Max",
      type: "Dog",
      breed: "German Shepherd",
      age: "3 years",
      gender: "Male",
      location: "Oakland, CA",
      listingType: "Sale",
      price: 500,
      imageUrl: "https://placehold.co/600x400.png",
      description: "Max is a loyal and intelligent German Shepherd. He is well-trained and would make a great family protector. Knows basic commands and is house-trained.",
      _id: undefined
  },
  {
      name: "Daisy",
      type: "Rabbit",
      breed: "Holland Lop",
      age: "6 months",
      gender: "Female",
      location: "Berkeley, CA",
      listingType: "Foster",
      imageUrl: "https://placehold.co/600x400.png",
      description: "Daisy is a sweet and curious Holland Lop. She is litter-trained and loves to be petted. Needs a calm environment to thrive.",
      _id: undefined
  },
   {
       name: "Charlie",
       type: "Dog",
       breed: "Beagle",
       age: "4 years",
       gender: "Male",
       location: "Palo Alto, CA",
       listingType: "Adoption",
       imageUrl: "https://placehold.co/600x400.png",
       description: "Charlie is a cheerful and playful Beagle. He gets along well with everyone and enjoys exploring new scents on his walks.",
       _id: undefined
   },
  {
      name: "Misty",
      type: "Cat",
      breed: "Persian",
      age: "2 years",
      gender: "Female",
      location: "San Jose, CA",
      listingType: "Sale",
      price: 800,
      imageUrl: "https://placehold.co/600x400.png",
      description: "Misty is a calm and gentle Persian cat with a luxurious long coat. She loves a quiet and peaceful environment and requires regular grooming.",
      _id: undefined
  },
  {
      name: "Rocky",
      type: "Dog",
      breed: "Boxer",
      age: "1.5 years",
      gender: "Male",
      location: "Fremont, CA",
      listingType: "Foster",
      imageUrl: "https://placehold.co/600x400.png",
      description: "Rocky is a high-energy Boxer who needs a foster home with a big yard. He is very affectionate and loves to play fetch for hours.",
      _id: undefined
  },
  {
      name: "Kiwi",
      type: "Bird",
      breed: "Parakeet",
      age: "1 year",
      gender: "Male",
      location: "Santa Clara, CA",
      listingType: "Adoption",
      imageUrl: "https://placehold.co/600x400.png",
      description: "Kiwi is a bright and cheerful Parakeet. He can mimic a few words and loves to sing in the morning. Comes with his cage and toys.",
      _id: undefined
  },
  {
      name: "Found Stray",
      type: "Cat",
      breed: "Domestic Shorthair",
      age: "Unknown",
      gender: "Unknown",
      location: "Downtown Park",
      listingType: "Stray",
      imageUrl: "https://placehold.co/600x400.png",
      description: "Friendly calico cat found near the main fountain. Seems healthy but is a bit skinny. No collar or tags. Very affectionate.",
      _id: undefined
  },
  {
      name: "Found Stray",
      type: "Dog",
      breed: "Terrier Mix",
      age: "Young adult",
      gender: "Male",
      location: "Elm Street",
      listingType: "Stray",
      imageUrl: "https://placehold.co/600x400.png",
      description: "Small, scruffy terrier mix found wandering on Elm St. A bit shy but wags his tail when approached. Seems to know how to walk on a leash.",
      _id: undefined
  }
];

export interface CommunityGroup {
    _id: any;
    id: string;
    name: string;
    description: string;
    members: number;
    imageUrl: string;
    ownerId?: string;
    createdAt?: Timestamp;
    memberIds?: string[];
}

export const communityGroups: Omit<CommunityGroup, 'id' | 'createdAt' | 'ownerId'>[] = [
    {
        name: "Dog Lovers Unite",
        description: "A group for all things dog-related! Share photos, stories, and advice.",
        members: 125,
        imageUrl: "https://placehold.co/600x400.png",
        _id: undefined
    },
    {
      name: "Cat Fanciers Club",
      description: "For those who appreciate the elegance and mystery of cats. All breeds welcome.",
      members: 88,
      imageUrl: "https://placehold.co/600x400.png",
      _id: undefined
    },
    {
      name: "Bay Area Adoptions",
      description: "Connecting rescue animals with loving homes in the Bay Area.",
      members: 210,
      imageUrl: "https://placehold.co/600x400.png",
      _id: undefined
    },
    {
      name: "Rabbit & Small Pet Owners",
      description: "A community for owners of rabbits, guinea pigs, hamsters, and other small furry friends.",
      members: 45,
      imageUrl: "https://placehold.co/600x400.png",
      _id: undefined
    },
    {
      name: "Exotic Bird Keepers",
      description: "Share your passion for parrots, finches, and other exotic birds. Tips, tricks, and beautiful photos.",
      members: 62,
      imageUrl: "https://placehold.co/600x400.png",
      _id: undefined
    }
];

export interface Comment {
  id: string;
  author: string;
  authorId: string;
  avatar: string;
  comment: string;
  createdAt: Timestamp | Date | { $date?: string };
}

export interface Post {
  id?: string;
  _id?: any;
  author: string;
  authorId: string;
  authorAvatar: string;
  createdAt: Timestamp | Date | { $date?: string };
  content: string;
  imageUrl?: string;
  likes: string[];
  comments: Comment[];
}

export const posts: Omit<Post, 'id' | 'createdAt' | 'authorId' | 'authorAvatar' | 'likes' | 'comments'>[] = [
    {
      author: "Jane Doe",
      content: "Just adopted this little guy! Everyone, meet Leo. ❤️ #adoptdontshop",
      imageUrl: "https://placehold.co/600x400.png",
    },
    {
      author: "John Smith",
      content: "Does anyone have recommendations for a good grain-free cat food? My kitty seems to have a sensitive stomach.",
    },
    {
        author: "Alice Johnson",
        content: "Enjoying a beautiful day at the park with my best boy, Cooper! He loves the sunshine.",
        imageUrl: "https://placehold.co/600x400.png",
    },
    {
        author: "Robert Brown",
        content: "Training tip of the day: Consistency is key! Even 5 minutes of practice each day makes a huge difference. What's your go-to training trick? #dogtraining"
    }
];
