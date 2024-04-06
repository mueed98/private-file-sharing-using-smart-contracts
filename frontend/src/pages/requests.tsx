import {
  Avatar,
  Box,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { NavDrawer } from "../components/drawer";
import { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { ethers } from "ethers";
import { medicalRecordJson } from "./login";
import { SigningKey } from "ethers/lib/utils";
import { helper } from "../helper";
import { MedicalRecordContractAdd } from "../contract";
import { useNavigate } from "react-router-dom";

export const Requests = (): JSX.Element => {
  const userType = sessionStorage.getItem("type");
  const [list, setList] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!(userType === "patient" || userType === "doctor")) {
      navigate("/");
    }
  }, [userType]);

  const [selectedDoc, setselectedDoc] = useState("");
  const [privateKey, setprivateKey] = useState("");

  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();

  // signer.getAddress().then((res) => setUserAddress(res));

  const MedicalRecordsContract = new ethers.Contract(
    // "0xe6eDd92F2677f0E561Db49Da2b979DC70D15546a",
    MedicalRecordContractAdd,
    medicalRecordJson,
    signer
  );

  const getList = async () => {
    if (userType === "patient") {
      const docCount = await MedicalRecordsContract.docterCount();

      for (let i = 0; i < docCount; i++) {
        const docterListAdd = await MedicalRecordsContract.docterList(i);

        setList((prev) => {
          if (prev.includes(docterListAdd.toString())) {
            return [...prev];
          } else {
            return [...prev, docterListAdd.toString()];
          }
        });
      }
    } else {
      const patCount = await MedicalRecordsContract.patientCount();

      for (let i = 0; i < patCount; i++) {
        const patientListAdd = await MedicalRecordsContract.patientList(i);

        setList((prev) => {
          if (prev.includes(patientListAdd.toString())) {
            return [...prev];
          } else {
            return [...prev, patientListAdd.toString()];
          }
        });
      }
    }
  };

  useEffect(() => {
    getList();
  }, [userType]);

  const handleFileInputChange = async (event) => {
    const doctorPublicKeyHex = await MedicalRecordsContract.publicKeys(
      // "0x1606Fdaef5Ca1620877775B0C6077Ca83260c047"
      selectedDoc
    );

    console.log(doctorPublicKeyHex, "doctorPublicKeyHex");

    // Convert the public key to a bytes array, which is what ethers.js expects
    const doctorPublicKeyBytes = ethers.utils.arrayify(doctorPublicKeyHex);

    console.log(doctorPublicKeyBytes, "doctorPublicKeyBytes");

    // Compute the shared secret
    const sharedSecret = new SigningKey(
      // "0xa44b6cb3bfa2a3dddc1bdb85b566156936ebdc7145e004ac25fe6ec269c9d52b"
      privateKey
    ).computeSharedSecret(doctorPublicKeyBytes);

    console.log(sharedSecret, "sharedSecret doctor");

    const file = event.target.files[0];
    const reader = new FileReader();
    console.log(file, "file");

    reader.onload = async (event) => {
      const content = event.target.result;
      // setFileContent(content);

      const FILE = await helper.compressPDF(content);
      console.log(FILE, "FILE");
      const encryptedFile = await helper.encrypt(FILE, sharedSecret);
      console.log(encryptedFile, "encryptedFile");

      const encryptedFileBytes = helper.base64ToBytes(encryptedFile);
      console.log(encryptedFileBytes, "encryptedFileBytes");

      // Save the file for doctor
      await MedicalRecordsContract.modifyAccess(
        // "0x1606Fdaef5Ca1620877775B0C6077Ca83260c047",
        selectedDoc,
        true,
        encryptedFileBytes
      );
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <Box display="flex">
      <NavDrawer />

      <Box marginLeft="310px" marginTop="20px">
        <Typography variant="h6" fontWeight="800" color="black">
          Upload your medical record.
        </Typography>

        <Typography
          variant="body1"
          fontWeight="800"
          color="black"
          marginTop="20px"
        >
          Step 1: Choose a doctor
        </Typography>

        {list.map((val) => (
          // <Box
          //   sx={
          //     selectedDoc === val
          //       ? {
          //           padding: "5px",
          //           borderWidth: "1px",
          //           borderStyle: "solid",
          //           borderColor: "green",
          //           cursor: "pointer",
          //           marginTop: "5px",
          //         }
          //       : {
          //           marginTop: "5px",
          //           cursor: "pointer",
          //         }
          //   }
          //   onClick={() => setselectedDoc(val)}
          // >
          //   <Typography variant="body1">{val}</Typography>
          // </Box>
          <Box
            display="flex"
            alignItems="center"
            padding="20px"
            width="600px"
            justifyContent="space-between"
            marginTop="5px"
            sx={
              selectedDoc===val
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
            onClick={() => setselectedDoc(val)}
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
          onChange={(e) => {
            setprivateKey("0x" + String(e.target.value).replace("0x", ""));
          }}
          size="small"
          sx={{ width: "70vw", marginTop: "5px" }}
          placeholder="Enter private key"
          disabled={selectedDoc ? false : true}
        />

        <Typography
          variant="body1"
          fontWeight="800"
          color="black"
          marginTop="20px"
        >
          Step 3: Choose your pdf to upload
        </Typography>

        <input
          type="file"
          onChange={handleFileInputChange}
          disabled={privateKey.length === 66 ? false : true}
          style={{ marginTop: "5px" }}
          accept="application/pdf"
        />

        {/* <TextField
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: "70vw",marginTop:"20px" }}
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
      </Box>
    </Box>
  );
};
