import React, { useState, useEffect } from "react";

// --- Helper Component 1: StatusBadge ---
function StatusBadge({ status }) {
  const base = "px-3 py-1 rounded-full text-sm font-semibold";
  if (status === "Green") return <span className={base + " bg-green-100 text-green-700 border border-green-200"}>Verified</span>;
  if (status === "Yellow") return <span className={base + " bg-yellow-100 text-yellow-800 border border-yellow-200"}>Pending Review</span>;
  if (status === "Red") return <span className={base + " bg-red-100 text-red-700 border border-red-200"}>Rejected</span>;
  return <span className={base + " bg-gray-100 text-gray-600"}>{status}</span>;
}

// --- Helper Component 2: DocThumb (For Modal) ---
function DocThumb({ src, name, onOpen }) {
  const placeholderText = "No Doc";
  return (
    <div 
      onClick={src ? onOpen : null} 
      className={`flex items-center gap-3 border rounded-lg p-2 bg-gray-50 ${src ? 'hover:bg-white hover:shadow-sm cursor-pointer' : 'opacity-60'} transition`}
    >
      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
        {src ? (
          <img src={src} alt={name} className="object-cover w-full h-full" />
        ) : (
          <div className="text-xs text-gray-500 text-center px-1">{placeholderText}</div>
        )}
      </div>
      <div className="flex-1 text-sm font-medium text-gray-700">{name}</div>
      {src && (
        <span className="text-xs text-blue-600 hover:underline font-medium">
          View
        </span>
      )}
    </div>
  );
}

