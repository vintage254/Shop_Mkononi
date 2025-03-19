# Google Sign-In Integration for Shop Mkononi

This document outlines the implementation of Google Sign-In for Shop Mkononi, including the setup process, key components, and testing procedures.

## Overview

The Google Sign-In integration allows users to authenticate using their Google accounts while maintaining the mandatory ID and selfie verification process for both sellers and buyers.

## Features

1. **Google Authentication**: Users can sign in or sign up using their Google accounts.
2. **Role Selection**: New Google users can select whether they want to be a buyer or seller.
3. **Verification Process**: All users (including Google-authenticated ones) must complete ID and selfie verification.
4. **Admin Verification**: Admin interface displays Google profile photos alongside selfies for better verification.

## Implementation Details

### Environment Variables

The following environment variables are required:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### Key Files Modified

1. **NextAuth Configuration** (`src/app/api/auth/[...nextauth]/route.ts`):
   - Added Google provider
   - Updated callbacks to handle Google authentication
   - Extended session and JWT types
   - Added logging for debugging

2. **User Profile Update API** (`src/app/api/auth/update-profile/route.ts`):
   - Handles updating user roles and phone numbers for Google users
   - Validates input data using Zod
   - Checks for duplicate phone numbers

3. **Verification API** (`src/app/api/auth/verify/route.ts`):
   - Processes verification documents (ID front, ID back, selfie)
   - Uploads images to Cloudinary
   - Updates user verification status

4. **Verification Page** (`src/app/auth/verify/page.tsx`):
   - Handles Google-authenticated users
   - Displays Google profile photos
   - Collects additional information (role, phone number)
   - Uploads verification documents

5. **Admin Verification Interface** (`src/app/admin/verifications/page.tsx`):
   - Shows Google profile photos alongside selfies for better comparison
   - Allows admins to approve or reject verification requests

6. **Sign-in and Sign-up Pages**:
   - Added Google Sign-In buttons
   - Updated to redirect to verification page for new users

7. **Middleware** (`src/middleware.ts`):
   - Enforces verification requirements
   - Redirects users to appropriate pages based on authentication status

## User Flow

### New User (Google Sign-Up)

1. User clicks "Sign up with Google" on the signup page
2. User selects their Google account
3. User is redirected to the verification page with `newUser=true` parameter
4. User selects their role (BUYER/SELLER) and provides phone number
5. User uploads ID front, ID back, and selfie
6. User submits verification documents
7. Admin reviews and approves/rejects verification
8. Once approved, user can access role-specific features

### Existing User (Google Sign-In)

1. User clicks "Sign in with Google" on the signin page
2. User selects their Google account
3. If user is already verified, they are redirected to the appropriate dashboard
4. If user is not verified, they are redirected to the verification page

## Testing

See the [test-google-auth.md](./test-google-auth.md) file for detailed testing procedures.

## Troubleshooting

### Common Issues

1. **Redirect Issues**: If users are not properly redirected after Google authentication, check:
   - NextAuth configuration in `[...nextauth]/route.ts`
   - Callback URLs in sign-in and sign-up pages

2. **Missing User Data**: If user data is missing after Google authentication, check:
   - JWT and session callbacks in NextAuth configuration
   - Database schema compatibility

3. **Verification Process**: If verification process is not working, check:
   - Cloudinary configuration
   - Form data handling in verification API
   - File upload handling in verification page

### Debugging

Extensive logging has been added to help debug issues:
- Check console logs for JWT and session callbacks
- Monitor user creation and updates in the signIn callback
- Review API responses for error messages

## Security Considerations

1. All users, including Google-authenticated ones, must complete ID and selfie verification
2. JWT tokens are used for secure session management
3. Sensitive operations require authentication and appropriate role
4. Phone numbers are validated to prevent duplicates

## Future Improvements

1. Add more OAuth providers (Facebook, Twitter, etc.)
2. Implement two-factor authentication
3. Enhance verification process with AI-based identity verification
4. Add more detailed user profiles
