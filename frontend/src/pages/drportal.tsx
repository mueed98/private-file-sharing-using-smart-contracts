import { useEffect, useState } from "react";
import { Box, Divider, Typography } from "@mui/material";
import { NavDrawer } from "../components/drawer";
import { ethers } from "ethers";
import { medicalRecordJson } from "./login";
import { MedicalRecordContractAdd } from "../contract";
import { useNavigate } from "react-router-dom";

export const DrPortal = (): JSX.Element => {
  const userType = sessionStorage.getItem("type");
  const [count, setCount] = useState();
  const [list, setList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!(userType === "patient" || userType === "doctor")) {
      navigate("/");
    }
  }, [userType]);

  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // const open = Boolean(anchorEl);
  // const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  //   setAnchorEl(event.currentTarget);
  // };
  // const handleClose = () => {
  //   setAnchorEl(null);
  // };

  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();

  // signer.getAddress().then((res) => setUserAddress(res));

  const MedicalRecordsContract = new ethers.Contract(
    // "0xe6eDd92F2677f0E561Db49Da2b979DC70D15546a",
    MedicalRecordContractAdd,
    medicalRecordJson,
    signer
  );

  const getCount = async () => {
    if (userType === "patient") {
      const doctorCount = await MedicalRecordsContract.docterCount();
      // return doctorCount;
      setCount(doctorCount.toString());
    } else {
      const patientCount = await MedicalRecordsContract.patientCount();
      // return patientCount;
      setCount(patientCount.toString());
    }
  };

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
    getCount();
    getList();
  }, [userType]);

  return (
    <Box display="flex">
      <NavDrawer />

      <Box marginLeft="310px" marginTop="20px">
        <Typography variant="h6" fontWeight="800" color="black">
          Dashboard
        </Typography>

        <Box display="flex" marginTop="20px">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="225px"
            padding="24px"
            sx={{ backgroundColor: "white", borderRadius: "10px" }}
            marginRight="20px"
          >
            <Box>
              <Typography variant="body2">
                {userType === "patient" ? "Doctors" : "Patients"}
              </Typography>
              <Typography variant="h6" fontWeight="800">
                {count}
              </Typography>
            </Box>

            <i
              className="fas fa-user-md"
              style={{ fontSize: "24px", color: "purple" }}
            ></i>
          </Box>

          {/* <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="225px"
            padding="24px"
            sx={{ backgroundColor: "white", borderRadius: "10px" }}
          >
            <Box>
              <Typography>Treatments</Typography>
              <Typography>402</Typography>
            </Box>

            <i
              className="fas fa-heartbeat"
              style={{ fontSize: "24px", color: "green" }}
            ></i>
          </Box> */}
        </Box>

        <Box display="flex" marginTop="20px">
          {/* <Box
            display="flex"
            flexDirection="column"
            // justifyContent="space-between"
            // alignItems="center"
            width="520px"
            padding="24px"
            sx={{ backgroundColor: "white", borderRadius: "10px" }}
            marginRight="20px"
          >
            <Typography variant="h6" fontWeight="800">
              Today's Appointments
            </Typography>

            <Box
              display="flex"
              alignItems="center"
              padding="20px"
              width="483px"
              justifyContent="space-between"
              marginTop="20px"
              sx={{
                "&:hover": {
                  backgroundColor: "rgb(249 250 251)",
                },
                borderRadius: "10px",
              }}
            >
              <Box display="flex">
                <Avatar
                  sx={{ height: "54px", width: "54px", marginRight: "10px" }}
                />
                <Box>
                  <Typography variant="h6" fontWeight="800">
                    Aisha
                  </Typography>
                  <Typography variant="body2">Check-up</Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="darkblue" fontWeight="800">
                On Going
              </Typography>
            </Box>
          </Box> */}

          <Box
            display="flex"
            flexDirection="column"
            width="520px"
            padding="24px"
            sx={{ backgroundColor: "white", borderRadius: "10px" }}
          >
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6" fontWeight="800">
                {userType === "patient" ? "Doctors" : "Patients"}
              </Typography>

              {/* <div>
                <IconButton
                  id="basic-button"
                  aria-controls={open ? "basic-menu" : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? "true" : undefined}
                  onClick={handleClick}
                  size="small"
                >
                  <MoreVertIcon fontSize="inherit" />
                </IconButton>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  MenuListProps={{
                    "aria-labelledby": "basic-button",
                  }}
                >
                  <MenuItem onClick={handleClose}>Profile</MenuItem>
                  <MenuItem onClick={handleClose}>My account</MenuItem>
                  <MenuItem onClick={handleClose}>Logout</MenuItem>
                </Menu>
              </div> */}
            </Box>

            <Divider
              orientation="horizontal"
              sx={{ width: "100%", marginTop: "10px" }}
            />

            <Box display="flex" flexDirection="column" marginTop="20px">
              {/* <Typography variant="body1" fontWeight="600">
                John Doe
              </Typography>
              <Typography variant="body2">johndoe@example.com</Typography>
              <Typography variant="body2">(123) 456-7890</Typography> */}
              {list.map((val) => (
                <Typography variant="body1" fontWeight="600">
                  {val}
                </Typography>
              ))}

              {/* <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginTop="10px"
              >
                <Box display="flex" alignItems="center">
                  <i className="fas fa-file-pdf mr-2"></i>
                  <Typography marginLeft="5px">Medical Detail</Typography>
                </Box>
                <div>
                  <IconButton
                    id="basic-button"
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                    size="small"
                  >
                    <MoreVertIcon fontSize="inherit" />
                  </IconButton>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                      "aria-labelledby": "basic-button",
                    }}
                  >
                    <MenuItem onClick={handleClose}>Profile</MenuItem>
                    <MenuItem onClick={handleClose}>My account</MenuItem>
                    <MenuItem onClick={handleClose}>Logout</MenuItem>
                  </Menu>
                </div>
              </Box> */}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
