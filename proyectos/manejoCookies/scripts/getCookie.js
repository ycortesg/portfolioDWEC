export default function getCookie(name){
    let cookieString = document.cookie;
    let cookies = cookieString.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
}