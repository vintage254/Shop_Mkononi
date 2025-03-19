# Google Sign-In Integration Testing Guide

This guide outlines the steps to test the Google Sign-In integration in Shop Mkononi.

## Prerequisites

- Ensure the application is running locally with `npm run dev`
- Make sure all environment variables are set correctly:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

## Test Cases

### 1. New User Sign-Up with Google

1. Navigate to `/auth/signup`
2. Click "Sign up with Google"
3. Select a Google account when prompted
4. You should be redirected to `/auth/verify?newUser=true`
5. Verify that:
   - The Google profile photo is displayed
   - Role selection (BUYER/SELLER) is available
   - Phone number field is required
   - ID and selfie upload fields are available
6. Complete the verification form:
   - Select a role
   - Enter a phone number (in format +1234567890)
   - Upload ID front, ID back, and selfie images
7. Submit the form
8. Verify that you are redirected to the appropriate dashboard based on your role
9. Check the console logs for successful API calls

### 2. Existing User Sign-In with Google

1. Navigate to `/auth/signin`
2. Click "Sign in with Google"
3. Select the same Google account used in Test Case 1
4. If the user is already verified, you should be redirected to the appropriate dashboard
5. If the user is not verified, you should be redirected to the verification page
6. Verify that the session contains the correct user information:
   - Open browser developer tools
   - Check Application tab > Cookies > `next-auth.session-token`
   - Verify that the JWT contains the correct user ID, role, and verification status

### 3. Admin Verification of Google Users

1. Sign in as an admin user (use credentials login if needed)
2. Navigate to `/admin/verifications`
3. Find a verification request from a Google user
4. Verify that:
   - The Google profile photo is displayed alongside the selfie
   - All user information is correctly displayed
5. Approve or reject the verification request
6. Verify that the user's verification status is updated accordingly

### 4. Edge Cases and Error Handling

#### 4.1. Invalid Phone Number

1. Sign up with Google
2. On the verification page, enter an invalid phone number (e.g., "123")
3. Submit the form
4. Verify that an appropriate error message is displayed

#### 4.2. Missing Required Fields

1. Sign up with Google
2. On the verification page, leave some required fields empty
3. Submit the form
4. Verify that appropriate error messages are displayed

#### 4.3. Duplicate Phone Number

1. Sign up with Google
2. On the verification page, enter a phone number that is already in use by another user
3. Submit the form
4. Verify that an appropriate error message is displayed

#### 4.4. Network Issues

1. Disable your internet connection
2. Try to sign in with Google
3. Verify that an appropriate error message is displayed
4. Re-enable your internet connection and try again

## Debugging Tips

If you encounter issues during testing, check the following:

1. **Console Logs**: Open browser developer tools and check the console for error messages
2. **Network Requests**: Monitor network requests in the browser developer tools
3. **Server Logs**: Check the terminal running the Next.js server for backend errors
4. **JWT Token**: Inspect the JWT token in the browser cookies to verify user data

## Expected Results

- New Google users should be able to sign up and complete verification
- Existing Google users should be able to sign in and access their accounts
- Admin users should be able to verify Google users
- All error cases should be handled gracefully with appropriate error messages

## Reporting Issues

If you encounter any issues during testing, please document:

1. The test case you were running
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Any error messages or logs
6. Browser and operating system information
