import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Lock,
    Mail,
    LogIn
} from "lucide-react";

import API from "../api/axios";
import "../App.css";



function Login(){


    const navigate = useNavigate();



    const [email,setEmail] = useState("");

    const [password,setPassword] = useState("");







    const handleLogin = async(e)=>{


        e.preventDefault();



        try{


            const response = await API.post(

                "/users/login",

                {

                    email:email,

                    password:password

                }

            );



            localStorage.setItem(

                "token",

                response.data.access_token

            );




            localStorage.setItem(

                "user",

                JSON.stringify(response.data)

            );




            alert("Login Successful");



            navigate("/dashboard");



        }


        catch(error){


            console.log(error);


            alert(

                error.response?.data?.detail ||

                "Login failed"

            );


        }


    };







return(


<div className="auth-page">



<div className="auth-card">





<h1>

SmartLoan AI

</h1>



<p className="auth-subtitle">

AI Powered Loan Approval System

</p>






<h2>

Welcome Back

</h2>





<form onSubmit={handleLogin}>


<div className="auth-input">


<Mail size={20}/>


<input

type="email"

placeholder="Email Address"

value={email}

onChange={(e)=>setEmail(e.target.value)}

required

/>


</div>






<div className="auth-input">


<Lock size={20}/>


<input

type="password"

placeholder="Password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

required

/>


</div>







<button

className="auth-btn"

type="submit"

>


<LogIn size={20}/>


Login


</button>





</form>








<p className="auth-footer">


Don't have an account?


<span

onClick={()=>navigate("/register")}

>

Register

</span>



</p>





</div>


</div>


);


}


export default Login;