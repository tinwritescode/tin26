# Backend & API Integration Prompt: Posts Feature

## Overview

Implement a complete backend system for posts (social media feed) and integrate it with the existing frontend. The system should follow the existing architecture patterns: Repository pattern, tRPC routers, Prisma ORM, and dependency injection.

## Current State

- Frontend: `src/routes/index.tsx` uses mock data from `src/data/mockPosts.ts`
- Components: `CreatePost.tsx` (UI only, not functional) and `PostCard.tsx` (display only)
- Backend: Uses tRPC, Prisma, Repository pattern, dependency injection (InversifyJS)
- Authentication: JWT-based with WorkOS integration

## Requirements

### 1. Database Schema (Prisma)

Add the following models to `prisma/schema.prisma`:

```prisma
model Post {
  id        String   @id @default(uuid())
  userId    String
  content   String
  imageUrl  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  likes     PostLike[]
  comments  PostComment[]
  shares    PostShare[]

  @@map("posts")
}

model PostLike {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@map("post_likes")
}

model PostComment {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("post_comments")
}

model PostShare {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@map("post_shares")
}
```

Update the `User` model to include relations:

```prisma
model User {
  // ... existing fields ...
  posts        Post[]
  postLikes    PostLike[]
  postComments PostComment[]
  postShares   PostShare[]
  // ... existing relations ...
}
```

### 2. Repository Layer

Create `src/server/repositories/PostRepository.ts` following the pattern from `HabitRepository.ts`:

**Interface** (`src/server/repositories/interfaces.ts`):

```typescript
export interface IPostRepository {
  findById: (id: string) => Promise<PostWithAuthor | null>
  findByUserId: (
    userId: string,
    limit?: number,
    offset?: number,
  ) => Promise<PostWithAuthor[]>
  findFeed: (
    userId: string,
    limit?: number,
    offset?: number,
  ) => Promise<PostWithAuthor[]>
  create: (data: {
    userId: string
    content: string
    imageUrl?: string | null
  }) => Promise<PostWithAuthor>
  update: (
    id: string,
    userId: string,
    data: {
      content?: string
      imageUrl?: string | null
    },
  ) => Promise<PostWithAuthor>
  delete: (id: string, userId: string) => Promise<void>
  toggleLike: (
    postId: string,
    userId: string,
  ) => Promise<{ liked: boolean; likeCount: number }>
  addComment: (
    postId: string,
    userId: string,
    content: string,
  ) => Promise<CommentWithAuthor>
  deleteComment: (commentId: string, userId: string) => Promise<void>
  share: (
    postId: string,
    userId: string,
  ) => Promise<{ shared: boolean; shareCount: number }>
  getLikeCount: (postId: string) => Promise<number>
  getCommentCount: (postId: string) => Promise<number>
  getShareCount: (postId: string) => Promise<number>
  isLikedByUser: (postId: string, userId: string) => Promise<boolean>
  isSharedByUser: (postId: string, userId: string) => Promise<boolean>
}

export type PostWithAuthor = Post & {
  user: User
  _count: {
    likes: number
    comments: number
    shares: number
  }
}

export type CommentWithAuthor = PostComment & {
  user: User
}
```

**Implementation Requirements:**

- Use Prisma for all database operations
- Verify ownership before update/delete operations
- Include user data in all post queries (author information)
- Include counts for likes, comments, shares
- Implement pagination with `limit` and `offset`
- For `findFeed`: Return posts from all users (for now, can be enhanced later with following/friends logic)
- Handle unique constraints for likes and shares (toggle behavior)

### 3. Dependency Injection

**Update `src/server/repositories/types.ts`:**

```typescript
export const TYPES = {
  // ... existing types ...
  PostRepository: Symbol.for('PostRepository'),
}
```

**Update `src/server/container.ts`:**

- Bind `PostRepository` to `IPostRepository` interface

**Update `src/server/trpc/context.ts`:**

- Add `postRepository` to context (similar to `habitRepository`)

### 4. tRPC Router

Create `src/server/trpc/router/posts.ts` following the pattern from `habits.ts`:

**Required Procedures:**

1. **`getFeed`** (query)
   - Input: `{ limit?: number, offset?: number }` (optional pagination)
   - Returns: Array of posts with author info and counts
   - Protected procedure
   - Default limit: 20

2. **`getPost`** (query)
   - Input: `{ postId: string }`
   - Returns: Single post with author info and counts
   - Protected procedure
   - Throw NOT_FOUND if post doesn't exist

3. **`createPost`** (mutation)
   - Input: `{ content: string, imageUrl?: string }`
   - Validation: content required, max 5000 chars, imageUrl optional URL
   - Returns: Created post with author info
   - Protected procedure

4. **`updatePost`** (mutation)
   - Input: `{ postId: string, content?: string, imageUrl?: string }`
   - Validation: content max 5000 chars if provided
   - Returns: Updated post
   - Protected procedure
   - Verify ownership, throw NOT_FOUND if not owner

5. **`deletePost`** (mutation)
   - Input: `{ postId: string }`
   - Returns: `{ success: boolean }`
   - Protected procedure
   - Verify ownership, throw NOT_FOUND if not owner

