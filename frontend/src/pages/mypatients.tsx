// @ts-nocheck
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { NavDrawer } from "../components/drawer";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { medicalRecordJson } from "./login";
import { SigningKey } from "ethers/lib/utils";
import { helper } from "../helper";
import { MedicalRecordContractAdd } from "../contract";
import { useNavigate } from "react-router-dom";

export const MyPatients = (): JSX.Element => {
  const userType = sessionStorage.getItem("type");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!(userType === "patient" || userType === "doctor")) {
      navigate("/");
    }
  }, [userType]);

  // const [search, setSearch] = useState("");
  const [userAddress, setUserAddress] = useState("");
  // const [compressedPDF, setCompressedPDF] = useState(null);
  // const [fileContent, setFileContent] = useState<any>();

  const [selectedPat, setselectedPat] = useState("");
  const [privateKey, setprivateKey] = useState("");

  const [error, seterror] = useState("");

  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();

  signer.getAddress().then((res) => setUserAddress(res));

  const MedicalRecordsContract = new ethers.Contract(
    // "0xe6eDd92F2677f0E561Db49Da2b979DC70D15546a",
    MedicalRecordContractAdd,
    medicalRecordJson,
    signer
  );

  // Use a file input to allow the user to select a PDF file
  // const handleFileInputChange = async (event) => {
  //   const doctorPublicKeyHex = await MedicalRecordsContract.publicKeys(
  //     "0x1606Fdaef5Ca1620877775B0C6077Ca83260c047"
  //   );

  //   console.log(doctorPublicKeyHex, "doctorPublicKeyHex");

  //   // Convert the public key to a bytes array, which is what ethers.js expects
  //   const doctorPublicKeyBytes = ethers.utils.arrayify(doctorPublicKeyHex);

  //   console.log(doctorPublicKeyBytes, "doctorPublicKeyBytes");

  //   // Compute the shared secret
  //   const sharedSecret = new SigningKey(
  //     "0xa44b6cb3bfa2a3dddc1bdb85b566156936ebdc7145e004ac25fe6ec269c9d52b"
  //   ).computeSharedSecret(doctorPublicKeyBytes);

  //   console.log(sharedSecret, "sharedSecret doctor");

  //   const file = event.target.files[0];
  //   const reader = new FileReader();
  //   console.log(file, "file");

  //   reader.onload = async (event) => {
  //     const content = event.target.result;
  //     // setFileContent(content);

  //     const FILE = await helper.compressPDF(content);
  //     console.log(FILE, "FILE");
  //     const encryptedFile = await helper.encrypt(FILE, sharedSecret);
  //     console.log(encryptedFile, "encryptedFile");

  //     const encryptedFileBytes = helper.base64ToBytes(encryptedFile);
  //     console.log(encryptedFileBytes, "encryptedFileBytes");

  //     // Save the file for doctor
  //     await MedicalRecordsContract.modifyAccess(
  //       "0x1606Fdaef5Ca1620877775B0C6077Ca83260c047",
  //       true,
  //       encryptedFileBytes
  //     );
  //   };

  //   reader.readAsArrayBuffer(file);
  // };

  const getFile = async () => {
    try {
      setLoading(true);
      const PATIENTPublicKeyHex = await MedicalRecordsContract.publicKeys(
        // "0x1e6d684046f7d99f78639562bB17d53d3CEFc937"
        selectedPat
      );
      console.log(PATIENTPublicKeyHex, "PATIENTPublicKeyHex");

      // const patientPublicKeyBytes = ethers.utils.arrayify(PATIENTPublicKeyHex);

      const sharedSecret = new SigningKey(
        // "0x88d8b9f5044e81b0a31a9667cedef95358c18ee97a264482517d50992bc53970"
        privateKey
      ).computeSharedSecret(PATIENTPublicKeyHex);
      // ).computeSharedSecret(patientPublicKeyBytes);

      console.log(sharedSecret, "sharedSecret patient");

      const doctorFile = await MedicalRecordsContract.getDoctorFiles(
        // "0x1e6d684046f7d99f78639562bB17d53d3CEFc937",
        selectedPat,
        // "0x1606Fdaef5Ca1620877775B0C6077Ca83260c047"
        userAddress
      ); // Convert the encrypted file from bytes to base64

      console.log(doctorFile, "doctorFile");

      const encryptedFileBase64 = await helper.bytesToBase64(doctorFile); // Decrypt the base64 file

      console.log(encryptedFileBase64, "encryptedFileBase64");

      const decryptedFileBase64 = await helper.decrypt(
        encryptedFileBase64,
        sharedSecret
      ); // Decompress the file

      console.log(decryptedFileBase64, "decryptedFileBase64");

      await helper.decompressPDF(decryptedFileBase64, "doctor");
      setLoading(false);
    } catch (error) {
      seterror(error);
      setLoading(false);
    }
  };

  const getList = async () => {
    try {
      const patCount = await MedicalRecordsContract.patientCount();

      for (let i = 0; i < patCount; i++) {
        const patientListAdd = await MedicalRecordsContract.patientList(i);

        const checkDownload = await MedicalRecordsContract.getDoctorPermission(
          patientListAdd.toString(),
          userAddress
        );

        if (checkDownload)
          setList((prev) => {
            if (prev.includes(patientListAdd.toString())) {
              return [...prev];
            } else {
              return [...prev, patientListAdd.toString()];
            }
          });
      }
    } catch (error) {
      seterror(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress) getList();
  }, [userAddress]);

  return (
    <Box display="flex">
      <NavDrawer />

      <Box marginLeft="310px" marginTop="20px">
        <Typography variant="h6" fontWeight="800" color="black">
          My Patients
        </Typography>

        <Typography
          variant="body1"
          fontWeight="800"
          color="black"
          marginTop="20px"
        >
          Step 1: Choose a patient
        </Typography>

        {list.map((val) => (
          <Box
            display="flex"
            alignItems="center"
            padding="20px"
            width="600px"
            justifyContent="space-between"
            marginTop="5px"
            sx={
              selectedPat===val
                ? {
                    backgroundColor: "rgb(249 250 251)",
                    borderRadius: "10px",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: "green",
                    cursor: "pointer",
                  }
                : {
                    backgroundColor: "rgb(249 250 251)",
                    borderRadius: "10px",
                  }
            }
            onClick={() => setselectedPat(val)}
          >
            <Box display="flex">
              <Avatar
                sx={{ height: "54px", width: "54px", marginRight: "10px" }}
              />
              <Box>
                <Typography variant="h6" fontWeight="800">
                  {val}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}

        <Typography
          variant="body1"
          fontWeight="800"
          color="black"
          marginTop="20px"
        >
          Step 2: Please enter your private key
        </Typography>

        <TextField
          variant="outlined"
          value={privateKey}
          onChange={(e) =>
            setprivateKey("0x" + String(e.target.value).replace("0x", ""))
          }
          size="small"
          sx={{ width: "70vw", marginTop: "5px" }}
          placeholder="Enter private key"
          disabled={selectedPat ? false : true}
        />

        <Typography
          variant="body1"
          fontWeight="800"
          color="black"
          marginTop="20px"
        >
          Step 3: Download patient's medical record
        </Typography>

        <Button
          variant="contained"
          sx={{ textTransform: "none" }}
          onClick={getFile}
          disabled={privateKey.length === 66 && !loading ? false : true}
        >
          {loading ? <CircularProgress /> : "Download"}
        </Button>

        {error && (
          <Typography variant="subtitle1" sx={{ color: "red" }}>
            {error}
          </Typography>
        )}

        {/* <TextField
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ width: "70vw", marginTop: "20px" }}
        placeholder="Search for patients."
        InputProps={{
          sx: { borderRadius: "50px", backgroundColor: "white" },
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      /> */}

        {/* <div>
          <input type="file" onChange={handleFileInputChange} />
          {compressedPDF && (
            <a
              href={`data:application/pdf;base64,${compressedPDF}`}
              download="compressed_pdf.pdf"
            >
              Download Compressed PDF
            </a>
          )}
        </div> */}

        {/* <Button variant="contained" onClick={getFile}>
          Login
        </Button> */}
      </Box>
    </Box>
  );
};
