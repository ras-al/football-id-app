import React, { useEffect, useState } from "react";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import JSZip from "jszip";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import "../index.css";

export default function AdminDashboard({ setLoggedIn }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const userData = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      docId: doc.id,
    }));
    setUsers(userData);
    setFilteredUsers(userData);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoggedIn(false); // ✅ Properly logs out
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(value) ||
        user.regId.toLowerCase().includes(value)
    );
    setFilteredUsers(filtered);
  };

  const deleteUser = async (docId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await deleteDoc(doc(db, "users", docId));
      fetchUsers();
    }
  };

  const downloadAllCardsAsZip = async () => {
    const zip = new JSZip();

    for (const user of filteredUsers) {
      const canvas = await html2canvas(document.getElementById(`card-${user.regId}`), {
        useCORS: true,
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [54,85.6],
      });
      pdf.addImage(imgData, "PNG", 0, 0, 54,85.6);
      const pdfBlob = pdf.output("blob");

      zip.file(`${user.name}_${user.regId}.pdf`, pdfBlob);
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, "user_cards.zip");
  };

  const exportToExcel = () => {
    const data = filteredUsers.map((user) => ({
      Name: user.name,
      Phone: user.phone,
      Age: user.age,
      ID: user.regId,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");
    XLSX.writeFile(workbook, "Participants_List.xlsx");
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Registered Participants</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="admin-controls">
        <input
          type="text"
          placeholder="Search by Name or ID"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="download-btn" onClick={downloadAllCardsAsZip}>
          Download All Cards (ZIP)
        </button>
        &nbsp;&nbsp;&nbsp;
        <button className="download-btn" onClick={exportToExcel}>
          Export to Excel
        </button>
      </div>

      <div className="user-list">
        <ul>
          {filteredUsers.map((user) => (
            <li
              key={user.regId}
              style={{
                color: "white",
                background: "#333",
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "6px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span
                style={{ cursor: "pointer", textDecoration: "underline" }}
                onClick={() => setSelectedUser(user)}
              >
                {user.name} ({user.regId})
              </span>
              <button
                style={{
                  background: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "4px 10px",
                  cursor: "pointer",
                }}
                onClick={() => deleteUser(user.docId)}
              >
                Delete
              </button>

              {/* Hidden card for export */}
              <div
                className="football-id-card"
                id={`card-${user.regId}`}
                style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
              >
                <div className="card-left">
                  <img src={user.image} alt="User" className="id-photo" />
                </div>
                <div className="card-right">
                  <h3>Football ID Pass</h3>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Phone:</strong> {user.phone}</p>
                  <p><strong>Age:</strong> {user.age}</p>
                  <p><strong>ID:</strong> {user.regId}</p>
                  <h2>Present by Mass Kannur</h2>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedUser && (
        <div className="selected-user-preview">
          <h3>{selectedUser.name}'s Details</h3>
          <div className="football-id-card">
            <div className="card-left">
              <img src={selectedUser.image} alt="User" className="id-photo" />
            </div>
            <div className="card-right">
              <h3>Football ID Pass</h3>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Age:</strong> {selectedUser.age}</p>
              <p><strong>ID:</strong> {selectedUser.regId}</p>
              <h2>Present by Mass Kannur</h2>
            </div>
          </div>
          <div style={{ marginTop: "20px" }}>
            <h4>Payment Screenshot:</h4>
            {selectedUser.paymentSS ? (
              <img src={selectedUser.paymentSS} alt="Payment SS" style={{ maxWidth: "200px" }} />
            ) : (
              <p>No screenshot uploaded.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
