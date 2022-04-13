import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { HashRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./components/Homepage";
import Workshop from "./components/Workshop";
import ContactUs from "./components/ContactUs";
import Events from "./components/Events";
import ScrollToTop from "./components/ScrollToTop";
import { Container } from "react-bootstrap";
import FourOhFour from "./components/404";
import Sponsors from "./components/Sponsors";
import Gallery from "./components/Gallery";
function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Navbar />
      <div className="mycontainer">
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/workshop" element={<Workshop />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/events" element={<Events />} />
            <Route path="/sponsors" element={<Sponsors />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="*" element={<FourOhFour />} />
          </Routes>
        </Container>
      </div>
      <Footer />
    </HashRouter>
  );
}

export default App;
