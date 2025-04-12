import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import "../index.css";

export default function UserForm() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [image, setImage] = useState(null);
  const [base64, setBase64] = useState("");
  const [paymentSS, setPaymentSS] = useState(null);
  const [paymentBase64, setPaymentBase64] = useState("");
  const [regId, setRegId] = useState("");

  useEffect(() => {
    generateUniqueRegId();
  }, []);

  const generateUniqueRegId = async () => {
    let regNumber;
    let isUnique = false;
  
    // Keep generating a new random number until it is unique
    while (!isUnique) {
      // Generate a random six-digit number
      regNumber = Math.floor(100000 + Math.random() * 900000).toString();
  
      // Check if this number already exists in the database
      const snapshot = await getDocs(collection(db, "users"));
      isUnique = !snapshot.docs.some(doc => doc.data().regId === regNumber);
    }
  
    setRegId(regNumber);
  };
  

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setImage(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => setBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePaymentSSUpload = (e) => {
    const file = e.target.files[0];
    setPaymentSS(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => setPaymentBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone || !age || !base64 || !paymentBase64) {
      alert("Please complete all fields and upload payment screenshot.");
      return;
    }
  
    await addDoc(collection(db, "users"), {
      name,
      phone,
      age,
      image: base64,
      paymentSS: paymentBase64,
      regId,
      timestamp: new Date(),
    });
  
    // Wait a bit to ensure the card is rendered in the DOM
    setTimeout(() => {
      downloadCard();
    }, 500); // 500ms delay
  };
  

  const downloadCard = () => {
    const card = document.getElementById("user-card");
    html2canvas(card).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "Potrait",
        unit: "mm",
        format: [85.6,54],
      });
      pdf.addImage(imgData, "PNG", 0, 0, 54, 85.6);
      pdf.save(`${name}_card.pdf`);
    });
  };

  return (
    <div className="form-container">
      <div className="form-box">
        <h2>Player Registration</h2>

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="tel" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} />
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <button type="submit">Next</button>
          </form>
        )}

        {step === 2 && (
          <>
            <p><strong>Scan the QR below to pay ₹100:</strong></p>
            <img src="/paymentQR.jpeg" alt="QR for payment" style={{ width: "200px" }} />
            <br /><br />
            <label>Upload Payment Screenshot:</label>
            <input type="file" accept="image/*" onChange={handlePaymentSSUpload} />
            <br /><br />
            <button onClick={handleSubmit}>Submit & Download Card</button>
          </>
        )}

        {image && (
          <div className="football-id-card" id="user-card">
            <div className="card-left">
              <img src={image} alt="User" className="id-photo" />
            </div>
            <div className="card-right">
              <h3>Football ID Pass</h3>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Phone:</strong> {phone}</p>
              <p><strong>Age:</strong> {age}</p>
              <p><strong>ID:</strong> {regId}</p>
              <h2>Present by Mass Kannur</h2>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
