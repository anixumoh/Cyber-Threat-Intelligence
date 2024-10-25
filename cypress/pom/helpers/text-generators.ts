//random text generator

const getRandomText = (length: number) => {
  // Declare all characters
  let chars = 'abcdefghijklmnopqrstuvwxyz';

  // Pick characers randomly
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
};

export { getRandomText };
