# UploadThing Setup

This project uses UploadThing for client-side file uploads. Follow these steps to set it up:

## Environment Variables

Add the following environment variable to your `.env` file:

```bash
# UploadThing Configuration
UPLOADTHING_TOKEN=your_uploadthing_token
```

### Getting Your UploadThing Credentials

1. Sign up for a free account at [uploadthing.com](https://uploadthing.com)
2. Create a new app in the dashboard
3. Copy your `UPLOADTHING_TOKEN` from the app settings
4. Add it to your `.env` file

## How It Works

### Backend

- **File Router**: `src/server/uploadthing/router.ts`
  - Defines the `imageUploader` route
  - Validates authentication using JWT tokens
  - Limits uploads to 4MB images, 1 file at a time
  - Returns the uploaded file URL on completion

- **Route Handler**: `src/server/uploadthing/route.ts`
  - Creates the Express route handler for `/api/uploadthing`
  - Handles presigned URL generation and callbacks

### Frontend

- **Upload Hook**: `src/lib/uploadthing.ts`
  - Provides `useUploadThing` hook for React components
  - Configured to use `/api/uploadthing` endpoint

- **CreatePost Component**: `src/components/feed/CreatePost.tsx`
  - Uses `useUploadThing` hook to upload images
  - Shows upload progress and preview
  - Automatically includes uploaded image URL when creating posts

## Usage

1. User clicks "Photo/video" button in CreatePost component
2. File picker opens (accepts image files only)
3. File is uploaded directly to UploadThing (client-side)
4. Upload progress is shown to user
5. Once uploaded, image preview appears
6. User can remove image or proceed to create post
7. When post is created, the image URL is included automatically

## Authentication

UploadThing routes are protected by JWT authentication. The middleware:

1. Extracts JWT token from `Authorization` header
2. Verifies the token
3. Loads user from database
4. Returns user ID in metadata for the upload callback

Make sure your frontend includes the JWT token in the Authorization header when making upload requests. The `@uploadthing/react` package handles this automatically if configured correctly.

## File Limits

- **Max file size**: 4MB
- **Max file count**: 1 file per upload
- **Allowed types**: Images only (image/\*)

To modify these limits, update the file router configuration in `src/server/uploadthing/router.ts`.
