import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Avatar, Box, Drawer, Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupIcon from "@mui/icons-material/Group";
import InboxIcon from "@mui/icons-material/Inbox";
import Logout from "@mui/icons-material/Logout";
import { ethers } from "ethers";

export const NavDrawer = (): JSX.Element => {
  const userType = sessionStorage.getItem("type");

  const [selected, setSelected] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();

  const [userAddress, setUserAddress] = useState("");
  const provider = new ethers.providers.Web3Provider(window?.ethereum);
  const signer = provider.getSigner();
  signer.getAddress().then((res) => setUserAddress(res));

  useEffect(() => {
    if (location?.pathname === "/dashboard") {
      setSelected("dashboard");
    } else if (location?.pathname === "/my_patients") {
      setSelected("my-patients");
    } else if (location?.pathname === "/request") {
      setSelected("requests");
    }
  }, [location?.pathname]);

  return (
    <Drawer variant="permanent" anchor="left">
      <Box
        display="flex"
        flexDirection="column"
        sx={{
          width: "250px",
          backgroundColor: "#0D47A1",
          height: "100%",
        }}
        alignItems="center"
        padding="20px"
      >
        <Avatar sx={{ height: "104px", width: "104px" }} />

        <Typography sx={{ color: "white", fontSize: "12px" }}>
          {userAddress}
        </Typography>
        {/* <Typography variant="body2" sx={{ color: "#BDBDBD" }}>
          General Practitioner
        </Typography> */}

        <Box
          marginTop="20px"
          display="flex"
          flexDirection="column"
          height="80vh"
          alignItems="stretch"
          justifyContent="space-between"
        >
          <Box>
            <Box
              display="flex"
              //   justifyContent="space-evenly"
              alignItems="center"
              width="227px"
              padding="10px"
              sx={
                selected === "dashboard"
                  ? {
                      backgroundColor: "#1D4ED8",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }
                  : { borderRadius: "5px", cursor: "pointer" }
              }
              onClick={() => {
                navigate("/dashboard");
                setSelected("dashboard");
              }}
            >
              <DashboardIcon
                sx={{
                  height: "20px",
                  width: "20px",
                  marginRight: "10px",
                  color: "white",
                }}
              />
              <Typography variant="body2" color="white">
                Dashboard
              </Typography>
            </Box>

            {userType === "doctor" && (
              <Box
                display="flex"
                //   justifyContent="space-evenly"
                alignItems="center"
                width="227px"
                padding="10px"
                sx={
                  selected === "my-patients"
                    ? {
                        backgroundColor: "#1D4ED8",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }
                    : { borderRadius: "5px", cursor: "pointer" }
                }
                onClick={() => {
                  navigate("/my_patients");
                  setSelected("my-patients");
                }}
              >
                <GroupIcon
                  sx={{
                    height: "20px",
                    width: "20px",
                    marginRight: "10px",
                    color: "white",
                  }}
                />
                <Typography variant="body2" color="white">
                  My Patients
                </Typography>
              </Box>
            )}

            {userType === "patient" && (
              <Box
                display="flex"
                //   justifyContent="space-evenly"
                alignItems="center"
                width="227px"
                padding="10px"
                sx={
                  selected === "requests"
                    ? {
                        backgroundColor: "#1D4ED8",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }
                    : { borderRadius: "5px", cursor: "pointer" }
                }
                onClick={() => {
                  navigate("/request");
                  setSelected("requests");
                }}
              >
                <InboxIcon
                  sx={{
                    height: "20px",
                    width: "20px",
                    marginRight: "10px",
                    color: "white",
                  }}
                />
                <Typography variant="body2" color="white">
                  Requests
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            display="flex"
            //   justifyContent="space-evenly"
            alignItems="center"
            width="227px"
            padding="10px"
            sx={
              selected === "logout"
                ? {
                    backgroundColor: "#1D4ED8",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }
                : { borderRadius: "5px", cursor: "pointer" }
            }
            onClick={() => {
              navigate("/");
            }}
          >
            <Logout
              sx={{
                height: "20px",
                width: "20px",
                marginRight: "10px",
                color: "white",
              }}
            />
            <Typography variant="body2" color="white">
              Logout
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};
