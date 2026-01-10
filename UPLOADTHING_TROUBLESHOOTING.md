# UploadThing Troubleshooting Guide

## Issues Fixed

### 1. Environment Variables
- **Required**: `UPLOADTHING_TOKEN` in `.env` file
- **Note**: UploadThing uses a single token that contains all necessary credentials

### 2. File Input Trigger
- **Problem**: The file input wasn't triggering properly because the button's onClick was interfering
- **Solution**: 
  - Changed the label to use a div instead of Button component
  - Added `setIsExpanded(true)` in `handleFileSelect` to ensure form expands when file is selected
  - Reset input value after selection to allow re-selecting the same file

### 3. Error Handling
- **Added**: Better error logging and console messages to help debug issues
- **Added**: `onUploadBegin` callback to track upload start
- **Added**: More detailed error messages in toast notifications

## How to Test

1. **Restart your server** to load the new environment variables:
   ```bash
   bun run dev:server
   ```

2. **Check browser console** for any errors when clicking "Photo/video"

3. **Check server logs** for authentication and upload messages

4. **Try uploading an image**:
   - Click "Photo/video" button
   - Select an image file (max 4MB)
   - You should see "Uploading image..." message
   - Once complete, image preview should appear

## Common Issues

### "Unauthorized: No token provided"
- **Cause**: JWT token not being sent with request
- **Fix**: Make sure you're logged in and the token is in localStorage
- **Check**: Open browser DevTools → Application → Local Storage → `auth_token`

### "UploadThing may not work correctly" warning
- **Cause**: Environment variable not set
- **Fix**: Make sure `.env` has `UPLOADTHING_TOKEN`
- **Restart**: Server must be restarted after adding env var

### Upload starts but never completes
- **Check**: Server logs for errors in middleware
- **Check**: Network tab in browser DevTools for failed requests
- **Verify**: UploadThing credentials are correct

### File too large error
- **Current limit**: 4MB
- **To change**: Edit `maxFileSize` in `src/server/uploadthing/router.ts`

## Debug Steps

1. **Check environment variables are loaded**:
   ```bash
   # In server terminal, you should see warnings if vars are missing
   ```

2. **Check browser console**:
   - Look for "Upload beginning:", "Upload complete:", or error messages
   - Check Network tab for `/api/uploadthing` requests

3. **Check server logs**:
   - Look for "UploadThing middleware: User authenticated"
   - Look for "Upload complete for userId:"
   - Check for any error messages

4. **Verify authentication**:
   - Make sure you're logged in
   - Token should be in localStorage as `auth_token`
   - Token should be sent in `Authorization: Bearer <token>` header

## Next Steps

If uploads still don't work:

1. Check the browser console for specific error messages
2. Check server logs for authentication/upload errors
3. Verify UploadThing dashboard shows the app is active
4. Test with a smaller image file (< 1MB) to rule out size issues
5. Check network tab to see if requests are reaching the server
