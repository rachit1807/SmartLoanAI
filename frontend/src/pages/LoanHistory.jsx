import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import API from "../api/axios";

import "../App.css";


function LoanHistory(){


    const navigate = useNavigate();


    const [loans,setLoans] = useState([]);




    useEffect(()=>{


        const getHistory = async()=>{


            try{


                const userData = JSON.parse(
                    localStorage.getItem("user")
                );


                const response = await API.get(

                    `/loans/history/${userData.user_id}`

                );


                setLoans(response.data);


            }


            catch(error){

                console.log(error);

            }


        };



        getHistory();


    },[]);







    return(


    <div className="history-page">


        <Navbar />



        <div className="history-container">


            <h1>
                Recent Loan Applications
            </h1>


            <p className="subtitle">

                View your previous loan applications

            </p>





            <div className="history-card">



                <table className="history-table">


                    <thead>


                        <tr>

                            <th>ID</th>

                            <th>Loan Amount</th>

                            <th>Income</th>

                            <th>Status</th>

                            <th>Date</th>


                        </tr>


                    </thead>





                    <tbody>


                    {


                    loans.map((loan)=>(



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

                                loan.status === "Approved"

                                ?

                                "badge-approved"

                                :

                                "badge-rejected"

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


export default LoanHistory;