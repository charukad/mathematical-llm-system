import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MathJaxContext } from "better-react-mathjax";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import Home from "./pages/Home";
import ProblemSolver from "./pages/ProblemSolver";
import NotFound from "./pages/NotFound";

// MathJax configuration
const mathJaxConfig = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
  },
};

function App() {
  return (
    <MathJaxContext config={mathJaxConfig}>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/solver" element={<ProblemSolver />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </MathJaxContext>
  );
}

export default App;
