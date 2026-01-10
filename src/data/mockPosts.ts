export interface Post {
  id: string
  author: {
    name: string
    avatar: string
  }
  time: string
  content: string
  image?: string
  likes: number
  comments: number
  shares: number
}

export const mockPosts: Post[] = [
  {
    id: '1',
    author: { name: 'Sarah Johnson', avatar: 'SJ' },
    time: '2h',
    content:
      'Just finished reading an amazing book! Highly recommend "The Design of Everyday Things" by Don Norman. It completely changed how I think about user experience.',
    likes: 42,
    comments: 8,
    shares: 3,
  },
  {
    id: '2',
    author: { name: 'Mike Chen', avatar: 'MC' },
    time: '5h',
    content: 'Beautiful sunset today! 🌅',
    image: 'sunset.jpg',
    likes: 128,
    comments: 15,
    shares: 12,
  },
  {
    id: '3',
    author: { name: 'Emily Davis', avatar: 'ED' },
    time: '1d',
    content:
      "Excited to announce that I'll be speaking at the upcoming tech conference! Can't wait to share what we've been working on.",
    likes: 89,
    comments: 22,
    shares: 7,
  },
  {
    id: '4',
    author: { name: 'David Wilson', avatar: 'DW' },
    time: '3h',
    content:
      'Just launched a new feature for our app. Check it out and let me know what you think!',
    likes: 56,
    comments: 11,
    shares: 5,
  },
  {
    id: '5',
    author: { name: 'Lisa Anderson', avatar: 'LA' },
    time: '6h',
    content:
      'Weekend project: Built a small React component library. Open source coming soon! 🚀',
    likes: 73,
    comments: 18,
    shares: 9,
  },
]
