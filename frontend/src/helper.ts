// @ts-nocheck
import { PDFDocument } from "pdf-lib";
import zlib from "react-zlib-js";
import CryptoJS from "crypto-js";
import { ethers as v5ethers } from "ethers";
import { Buffer } from "buffer";
// import { gzipSync } from "zlib";

async function saveFile(pdfBytes, fileName) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  console.log(blob, "blob");

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${fileName}.pdf`;
  link.click();

  // Clean up
  window.URL.revokeObjectURL(url);
}

function Decodeuint8arr(uint8array) {
  return new TextDecoder("utf-8").decode(uint8array);
  // return new TextDecoder("utf-8").encoding;
}

// function Encodeuint8arr(uint8array) {
//   return new TextDecoder().enc;
//   // return new TextDecoder("utf-8").encoding;
// }

// async function compressPDF(fileName: string) {
async function compressPDF(fileBuffer) {
  // const filePath = path.join(__dirname, fileName);
  // const fileBuffer = readFileSync(filePath);
  console.log(fileBuffer, "decompressedPDFBytes");

  const pdfDoc = await PDFDocument.load(fileBuffer);
  console.log(pdfDoc, "pdfDoc");

  const pdfBytes = await pdfDoc.save();
  console.log(pdfBytes, "pdfBytes");

  // const compressedPDFBytes = zlib.gzipSync(pdfBytes, {
  //   level: 9,
  // });
  const compressedPDFBytes = zlib.gzipSync(Buffer.from(pdfBytes));

  // const uncompressedPDFBytes = zlib.gunzipSync(compressedPDFBytes);

  // console.log(compressedPDFBytes, "compressedPDFBytes");
  // console.log(uncompressedPDFBytes, uncompressedPDFBytes, "compare data");
  // console.log(uncompressedPDFBytes,pdfBytes, "compare data");
  // console.log(uncompressedPDFBytes,pdfBytes, "compare data");

  return compressedPDFBytes.toString("base64");
}

async function decompressPDF(compressedPDFBase64, fileName) {
  try {
    const compressedPDFBytes = Buffer.from(compressedPDFBase64, "base64");
    //   const compressedPDFBytes = Buffer.from(compressedPDFBase64).toString('base64');
    console.log(compressedPDFBytes, "compressedPDFBytes");
    // console.log(compressedPDFBytes.buffer, "compressedPDFBytes");

    const decompressedPDFBytes = zlib.gunzipSync(compressedPDFBytes);

    console.log(decompressedPDFBytes, "decompressedPDFBytes");

    const pdfDoc = await PDFDocument.load(decompressedPDFBytes);

    console.log(pdfDoc, "pdfDoc");
    console.log(typeof pdfDoc, "pdfDoc");

    // pdfDoc.addPage([500, 750])

    // const pages = pdfDoc.getPages()
    // console.log(pages,"pages");

    // console.log(pdfDoc.getPageCount(),"countttttttt");

    const pdfBytes = await pdfDoc.save();

    console.log(pdfBytes, "pdfBytes");

    // writeFileSync(`./test/${fileName}.pdf`, pdfBytes); // Save the decompressed PDF to a file

    // try {
    // Write the file asynchronously
    await saveFile(pdfBytes, fileName);
    console.log("PDF saved successfully!");
    // } catch (error) {
    //   console.error("Error saving PDF:", error);
    // }
  } catch (error) {
    throw new Error("Something went wrong");
  }
}

// async function decompressPDF(compressedPDFBase64, fileName) {
//     const compressedPDFBytes = Buffer.from(compressedPDFBase64, "base64");
//     console.log(compressedPDFBytes, "compressedPDFBytes");

//     try {
//         const decompressedPDFBytes = zlib.gunzipSync(compressedPDFBytes);
//         console.log(decompressedPDFBytes, "decompressedPDFBytes");

//         const pdfDoc = await PDFDocument.load(decompressedPDFBytes);
//         console.log(pdfDoc, "pdfDoc");

//         const pdfBytes = await pdfDoc.save();

//         console.log(pdfBytes, 'pdfBytes');

//         await saveFile(pdfBytes, fileName);
//         console.log("PDF saved successfully!");
//     } catch (error) {
//         console.error("Error decompressing or saving PDF:", error);
//     }
// }

// async function decompressPDF(compressedPDFBase64, fileName) {
//     try {
//       console.log(compressedPDFBase64, "compressedPDFBase64");

//       // Ensure compressedPDFBase64 is a string
//       if (typeof compressedPDFBase64 !== 'string') {
//         throw new Error('Input is not a base64 string.');
//       }

//       const compressedPDFBytes = Buffer.from(compressedPDFBase64, "base64");
//       console.log(compressedPDFBytes, "compressedPDFBytes");

//       const decompressedPDFBytes = zlib.gunzipSync(compressedPDFBytes);
//       console.log(decompressedPDFBytes, "decompressedPDFBytes");

//       const pdfDoc = await PDFDocument.load(decompressedPDFBytes);
//       console.log(pdfDoc, "pdfDoc");

//       const pdfBytes = await pdfDoc.save();
//       console.log(pdfBytes, "pdfBytes");

//       // Save the decompressed PDF to a file
//       // writeFileSync(`./test/${fileName}.pdf`, pdfBytes);

//       // Save the decompressed PDF asynchronously
//       try {
//         await saveFile(pdfBytes, fileName);
//         console.log("PDF saved successfully!");
//       } catch (error) {
//         console.error("Error saving PDF:", error);
//       }
//     } catch (error) {
//       console.error("Error during PDF decompression:", error);
//     }
//   }

function encrypt(text: string, sharedSecret: any) {
  const key = CryptoJS.enc.Hex.parse(
    v5ethers.utils.hexlify(sharedSecret).substr(2)
  );
  console.log(key, "key encrypt");

  // const iv = CryptoJS.lib.WordArray.random(16);
  const value = CryptoJS.enc.Hex.parse("000102030405060708090a0b0c0d0e0f");
  const iv = CryptoJS.lib.WordArray.create(value.words, 16); // 16 bytes
  console.log(iv);

  const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv });
  return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
}

function decrypt(encryptedText: string, sharedSecret: any) {
  try {
    const rawData = CryptoJS.enc.Base64.parse(encryptedText);
    console.log(rawData, "rawData");

    const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4));
    console.log(iv, "iv");

    const encrypted = CryptoJS.lib.WordArray.create(rawData.words.slice(4));
    console.log(encrypted, "encrypted");

    const key = CryptoJS.enc.Hex.parse(
      v5ethers.utils.hexlify(sharedSecret).substr(2)
    );
    console.log(key, "key decrypt");

    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, {
      iv: iv,
    });
    console.log(decrypted, "decrypted");
    //   console.log(typeof decrypted, "decrypted");

    return decrypted.toString(CryptoJS.enc.Utf8);
    // return decrypted.toString();
  } catch (error) {
    throw new Error("Something went wrong");
  }
}

// function decrypt(encryptedText, sharedSecret) {
//     try {
//       const rawData = CryptoJS.enc.Base64.parse(encryptedText);
//       console.log(rawData, "rawData");

//       const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4));
//       console.log(iv, "iv");

//       const encrypted = CryptoJS.lib.WordArray.create(rawData.words.slice(4));
//       console.log(encrypted, "encrypted");

//       const key = CryptoJS.enc.Hex.parse(
//         v5ethers.utils.hexlify(sharedSecret).substr(2)
//       );
//       console.log(key, "key");

//       const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, {
//         iv: iv,
//       });
//       console.log(decrypted, "decrypted");

//       const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
//       console.log(decryptedText, "decryptedText");

//       return decryptedText;
//     } catch (error) {
//       console.error("Error during decryption:", error);
//       return null;
//     }
//   }

function base64ToBytes(base64String: string) {
  return v5ethers.utils.arrayify(
    "0x" + Buffer.from(base64String, "base64").toString("hex")
  );
}

function bytesToBase64(bytes: any) {
  try {
    bytes = v5ethers.utils.arrayify(bytes);
    return Buffer.from(v5ethers.utils.hexlify(bytes).substr(2), "hex").toString(
      "base64"
    );
  } catch (error) {
    throw new Error("Something went wrong");
  }
}

export const helper = {
  compressPDF,
  decompressPDF,
  encrypt,
  decrypt,
  base64ToBytes,
  bytesToBase64,
};
