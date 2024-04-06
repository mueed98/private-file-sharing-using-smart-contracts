import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MedicalRecordsModule = buildModule(
	`MedicalRecords_${Date.now()}`,
	(m) => {
		const MedicalRecords = m.contract("MedicalRecords");

		return { MedicalRecords };
	}
);

export default MedicalRecordsModule;
