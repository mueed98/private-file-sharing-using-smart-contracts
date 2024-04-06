import { expect } from "chai";
import hre from "hardhat";
import { MedicalRecords } from "../typechain-types";
import { Bytes, Signer, ethers as v5ethers } from "v5ethers";
import { helper } from "./helper";
import { SigningKey } from "v5ethers/lib/utils";

describe("MedicalRecords Contract", function () {
	let CONTRACT: MedicalRecords;
	let DOCTOR: any;
	let PATIENT: any;

	before(async () => {
		CONTRACT = await hre.ethers.deployContract("MedicalRecords");
		await CONTRACT.waitForDeployment();

		// signer 1 is doctor
		PATIENT = (await hre.ethers.getSigners())[1];
		PATIENT["privateKey"] =
			"0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
		// signer 2 is doctor
		DOCTOR = (await hre.ethers.getSigners())[2];
		DOCTOR["privateKey"] =
			"0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a";
	});

	it("User Registration - Register user as a patient", async function () {
		const message = "Hello, world!";
		const messageHash = v5ethers.utils.hashMessage(message); // Sign the message

		const signature = await PATIENT.signMessage(message); // Split signature into r, s, v

		const signatureParts = v5ethers.utils.splitSignature(signature); // Get public key from the signed message

		const publicKey = v5ethers.utils.recoverPublicKey(
			messageHash,
			signatureParts
		);

		// v5ethers.utils.arrayify() converts the public key to a bytes
		await CONTRACT.connect(PATIENT).modifyUser(
			v5ethers.utils.arrayify(publicKey),
			1
		);
		expect(await CONTRACT.userRoles(PATIENT.address)).to.equal(1);

		const _key = await CONTRACT.connect(PATIENT).publicKeys(PATIENT.address);
		expect(v5ethers.utils.hexlify(_key)).to.equal(publicKey);
	});

	it("User Registration - Register a user as a doctor", async function () {
		// Create a message
		const message = "Hello, world!";
		const messageHash = v5ethers.utils.hashMessage(message);

		// Sign the message
		const signature = await DOCTOR.signMessage(message);

		// Split signature into r, s, v
		const signatureParts = v5ethers.utils.splitSignature(signature);

		// Get public key from the signed message
		const publicKey = v5ethers.utils.recoverPublicKey(
			messageHash,
			signatureParts
		);

		// v5ethers.utils.arrayify() converts the public key to a bytes
		await CONTRACT.connect(DOCTOR).modifyUser(
			v5ethers.utils.arrayify(publicKey),
			2
		);
		expect(await CONTRACT.userRoles(DOCTOR.address)).to.equal(2);

		const _key = await CONTRACT.connect(DOCTOR).publicKeys(DOCTOR.address);
		expect(v5ethers.utils.hexlify(_key)).to.equal(publicKey);
	});

	it("simple string test", async function () {
		// Compute the shared secret
		const doctorPublicKeyHex = await CONTRACT.publicKeys(DOCTOR.address);
		const doctorPublicKeyBytes = v5ethers.utils.arrayify(doctorPublicKeyHex);
		const patientPublicKeyHex = await CONTRACT.publicKeys(PATIENT.address);
		const patientPublicKeyBytes = v5ethers.utils.arrayify(patientPublicKeyHex);
		const sharedSecret_P = new SigningKey(
			PATIENT.privateKey
		).computeSharedSecret(doctorPublicKeyBytes);

		const sharedSecret_D = new SigningKey(
			DOCTOR.privateKey
		).computeSharedSecret(patientPublicKeyBytes);
		expect(sharedSecret_P).to.equal(sharedSecret_D);

		const TEST_STRING = "This is a test string.";
		const encryptedString = await helper.encrypt(TEST_STRING, sharedSecret_P);
		const decryptedString = await helper.decrypt(
			encryptedString,
			sharedSecret_D
		);
		expect(decryptedString).to.equal(TEST_STRING);
	});

	it("save file from patient", async function () {
		// Get the public key of the doctor from the contract
		const doctorPublicKeyHex = await CONTRACT.publicKeys(DOCTOR.address);

		// Convert the public key to a bytes array, which is what ethers.js expects
		const doctorPublicKeyBytes = v5ethers.utils.arrayify(doctorPublicKeyHex);

		// Compute the shared secret
		const sharedSecret = new SigningKey(PATIENT.privateKey).computeSharedSecret(
			doctorPublicKeyBytes
		);

		// Encrypt the file with the shared secret
		const FILE = await helper.compressPDF("./example.pdf");
		const encryptedFile = await helper.encrypt(FILE, sharedSecret);
		const encryptedFileBytes = helper.base64ToBytes(encryptedFile);

		// Save the file for doctor
		await CONTRACT.connect(PATIENT).modifyAccess(
			DOCTOR.address,
			true,
			encryptedFileBytes
		);

		// Check if the doctor has access to the patient's file
		expect(
			await CONTRACT.getDoctorPermission(PATIENT.address, DOCTOR.address)
		).to.equal(true);
	});
	it("Check file on doctor's end", async function () {
		const PATIENTPublicKeyHex = await CONTRACT.publicKeys(PATIENT.address);
		const sharedSecret = new SigningKey(DOCTOR.privateKey).computeSharedSecret(
			PATIENTPublicKeyHex
		);

		const doctorFile = await CONTRACT.getDoctorFiles(
			PATIENT.address,
			DOCTOR.address
		); // Convert the encrypted file from bytes to base64

		const encryptedFileBase64 = await helper.bytesToBase64(doctorFile); // Decrypt the base64 file

		const decryptedFileBase64 = await helper.decrypt(
			encryptedFileBase64,
			sharedSecret
		); // Decompress the file

		await helper.decompressPDF(decryptedFileBase64, "doctor");
	});

	/*
	it("Access Modification - Revoke a doctor's access to patient's record", async function () {
		await CONTRACT.connect(PATIENT).modifyAccess(
			DOCTOR.address,
			false,
			v5ethers.utils.toUtf8Bytes("")
		);
		expect(
			await CONTRACT.getDoctorPermission(PATIENT.address, DOCTOR.address)
		).to.equal(false);
	});
	 */
});
