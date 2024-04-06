import { Box, Button, MenuItem, Select, Typography } from "@mui/material";
import { ethers } from "ethers";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MedicalRecordContractAdd } from "../contract";
// import Logo from "../assets/medical_record.png"

type ClientType = 1 | 2;

declare global {
  interface Window {
    ethereum: any;
  }
}

export const Login = (): JSX.Element => {
  const [typeUser, setTypeUser] = useState<ClientType>(1);

  const [errorMessage, setErrorMessage] = useState("");
  const [defaultAccount, setDefaultAccount] = useState("");

  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  let MedicalRecordsContract;
  const navigate = useNavigate();

  const checkPatDocExists = async (userAddress) => {
    if (typeUser === 1) {
      const patientCount = await MedicalRecordsContract.patientCount();

      for (let i = 0; i < patientCount; i++) {
        // const element = array[i];
        const patientListAdd = await MedicalRecordsContract.patientList(i);

        if (String(patientListAdd) === String(userAddress)) {
          return true;
        }
      }
    } else {
      const docCount = await MedicalRecordsContract.docterCount();

      for (let i = 0; i < docCount; i++) {
        // const element = array[i];
        const docterListAdd = await MedicalRecordsContract.docterList(i);

        if (String(docterListAdd) === String(userAddress)) {
          return true;
        }
      }
    }

    return false;
  };

  const checkNetwork = async () => {
    const chainId = 421614;

    if (window.ethereum.networkVersion !== chainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          // params: [{ chainId: ethers.utils.hexlify(chainId) }],
          params: [{ chainId: `0x${Number(421614).toString(16)}` }],
        });
      } catch (err) {
        // This error code indicates that the chain has not been added to MetaMask
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainName: "Arbitrum Sepolia",
                // chainId: ethers.utils.hexlify(chainId),
                chainId: `0x${Number(421614).toString(16)}`,
                nativeCurrency: {
                  name: "ETH",
                  decimals: 18,
                  symbol: "ETH",
                },
                rpcUrls: ["https://sepolia-rollup.arbitrum.io/rpc"],
              },
            ],
          });
        }
      }
    }
  };

  const accountChangedHandler = async (newAccount) => {
    const address = await newAccount.getAddress();
    setDefaultAccount(address);

    const signer = await provider.getSigner();

    MedicalRecordsContract = new ethers.Contract(
      // "0xe6eDd92F2677f0E561Db49Da2b979DC70D15546a",
      MedicalRecordContractAdd,
      medicalRecordJson,
      signer
    );

    const checkUserxists = await checkPatDocExists(address);

    if (checkUserxists) {
      if (typeUser === 1) {
        sessionStorage.setItem("type", "patient");
        navigate("/dashboard");
      } else {
        sessionStorage.setItem("type", "doctor");
        navigate("/dashboard");
      }
    } else {
      const message = "Welcome, you are signing up.";
      const messageHash = ethers.utils.hashMessage(message);

      // const signer = await provider.getSigner();
      // const signature = await signer.signMessage(messageHash);
      const signature = await window?.ethereum.request({
        method: "personal_sign",
        params: [address, message],
      });

      const signatureParts = ethers.utils.splitSignature(signature);

      const publicKey = ethers.utils.recoverPublicKey(
        messageHash,
        signatureParts
      );
      // MedicalRecordsContract; = new ethers.Contract(
      //   "0x72bD6C0BCE7D547c2cC56A35dC2bEB3151cEE369",
      //   medicalRecordJson,
      //   signer
      // );

      // v5ethers.utils.arrayify() converts the public key to a bytes
      const check = await MedicalRecordsContract.modifyUser(
        ethers.utils.arrayify(publicKey),
        typeUser
      );

      // console.log(publicKey, "publickey");
      // console.log(
      //   ethers.utils.computePublicKey(
      //     "0xa44b6cb3bfa2a3dddc1bdb85b566156936ebdc7145e004ac25fe6ec269c9d52b"
      //   ),
      //   "gen"
      // );

      if (typeUser === 1) {
        sessionStorage.setItem("type", "patient");
        navigate("/dashboard");
      } else {
        sessionStorage.setItem("type", "doctor");
        navigate("/dashboard");
      }
    }

    // const address = await signer.getAddress();
  };

  const connectwalletHandler = () => {
    if (window.ethereum) {
      provider.send("eth_requestAccounts", []).then(async () => {
        await checkNetwork();
        await accountChangedHandler(provider.getSigner());
      });
    } else {
      setErrorMessage("Please Install MetaMask!!!");
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="98vh"
      width="98vw"
      sx={{ backgroundColor: "#f4f4f4" }}
    >
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          padding: "20px",
          borderRadius: "10px",
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(0, 0, 0, 0.1);",
        }}
        width="195px"
        height="250px"
      >
        <img
          src={require("../assets/medical_record.png")}
          alt=""
          width="100px"
          height="100px"
        />
        <Box>
          <Typography>I am a:</Typography>
          <Select
            value={typeUser}
            onChange={(e) => setTypeUser(e.target.value as ClientType)}
            sx={{ height: "35px", width: "180px" }}
            fullWidth
          >
            <MenuItem value={2}>Doctor</MenuItem>
            <MenuItem value={1}>Patient</MenuItem>
          </Select>
        </Box>

        <Button
          variant="contained"
          onClick={connectwalletHandler}
          sx={{ textTransform: "none" }}
        >
          Connect with Metamask
        </Button>
      </Box>
    </Box>
  );
};

export const medicalRecordJson = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "docterAccess",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "docterCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "docterList",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_patient",
        type: "address",
      },
      {
        internalType: "address",
        name: "_doctor",
        type: "address",
      },
    ],
    name: "getDoctorFiles",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_patient",
        type: "address",
      },
      {
        internalType: "address",
        name: "_doctor",
        type: "address",
      },
    ],
    name: "getDoctorPermission",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_doctor",
        type: "address",
      },
      {
        internalType: "bool",
        name: "_giveAccess",
        type: "bool",
      },
      {
        internalType: "bytes",
        name: "_fileForDoctor",
        type: "bytes",
      },
    ],
    name: "modifyAccess",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "publicKey",
        type: "bytes",
      },
      {
        internalType: "enum MedicalRecords.Role",
        name: "_role",
        type: "uint8",
      },
    ],
    name: "modifyUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "patientCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "patientList",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "patients",
    outputs: [
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "publicKeys",
    outputs: [
      {
        internalType: "bytes",
        name: "",
        type: "bytes",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "userRoles",
    outputs: [
      {
        internalType: "enum MedicalRecords.Role",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
