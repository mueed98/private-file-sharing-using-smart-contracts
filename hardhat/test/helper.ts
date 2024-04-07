const fs = require("fs");
const zlib = require("zlib");
const { PDFDocument } = require("pdf-lib");
const CryptoJS = require("crypto-js");
import { ethers as v5ethers } from "v5ethers";

const path = require("path");

async function compressPDF(fileName: string) {
	const filePath = path.join(__dirname, fileName);
	const fileBuffer = fs.readFileSync(filePath);
	const pdfDoc = await PDFDocument.load(fileBuffer);
	const pdfBytes = await pdfDoc.save();
	const compressedPDFBytes = zlib.gzipSync(pdfBytes, {
		level: zlib.constants.Z_BEST_COMPRESSION,
	});

	return compressedPDFBytes.toString("base64");
}

async function decompressPDF(compressedPDFBase64: string, fileName: string) {
	const compressedPDFBytes = Buffer.from(compressedPDFBase64, "base64");
	const decompressedPDFBytes = zlib.gunzipSync(compressedPDFBytes);
	const pdfDoc = await PDFDocument.load(decompressedPDFBytes);
	const pdfBytes = await pdfDoc.save();
	fs.writeFileSync(`./test/${fileName}.pdf`, pdfBytes); // Save the decompressed PDF to a file
}

// This function is used to encrypt a plain text string using a shared secret.
function encrypt(text: string, sharedSecret: any) {
	// We first parse the shared secret into a format that CryptoJS can use.
	const key = CryptoJS.enc.Hex.parse(
		v5ethers.utils.hexlify(sharedSecret).substr(2)
	);

	// We generate a random initialization vector (IV). This ensures that even if we encrypt
	// the same plain text with the same key multiple times, the encrypted text will still be different.
	const iv = CryptoJS.lib.WordArray.random(16);

	// We then use CryptoJS's AES implementation to encrypt the plain text.
	// AES is a widely used symmetric encryption algorithm.
	const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv });

	//  The IV and the encrypted text are concatenated and returned as a base64 string.
	return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
}

// This function is used to decrypt an encrypted text string using a shared secret.
function decrypt(encryptedText: string, sharedSecret: any) {
	// We first parse the base64 string back into raw data.
	const rawData = CryptoJS.enc.Base64.parse(encryptedText);

	// The IV was stored in the first 4 words of the raw data, so we extract it.
	const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4));

	// The encrypted text is the rest of the raw data, so we extract that as well.
	const encrypted = CryptoJS.lib.WordArray.create(rawData.words.slice(4));

	// We parse the shared secret into a format that CryptoJS can use.
	const key = CryptoJS.enc.Hex.parse(
		v5ethers.utils.hexlify(sharedSecret).substr(2)
	);

	// We then use CryptoJS's AES implementation to decrypt the encrypted text.
	const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, {
		iv: iv,
	});

	// The decrypted text is returned as a UTF-8 string.
	return decrypted.toString(CryptoJS.enc.Utf8);
}

function base64ToBytes(base64String: string) {
	return v5ethers.utils.arrayify(
		"0x" + Buffer.from(base64String, "base64").toString("hex")
	);
}

function bytesToBase64(bytes: any) {
	bytes = v5ethers.utils.arrayify(bytes);
	return Buffer.from(v5ethers.utils.hexlify(bytes).substr(2), "hex").toString(
		"base64"
	);
}

export const helper = {
	compressPDF,
	decompressPDF,
	encrypt,
	decrypt,
	base64ToBytes,
	bytesToBase64,
};
