import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ApplyLoan from "./pages/ApplyLoan";
import LoanHistory from "./pages/LoanHistory";


function App(){

  return (

    <BrowserRouter>

      <Routes>


        {/* Login Page */}
        <Route
          path="/"
          element={<Login />}
        />


        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* Apply Loan */}
        <Route
          path="/apply-loan"
          element={<ApplyLoan />}
        />


        {/* Loan History */}
        <Route
          path="/loan-history"
          element={<LoanHistory />}
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;