// --- Helper Component 3: ComparisonField (For Modal) ---
function ComparisonField({ title, formData, ocrData, score }) {
  const pct = (n) => `${Math.round((n || 0) * 100)}%`;
  const scoreColor = score >= 0.8 ? 'text-green-600' : (score >= 0.5 ? 'text-yellow-600' : 'text-red-600');
  
  return (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-bold uppercase text-gray-600">{title}</div>
        <div className={`text-xl font-bold ${scoreColor}`}>
          {pct(score)}
        </div>
      </div>
      <div className="text-sm space-y-2">
        <div>
          <span className="font-medium text-gray-500 w-24 inline-block">Form Data:</span>
          <span className="text-gray-900">{formData || "N/A"}</span>
        </div>
        <div className="flex items-start">
          <span className="font-medium text-gray-500 w-24 inline-block shrink-0">Extracted:</span>
          <span className="text-gray-900 font-mono text-xs p-1 bg-gray-200 rounded break-all">
            {ocrData ? ocrData.substring(0, 100) + (ocrData.length > 100 ? '...' : '') : 'No text extracted'}
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Main Dashboard Component ---
export default function ScientistDashboard() {
  const placeholder = "https://placehold.co/400x250/eee/ccc?text=No+Document";

  // --- (YAHAN MOCK DATA ADD KIYA HAI) ---
  const [applications, setApplications] = useState([
    {
      id: "dummy-green",
      name: "Ojas Deshmukh",
      category: "General",
      status: "Green",
      dob: "1995-03-12",
      extracted: { name_confidence: 1.0, dob_confidence: 1.0, category_confidence: 1.0, aadhaar_confidence: 1.0 },
      ocrData: { aadhaar: "Priya Sharma 12-03-1995" },
      flags: [],
      notes: "Auto-verified successfully.",
      docs: { aadhaar: placeholder, caste: null }
    },
    {
      id: "dummy-yellow",
      name: "Rohan Varma ",
      category: "OBC",
      status: "Yellow", // Yeh "Pending Review" mein dikhega
      dob: "1999-05-10",
      extracted: {
        name_confidence: 1.0,
        dob_confidence: 0.1, // Score kam hai
        category_confidence: 1.0,
        aadhaar_confidence: 0.9,
      },
      ocrData: {
        aadhaar: "Name: Rohan Varma, DOB: 1998-05-10", // DOB Mismatch
        caste: "Other Backward Class",
      },
      flags: [
        { type: "DOB", reason: "Date of Birth does not match document.", severity: "high" }
      ],
      notes: "Partial match. Manual review required.",
      docs: {
        aadhaar: placeholder,
        caste: placeholder,
      }
    },
    {
      id: "dummy-red",
      name: "Amit Kumar ",
      category: "SC",
      status: "Red", // Yeh "Rejected History" mein dikhega
      dob: "2001-01-01",
      extracted: {
        name_confidence: 0.1,
        dob_confidence: 0.1,
        category_confidence: 0.1,
        aadhaar_confidence: 0.1,
      },
      ocrData: {
        aadhaar: "Name: Suresh... DOB: 1990...",
        caste: "Unreadable text...",
      },
      flags: [
        { type: "Name", reason: "Name mismatch.", severity: "high" },
        { type: "DOB", reason: "DOB mismatch.", severity: "high" }
      ],
      notes: "Critical mismatch.",
      docs: {
        aadhaar: placeholder,
        caste: placeholder,
      }
    }
  ]);
  // ----------------------------------------

  // --- (LOADING KO 'FALSE' SET KAR DIYA) ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // UI State
  const [openReviewId, setOpenReviewId] = useState(null); // ID of app being reviewed
  const [openDoc, setOpenDoc] = useState(null); // {src, name} for zoom
  const [showAllPending, setShowAllPending] = useState(false);

  // --- 1. Fetch Data (*** COMMENTED OUT FOR DEMO ***) ---
  /*
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/applications");
        if (!response.ok) throw new Error("Failed to fetch applications from backend");
        const data = await response.json();
        setApplications(data); // Yeh line aapke mock data ko delete kar degi
      } catch (err) {
        console.error("Error:", err);
        setError("Could not load dashboard data. Ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []); 
  */
  // ---------------------------------------------------

  // --- 2. Handle Actions (Approve/Reject) ---
  const handleDecision = async (appId, newStatus) => {
    const originalApps = [...applications];
    
    setApplications(prev => prev.map(app => 
      app.id === appId ? { ...app, status: newStatus, notes: newStatus === 'Green' ? "Manually approved" : "Manually rejected" } : app
    ));
    setOpenReviewId(null); 

    try {
      // Yeh backend call try karega, lekin demo ke liye zaroori nahi
      const response = await fetch(`http://localhost:5000/api/applications/${appId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error("Backend update failed");
      
      console.log(`App ${appId} updated to ${newStatus}`);
    } catch (err) {
      console.error("Update failed:", err);
      // Hum mock data use kar rahe hain, isliye error par data revert nahi karenge
      // alert("Failed to update status. Reverting changes.");
      // setApplications(originalApps); 
    }
  };

  // --- 3. Derived Data for UI ---
  const pendingApps = applications.filter(a => a.status === "Yellow");
  const verifiedApps = applications.filter(a => a.status === "Green");
  const rejectedApps = applications.filter(a => a.status === "Red");
  
  const total = applications.length;
  const totalVerified = verifiedApps.length;
  const totalPending = pendingApps.length; 
  const totalFlagged = rejectedApps.length; 

  const pct = (n) => `${Math.round((n || 0) * 100)}%`;
  const appInReview = applications.find(a => a.id === openReviewId);

  // --- Render Loading/Error ---
  if (loading) return <div className="min-h-screen bg-[#f3f6fb] flex items-center justify-center text-gray-500">Loading Dashboard...</div>;
  if (error) return <div className="min-h-screen bg-[#f3f6fb] flex items-center justify-center text-red-500">{error}</div>;

  // --- Render Dashboard ---
  return (
    <div className="min-h-screen bg-[#0A1D3B] p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[#0A1D3B]">Scientist Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, Scientist. You have {totalPending} applications requiring attention.</p>
        </header>

        {/* Stats Cards (Updated counts) */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500 font-medium">Total Applications</div>
            <div className="text-3xl font-bold text-[#0A1D3B] mt-1">{total}</div>
          </div>
          <div className="bg-green-50 p-5 rounded-xl shadow-sm border border-green-100">
            <div className="text-sm text-green-800 font-medium">Verified & Approved</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{totalVerified}</div>
          </div>
          <div className="bg-yellow-50 p-5 rounded-xl shadow-sm border border-yellow-100">
            <div className="text-sm text-yellow-800 font-medium">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-600 mt-1">{totalPending}</div>
          </div>
          <div className="bg-red-50 p-5 rounded-xl shadow-sm border border-red-100">
            <div className="text-sm text-red-800 font-medium">System Flagged</div>
            {/* --- (TYPO FIXED) --- */}
            <div className="text-3xl font-bold text-red-600 mt-1">{totalFlagged}</div>
          </div>
        </div>

        {/* --- Pending Review Table (Sirf Yellow) --- */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mb-8">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-lg font-bold text-[#0A1D3B]">Pending Review <span className="ml-2 bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">{totalPending}</span></h2>
            <div className="text-sm text-gray-500">
              Showing {showAllPending ? pendingApps.length : Math.min(5, pendingApps.length)} of {pendingApps.length}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200 uppercase tracking-wider">
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">AI Score (Name)</th>
                  <th className="p-4">AI Score (DOB)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(showAllPending ? pendingApps : pendingApps.slice(0, 5)).map((app) => (
                  <tr key={app.id} className="hover:bg-blue-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-[#0A1D3B]">{app.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">{app.notes}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{app.category}</td>
                    <td className="p-4 text-sm font-medium text-gray-700">{pct(app.extracted?.name_confidence)}</td>
                    <td className="p-4 text-sm font-medium text-gray-700">{pct(app.extracted?.dob_confidence)}</td>
                    <td className="p-4"><StatusBadge status={app.status} /></td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setOpenReviewId(app.id)}
                        className="bg-[#0A1D3B] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#15305b] transition shadow-sm"
                      >
                        Review & Act
                      </button>
                    </td>
                  </tr>
                ))}
                {pendingApps.length === 0 && (
                  <tr><td colSpan="6" className="p-8 text-center text-gray-500">No applications pending manual review.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {pendingApps.length > 5 && (
            <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
              <button onClick={() => setShowAllPending(!showAllPending)} className="text-blue-600 text-sm font-medium hover:underline">
                {showAllPending ? "Show Less" : "Show All Pending"}
              </button>
            </div>
          )}
        </div>

        {/* --- Review Modal (UI Change) --- */}
        {openReviewId && appInReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A1D3B]/60 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
              
              <div className="w-full md:w-1/2 bg-gray-100 p-6 overflow-y-auto border-r border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 sticky top-0 bg-gray-100 py-2">Submitted Documents</h3>
                <div className="space-y-4">
                  {(appInReview.flags || []).some(f => f.type === "Name" || f.type === "DOB" || f.type === "Document") && (
                    <DocThumb 
                      src={appInReview.docs?.aadhaar || placeholder} 
                      name="Aadhaar Card" 
                      onOpen={() => setOpenDoc({ src: appInReview.docs?.aadhaar || placeholder, name: "Aadhaar Card" })} 
                    />
                  )}
                  {(appInReview.flags || []).some(f => f.type === "Category") && (
                    <DocThumb 
                      src={appInReview.docs?.caste} 
                      name="Caste Certificate" 
                      onOpen={() => setOpenDoc({ src: appInReview.docs?.caste || placeholder, name: "Caste Certificate" })} 
                    />
                  )}
                  {(appInReview.flags || []).length === 0 && (
                       <DocThumb 
                          src={appInReview.docs?.aadhaar || placeholder} 
                          name="Aadhaar Card" 
                          onOpen={() => setOpenDoc({ src: appInReview.docs?.aadhaar || placeholder, name: "Aadhaar Card" })} 
                        />
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2 flex flex-col bg-white">
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0A1D3B]">{appInReview.name}</h2>
                      <div className="text-sm text-gray-500 mt-1">Category: <span className="font-medium text-gray-800">{appInReview.category}</span></div>
                    </div>
                    <button onClick={() => setOpenReviewId(null)} className="text-gray-400 hover:text-gray-800 text-3xl leading-none">&times;</button>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">Mismatch Details & AI Score</h4>
                  <div className="space-y-4">
                    <ComparisonField
                      title="Applicant Name"
                      formData={appInReview.name}
                      ocrData={appInReview.ocrData?.aadhaar}
                      score={appInReview.extracted?.name_confidence}
                    />
                    <ComparisonField
                      title="Date of Birth"
                      formData={appInReview.dob}
                      ocrData={appInReview.ocrData?.aadhaar}
                      score={appInReview.extracted?.dob_confidence}
                    />
                    {appInReview.category !== 'General' && (
                      <ComparisonField
                        title="Category"
                        formData={appInReview.category}
                        ocrData={appInReview.ocrData?.caste}
                        score={appInReview.extracted?.category_confidence}
                      />
                    )}
                    {(appInReview.flags || []).length === 0 && (
                       <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-green-800 text-sm flex items-center gap-2">
                         ✅ No anomalies detected by AI.
                       </div>
                    )}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleDecision(appInReview.id, "Green")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold shadow-sm transition transform active:scale-95"
                    >
                      Approve Application
                    </button>
                    <button 
                      onClick={() => handleDecision(appInReview.id, "Red")}
                      className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-bold shadow-sm transition"
                    >
                      Reject Application
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Document Fullscreen Zoom --- */}
        {openDoc && (
          <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setOpenDoc(null)}>
            <div className="relative max-w-5xl w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <img src={openDoc.src} alt={openDoc.name} className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl" />
              <div className="mt-4 flex items-center gap-4">
                <span className="text-white font-medium text-lg">{openDoc.name}</span>
                <button onClick={() => setOpenDoc(null)} className="bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-full backdrop-blur-md transition">
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- Verified History Table (Green) --- */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mt-8 opacity-75 hover:opacity-100 transition-opacity">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-bold text-green-500">Verified History (Green)</h2>
          </div>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                {verifiedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-600 font-medium">{app.name}</td>
                    <td className="p-4 text-sm text-gray-500">{app.category}</td>
                    <td className="p-4"><StatusBadge status="Green" /></td>
                    <td className="p-4 text-right text-sm text-gray-400">Action locked</td>
                  </tr>
                ))}
                 {verifiedApps.length === 0 && (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500">No verified applications yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- NEW: Rejected History Table (Red) --- */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 mt-8 opacity-60 hover:opacity-100 transition-opacity">
          <div className="p-5 border-b border-gray-100 bg-red-50">
            <h2 className="text-lg font-bold text-red-700">Rejected History (Red)</h2>
          </div>
          <div className="overflow-x-auto max-h-64">
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                {rejectedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="p-4 text-gray-600 font-medium">{app.name}</td>
                    <td className="p-4 text-sm text-gray-500">{app.category}</td>
                    <td className="p-4"><StatusBadge status="Red" /></td>
                    <td className="p-4 text-right text-sm text-red-400">Rejected</td>
                  </tr>
                ))}
                 {rejectedApps.length === 0 && (
                  <tr><td colSpan="4" className="p-8 text-center text-gray-500">No rejected applications.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      
      {/* Animation Style */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}