"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";


interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "HR" | "USER" | "";
}

interface DecodedToken {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
}


const roleMap = { HR: 2, USER: 3 };
const reverseRoleMap: Record<number, "HR" | "USER"> = { 2: "HR", 3: "USER" };


const page: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loggedInRole, setLoggedInRole] = useState<number | null>(null);

  const router = useRouter();



  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setLoggedInRole(decoded.role);
      } catch (error) {
        console.error("Invalid token");
      }
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>("http://localhost:5000/users");
      setUsers(response.data);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await axios.delete(`http://localhost:5000/users/${id}`);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  // const filteredUsers = users.filter((user) => user.role === 2 || user.role === 3);
  const filteredUsers = loggedInRole === 1 ? users.filter((user) => user.role === 2 || user.role === 3 ) : users.filter((user) => user.role === 3 )

  if (loading) return <p className="text-center text-lg font-semibold">Loading users...</p>;
  if (error) return <p className="text-center text-red-500 font-semibold">{error}</p>;

  return (
    <div className="container mx-auto p-6 min-h-screen min-w-screen bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 ">
      {/* <div className="flex justify-between items-center mb-6 bg-white shadow-md p-4 rounded-lg">
        <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
        <button
        onClick={() => router.push("./dashboard")}
         className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
         >
          Dashboard
        </button>
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
          onClick={() => {
            setShowForm(!showForm);
            setEditingUser(null);
          }}
        >
          {showForm ? "Back to List" : "Add User"}
        </button>
      </div> */}
      <div className="flex justify-between items-center mb-6 bg-white shadow-md p-4 rounded-lg">
  <h1 className="text-3xl font-bold text-black">Employees</h1>
  <div className="flex gap-x-4">
    <button
      onClick={() => router.push("./dashboard")}
      className="bg-blue-600 text-black px-5 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
    >
      Dashboard
    </button>
    <button
      className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
      onClick={() => {
        setShowForm(!showForm);
        setEditingUser(null);
      }}
    >
      {showForm ? "Back to List" : "Add User"}
    </button>
  </div>
</div>



      {showForm ? (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
            {editingUser ? "Edit User" : "Register New User"}
          </h2>
          <Formik<FormValues>
            initialValues={{
              firstName: editingUser?.firstName || "",
              lastName: editingUser?.lastName || "",
              email: editingUser?.email || "",
              password: "",
              role: editingUser ? reverseRoleMap[editingUser.role] : "",
            }}
            enableReinitialize
            validationSchema={Yup.object({
              firstName: Yup.string().min(2, "Too Short!").required("Required"),
              lastName: Yup.string().min(2, "Too Short!").required("Required"),
              email: Yup.string().email("Invalid email").required("Required"),
              password: editingUser ? Yup.string() : Yup.string().min(6, "Too Short!").required("Required"),
              role: Yup.string().oneOf(["HR", "USER"], "Invalid role").required("Required"),
            })}
            onSubmit={async (values, { setSubmitting, resetForm }) => {
              try {
                const numericRole = roleMap[values.role as "HR" | "USER"];

                if (editingUser) {
                  await axios.put(`http://localhost:5000/users/${editingUser.id}`, {
                    firstName: values.firstName,
                    lastName: values.lastName,
                    email: values.email,
                    password: values.password || undefined,
                    role: numericRole,
                  });
                  alert("User updated successfully!");
                } else {
                  await axios.post("http://localhost:5000/register", {
                    ...values,
                    role: numericRole,
                  });
                  alert("User added successfully!");
                }

                resetForm();
                setShowForm(false);
                setEditingUser(null);
                fetchUsers();
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
                  <label className="block text-gray-900 font-medium">First Name</label>
                  <Field type="text" name="firstName" className="w-full p-2 border rounded-lg text-black" />
                  <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium">Last Name</label>
                  <Field type="text" name="lastName" className="w-full p-2 border rounded-lg text-black" />
                  <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium">Email</label>
                  <Field type="email" name="email" className="w-full p-2 border rounded-lg text-black" />
                  <ErrorMessage name="email" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium">Password</label>
                  <Field type="password" name="password" className="w-full p-2 border rounded-lg text-black" />
                  <ErrorMessage name="password" component="div" className="text-red-500 text-sm" />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium">Role</label>
                  <Field as="select" name="role" className="w-full p-2 border rounded-lg text-black">
                    <option value="">Select a role</option>
                    {loggedInRole === 1 && <option value="HR">HR</option>}
                    <option value="USER">USER</option>
                  </Field>
                  <ErrorMessage name="role" component="div" className="text-red-500 text-sm" />
                </div>

                <button
                  type="submit"
                  className="w-full p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? editingUser
                      ? "Updating..."
                      : "Creating user..."
                    : editingUser
                    ? "Update User"
                    : "Create User"}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-6 text-left">First Name</th>
                <th className="py-3 px-6 text-left">Last Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-left">Role</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-100 text-black">
                  <td className="py-3 px-6">{user.firstName}</td>
                  <td className="py-3 px-6">{user.lastName}</td>
                  <td className="py-3 px-6">{user.email}</td>
                  <td className="py-3 px-6 font-semibold text-blue-600">
                    {user.role === 2 ? "HR" : "USER"}
                  </td>
                  <td className="py-3 px-6 text-center space-x-4">
                    <button onClick={() => handleEdit(user)} className="text-blue-500 hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No HR or User accounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default page;
