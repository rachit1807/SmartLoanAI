import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";

function UploadDocuments() {
    const navigate = useNavigate();

    const [applicationId, setApplicationId] = useState("");

    const [files, setFiles] = useState({
        income_report: null,
        aadhaar: null,
        pan: null,
        salary_slip: null,
        bank_statement: null,
        photo: null,
    });

    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFiles({
            ...files,
            [e.target.name]: e.target.files[0],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!applicationId) {
            alert("Please enter Application ID");
            return;
        }

        const formData = new FormData();

        formData.append("application_id", applicationId);

        Object.keys(files).forEach((key) => {
            if (files[key]) {
                formData.append(key, files[key]);
            }
        });

        try {
            setLoading(true);

            await API.post("/documents/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            alert("Documents uploaded successfully.");

            navigate("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bank-upload-page">
            <Navbar />
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-2xl">

                <h1 className="text-3xl font-bold mb-2">
                    Upload Loan Documents
                </h1>

                <p className="text-gray-500 mb-6">
                    Upload the required documents for verification.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <input
                        type="number"
                        placeholder="Application ID"
                        value={applicationId}
                        onChange={(e) => setApplicationId(e.target.value)}
                        className="w-full border rounded-lg p-3"
                    />

                    <div>
                        <label className="font-medium">
                            Income Report
                        </label>
                        <input
                            type="file"
                            name="income_report"
                            onChange={handleFileChange}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="font-medium">
                            Aadhaar Card
                        </label>
                        <input
                            type="file"
                            name="aadhaar"
                            onChange={handleFileChange}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="font-medium">
                            PAN Card
                        </label>
                        <input
                            type="file"
                            name="pan"
                            onChange={handleFileChange}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="font-medium">
                            Salary Slip
                        </label>
                        <input
                            type="file"
                            name="salary_slip"
                            onChange={handleFileChange}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="font-medium">
                            Bank Statement
                        </label>
                        <input
                            type="file"
                            name="bank_statement"
                            onChange={handleFileChange}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="font-medium">
                            Passport Size Photo
                        </label>
                        <input
                            type="file"
                            name="photo"
                            onChange={handleFileChange}
                            className="w-full"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
                    >
                        {loading ? "Uploading..." : "Upload Documents"}
                    </button>

                </form>

            </div>
        </div>
    );
}

export default UploadDocuments;
