
import React from "react";
import { Link } from "react-router-dom";

const Index = () => {
  console.log("Index page rendering");
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to FinSuite</h1>
        <p className="text-xl text-gray-600 mb-6">Your comprehensive financial dashboard</p>
        <Link to="/dashboard" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Index;
