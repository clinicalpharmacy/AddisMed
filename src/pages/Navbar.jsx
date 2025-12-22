import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Medical System</h1>
        <ul className="flex space-x-6">
          <li><Link className="hover:text-gray-300" to="/home">Homepage</Link></li>
          <li><Link className="hover:text-gray-300" to="/medication-history">Comprehensive Medication History</Link></li>
          <li><Link className="hover:text-gray-300" to="/drn-assessment">DRN Assessment</Link></li>
          <li><Link className="hover:text-gray-300" to="/ph-assist">PH-Assist & Plan</Link></li>
          <li><Link className="hover:text-gray-300" to="/outcome">Patient Outcome</Link></li>
          <li><Link className="hover:text-gray-300" to="/cost">Cost</Link></li>
          <li><Link className="hover:text-gray-300" to="/report">Report</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