6. **`toggleLike`** (mutation)
   - Input: `{ postId: string }`
   - Returns: `{ liked: boolean, likeCount: number }`
   - Protected procedure
   - Toggle like status (create if not exists, delete if exists)

7. **`addComment`** (mutation)
   - Input: `{ postId: string, content: string }`
   - Validation: content required, max 1000 chars
   - Returns: Created comment with author info
   - Protected procedure

8. **`deleteComment`** (mutation)
   - Input: `{ commentId: string }`
   - Returns: `{ success: boolean }`
   - Protected procedure
   - Verify ownership, throw NOT_FOUND if not owner

9. **`sharePost`** (mutation)
   - Input: `{ postId: string }`
   - Returns: `{ shared: boolean, shareCount: number }`
   - Protected procedure
   - Toggle share status (create if not exists, delete if exists)

10. **`getPostInteractions`** (query)
    - Input: `{ postId: string }`
    - Returns: `{ liked: boolean, shared: boolean, likeCount: number, commentCount: number, shareCount: number }`
    - Protected procedure
    - Get current user's interaction status and all counts

**Validation Schemas:**

- Use Zod for all input validation
- Follow existing patterns from `habits.ts`
- Include proper error messages

**Error Handling:**

- Use `TRPCError` with appropriate codes (NOT_FOUND, BAD_REQUEST, UNAUTHORIZED)
- Provide clear error messages

### 5. Register Router

**Update `src/server/trpc/router/_app.ts`:**

```typescript
import { postsRouter } from './posts.js'

export const appRouter = router({
  // ... existing routers ...
  posts: postsRouter,
})
```

### 6. Frontend Integration

**Update `src/routes/index.tsx`:**

- Replace `mockPosts` with tRPC query: `trpc.posts.getFeed.useQuery()`
- Handle loading and error states
- Implement infinite scroll or pagination (optional, can be basic for now)

**Update `src/components/feed/CreatePost.tsx`:**

- Add state for content and image URL
- Add form submission handler
- Use `trpc.posts.createPost.useMutation()`
- Show loading state during submission
- Clear form after successful creation
- Show error messages if validation fails
- Add image upload functionality (optional, can be URL input for now)

**Update `src/components/feed/PostCard.tsx`:**

- Accept real post data (from API response)
- Use `trpc.posts.toggleLike.useMutation()` for like button
- Use `trpc.posts.sharePost.useMutation()` for share button
- Use `trpc.posts.getPostInteractions.useQuery()` to get initial state
- Show real counts from API
- Format time using relative time (e.g., "2h ago", "1d ago")
- Add optimistic updates for better UX
- Handle delete action (if user is post owner)

**Type Updates:**

- Update `Post` interface in `src/data/mockPosts.ts` or create new type file
- Match the backend response structure:
  ```typescript
  export interface Post {
    id: string
    content: string
    imageUrl?: string | null
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
      likes: number
      comments: number
      shares: number
    }
  }
  ```

### 7. Time Formatting

Create utility function for relative time:

- "just now" (< 1 minute)
- "Xm ago" (< 1 hour)
- "Xh ago" (< 24 hours)
- "Xd ago" (< 7 days)
- "MMM DD" (this year)
- "MMM DD, YYYY" (older)

### 8. User Avatar Display

- Use user initials if no avatar URL
- Follow existing pattern from `CreatePost.tsx`

## Implementation Guidelines

### Code Style

- Follow existing patterns exactly
- Use TypeScript strict mode
- Use dependency injection (InversifyJS)
- Use async/await (no callbacks)
- Handle errors gracefully

### Testing Considerations

- All mutations should verify user ownership where applicable
- Handle edge cases (deleted posts, invalid IDs, etc.)
- Validate all inputs
- Test pagination

### Performance

- Use Prisma `select` to limit fields when possible
- Index frequently queried fields (userId, postId, createdAt)
- Consider cursor-based pagination for large datasets (optional)

### Security

- Always verify user ownership before mutations
- Sanitize user input (content, imageUrl)
- Validate image URLs if allowing external URLs
- Rate limiting considerations (can be added later)

## Migration Steps

1. Update Prisma schema
2. Run migration: `npx prisma migrate dev --name add_posts`
3. Generate Prisma client: `npx prisma generate`
4. Implement repository
5. Update DI container
6. Update tRPC context
7. Implement tRPC router
8. Register router
9. Update frontend components
10. Test all flows

## Success Criteria

- [ ] Posts can be created from frontend
- [ ] Posts display in feed with correct author info
- [ ] Like/unlike works correctly
- [ ] Share/unshare works correctly
- [ ] Comments can be added (if comment UI exists)
- [ ] Post owner can delete their posts
- [ ] Time displays in relative format
- [ ] Loading and error states handled
- [ ] Optimistic updates work smoothly
- [ ] All TypeScript types are correct
- [ ] No console errors
- [ ] Follows existing code patterns

## Notes

- Start with basic functionality, enhance later (e.g., image upload, rich text, mentions)
- Comment UI can be added later if not in current design
- Image handling can start with URL input, file upload can be added later
- Consider adding pagination/infinite scroll after basic functionality works
- Follow the "Only Extend, Do Not Break" principle - don't modify existing working code unnecessarily
