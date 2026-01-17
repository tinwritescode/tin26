export interface Album {
  id: string
  userId: string
  title: string
  description: string | null
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
    avatar: string | null
  }
  _count: {
    images: number
  }
}

export interface AlbumWithImages extends Album {
  images: Image[]
}

export interface Image {
  id: string
  albumId: string
  url: string
  description: string | null
  order: number
  createdAt: string
  updatedAt: string
}
