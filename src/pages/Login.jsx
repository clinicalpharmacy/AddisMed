import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../utils/supabase";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordChangeStatus, setPasswordChangeStatus] = useState({ message: "", isError: false });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error message when user starts typing
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    console.log("Attempting login with:", formData.email);

    // Attempt to sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      console.error("Authentication error:", error.message);
      setErrorMessage("Invalid credentials! Please check your email and password.");
      setIsLoading(false);
      return;
    }

    console.log("User authenticated successfully:", data);

    // Fetch the user from the 'users' table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", formData.email)
      .single();

    if (userError || !userData) {
      console.error("Error fetching user from 'users' table:", userError?.message);
      setErrorMessage("User not found. Please contact support.");
      setIsLoading(false);
      return;
    }

    console.log("User data from 'users' table:", userData);

    // If the user is not approved, show a message and prevent login
    if (!userData.approved) {
      setErrorMessage("Your account is awaiting approval by an admin.");
      setIsLoading(false);
      return;
    }

    console.log("User approved, navigating to home...");
    navigate("/home");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordChangeStatus({ message: "", isError: false });
    
    // Validate passwords
    if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
      setPasswordChangeStatus({ message: "New passwords do not match", isError: true });
      return;
    }
    
    if (passwordChangeData.newPassword.length < 6) {
      setPasswordChangeStatus({ message: "Password must be at least 6 characters", isError: true });
      return;
    }

    setIsLoading(true);
    
    try {
      // First verify current credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: passwordChangeData.currentPassword,
      });

      if (signInError) {
        setPasswordChangeStatus({ message: "Current password is incorrect", isError: true });
        setIsLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordChangeData.newPassword,
      });

      if (updateError) {
        setPasswordChangeStatus({ message: "Error updating password. Please try again.", isError: true });
      } else {
        setPasswordChangeStatus({ message: "Password updated successfully!", isError: false });
        // Clear form and close modal after success
        setTimeout(() => {
          setShowChangePasswordModal(false);
          setPasswordChangeData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          });
          setPasswordChangeStatus({ message: "", isError: false });
        }, 2000);
      }
    } catch (error) {
      console.error("Password change error:", error);
      setPasswordChangeStatus({ message: "An unexpected error occurred", isError: true });
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMessage && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {errorMessage}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              id="email"
              name="email" 
              placeholder="Enter your email" 
              required 
              onChange={handleChange} 
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button 
                type="button"
                onClick={() => setShowChangePasswordModal(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Change Password
              </button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                id="password"
                name="password" 
                placeholder="Enter your password" 
                required 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <i className="far fa-eye-slash"></i>
                ) : (
                  <i className="far fa-eye"></i>
                )}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-medium hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Change Password</h3>
              <button 
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPasswordChangeData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                  });
                  setPasswordChangeStatus({ message: "", isError: false });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              For security, please enter your current password and then your new password.
            </p>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              {passwordChangeStatus.message && (
                <div className={`p-3 rounded-lg text-sm ${passwordChangeStatus.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {passwordChangeStatus.message}
                </div>
              )}
              
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input 
                  type="password" 
                  id="current-password"
                  value={passwordChangeData.currentPassword}
                  onChange={(e) => setPasswordChangeData({...passwordChangeData, currentPassword: e.target.value})}
                  placeholder="Enter current password" 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                />
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input 
                  type="password" 
                  id="new-password"
                  value={passwordChangeData.newPassword}
                  onChange={(e) => setPasswordChangeData({...passwordChangeData, newPassword: e.target.value})}
                  placeholder="Enter new password" 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                />
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input 
                  type="password" 
                  id="confirm-password"
                  value={passwordChangeData.confirmPassword}
                  onChange={(e) => setPasswordChangeData({...passwordChangeData, confirmPassword: e.target.value})}
                  placeholder="Confirm new password" 
                  required 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPasswordChangeData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: ""
                    });
                    setPasswordChangeStatus({ message: "", isError: false });
                  }}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
