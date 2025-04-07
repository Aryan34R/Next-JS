"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import axios from "axios";

const Signup = () => {
  const router = useRouter();

  const SignupSchema = Yup.object().shape({
    firstName: Yup.string().min(2, "Too Short!").required("Required"),
    lastName: Yup.string().min(2, "Too Short!").required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "Too Short!").required("Required"),
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-black">Sign Up</h2>

        <Formik
          initialValues={{ firstName: "", lastName: "", email: "", password: "" }}
          validationSchema={SignupSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const response = await axios.post("http://localhost:5000/register", values, {
                headers: { "Content-Type": "application/json" },
              });

              if (response.status === 201) {
                alert("Signup successful! Redirecting to login...");
                router.push("/auth/login"); 
              } else {
                throw new Error(response.data.error || "Signup failed");
              }
            } catch (error: any) {
              alert(error.response?.data?.message || "An error occurred");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="block text-gray-700">First Name</label>
                <Field
                  type="text"
                  name="firstName"
                  className="w-full p-2 mt-1 border rounded-lg focus:ring focus:ring-indigo-300"
                />
                <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm" />
              </div>

              <div>
                <label className="block text-gray-700">Last Name</label>
                <Field
                  type="text"
                  name="lastName"
                  className="w-full p-2 mt-1 border rounded-lg focus:ring focus:ring-indigo-300"
                />
                <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm" />
              </div>

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
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="mt-4 text-center text-black font-bold">
          Already have an account?{" "}
          <a href="/auth/login" className="text-indigo-600 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
