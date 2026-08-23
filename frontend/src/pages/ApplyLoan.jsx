import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    CheckCircle,
    XCircle,
    ShieldCheck
} from "lucide-react";

import API from "../api/axios";
import "../App.css";


function ApplyLoan(){

    const navigate = useNavigate();


    const [formData,setFormData] = useState({

        age:"",
        gender:"",
        married:"",
        education:"",
        employment_status:"",
        income:"",
        coapplicant_income:"",
        loan_amount:"",
        loan_term:"",
        credit_history:"",
        property_area:""

    });



    const [result,setResult] = useState(null);

    const [loading,setLoading] = useState(false);



    // EMI Calculator States

    const [emiData,setEmiData] = useState({

        amount:"",
        rate:"",
        tenure:""

    });


    const [emi,setEmi] = useState(0);





    const handleChange=(e)=>{

        setFormData({

            ...formData,

            [e.target.name]:e.target.value

        });

    };






    const handleEmiChange=(e)=>{


        setEmiData({

            ...emiData,

            [e.target.name]:e.target.value

        });


    };






    const calculateEMI=()=>{


        const P = Number(emiData.amount);

        const annualRate = Number(emiData.rate);

        const N = Number(emiData.tenure);



        if(!P || !annualRate || !N){

            alert("Please enter all EMI details");

            return;

        }



        const monthlyRate = annualRate / 12 / 100;



        const emiValue =

        P *

        monthlyRate *

        Math.pow(1+monthlyRate,N)

        /

        (Math.pow(1+monthlyRate,N)-1);



        setEmi(

            Math.round(emiValue)

        );


    };









    const handleSubmit=async(e)=>{


        e.preventDefault();


        try{


            setLoading(true);



            const user = JSON.parse(

                localStorage.getItem("user")

            );



            const loanData={


                user_id:user.user_id,

                age:Number(formData.age),

                gender:formData.gender,

                married:formData.married,

                education:formData.education,

                employment_status:
                formData.employment_status,


                income:Number(formData.income),


                coapplicant_income:
                Number(formData.coapplicant_income),


                loan_amount:
                Number(formData.loan_amount),


                loan_term:
                Number(formData.loan_term),


                credit_history:
                formData.credit_history,


                property_area:
                formData.property_area

            };




            const response = await API.post(

                "/loans/apply",

                loanData

            );



            setResult(response.data);



        }


        catch(error){


            console.log(error);


            alert(

                error.response?.data?.detail ||

                "Something went wrong"

            );


        }


        finally{

            setLoading(false);

        }


    };







return(


<div className="loan-page">



<div className="loan-card-new">



<h1>
AI Loan Application
</h1>



<p className="subtitle">

Get instant AI based loan prediction

</p>






<form

className="loan-form"

onSubmit={handleSubmit}

>




<h2>
Personal Details
</h2>



<div className="input-grid">



<input
name="age"
placeholder="Age"
value={formData.age}
onChange={handleChange}
required
/>



<select
name="gender"
value={formData.gender}
onChange={handleChange}
required
>

<option value="">
Gender
</option>

<option value="Male">
Male
</option>

<option value="Female">
Female
</option>

</select>





<select
name="married"
value={formData.married}
onChange={handleChange}
required
>

<option value="">
Married
</option>

<option value="Yes">
Yes
</option>

<option value="No">
No
</option>

</select>





<select
name="education"
value={formData.education}
onChange={handleChange}
required
>

<option value="">
Education
</option>

<option value="Graduate">
Graduate
</option>

<option value="Not Graduate">
Not Graduate
</option>

</select>



</div>







<h2>
Financial Details
</h2>




<div className="input-grid">



<select
name="employment_status"
value={formData.employment_status}
onChange={handleChange}
required
>

<option value="">
Employment
</option>

<option value="Employed">
Employed
</option>

<option value="Self Employed">
Self Employed
</option>

</select>





<input
name="income"
placeholder="Monthly Income"
value={formData.income}
onChange={handleChange}
required
/>





<input
name="coapplicant_income"
placeholder="Coapplicant Income"
value={formData.coapplicant_income}
onChange={handleChange}
required
/>





<input
name="loan_amount"
placeholder="Loan Amount"
value={formData.loan_amount}
onChange={handleChange}
required
/>





<input
name="loan_term"
placeholder="Loan Term (Months)"
value={formData.loan_term}
onChange={handleChange}
required
/>





<select
name="credit_history"
value={formData.credit_history}
onChange={handleChange}
required
>

<option value="">
Credit History
</option>

<option value="Good">
Good
</option>

<option value="Bad">
Bad
</option>

</select>





<select
name="property_area"
value={formData.property_area}
onChange={handleChange}
required
>

<option value="">
Property Area
</option>

<option value="Urban">
Urban
</option>

<option value="Semiurban">
Semiurban
</option>

<option value="Rural">
Rural
</option>

</select>



</div>







<button

type="submit"

className="predict-btn"

>


{

loading

?

"Processing AI..."

:

"Predict Loan Approval"

}


</button>



</form>












{
result && (


<div

className={

result.status==="Approved"

?

"ai-result approved"

:

"ai-result rejected"

}

>


{

result.status==="Approved"

?

<CheckCircle size={45}/>

:

<XCircle size={45}/>

}



<h2>
Loan Prediction Result
</h2>



<h3>

Status:

{" "}

{result.status}

</h3>



<p>

Application ID:

{" "}

{result.application_id}

</p>




<p>

Approval Probability:

{" "}

{result.approval_probability}%

</p>





<div className="approval-bar">

<div

style={{

width:`${result.approval_probability}%`

}}

>

</div>

</div>




<p>

<ShieldCheck size={20}/>

Risk Level:

{" "}

{result.risk_level}

</p>



</div>


)

}









<div className="emi-card">


<h2>
EMI Calculator
</h2>



<div className="emi-grid">


<input

name="amount"

placeholder="Loan Amount"

value={emiData.amount}

onChange={handleEmiChange}

/>




<input

name="rate"

placeholder="Interest Rate %"

value={emiData.rate}

onChange={handleEmiChange}

/>




<input

name="tenure"

placeholder="Tenure Months"

value={emiData.tenure}

onChange={handleEmiChange}

/>



</div>





<button

type="button"

className="emi-btn"

onClick={calculateEMI}

>

Calculate EMI

</button>





{

emi>0 &&

<p className="emi-result">

Monthly EMI:

₹ {emi}

</p>

}



</div>







<button

className="back-dashboard-btn"

onClick={()=>navigate("/dashboard")}

>

← Back to Dashboard

</button>





</div>


</div>


);


}


export default ApplyLoan;