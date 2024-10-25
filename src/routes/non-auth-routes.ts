const ALLOWED_ROUTES_WITHOUT_LOGIN = [
  // Do not redirect to /login
  '/login',
  '/login/forgot',
  '/signup',
  '/privacityTerms',
  '/renew-password',
  '/expired-password'
];
export default ALLOWED_ROUTES_WITHOUT_LOGIN;
