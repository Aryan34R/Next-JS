"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';

type User = {
  id: number;
  firstName: string;
  lastName: string;
  role: number; 
};

type AttendanceRecord = {
  id: number;
  date: string;
  inTime: string | null;
  outTime: string | null;
};

const AttendancePage: React.FC = () => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [inTime, setInTime] = useState<string>(''); 
  const [outTime, setOutTime] = useState<string>(''); 
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  const combineWithToday = (time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    now.setHours(hours, minutes, 0, 0);
    return now.toISOString();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parsedUser = jwtDecode<User>(token);
        setLoggedInUser(parsedUser);
        if (parsedUser.role !== 2) {
          setSelectedUserId(parsedUser.id);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    } else {
      console.error("No token found in localStorage");
    }
  }, []);

  useEffect(() => {
    if (loggedInUser && loggedInUser.role === 2) {
      axios.get<User[]>('http://localhost:5000/users')
        .then(res => {
          const employees = res.data.filter(user => user.role === 3);
          setUsers(employees);
        })
        .catch(err => console.error("Error fetching users:", err));
    }
  }, [loggedInUser]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get<AttendanceRecord[]>(`http://localhost:5000/api/attendance/${selectedUserId}`)
        .then(res => setAttendanceRecords(res.data))
        .catch(err => console.error("Error fetching attendance records:", err));
    }
  }, [selectedUserId]);

  const isAttendanceMarkedForToday = () => {
    const today = new Date().toLocaleDateString();
    return attendanceRecords.some(record => {
      const recordDate = new Date(record.date).toLocaleDateString();
      return recordDate === today;
    });
  };

  const handleAttendanceSubmit = async () => {
    if (!inTime && !outTime) {
      alert('Please select at least one time');
      return;
    }

    if (loggedInUser && loggedInUser.role !== 2 && isAttendanceMarkedForToday()) {
      alert('Attendance for today has already been marked.');
      return;
    }

    const combinedInTime = inTime ? combineWithToday(inTime) : null;
    const combinedOutTime = outTime ? combineWithToday(outTime) : null;

    try {
      await axios.post('http://localhost:5000/attendance', {
        employeeId: selectedUserId,
        inTime: combinedInTime,
        outTime: combinedOutTime,
      });
      alert('Attendance marked successfully!');
      if (selectedUserId) {
        axios.get<AttendanceRecord[]>(`http://localhost:5000/api/attendance/${selectedUserId}`)
          .then(res => setAttendanceRecords(res.data))
          .catch(err => console.error("Error fetching attendance records:", err));
      }
      setInTime('');
      setOutTime('');
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert('Failed to mark attendance');
    }
  };

  if (!loggedInUser) {
    return <p>Please log in to mark attendance.</p>;
  }

  return (
    <div className="container mx-auto p-6 min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500">
      <div className="flex justify-between items-center mb-6 bg-white shadow-md p-4 rounded-lg">
        <h1 className="text-3xl font-bold text-black">Attendance</h1>
        <div className="flex gap-x-4">
          <button
            onClick={() => router.push("./dashboard")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Dashboard
          </button>
        </div>
      </div>

      {loggedInUser.role === 2 ? (
        <div>
          <div className="p-4 max-w-md mx-auto bg-white shadow rounded text-black mb-4">
            <h2 className="text-xl font-semibold mb-2">Select Employee</h2>
            <select 
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select Employee --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          {selectedUserId && (
            <div className="p-4 max-w-3xl mx-auto bg-white shadow rounded text-black">
              <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
              {attendanceRecords.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">In Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Out Time</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.inTime ? new Date(record.inTime).toLocaleTimeString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.outTime ? new Date(record.outTime).toLocaleTimeString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No attendance records found for this employee.</p>
              )}

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Add Attendance</h3>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">In Time:</label>
                  <input
                    type="time"
                    className="w-full border px-3 py-2 rounded"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Out Time:</label>
                  <input
                    type="time"
                    className="w-full border px-3 py-2 rounded"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleAttendanceSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Submit Attendance
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 max-w-md mx-auto bg-white shadow rounded text-black">
          <h2 className="text-xl font-semibold mb-4">Your Attendance</h2>
          {attendanceRecords.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">In Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Out Time</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.inTime ? new Date(record.inTime).toLocaleTimeString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.outTime ? new Date(record.outTime).toLocaleTimeString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No attendance records found.</p>
          )}
          {!isAttendanceMarkedForToday() && (
            <p className="text-red-600 font-bold">Absent</p>
          )}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Mark Attendance</h3>
            {isAttendanceMarkedForToday() ? (
              <p className="text-green-600">You have already marked attendance for today.</p>
            ) : (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">In Time:</label>
                  <input
                    type="time"
                    className="w-full border px-3 py-2 rounded"
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Out Time:</label>
                  <input
                    type="time"
                    className="w-full border px-3 py-2 rounded"
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleAttendanceSubmit}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Submit Attendance
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
