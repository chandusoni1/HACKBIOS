import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function DRDOForm2() {
  const navigate = useNavigate();

  // --- 1. Define Initial States for Resetting ---
  const initialEducationState = {
    school: "",
    board: "",
    roll: "",
    marks: "",
    total: "",
    percentage: "",
    file: null,
    preview: null,
  };

  const initialDegreeState = {
    type: "",
    college: "",
    university: "",
    passing: "",
    cgpa: "",
    roll: "",
    file: null,
    preview: null,
  };

  const [tenth, setTenth] = useState(initialEducationState);
  const [twelfth, setTwelfth] = useState(initialEducationState);

  const [selectedDegree, setSelectedDegree] = useState("");
  const [degreeData, setDegreeData] = useState(initialDegreeState);

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
  });

  const degreeOptions = ["Diploma", "ITI", "B.Tech", "M.Tech", "M.Sc", "PhD"];

  // -------- SCROLL LOCK WHEN POPUP OPEN --------
  useEffect(() => {
    if (popup.show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [popup.show]);

  // Auto Percentage Calculation
  const autoCalc = (obj, setObj) => {
    const { marks, total } = obj;
    if (marks && total) {
      const per = ((Number(marks) / Number(total)) * 100).toFixed(2);
      setObj({ ...obj, percentage: per });
    }
  };

  // --- HANDLE POPUP CLOSE & REDIRECT ---
  const handlePopupClose = () => {
    const isSuccess = popup.type === "success";
    setPopup({ ...popup, show: false });
    
    if (isSuccess) {
      // Redirect to Form 1 (Home)
      navigate("/form1"); 
    }
  };

  // ---------------- SUBMIT FORM  ----------------
  const submitForm2 = async (e) => {
    e.preventDefault();

    // 1. Validation
    if (
      !tenth.school ||
      !tenth.board ||
      !tenth.roll ||
      !tenth.marks ||
      !tenth.total ||
      !tenth.file ||
      !twelfth.school ||
      !twelfth.board ||
      !twelfth.roll ||
      !twelfth.marks ||
      !twelfth.total ||
      !twelfth.file ||
      !selectedDegree ||
      !degreeData.college ||
      !degreeData.university ||
      !degreeData.passing ||
      !degreeData.cgpa ||
      !degreeData.roll ||
      !degreeData.file
    ) {
      setPopup({
        show: true,
        type: "error",
        message: "Error in submitting application | Fill the form correctly",
      });
      return;
    }

    // 2. Prepare Data for API
    const formData = new FormData();

    // Append 10th Details
    formData.append("tenth_school", tenth.school);
    formData.append("tenth_board", tenth.board);
    formData.append("tenth_roll", tenth.roll);
    formData.append("tenth_marks", tenth.marks);
    formData.append("tenth_total", tenth.total);
    formData.append("tenth_percentage", tenth.percentage);
    if (tenth.file) formData.append("tenth_file", tenth.file);

    // Append 12th Details
    formData.append("twelfth_school", twelfth.school);
    formData.append("twelfth_board", twelfth.board);
    formData.append("twelfth_roll", twelfth.roll);
    formData.append("twelfth_marks", twelfth.marks);
    formData.append("twelfth_total", twelfth.total);
    formData.append("twelfth_percentage", twelfth.percentage);
    if (twelfth.file) formData.append("twelfth_file", twelfth.file);

    // Append Degree Details
    formData.append("degree_type", selectedDegree);
    formData.append("degree_college", degreeData.college);
    formData.append("degree_university", degreeData.university);
    formData.append("degree_passing", degreeData.passing);
    formData.append("degree_cgpa", degreeData.cgpa);
    formData.append("degree_roll", degreeData.roll);
    if (degreeData.file) formData.append("degree_file", degreeData.file);

    try {
      // 3. Call the API
      const response = await fetch(`${import.meta.env.VITE_API}/api/submit-education`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        // 4. Success Response
        setPopup({
          show: true,
          type: "success",
          message: "Application submitted successfully!",
        });

        // --- CLEAR INPUT FIELDS ---
        setTenth(initialEducationState);
        setTwelfth(initialEducationState);
        setDegreeData(initialDegreeState);
        setSelectedDegree("");
        
        // Clear native file inputs
        e.target.reset(); 

      } else {
        // 5. Server Error Response
        setPopup({
          show: true,
          type: "error",
          message: result.message || "Server rejected the application.",
        });
      }
    } catch (error) {
      // 6. Network Error
      console.error("Submission Error:", error);
      setPopup({
        show: true,
        type: "error",
        message: "Network Error: Could not connect to server.",
      });
    }
  };

  // -------- FILE INPUT COMPONENT --------
  const FileInput = ({ label, data, setData }) => {
    const handleFile = (file) => {
      let previewURL = null;

      if (file && file.type === "application/pdf") {
        previewURL = "/pdf-icon.png"; // Ensure this image exists in public folder
      } else if (file) {
        previewURL = URL.createObjectURL(file);
      }

      setData({ ...data, file, preview: previewURL });
    };

    return (
      <label className="border rounded-xl p-3 flex justify-between items-center cursor-pointer bg-white relative">
        <span className="text-gray-500">
          {data.file ? data.file.name : label}
        </span>

        <span className="bg-[#0A1D3B] text-white py-1 px-3 rounded-lg text-sm">
          Choose File
        </span>

        <input
          type="file"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
          accept="image/*,application/pdf"
        />

        {data.preview && (
          <img
            src={data.preview}
            alt="Preview"
            className="w-16 h-16 object-cover border ml-3 rounded-lg absolute right-[-80px]"
          />
        )}
      </label>
    );
  };

  return (
    <>
      {popup.show && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-[40%] max-w-md text-center animate-fadeIn">
            <h2
              className={`text-2xl font-bold mb-4 ${
                popup.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {popup.type === "success" ? "Success" : "Error"}
            </h2>

            <p className="text-gray-700 mb-6">{popup.message}</p>

            <button
              onClick={handlePopupClose}
              className="bg-[#0A1D3B] text-white px-6 py-2 rounded-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}

      
      <div className="min-h-screen bg-[#0A1D3B] flex justify-center py-10 px-4">
        <form
          onSubmit={submitForm2}
          className={`w-full max-w-3xl bg-white p-8 rounded-2xl shadow-xl border border-[#1A3A6B] ${
            popup.show ? "blur-sm" : ""
          }`}
        >
          <h1 className="text-3xl font-bold text-[#0A1D3B] mb-6 text-center">
            Educational Qualification
          </h1>

          
          <h2 className="text-xl font-semibold text-[#0A1D3B] mb-3">
            10th Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="School Name"
              className="p-3 border rounded-xl"
              value={tenth.school}
              pattern="[A-Za-z\s.,]+"
              title="Only letters, spaces, dots and commas allowed"
              onChange={(e) => setTenth({ ...tenth, school: e.target.value.replace(/[^A-Za-z\s.,]/g, '') })}
            />

            <input
              type="text"
              placeholder="Board Name"
              className="p-3 border rounded-xl"
              value={tenth.board}
              pattern="[A-Za-z\s.,]+"
              title="Only letters, spaces, dots and commas allowed"
              onChange={(e) => setTenth({ ...tenth, board: e.target.value.replace(/[^A-Za-z\s.,]/g, '') })}
            />

            <input
              type="numeric"
              placeholder="Roll Number"
              className="p-3 border rounded-xl"
              value={tenth.roll}
              pattern="[A-Za-z0-9]+"
              title="Only numeric characters allowed"
              onChange={(e) => setTenth({ ...tenth, roll: e.target.value.replace(/[^A-Za-z0-9]/g, '') })}
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="Marks Obtained"
              className="p-3 border rounded-xl"
              value={tenth.marks}
              pattern="\d+"
              title="Only numbers allowed"
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                const updated = { ...tenth, marks: val };
                setTenth(updated);
                autoCalc(updated, setTenth);
              }}
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="Total Marks"
              className="p-3 border rounded-xl"
              value={tenth.total}
              pattern="\d+"
              title="Only numbers allowed"
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                const updated = { ...tenth, total: val };
                setTenth(updated);
                autoCalc(updated, setTenth);
              }}
            />

            <input
              type="text"
              value={tenth.percentage}
              readOnly
              placeholder="Percentage"
              className="p-3 border rounded-xl bg-gray-100"
            />

            <FileInput
              label="Upload 10th Marksheet"
              data={tenth}
              setData={setTenth}
            />
          </div>

          
          <h2 className="text-xl font-semibold text-[#0A1D3B] mt-8 mb-3">
            12th Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="School Name"
              className="p-3 border rounded-xl"
              value={twelfth.school}
              pattern="[A-Za-z\s.,]+"
              title="Only letters, spaces, dots and commas allowed"
              onChange={(e) =>
                setTwelfth({ ...twelfth, school: e.target.value.replace(/[^A-Za-z\s.,]/g, '') })
              }
            />

            <input
              type="text"
              placeholder="Board Name"
              className="p-3 border rounded-xl"
              value={twelfth.board}
              pattern="[A-Za-z\s.,]+"
              title="Only letters, spaces, dots and commas allowed"
              onChange={(e) =>
                setTwelfth({ ...twelfth, board: e.target.value.replace(/[^A-Za-z\s.,]/g, '') })
              }
            />

            <input
              type="text"
              placeholder="Roll Number"
              className="p-3 border rounded-xl"
              value={twelfth.roll}
              pattern="[A-Za-z0-9]+"
              title="Only alphanumeric characters allowed"
              onChange={(e) =>
                setTwelfth({ ...twelfth, roll: e.target.value.replace(/[^A-Za-z0-9]/g, '') })
              }
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="Marks Obtained"
              className="p-3 border rounded-xl"
              value={twelfth.marks}
              pattern="\d+"
              title="Only numbers allowed"
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                const updated = { ...twelfth, marks: val };
                setTwelfth(updated);
                autoCalc(updated, setTwelfth);
              }}
            />

            <input
              type="text"
              inputMode="numeric"
              placeholder="Total Marks"
              className="p-3 border rounded-xl"
              value={twelfth.total}
              pattern="\d+"
              title="Only numbers allowed"
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                const updated = { ...twelfth, total: val };
                setTwelfth(updated);
                autoCalc(updated, setTwelfth);
              }}
            />

            <input
              type="text"
              value={twelfth.percentage}
              readOnly
              placeholder="Percentage"
              className="p-3 border rounded-xl bg-gray-100"
            />

            <FileInput
              label="Upload 12th Marksheet"
              data={twelfth}
              setData={setTwelfth}
            />
          </div>

          
          <h2 className="text-xl font-semibold text-[#0A1D3B] mt-8 mb-3">
            Degree Details
          </h2>

          <select
            className="p-3 border rounded-xl mb-4"
            value={selectedDegree}
            onChange={(e) => {
              setSelectedDegree(e.target.value);
              setDegreeData({ ...degreeData, type: e.target.value });
            }}
          >
            <option value="">Select Degree</option>
            {degreeOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {selectedDegree && (
            <div className="border p-4 rounded-xl mb-4">
              <h3 className="font-semibold text-lg mb-3 text-[#0A1D3B]">
                {selectedDegree} Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
                <input
                  type="text"
                  placeholder="College Name"
                  className="p-3 border rounded-xl"
                  value={degreeData.college}
                  pattern="[A-Za-z\s.,]+"
                  title="Only letters, spaces, dots and commas allowed"
                  onChange={(e) =>
                    setDegreeData({
                      ...degreeData,
                      college: e.target.value.replace(/[^A-Za-z\s.,]/g, ''),
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="University Name"
                  className="p-3 border rounded-xl"
                  value={degreeData.university}
                  pattern="[A-Za-z\s.,]+"
                  title="Only letters, spaces, dots and commas allowed"
                  onChange={(e) =>
                    setDegreeData({
                      ...degreeData,
                      university: e.target.value.replace(/[^A-Za-z\s.,]/g, ''),
                    })
                  }
                />

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Passing Year"
                  className="p-3 border rounded-xl"
                  value={degreeData.passing}
                  maxLength={4}
                  pattern="\d{4}"
                  title="Enter 4 digit year"
                  onChange={(e) =>
                    setDegreeData({
                      ...degreeData,
                      passing: e.target.value.replace(/\D/g, '').slice(0, 4),
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="CGPA / Percentage"
                  className="p-3 border rounded-xl"
                  value={degreeData.cgpa}
                  pattern="[0-9.]+"
                  title="Only numbers and decimal points allowed"
                  onChange={(e) =>
                    setDegreeData({
                      ...degreeData,
                      cgpa: e.target.value.replace(/[^0-9.]/g, ''),
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Roll Number"
                  className="p-3 border rounded-xl"
                  value={degreeData.roll}
                  pattern="[A-Za-z0-9]+"
                  title="Only alphanumeric characters allowed"
                  onChange={(e) =>
                    setDegreeData({
                      ...degreeData,
                      roll: e.target.value.replace(/[^A-Za-z0-9]/g, ''),
                    })
                  }
                />

                <FileInput
                  label="Upload Degree Marksheet"
                  data={degreeData}
                  setData={setDegreeData}
                />
              </div>
            </div>
          )}

          
          <div className="w-full flex justify-center mt-8">
            <button
              type="submit"
              className="bg-[#0A1D3B] text-white py-2 px-8 rounded-lg text-sm"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>

      
      <style>{`
        .animate-fadeIn {
          animation: fadeIn .3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}