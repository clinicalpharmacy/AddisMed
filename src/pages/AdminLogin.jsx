import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabase";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the admin exists in the "admin" table
    const { data, error } = await supabase
      .from("admin")
      .select("*")
      .eq("email", formData.email)
      .single();

    if (error || !data || data.password !== formData.password) {
      alert("Invalid admin credentials!");
    } else {
      // ✅ Store authentication token
      localStorage.setItem("adminToken", "authenticated");

      // ✅ Redirect to Admin Dashboard
      navigate("/admin");
    }
  };

  const handleChangeCredentials = async (e) => {
    e.preventDefault();

    // Check if the admin exists in the "admin" table
    const { data, error } = await supabase
      .from("admin")
      .select("*")
      .eq("email", formData.email)
      .single();

    if (error || !data || data.password !== formData.password) {
      alert("Invalid admin credentials!");
    } else {
      // Update email and password
      const { error: updateError } = await supabase
        .from("admin")
        .update({ email: newEmail, password: newPassword })
        .eq("email", formData.email);

      if (updateError) {
        alert("Error updating credentials!");
      } else {
        alert("Credentials updated successfully!");
        setIsChanging(false);
        setFormData({ email: newEmail, password: newPassword });
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            onChange={handleChange}
            className="border p-2 rounded w-full"
          />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded w-full">
            Login
          </button>
        </form>

        {/* Change Email and Password */}
        <button
          onClick={() => setIsChanging(!isChanging)}
          className="text-blue-600 mt-4"
        >
          {isChanging ? "Cancel Change" : "Change Email/Password"}
        </button>

        {isChanging && (
          <form onSubmit={handleChangeCredentials} className="space-y-4 mt-4">
            <input
              type="email"
              placeholder="New Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <button
              type="submit"
              className="bg-green-600 text-white py-2 rounded w-full"
            >
              Update Credentials
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
