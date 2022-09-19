import {Routes, Route} from "react-router-dom";
import Header from "./Components/Header/Header";
import Home from "./Containers/Home/Home";
import Log from "./Containers/Log/Log";
import NotFound from "./Containers/NotFound/NotFound";
import Sign from "./Containers/Sign/Sign";

function App() {
  return (
    <>
      <Header />
      <Routes basename={process.env.PUBLIC_URL}>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Log />} />
        <Route path="/inscription" element={<Sign />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
