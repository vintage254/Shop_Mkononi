// This script helps test the Google Sign-In flow
// Run this in the browser console to check the authentication state

(function() {
  console.log('=== Google Sign-In Flow Verification ===');
  
  // Check if the user is logged in
  const session = window.__NEXT_DATA__?.props?.pageProps?.session;
  
  if (session) {
    console.log('User is logged in:', {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      verificationStatus: session.user.verificationStatus,
      phone: session.user.phone || 'Not set',
      image: session.user.image ? 'Present' : 'Not present'
    });
  } else {
    console.log('User is not logged in');
  }
  
  // Check current URL
  const currentUrl = window.location.href;
  console.log('Current URL:', currentUrl);
  
  // Check for URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const params = {};
  for (const [key, value] of urlParams.entries()) {
    params[key] = value;
  }
  console.log('URL Parameters:', params);
  
  // Check for localStorage items related to authentication
  const authItems = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.includes('auth') || key.includes('session') || key.includes('next-auth')) {
      authItems[key] = 'Present';
    }
  }
  console.log('Auth-related localStorage items:', authItems);
  
  // Check for cookies related to authentication
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    if (key.includes('auth') || key.includes('session') || key.includes('next-auth')) {
      acc[key] = 'Present';
    }
    return acc;
  }, {});
  console.log('Auth-related cookies:', cookies);
  
  console.log('=== End of Verification ===');
  
  return {
    isLoggedIn: !!session,
    currentUrl,
    urlParams: params,
    authItems,
    cookies
  };
})();
