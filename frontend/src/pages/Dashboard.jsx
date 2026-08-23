import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import API from "../api/axios";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import "../App.css";


function Dashboard(){

    const navigate = useNavigate();


    const [stats,setStats] = useState({

        total_loans:0,
        approved:0,
        rejected:0,
        pending:0,
        approval_percentage:0,
        risk_level:"Low"

    });


    const [user,setUser] = useState({});


    const [recentLoans,setRecentLoans] = useState([]);



    useEffect(()=>{


        const getDashboard = async()=>{


            try{


                const userData = JSON.parse(
                    localStorage.getItem("user")
                );


                setUser(userData);



                const statsResponse = await API.get(
                    `/loans/dashboard/${userData.user_id}`
                );


                setStats(
                    statsResponse.data
                );



                const historyResponse = await API.get(
                    `/loans/recent/${userData.user_id}`
                );


                setRecentLoans(
                    historyResponse.data
                );



            }
            catch(error){

                console.log(error);

            }


        };


        getDashboard();


    },[]);



    const chartData = [

        {
            name:"Total",
            value:stats.total_loans
        },

        {
            name:"Approved",
            value:stats.approved
        },

        {
            name:"Rejected",
            value:stats.rejected
        }

    ];




return(

<div className="dashboard">


<Navbar />



<h1>
Welcome to SmartLoan AI 👋
</h1>


<p className="subtitle">

AI powered loan approval and risk prediction system

</p>





<div className="stats">



<div className="stat-card">

<h3>
Total Loans
</h3>

<p>
{stats.total_loans}
</p>

</div>




<div className="stat-card">

<h3>
Approved
</h3>

<p>
{stats.approved}
</p>

</div>




<div className="stat-card">

<h3>
Rejected
</h3>

<p>
{stats.rejected}
</p>

</div>




<div className="stat-card">

<h3>
Approval %
</h3>

<p>

{stats.approval_percentage}%

</p>

</div>



</div>





<div className="profile-card">


<h2>
Profile Details
</h2>


<p>
Name: {user.name}
</p>


<p>
Email: {user.email}
</p>


</div>






<div className="profile-card">


<h2>
Risk Analysis
</h2>



<p>

Risk Level:

{" "}

<span className={
stats.risk_level==="High"
?
"risk-high"
:
stats.risk_level==="Medium"
?
"risk-medium"
:
"risk-low"
}>

{stats.risk_level}

</span>


</p>



<p>

Pending Applications:

{" "}

{stats.pending}

</p>





<h3>
Approval Rate
</h3>


<div className="progress-container">


<div

className="progress-bar"

style={{
width:`${stats.approval_percentage}%`
}}

>


</div>


</div>



<p>

{stats.approval_percentage}% Approval

</p>



</div>







<div className="profile-card">


<h2>
Loan Analytics
</h2>



<div className="chart-container">


<ResponsiveContainer
width="100%"
height={300}
>


<BarChart
data={chartData}
>


<XAxis dataKey="name"/>


<YAxis/>


<Tooltip/>


<Bar
    dataKey="value"
    fill="#2563eb"
/>


</BarChart>


</ResponsiveContainer>



</div>


</div>







<div className="recent-loans-card">


<h2>
Recent Loan Applications
</h2>



<table className="recent-table">


<thead>

<tr>

<th>
ID
</th>


<th>
Amount
</th>


<th>
Income
</th>


<th>
Status
</th>


<th>
Date
</th>


</tr>

</thead>




<tbody>


{

recentLoans.map((loan)=>(


<tr key={loan.id}>


<td>

#{loan.id}

</td>



<td>

₹ {loan.loan_amount}

</td>



<td>

₹ {loan.income}

</td>




<td>


<span

className={

loan.status==="Approved"

?

"recent-status-approved"

:

"recent-status-rejected"

}

>


{loan.status}


</span>


</td>




<td>

{
new Date(
loan.created_at
).toLocaleDateString()
}


</td>



</tr>



))


}



</tbody>



</table>



</div>








<div className="dashboard-buttons">


<button

onClick={()=>navigate("/apply-loan")}

>

Apply New Loan

</button>




<button

className="history-btn"

onClick={()=>navigate("/loan-history")}

>

Loan History

</button>



</div>





</div>


);


}


export default Dashboard;