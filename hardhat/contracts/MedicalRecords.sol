// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Contract to handle the storage of Medical Records
contract MedicalRecords {
    // Enum to define roles for users
    enum Role {
        None,
        Patient,
        Doctor
    }

    // Struct to define a patient
    struct Patient {
        bool exists; // Flag to check if a patient exists
        // Mapping to keep track of doctors authorized to access the patient's medical record
        mapping(address => bool) doctorPermission;
        // Mapping to keep track of data associated with each authorized doctor
        mapping(address => bytes) doctorFiles;
    }

    // Mapping from user's address to their public keys
    mapping(address => bytes) public publicKeys;
    // Mapping from user's address to their roles
    mapping(address => Role) public userRoles;
    // Mapping from patient's address to their records
    mapping(address => Patient) public patients;

    // Mapping from doctor's address to their list of patients
    mapping(address => address[]) public docterAccess;

    address[] public docterList;
    uint256 public docterCount;
    address[] public patientList;
    uint256 public patientCount;

    // Modifier for role-based control
    modifier onlyRole(Role _role) {
        require(userRoles[msg.sender] == _role, "Not authorized.");
        _;
    }

    // Empty constructor
    constructor() {}

    // Function to assign a user a role (Patient or Doctor) and store their public key
    function modifyUser(bytes calldata publicKey, Role _role) public {
        require(_role == Role.Patient || _role == Role.Doctor, "Invalid role.");
        require(userRoles[msg.sender] == Role.None, "Role already assigned.");
        if (_role == Role.Doctor) {
            docterList.push(msg.sender);
            docterCount++;
        } else if (_role == Role.Patient) {
            patientList.push(msg.sender);
            patientCount++;
        }
        publicKeys[msg.sender] = publicKey;
        userRoles[msg.sender] = _role;
    }

    // Function to modify doctor's access to patient's medical record
    // This function allows a patient to give or revoke a doctor's access to their medical records
    function modifyAccess(
        address _doctor,
        bool _giveAccess,
        bytes calldata _fileForDoctor
    ) public onlyRole(Role.Patient) {
        if (!_giveAccess) {
            delete patients[msg.sender].doctorPermission[_doctor];
            delete patients[msg.sender].doctorFiles[_doctor];
        } else {
            patients[msg.sender].doctorPermission[_doctor] = true;
            patients[msg.sender].doctorFiles[_doctor] = _fileForDoctor;
            docterAccess[_doctor].push(msg.sender);
        }
    }

    // Function to check if a doctor has permission to access a patient's data
    function getDoctorPermission(
        address _patient,
        address _doctor
    ) public view returns (bool) {
        return patients[_patient].doctorPermission[_doctor];
    }

    // Function to get the data associated with a doctor for a patient
    function getDoctorFiles(
        address _patient,
        address _doctor
    ) public view returns (bytes memory) {
        return patients[_patient].doctorFiles[_doctor];
    }
}
