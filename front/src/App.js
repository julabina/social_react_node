import {Routes, Route} from "react-router-dom";
import Home from "./Containers/Home/Home";
import Log from "./Containers/Log/Log";
import Messenger from "./Containers/Messenger/Messenger";
import NotFound from "./Containers/NotFound/NotFound";
import Profil from "./Containers/Profil/Profil";
import Sign from "./Containers/Sign/Sign";
import About from "./Containers/About/About";
import Legals from "./Containers/Legals/Legals";

function App() {
  return (
      <Routes basename={process.env.PUBLIC_URL}>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Log />} />
        <Route path="/inscription" element={<Sign />} />
        <Route path="/profil_=:id" element={<Profil />} />
        <Route path="/mentions-legales" element={<Legals />} />
        <Route path="/a-propos" element={<About />} />
        <Route path="/messagerie">
            <Route index element={<Messenger />} />
            <Route path=":id" element={<Messenger />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
  );
}

export default App;
