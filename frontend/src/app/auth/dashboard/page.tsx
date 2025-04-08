"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: number; 
}

export default function page() {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const router = useRouter();
    
  useEffect(() => {
    const loadUserFromToken = () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Unauthorized: No token provided");
        router.push("./login");
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode<DecodedToken>(token);
        setUser(decoded);
      } catch (error) {
        toast.error("Invalid token. Please log in again.");
        localStorage.removeItem("token");
        router.push("./login");
      }
    };

    loadUserFromToken();
  }, [router]);

  if (!user) return <p className="text-center text-lg mt-10">Loading...</p>;

  const isSuperAdmin = user.role === 1;
  const isHr = user.role === 2;
  const isUser = user.role === 3;

  return (
      <div className="container mx-auto p-6 min-h-screen min-w-screen bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500">
      <div className="flex justify-between items-center mb-6 bg-white shadow-md p-4 rounded-lg">
        <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>
        <div className="flex space-x-4">
          {isSuperAdmin && (
            <>
              <button
                onClick={() => router.push("./employee")}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              >
                Employees
              </button>
              <button
                onClick={() => router.push("./userpanel")}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              >
                Projects
              </button>
            </>
          )}
          {isHr && (
            <>
            <button
              onClick={() => router.push("./employee")}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Employee
            </button>
            <button
                onClick={() => router.push("./userpanel")}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              >
                Projects
              </button>
              <button
                onClick={() => router.push("./attendance")}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              >
                Attendance
              </button>
              
            </>
          )}
          {isUser && (
           <>
            <button
              onClick={() => router.push("./userpanel")}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Projects
            </button>
            <button
                onClick={() => router.push("./attendance")}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition duration-300"
              >
                Attendance
              </button>
           </>
          )}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              document.cookie = "token=";

              router.push("./login");
            }}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition duration-300"
          >
            Logout
          </button>
        </div>
           </div>

      <div className="flex flex-col items-center justify-center min-h-screen pt-10">
        <div className="bg-white shadow-xl rounded-lg p-10 w-full max-w-lg text-center">
          <div className="text-black p-4 rounded-lg shadow-lg">
            <h2 className="text-4xl font-semibold">{`Welcome, ${user.firstName} ${user.lastName}!`}</h2>
          </div>

          <p className="text-xl text-gray-700 mt-4">Email: {user.email}</p>
        </div>
      </div>
    </div>
  );
}
