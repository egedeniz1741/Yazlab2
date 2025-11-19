import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home"; // Home'u ekledik
import "./App.css";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ana sayfa artık Home olsun */}
                <Route path="/" element={<Home />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;