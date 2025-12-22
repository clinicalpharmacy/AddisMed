import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "", phone: "", email: "", institution: "",
    country: "", province: "", city: "", specialty: "",
    password: "", confirmPassword: ""
  });

  const [agree, setAgree] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [userAgreement, setUserAgreement] = useState(""); // State to hold the agreement text

  // Fetch user agreement from the database
  useEffect(() => {
    const fetchUserAgreement = async () => {
      const { data, error } = await supabase
        .from("user_agreement")
        .select("agreement_text")
        .order("created_at", { ascending: false }) // Get the latest agreement
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching user agreement:", error.message);
      } else {
        setUserAgreement(data?.agreement_text || "No agreement found."); // Set the agreement text
      }
    };

    fetchUserAgreement();
  }, []); // Fetch on component mount

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agree) {
      setErrorMessage("You must agree to the terms before signing up.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", formData.email)
        .single();

      if (existingUser) {
        setErrorMessage("User already exists! Please login.");
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        }, {
      // Redirect user to your custom page after email confirmation
      redirectTo: "https://www.clinicalpharmacytool.com/login"
      });

      if (authError) {
        setErrorMessage("Error signing up: " + authError.message);
        return;
      }

      await supabase.from("users").insert([{
        email: formData.email,
        full_name: formData.fullName,
        phone: formData.phone,
        institution: formData.institution,
        country: formData.country,
        region: formData.province,
        woreda: formData.city,
        tin_number: formData.specialty,
        approved: false, // Needs admin approval
         }]);

      setSuccessMessage("Signup successful! Please wait for admin approval.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setErrorMessage("Unexpected error occurred: " + error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>

        {successMessage && <p className="text-green-600 text-center">{successMessage}</p>}
        {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}


        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {["fullName", "phone", "email", "institution", "country", "province", "city", "specialty"].map((field, idx) => (
            <input key={idx} type="text" name={field} placeholder={field.replace(/([A-Z])/g, " $1")} required={field !== "specialty"} onChange={handleChange} className="border p-2 rounded w-full" />
          ))}
          <input type="password" name="password" placeholder="Password" required onChange={handleChange} className="border p-2 rounded w-full" />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" required onChange={handleChange} className="border p-2 rounded w-full" />

          <button type="submit" disabled={!agree} className={`col-span-2 py-2 rounded ${agree ? "bg-blue-600 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"}`}>
            Sign Up
          </button>
        </form>
        {/* User Agreement Section */}
        <div className="border p-4 rounded bg-gray-50 mb-4">
          <h3 className="text-lg font-semibold mb-2">User Agreement before Sign Up:</h3>
          {/* Render fetched agreement text */}
          <p className="text-sm text-gray-700">{userAgreement}</p>

          <div className="mt-3 flex items-center">
            <input
              type="checkbox"
              id="agree"
              checked={agree}
              onChange={() => setAgree(!agree)}
              className="w-5 h-5"
            />
            <label htmlFor="agree" className="ml-2 text-gray-700 font-medium">I Agree</label>
          </div>
        </div>

        <p className="mt-2 text-center">Already have an account? <a href="/login" className="text-blue-600">Login</a></p>
      </div>
    </div>
  );
};

export default Signup;
