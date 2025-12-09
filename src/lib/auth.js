/* src/lib/auth.js - patched */
export function setAuth(user, token){
  // keep compatibility: save both keys some code might read
  localStorage.setItem('renttrack_token', token);
  localStorage.setItem('token', token);
  localStorage.setItem('renttrack_user', JSON.stringify(user));
  localStorage.setItem('user', JSON.stringify(user));
}
export function clearAuth(){
  localStorage.removeItem('renttrack_token');
  localStorage.removeItem('token');
  localStorage.removeItem('renttrack_user');
  localStorage.removeItem('user');
}
export function getUser(){
  try { return JSON.parse(localStorage.getItem('renttrack_user') || localStorage.getItem('user') || 'null'); } catch { return null; }
}
export function getRole(){ const u=getUser(); return u?.role || null; }
