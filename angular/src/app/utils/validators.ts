// Based on BE email validation
const accentedCharacters = 'àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ-';
export const laxString = '.+@.+\\.[A-Za-z]{2}[A-Za-z]*';
export const emailRegexp = `[A-Z0-9a-z._%+-${accentedCharacters}]+@[A-Za-z0-9.-${accentedCharacters}]+\\.[A-Za-z]{2,}`;

// TODO BE uses this regex, but it doesn't work in FE
// export const emailRegexp =
//   /^([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff!|#$~%&/'=?¿¡^+*{}]+|\x22([^\x0d\x22\x5c\x80-\xff!|#$~%&/'=?¿¡^+{}]|\x5c[\x00-\x7f])\x22)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff!|#$~%&/'=?¿¡^+*{}]+|\x22([^\x0d\x22\x5c\x80-\xff!|#$~%&/'=?¿¡^+{}]|\x5c[\x00-\x7f])\x22))\x40([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff!|#$~%&/'=?¿¡^+*{}]+|\x5b([^\x0d\x5b-\x5d\x80-\xff!|#$~%&/'=?¿¡^+{}]|\x5c[\x00-\x7f])\x5d)(\x2e([^\x00-\x20\x22\x28\x29\x2c\x2e\x3a-\x3c\x3e\x40\x5b-\x5d\x7f-\xff!|#$~%&/'=?¿¡^+*{}]+|\x5b([^\x0d\x5b-\x5d\x80-\xff!|#$~%&/'=?¿¡^+{}]|\x5c[\x00-\x7f])*\x5d))+$/;
