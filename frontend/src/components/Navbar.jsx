import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../App.css";


function Navbar(){

    const navigate = useNavigate();


    const [dark,setDark] = useState(
        localStorage.getItem("theme")==="dark"
    );


    useEffect(()=>{

        if(dark){

            document.body.classList.add("dark-mode");

            localStorage.setItem(
                "theme",
                "dark"
            );

        }
        else{

            document.body.classList.remove("dark-mode");

            localStorage.setItem(
                "theme",
                "light"
            );

        }


    },[dark]);




return(

<nav className="main-navbar">


<h2
className="nav-logo"
onClick={()=>navigate("/dashboard")}
>
SmartLoan AI
</h2>



<div className="nav-links">


<button
onClick={()=>navigate("/dashboard")}
>
Dashboard
</button>



<button
onClick={()=>navigate("/apply-loan")}
>
Apply Loan
</button>



<button
onClick={()=>navigate("/loan-history")}
>
Loan History
</button>




<button
className="theme-btn"
onClick={()=>setDark(!dark)}
>

{
dark
?
"☀️ Light"
:
"🌙 Dark"
}


</button>




<button
className="logout-btn"
onClick={()=>{

localStorage.clear();

navigate("/");

}}
>

Logout

</button>



</div>


</nav>


);


}


export default Navbar;