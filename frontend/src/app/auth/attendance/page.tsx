// "use client"
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import {jwtDecode} from 'jwt-decode';

// type User = {
//   id: number;
//   firstName: string;
//   lastName: string;
//   role: number; 
// };

// type AttendanceRecord = {
//   id: number;
//   date: string;
//   inTime: string | null;
//   outTime: string | null;
// };

// const AttendancePage: React.FC = () => {
//   const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
//   const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
//   const [inTime, setInTime] = useState<string>(''); 
//   const [outTime, setOutTime] = useState<string>(''); 
//   const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const router = useRouter();

//   const combineWithToday = (time: string): string => {
//     const now = new Date();
//     const [hours, minutes] = time.split(':').map(Number);
//     now.setHours(hours, minutes, 0, 0);
//     return now.toISOString();
//   };

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const parsedUser = jwtDecode<User>(token);
//         setLoggedInUser(parsedUser);
//         if (parsedUser.role !== 2) {
//           setSelectedUserId(parsedUser.id);
//         }
//       } catch (error) {
//         console.error("Error decoding token:", error);
//       }
//     } else {
//       console.error("No token found in localStorage");
//     }
//   }, []);

//   useEffect(() => {
//     if (loggedInUser && loggedInUser.role === 2) {
//       axios.get<User[]>('http://localhost:5000/users')
//         .then(res => {
//           const employees = res.data.filter(user => user.role === 3);
//           setUsers(employees);
//         })
//         .catch(err => console.error("Error fetching users:", err));
//     }
//   }, [loggedInUser]);

//   useEffect(() => {
//     if (selectedUserId) {
//       axios.get<AttendanceRecord[]>(`http://localhost:5000/api/attendance/${selectedUserId}`)
//         .then(res => setAttendanceRecords(res.data))
//         .catch(err => console.error("Error fetching attendance records:", err));
//     }
//   }, [selectedUserId]);

//   const isAttendanceMarkedForToday = () => {
//     const today = new Date().toLocaleDateString();
//     return attendanceRecords.some(record => {
//       const recordDate = new Date(record.date).toLocaleDateString();
//       return recordDate === today;
//     });
//   };

//   const handleAttendanceSubmit = async () => {
//     if (!inTime && !outTime) {
//       alert('Please select at least one time');
//       return;
//     }

//     if (loggedInUser && loggedInUser.role !== 2 && isAttendanceMarkedForToday()) {
//       alert('Attendance for today has already been marked.');
//       return;
//     }

//     const combinedInTime = inTime ? combineWithToday(inTime) : null;
//     const combinedOutTime = outTime ? combineWithToday(outTime) : null;

//     try {
//       await axios.post('http://localhost:5000/attendance', {
//         employeeId: selectedUserId,
//         inTime: combinedInTime,
//         outTime: combinedOutTime,
//       });
//       alert('Attendance marked successfully!');
//       if (selectedUserId) {
//         axios.get<AttendanceRecord[]>(`http://localhost:5000/api/attendance/${selectedUserId}`)
//           .then(res => setAttendanceRecords(res.data))
//           .catch(err => console.error("Error fetching attendance records:", err));
//       }
//       setInTime('');
//       setOutTime('');
//     } catch (error) {
//       console.error("Error submitting attendance:", error);
//       alert('Failed to mark attendance');
//     }
//   };

//   if (!loggedInUser) {
//     return <p>Please log in to mark attendance.</p>;
//   }

//   return (
//     <div className="container mx-auto p-6 min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500">
//       <div className="flex justify-between items-center mb-6 bg-white shadow-md p-4 rounded-lg">
//         <h1 className="text-3xl font-bold text-black">Attendance</h1>
//         <div className="flex gap-x-4">
//           <button
//             onClick={() => router.push("./dashboard")}
//             className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
//           >
//             Dashboard
//           </button>
//         </div>
//       </div>

