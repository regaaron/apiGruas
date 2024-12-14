const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Llaves y vector de inicialización (valores constantes)
const KEY = Buffer.from('12345678901234567890123456789012'); // 32 bytes (256 bits)
const IV = Buffer.from('1234567890123456'); // 16 bytes

/**
 * Encripta un archivo.
 * @param {string} inputFileName - Nombre del archivo a encriptar.
 * @param {string} outputFileName - Nombre del archivo encriptado.
 */
const encryptFile = (inputFileName, outputFileName) => {
  const inputPath = path.resolve(__dirname, inputFileName);
  const outputPath = path.resolve(__dirname, outputFileName);

  const cipher = crypto.createCipheriv('aes-256-cbc', KEY, IV);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  input.pipe(cipher).pipe(output);

  return new Promise((resolve, reject) => {
    output.on('finish', () => resolve('Archivo encriptado correctamente.'));
    output.on('error', (err) => reject(err));
  });
};

/**
 * Desencripta un archivo.
 * @param {string} inputFileName - Nombre del archivo encriptado.
 * @param {string} outputFileName - Nombre del archivo desencriptado.
 */
const decryptFile = (inputFileName, outputFileName) => {
  const inputPath = path.resolve(__dirname, inputFileName);
  const outputPath = path.resolve(__dirname, outputFileName);

  const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  input.pipe(decipher).pipe(output);

  return new Promise((resolve, reject) => {
    output.on('finish', () => resolve('Archivo desencriptado correctamente.'));
    output.on('error', (err) => reject(err));
  });
};

module.exports = { encryptFile, decryptFile };
