import { Routes, Route } from "react-router-dom";
import Login from "./markup/pages/LoginPage/LoginPage";
import Install from './util/install';
import Authenticator from "./Routes/Authenticator";
import Unauthorized from "./markup/pages/401";
import NotFound from "./markup/pages/404";

const install = import.meta.env.VITE_REACT_INSTALL;
const checking = import.meta.env.VITE_REACT_CHECKING;
const reseting = import.meta.env.VITE_REACT_RESET;

function App() {
  return (
    <div>
      <Routes>
        <Route path={install} element={<Install />} />
        <Route path="/login" element={<Login reset={false} />} />
        <Route path="/401" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        <Route path={reseting} element={<Login reset={true} confirm={false} />} />
        <Route path={checking} element={<Login reset={false} confirm={true} />} />
        <Route path="*" element={<Authenticator />} />

      </Routes>
    </div>
  );
}

export default App;