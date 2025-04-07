"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import axios from "axios";

const Login = () => {
  const router = useRouter();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "Too Short!").required("Required"),
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">Login</h2>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              // debugger
              const response = await axios.post(
                "http://localhost:5000/login",
                values,
                { headers: { "Content-Type": "application/json" } }
              );

              if (response.status === 200 && response.data.token) {
                
                localStorage.setItem("token", response.data.token);
                document.cookie = `token=${response.data.token};`; 
                alert("Login successful! Redirecting to dashboard...");
                router.replace("./dashboard"); 
              } else {
                throw new Error(response.data.error || "Login failed");
              }
            } catch (error: any) {
              alert(error.response?.data?.message || "Invalid credentials");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-gray-700">Email</label>
                <Field
                  type="email"
                  name="email"
                  className="w-full p-2 mt-1 border rounded-lg focus:ring focus:ring-indigo-300"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block text-gray-700">Password</label>
                <Field
                  type="password"
                  name="password"
                  className="w-full p-2 mt-1 border rounded-lg focus:ring focus:ring-indigo-300"
                />
                <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
              </div>

             <button
                type="submit"
                className="w-full p-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="mt-4 text-center font-bold text-black">
          Don't have an account?{" "}
          <a href="/auth/signup" className="text-indigo-600 hover:underline">Sign Up</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
