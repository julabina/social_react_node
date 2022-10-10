import {Routes, Route} from "react-router-dom";
import Home from "./Containers/Home/Home";
import Log from "./Containers/Log/Log";
import Messenger from "./Containers/Messenger/Messenger";
import NotFound from "./Containers/NotFound/NotFound";
import Profil from "./Containers/Profil/Profil";
import Friend from "./Containers/Friend/Friend";
import Sign from "./Containers/Sign/Sign";

function App() {
  return (
      <Routes basename={process.env.PUBLIC_URL}>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Log />} />
        <Route path="/inscription" element={<Sign />} />
        <Route path="/profil_=:id" element={<Profil />} />
        <Route path="/amis" element={<Friend />} />
        <Route path="/messagerie">
            <Route index element={<Messenger />} />
            <Route path=":id" element={<Messenger />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
  );
}

export default App;
