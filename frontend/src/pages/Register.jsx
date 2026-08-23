import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    User,
    Mail,
    Lock,
    UserPlus
} from "lucide-react";

import API from "../../api/axios";

import "../../App.css";



function Register(){


    const navigate = useNavigate();



    const [name,setName] = useState("");

    const [email,setEmail] = useState("");

    const [password,setPassword] = useState("");







    const handleRegister = async(e)=>{


        e.preventDefault();



        try{


            const response = await API.post(

                "/users/register",

                {

                    name:name,

                    email:email,

                    password:password

                }

            );



            console.log(response.data);



            alert("Registration successful");



            navigate("/");



        }


        catch(error){


            console.log(error);



            alert(

                error.response?.data?.detail ||

                "Registration failed"

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

Create your AI loan account

</p>







<h2>

Register

</h2>







<form onSubmit={handleRegister}>


<div className="auth-input">


<User size={20}/>


<input

type="text"

placeholder="Full Name"

value={name}

onChange={(e)=>setName(e.target.value)}

required

/>


</div>








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

placeholder="Create Password"

value={password}

onChange={(e)=>setPassword(e.target.value)}

required

/>


</div>







<button

className="auth-btn"

type="submit"

>


<UserPlus size={20}/>


Register


</button>





</form>









<p className="auth-footer">


Already have an account?


<span

onClick={()=>navigate("/")}

>

Login

</span>


</p>







</div>





</div>


);


}



export default Register;