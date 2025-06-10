export const getTokenFromCookie = (): string | null => {
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('token='));
  if (tokenCookie) {
    return tokenCookie.split('=')[1];
  }
  return null;
}; 