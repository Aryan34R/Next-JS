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

const ROLE_MAP = { HR: 2, USER: 3 };
const REVERSE_ROLE_MAP: Record<number, "HR" | "USER"> = { 2: "HR", 3: "USER" };

const Page: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loggedInRole, setLoggedInRole] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 3;

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setLoggedInRole(decoded.role);
      } catch {
        console.error("Invalid token");
      }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get<User[]>("http://localhost:5000/users");
      setUsers(res.data);
    } catch {
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
    } catch {
      alert("Failed to delete user");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const filteredUsers =
    loggedInRole === 1
      ? users.filter((u) => [2, 3].includes(u.role))
      : users.filter((u) => u.role === 3);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) return <p className="text-center text-lg font-semibold">Loading users...</p>;
  if (error) return <p className="text-center text-red-500 font-semibold">{error}</p>;

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500">
      <div className="flex justify-between items-center mb-6 bg-white shadow-md p-4 rounded-lg">
        <h1 className="text-3xl font-bold text-black">Employees</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("./dashboard")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingUser(null);
            }}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            {showForm ? "Back to List" : "Add User"}
          </button>
        </div>
      </div>

      {showForm ? (
        <UserForm
          initialValues={{
            firstName: editingUser?.firstName || "",
            lastName: editingUser?.lastName || "",
            email: editingUser?.email || "",
            password: "",
            role: editingUser ? REVERSE_ROLE_MAP[editingUser.role] : "",
          }}
          editingUser={editingUser}
          loggedInRole={loggedInRole}
          onCloseForm={() => {
            setShowForm(false);
            setEditingUser(null);
            fetchUsers();
          }}
        />
      ) : (
        <>
          <UserTable users={currentUsers} onEdit={handleEdit} onDelete={handleDelete} />
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Page;

// ------------------ Subcomponents ------------------

const UserForm: React.FC<{
  initialValues: FormValues;
  editingUser: User | null;
  loggedInRole: number | null;
  onCloseForm: () => void;
}> = ({ initialValues, editingUser, loggedInRole, onCloseForm }) => {
  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">
        {editingUser ? "Edit User" : "Register New User"}
      </h2>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={Yup.object({
          firstName: Yup.string().min(2, "Too Short!").required("Required"),
          lastName: Yup.string().min(2, "Too Short!").required("Required"),
          email: Yup.string().email("Invalid email").required("Required"),
          password: editingUser
            ? Yup.string()
            : Yup.string().min(6, "Too Short!").required("Required"),
          role: Yup.string().oneOf(["HR", "USER"], "Invalid role").required("Required"),
        })}
        onSubmit={async (values, { setSubmitting, resetForm }) => {
          try {
            const numericRole = ROLE_MAP[values.role as "HR" | "USER"];

            if (editingUser) {
              await axios.put(`http://localhost:5000/users/${editingUser.id}`, {
                ...values,
                role: numericRole,
                password: values.password || undefined,
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
            onCloseForm();
          } catch (error: any) {
            alert(error.response?.data?.message || "An error occurred");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-4 text-black">
            <TextInput label="First Name" name="firstName" />
            <TextInput label="Last Name" name="lastName" />
            <TextInput label="Email" name="email" type="email" />
            <TextInput label="Password" name="password" type="password" />
            <div>
              <label className="block font-medium">Role</label>
              <Field as="select" name="role" className="w-full p-2 border rounded-lg">
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
                  : "Creating..."
                : editingUser
                ? "Update User"
                : "Create User"}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const TextInput: React.FC<{ label: string; name: string; type?: string }> = ({
  label,
  name,
  type = "text",
}) => (
  <div>
    <label className="block font-medium">{label}</label>
    <Field type={type} name={name} className="w-full p-2 border rounded-lg" />
    <ErrorMessage name={name} component="div" className="text-red-500 text-sm" />
  </div>
);

const UserTable: React.FC<{
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
}> = ({ users, onEdit, onDelete }) => {
  return (
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
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-100 text-black">
              <td className="py-3 px-6">{user.firstName}</td>
              <td className="py-3 px-6">{user.lastName}</td>
              <td className="py-3 px-6">{user.email}</td>
              <td className="py-3 px-6 font-semibold text-blue-600">
                {REVERSE_ROLE_MAP[user.role]}
              </td>
              <td className="py-3 px-6 text-center space-x-4">
                <button onClick={() => onEdit(user)} className="text-blue-500 hover:underline">
                  Edit
                </button>
                <button onClick={() => onDelete(user.id)} className="text-red-500 hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-500">
                No HR or User accounts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
