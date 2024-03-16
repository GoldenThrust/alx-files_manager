export default function randomUserName(length) {
  let username = '';

  for (let i = 0; i < length; i++) {
    const randomCharCode = Math.floor(Math.random() * 26) + 97;
    username += String.fromCharCode(randomCharCode);
  }

  return username;
}
