"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface Project {
  id: number;
  name: string;
  clientName: string;
  status: string;
  description?: string;
  assignedTo: number;
  assignedToUser?: { firstName: string; lastName: string };
}

interface UserToken {
  id: number; 
  role: number;
  email: string;
  firstName: string;
  lastName: string;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: number;
}

const ProjectPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [user, setUser] = useState<UserToken | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    clientName: "",
    status: "Active",
    description: "",
    assignedTo: "",
    id: null as number | null,
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
const projectsPerPage = 3;

const indexOfLastProject = currentPage * projectsPerPage;
const indexOfFirstProject = indexOfLastProject - projectsPerPage;
const currentProjects = projects.slice(indexOfFirstProject, indexOfLastProject);

const totalPages = Math.ceil(projects.length / projectsPerPage);

const paginate = (pageNumber: number) => setCurrentPage(pageNumber);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const decoded: UserToken = jwtDecode(token);
      setUser(decoded);
      fetchProjects(token, decoded.role, decoded.id); 
          if (decoded.role === 1 || decoded.role === 2) {
        fetchUsers();
      }
    } catch (error) {
      toast.error("Invalid token. Please log in again.");
      localStorage.removeItem("token");
      router.push("./login");
    }
  }, [router]);

  const fetchProjects = (token: string, role: number, userId: number) => {
    axios
      .get("http://localhost:5000/projects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
               if (role === 3) {
          setProjects(
            res.data.filter((project: Project) => project.assignedTo === userId)
          );
        } else {
          setProjects(res.data);
        }
      })
      .catch(() => toast.error("Failed to fetch projects"));
  };

  const fetchUsers = () => {
    axios
      .get("http://localhost:5000/users")
      .then((res) => {
        const userOptions = res.data.filter((u: User) => u.role === 3);
        setUsers(userOptions);
      })
      .catch(() => toast.error("Failed to fetch users"));
  };

  const handleSubmit = async () => {
    if (!user) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = {
      name: form.name,
      clientName: form.clientName,
      status: form.status,
      description: form.description,
      assignedTo: parseInt(form.assignedTo),
      assignedBy: user.id, 
    };

    try {
      if (form.id) {
        await axios.put(`http://localhost:5000/projects/${form.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Project updated");
      } else {
        await axios.post("http://localhost:5000/projects", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Project created");
      }
      setForm({
        name: "",
        clientName: "",
        status: "Active",
        description: "",
        assignedTo: "",
        id: null,
      });
      setShowForm(false);
      fetchProjects(token, user.role, user.id); 
    } catch {
      toast.error("Error saving project");
    }
  };

  const handleEdit = (project: Project) => {
    setForm({
      name: project.name,
      clientName: project.clientName,
      status: project.status,
      description: project.description || "",
      assignedTo: project.assignedTo.toString(),
      id: project.id,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!user || (user.role !== 1 && user.role !== 2)) return;
    const token = localStorage.getItem("token");
    if (!token || !window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://localhost:5000/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Deleted project");
      fetchProjects(token, user.role, user.id); 
    } catch {
      toast.error("Error deleting project");
    }
  };

  const openDetailModal = (project: Project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowDetailModal(false);
      }
    };
    if (showDetailModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDetailModal]);

  return (
    <div className="container mx-auto p-6 min-w-screen min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500">
      <div className="flex justify-between items-center mb-6 bg-white shadow-md p-4 rounded-lg">
        <h1 className="text-2xl font-bold text-black">Projects</h1>
        <div className="flex gap-x-2 items-center">
          <button
            onClick={() => router.push("./dashboard")}
            className="bg-blue-600 text-black px-5 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            Dashboard
          </button>
          {(user?.role === 1 || user?.role === 2) && (
            <button
              onClick={() => {
                setShowForm(true);
                setForm({
                  name: "",
                  clientName: "",
                  status: "Active",
                  description: "",
                  assignedTo: "",
                  id: null,
                });
              }}
              className="bg-blue-600 text-black px-5 text-white py-2 rounded-lg hover:bg-blue-700 transition-all duration-300"
            >
              Add Project
            </button>
          )}
        </div>
      </div>

      {showForm && (user?.role === 1 || user?.role === 2) ? (
        <div className="bg-white p-6 rounded-lg shadow mb-8 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {form.id ? "Edit Project" : "Create Project"}
          </h2>
          <input
            value={form.name}
            onChange={(e) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="Project Name"
          />
          <input
            value={form.clientName}
            onChange={(e) =>
              setForm((f) => ({ ...f, clientName: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="Client Name"
          />
          <select
            value={form.status}
            onChange={(e) =>
              setForm((f) => ({ ...f, status: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded text-black"
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
          </select>
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded text-black"
            placeholder="Description"
          />
              <select
            value={form.assignedTo}
            onChange={(e) =>
              setForm((f) => ({ ...f, assignedTo: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded text-black"
          >
            <option value="">Select User</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.firstName} {u.lastName}
              </option>
            ))}
          </select>
          <div className="p-2 border border-gray-300 rounded bg-gray-50 text-black">
            <strong>Assigned By: </strong>
            {user?.firstName} {user?.lastName}
          </div>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
          >
            Save
          </button>
          <button
            onClick={() => setShowForm(false)}
            className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full">
            <thead className="bg-gray-800 text-left text-base font-semibold text-white">
              <tr>
                <th className="p-4">Project Name</th>
                <th className="p-4">Status</th>
                <th className="p-4">Details</th>
                {(user?.role === 1 || user?.role === 2) && (
                  <th className="p-4">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentProjects.map((project) => (
                <tr key={project.id} className="border-t text-gray-800">
                  <td className="p-4">{project.name}</td>
                  <td className="p-4">{project.status}</td>
                  <td className="p-4">
                    <button
                      onClick={() => openDetailModal(project)}
                      className="text-blue-600 hover:underline"
                    >
                      Details
                    </button>
                  </td>
                  {(user?.role === 1 || user?.role === 2) && (
                    <td className="p-4 space-x-4">
                      <button
                        onClick={() => handleEdit(project)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan={user && (user.role === 1 || user.role === 2) ? 5 : 4}
                    className="text-center p-4 text-gray-500"
                  >
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-center mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
          <button
           key={i + 1}
            onClick={() => paginate(i + 1)}
             className={`mx-1 px-4 py-2 rounded ${
               currentPage === i + 1
               ? "bg-blue-600 text-white"
             : "bg-gray-200 text-gray-800"
            } hover:bg-blue-500 transition-all duration-300`}
                 >
              {i + 1}
                </button>
     ))}
      </div>

          
        </div>
        
        
      )}

      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-black"
          >
            <h2 className="text-2xl font-bold mb-4">Project Details</h2>
            <p>
              <strong>Name:</strong> {selectedProject.name}
            </p>
            <p>
              <strong>Client:</strong> {selectedProject.clientName}
            </p>
            <p>
              <strong>Status:</strong> {selectedProject.status}
            </p>
            {selectedProject.description && (
              <p>
                <strong>Description:</strong> {selectedProject.description}
              </p>
            )}
            <p>
              <strong>Assigned To:</strong>{" "}
              {selectedProject.assignedToUser
                ? `${selectedProject.assignedToUser.firstName} ${selectedProject.assignedToUser.lastName}`
                : selectedProject.assignedTo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;
