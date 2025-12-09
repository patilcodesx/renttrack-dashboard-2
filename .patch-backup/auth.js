export function setAuth(user, token){
  localStorage.setItem('renttrack_token', token);
  localStorage.setItem('renttrack_user', JSON.stringify(user));
}
export function clearAuth(){
  localStorage.removeItem('renttrack_token');
  localStorage.removeItem('renttrack_user');
}
export function getUser(){
  try { return JSON.parse(localStorage.getItem('renttrack_user') || 'null'); } catch { return null; }
}
export function getRole(){ const u=getUser(); return u?.role || null; }
