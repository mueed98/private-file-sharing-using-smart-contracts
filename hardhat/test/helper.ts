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

function encrypt(text: string, sharedSecret: any) {
	const key = CryptoJS.enc.Hex.parse(
		v5ethers.utils.hexlify(sharedSecret).substr(2)
	);
	const iv = CryptoJS.lib.WordArray.random(16);
	const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv });
	return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
}

function decrypt(encryptedText: string, sharedSecret: any) {
	const rawData = CryptoJS.enc.Base64.parse(encryptedText);
	const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4));
	const encrypted = CryptoJS.lib.WordArray.create(rawData.words.slice(4));
	const key = CryptoJS.enc.Hex.parse(
		v5ethers.utils.hexlify(sharedSecret).substr(2)
	);
	const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, key, {
		iv: iv,
	});
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