//       {loggedInUser.role === 2 ? (
//         <div>
//           <div className="p-4 max-w-md mx-auto bg-white shadow rounded text-black mb-4">
//             <h2 className="text-xl font-semibold mb-2">Select Employee</h2>
//             <select 
//               value={selectedUserId || ''}
//               onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
//               className="w-full border px-3 py-2 rounded"
//             >
//               <option value="">-- Select Employee --</option>
//               {users.map((user) => (
//                 <option key={user.id} value={user.id}>
//                   {user.firstName} {user.lastName}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {selectedUserId && (
//             <div className="p-4 max-w-3xl mx-auto bg-white shadow rounded text-black">
//               <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
//               {attendanceRecords.length > 0 ? (
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead>
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">In Time</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Out Time</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {attendanceRecords.map((record) => (
//                       <tr key={record.id}>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {new Date(record.date).toLocaleDateString()}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {record.inTime ? new Date(record.inTime).toLocaleTimeString() : 'N/A'}
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           {record.outTime ? new Date(record.outTime).toLocaleTimeString() : 'N/A'}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               ) : (
//                 <p>No attendance records found for this employee.</p>
//               )}

//               <div className="mt-6">
//                 <h3 className="text-lg font-medium mb-2">Add Attendance</h3>
//                 <div className="mb-3">
//                   <label className="block text-sm font-medium mb-1">In Time:</label>
//                   <input
//                     type="time"
//                     className="w-full border px-3 py-2 rounded"
//                     value={inTime}
//                     onChange={(e) => setInTime(e.target.value)}
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="block text-sm font-medium mb-1">Out Time:</label>
//                   <input
//                     type="time"
//                     className="w-full border px-3 py-2 rounded"
//                     value={outTime}
//                     onChange={(e) => setOutTime(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   onClick={handleAttendanceSubmit}
//                   className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//                 >
//                   Submit Attendance
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="p-4 max-w-md mx-auto bg-white shadow rounded text-black">
//           <h2 className="text-xl font-semibold mb-4">Your Attendance</h2>
//           {attendanceRecords.length > 0 ? (
//             <table className="min-w-full divide-y divide-gray-200 mb-4">
//               <thead>
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">In Time</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Out Time</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {attendanceRecords.map((record) => (
//                   <tr key={record.id}>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {new Date(record.date).toLocaleDateString()}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {record.inTime ? new Date(record.inTime).toLocaleTimeString() : 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {record.outTime ? new Date(record.outTime).toLocaleTimeString() : 'N/A'}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p>No attendance records found.</p>
//           )}
//           {!isAttendanceMarkedForToday() && (
//             <p className="text-red-600 font-bold">Absent</p>
//           )}
//           <div className="mt-6">
//             <h3 className="text-lg font-medium mb-2">Mark Attendance</h3>
//             {isAttendanceMarkedForToday() ? (
//               <p className="text-green-600">You have already marked attendance for today.</p>
//             ) : (
//               <>
//                 <div className="mb-3">
//                   <label className="block text-sm font-medium mb-1">In Time:</label>
//                   <input
//                     type="time"
//                     className="w-full border px-3 py-2 rounded"
//                     value={inTime}
//                     onChange={(e) => setInTime(e.target.value)}
//                   />
//                 </div>
//                 <div className="mb-3">
//                   <label className="block text-sm font-medium mb-1">Out Time:</label>
//                   <input
//                     type="time"
//                     className="w-full border px-3 py-2 rounded"
//                     value={outTime}
//                     onChange={(e) => setOutTime(e.target.value)}
//                   />
//                 </div>
//                 <button
//                   onClick={handleAttendanceSubmit}
//                   className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//                 >
//                   Submit Attendance
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AttendancePage;


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
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0 indexed
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const router = useRouter();

  // Helper: Combine provided time with today's date, returns ISO string
  const combineWithToday = (time: string): string => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    now.setHours(hours, minutes, 0, 0);
    return now.toISOString();
  };

  // Helper: Generate an array of date strings (YYYY-MM-DD) for the given month/year.
  // If the month/year is the current month, only include dates up to (and including) today.
  const getDatesForMonth = (year: number, month: number): string[] => {
    const dates: string[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    // Determine the number of days in the month.
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      // If this is the current month/year, include only dates in the past or today.
      if (year === currentYear && month === currentMonth) {
        if (date > today) break;
      }
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  // Helper: Retrieve an attendance record for a specific date by comparing only the date portion.
  const getRecordForDate = (dateStr: string): AttendanceRecord | undefined => {
    return attendanceRecords.find(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0];
      return recordDate === dateStr;
    });
  };

  // Decode token on mount and set logged in user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const parsedUser = jwtDecode<User>(token);
        setLoggedInUser(parsedUser);
        // For non-HR users, the selected user is themselves.
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

  // For HR, fetch list of employees (role 3)
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

  // Fetch attendance records when a user is selected
  useEffect(() => {
    if (selectedUserId) {
      axios.get<AttendanceRecord[]>(`http://localhost:5000/api/attendance/${selectedUserId}`)
        .then(res => setAttendanceRecords(res.data))
        .catch(err => console.error("Error fetching attendance records:", err));
    }
  }, [selectedUserId]);

  // Check if attendance for today has already been marked (for non-HR users)
  const isAttendanceMarkedForToday = (): boolean => {
    const todayStr = new Date().toLocaleDateString();
    return attendanceRecords.some(record => {
      const recordDate = new Date(record.date).toLocaleDateString();
      return recordDate === todayStr;
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
      // Refresh attendance records after submission
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

  // Available months and a range of years for filtering
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

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
        // HR View: Filter dropdowns and full attendance table for the selected month/year.
        <div>
          <div className="p-4 max-w-md mx-auto bg-white shadow rounded text-black mb-4">
            <h2 className="text-xl font-semibold mb-2">Select Employee</h2>
            <select 
              value={selectedUserId || ''}
              onChange={(e) => setSelectedUserId(parseInt(e.target.value))}
              className="w-full border px-3 py-2 rounded mb-4"
            >
              <option value="">-- Select Employee --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="border px-3 py-2 rounded"
                >
                  {monthNames.map((name, index) => (
                    <option key={index} value={index}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="border px-3 py-2 rounded"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {selectedUserId && (
            <div className="p-4 max-w-3xl mx-auto bg-white shadow rounded text-black">
              <h2 className="text-xl font-semibold mb-4">
                Attendance Records for {monthNames[selectedMonth]} {selectedYear}
              </h2>
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      In Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Out Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getDatesForMonth(selectedYear, selectedMonth).map(dateStr => {
                    const record = getRecordForDate(dateStr);
                    const isPresent = !!record; // If record exists, mark as present
                    return (
                      <tr key={dateStr}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {new Date(dateStr).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isPresent ? "Present" : "Absent"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record && record.inTime ? new Date(record.inTime).toLocaleTimeString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record && record.outTime ? new Date(record.outTime).toLocaleTimeString() : 'N/A'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
        // Employee View: Show own attendance records with a check for today’s attendance.
        <div className="p-4 max-w-md mx-auto bg-white shadow rounded text-black">
          <h2 className="text-xl font-semibold mb-4">Your Attendance</h2>
          {attendanceRecords.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 mb-4">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    In Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Out Time
                  </th>
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

// "use client"
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import {jwtDecode} from 'jwt-decode';
// import { io } from "socket.io-client";

// type User = {
//   id: number;
//   firstName: string;
//   lastName: string;
//   role: number;
// };

// type AttendanceRecord = {
//   id: number;
//   date: string;
//   inTime: string | null;
//   outTime: string | null;
// };

// const AttendancePage: React.FC = () => {
//   const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
//   const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
//   const [inTime, setInTime] = useState<string>('');
//   const [outTime, setOutTime] = useState<string>('');
//   const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [userStatuses, setUserStatuses] = useState<Record<number, string>>({});
//   const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
//   const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
//   const router = useRouter();

//   // ✅ Socket.IO setup (with reconnect + graceful tab close)
//   useEffect(() => {
//     const socket = io('http://localhost:5000'); // adjust to your backend URL

//     socket.on('connect', () => {
//       console.log("✅ Connected to socket:", socket.id);
//       if (loggedInUser) {
//         const status = loggedInUser.role === 2 ? "hr-active" : "active";
//         socket.emit("userStatus", { userId: loggedInUser.id, status });
//         console.log("🟢 Status emitted:", status);
//       }
//     });

//     socket.on("statusUpdate", (data: { userId: number, status: string }) => {
//       console.log("📡 Received status update:", data);
//       setUserStatuses(prev => ({ ...prev, [data.userId]: data.status }));
//     });

//     // Gracefully emit "away" on tab close/refresh
//     const handleBeforeUnload = () => {
//       if (loggedInUser) {
//         socket.emit("userStatus", { userId: loggedInUser.id, status: "away" });
//         console.log("🔴 Emitted away before unload");
//       }
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       socket.disconnect();
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, [loggedInUser]);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const parsedUser = jwtDecode<User>(token);
//         setLoggedInUser(parsedUser);
//         if (parsedUser.role !== 2) setSelectedUserId(parsedUser.id);
//       } catch (error) {
//         console.error("❌ Token decode error:", error);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     if (loggedInUser?.role === 2) {
//       axios.get<User[]>('http://localhost:5000/users')
//         .then(res => setUsers(res.data.filter(user => user.role === 3)))
//         .catch(err => console.error("User fetch error:", err));
//     }
//   }, [loggedInUser]);

//   useEffect(() => {
//     if (selectedUserId) {
//       axios.get<AttendanceRecord[]>(`http://localhost:5000/api/attendance/${selectedUserId}`)
//         .then(res => setAttendanceRecords(res.data))
//         .catch(err => console.error("Attendance fetch error:", err));
//     }
//   }, [selectedUserId]);

//   const isAttendanceMarkedForToday = (): boolean => {
//     const todayStr = new Date().toLocaleDateString();
//     return attendanceRecords.some(record =>
//       new Date(record.date).toLocaleDateString() === todayStr
//     );
//   };

//   const handleAttendanceSubmit = async () => {
//     if (!inTime && !outTime) return alert("Please select at least one time");
//     if (loggedInUser?.role !== 2 && isAttendanceMarkedForToday()) {
//       return alert("Attendance already marked for today.");
//     }

//     const today = new Date();
//     const buildTime = (val: string) => {
//       const [h, m] = val.split(":").map(Number);
//       today.setHours(h, m, 0, 0);
//       return today.toISOString();
//     };

//     try {
//       await axios.post("http://localhost:5000/attendance", {
//         employeeId: selectedUserId,
//         inTime: inTime ? buildTime(inTime) : null,
//         outTime: outTime ? buildTime(outTime) : null,
//       });
//       alert("✅ Attendance marked!");
//       setInTime(""); setOutTime("");
//       if (selectedUserId) {
//         const res = await axios.get(`http://localhost:5000/api/attendance/${selectedUserId}`);
//         setAttendanceRecords(res.data);
//       }
//     } catch (error) {
//       console.error("Attendance error:", error);
//       alert("❌ Could not mark attendance.");
//     }
//   };

//   const getDatesForMonth = (year: number, month: number): string[] => {
//     const dates: string[] = [];
//     const today = new Date();
//     const daysInMonth = new Date(year, month + 1, 0).getDate();
//     for (let day = 1; day <= daysInMonth; day++) {
//       const d = new Date(year, month, day);
//       if (year === today.getFullYear() && month === today.getMonth() && d > today) break;
//       dates.push(d.toISOString().split("T")[0]);
//     }
//     return dates;
//   };

//   const getRecordForDate = (dateStr: string) =>
//     attendanceRecords.find(record =>
//       new Date(record.date).toISOString().split("T")[0] === dateStr
//     );

//   const monthNames = [
//     "January", "February", "March", "April", "May", "June",
//     "July", "August", "September", "October", "November", "December"
//   ];
//   const currentYear = new Date().getFullYear();
//   const years = [currentYear - 1, currentYear, currentYear + 1];

//   return (
//     <div className="container mx-auto p-6 min-w-screen min-h-screen bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500">

   
//       {/* Header Section */}
//       <div className="flex justify-between items-center mb-6 bg-white shadow-md p-4 rounded-lg">
//         <h1 className="text-3xl font-bold text-black">Attendance Page</h1>
//         <button
//           onClick={() => router.push("./dashboard")}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
//         >
//           Dashboard
//         </button>
//       </div>
      

//       {loggedInUser?.role === 2 ? (
//         // HR VIEW
//         <>
//           <div className="bg-white text-black p-4 rounded shadow max-w-xl mb-4">
//             <label>Select Employee:</label>
//             <select
//               className="w-full border px-2 py-1 rounded"
//               value={selectedUserId ?? ""}
//               onChange={(e) => setSelectedUserId(Number(e.target.value))}
//             >
//               <option value="">-- Select --</option>
//               {users.map(u => (
//                 <option key={u.id} value={u.id}>
//                   {u.firstName} {u.lastName}
//                 </option>
//               ))}
//             </select>

//             {selectedUserId && (
//               <p className="mt-2 font-medium">
//                 Current Status:
//                 <span className={`ml-2 font-bold ${
//                   userStatuses[selectedUserId] === "active" ? "text-green-600" : "text-red-600"
//                 }`}>
//                   {userStatuses[selectedUserId]?.toUpperCase() || "UNKNOWN"}
//                 </span>
//               </p>
//             )}
//           </div>

//           {selectedUserId && (
//             <div className="bg-white text-black p-4 rounded shadow">
//               <div className="flex gap-4 mb-4">
//                 <div>
//                   <label>Month:</label>
//                   <select
//                     className="border rounded px-2 py-1"
//                     value={selectedMonth}
//                     onChange={(e) => setSelectedMonth(Number(e.target.value))}
//                   >
//                     {monthNames.map((m, i) => (
//                       <option key={i} value={i}>{m}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label>Year:</label>
//                   <select
//                     className="border rounded px-2 py-1"
//                     value={selectedYear}
//                     onChange={(e) => setSelectedYear(Number(e.target.value))}
//                   >
//                     {years.map(y => <option key={y}>{y}</option>)}
//                   </select>
//                 </div>
//               </div>

//               <table className="w-full table-auto border mt-2">
//                 <thead>
//                   <tr className="bg-gray-100 text-left">
//                     <th className="p-2">Date</th>
//                     <th className="p-2">Status</th>
//                     <th className="p-2">In</th>
//                     <th className="p-2">Out</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {getDatesForMonth(selectedYear, selectedMonth).map(dateStr => {
//                     const rec = getRecordForDate(dateStr);
//                     const isPresent = !!rec;
//                     return (
//                       <tr key={dateStr}>
//                         <td className="p-2">{new Date(dateStr).toLocaleDateString()}</td>
//                         <td className="p-2">{isPresent ? "Present" : "Absent"}</td>
//                         <td className="p-2">{rec?.inTime ? new Date(rec.inTime).toLocaleTimeString() : "N/A"}</td>
//                         <td className="p-2">{rec?.outTime ? new Date(rec.outTime).toLocaleTimeString() : "N/A"}</td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </>
//       ) : (
//         // EMPLOYEE VIEW
//         <div className="bg-white text-black p-4 rounded shadow">
//           <h2 className="text-xl font-semibold mb-2">Your Attendance</h2>
//           <table className="w-full table-auto border mb-4">
//             <thead>
//               <tr className="bg-gray-100 text-left">
//                 <th className="p-2">Date</th>
//                 <th className="p-2">In</th>
//                 <th className="p-2">Out</th>
//               </tr>
//             </thead>
//             <tbody>
//               {attendanceRecords.map(r => (
//                 <tr key={r.id}>
//                   <td className="p-2">{new Date(r.date).toLocaleDateString()}</td>
//                   <td className="p-2">{r.inTime ? new Date(r.inTime).toLocaleTimeString() : "N/A"}</td>
//                   <td className="p-2">{r.outTime ? new Date(r.outTime).toLocaleTimeString() : "N/A"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {!isAttendanceMarkedForToday() && (
//             <p className="text-red-600 font-semibold">Absent today</p>
//           )}

//           <div className="mt-4">
//             <label className="block">In Time:</label>
//             <input type="time" value={inTime} onChange={e => setInTime(e.target.value)} className="border rounded px-2 py-1 mb-2 w-full" />
//             <label className="block">Out Time:</label>
//             <input type="time" value={outTime} onChange={e => setOutTime(e.target.value)} className="border rounded px-2 py-1 w-full" />
//             <button onClick={handleAttendanceSubmit} className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
//               Submit Attendance
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default AttendancePage;
