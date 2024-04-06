import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { DrPortal } from "./pages/drportal";
import { Login } from "./pages/login";
import { MyPatients } from "./pages/mypatients";
import { Requests } from "./pages/requests";

function App() {
  const userType = sessionStorage.getItem("type");

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DrPortal />} />
        <Route path="/my_patients" element={<MyPatients />} />
        <Route path="/request" element={<Requests />} />
      </>
    )
  );

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
