"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Connection } from "@/lib/types";
import { Sparkles, Copy, Check, Mail, Linkedin, AlertCircle, Lightbulb, Target, Send, Edit2 } from "lucide-react";

function MessageGeneratorContent() {
  const searchParams = useSearchParams();
  const connectionId = searchParams.get("connection");
  const companyName = searchParams.get("company");

  const [connection, setConnection] = useState<Connection | null>(null);
  const [formData, setFormData] = useState({
    senderName: "",
    senderSchool: "",
    senderMajor: "",
    senderCareerStage: "undergrad",
    recipientName: "",
    recipientRole: "",
    recipientCompany: companyName || "",
    goal: "informational_interview",
    customContext: "",
  });

  const [generatedMessage, setGeneratedMessage] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedMessage, setEditedMessage] = useState("");

  // Load connection if ID provided
  useEffect(() => {
    if (connectionId) {
      const stored = localStorage.getItem("pathfinder_connections");
      if (stored) {
        const connections = JSON.parse(stored);
        const found = connections.find((c: Connection) => c.id === connectionId);
        if (found) {
          setConnection(found);
          setFormData((prev) => ({
            ...prev,
            recipientName: found.full_name,
            recipientRole: found.current_role || "",
            recipientCompany: found.current_company || prev.recipientCompany,
          }));
        }
      }
    }

    // Load user info from localStorage
    const userStr = localStorage.getItem("pathfinder_user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setFormData((prev) => ({
        ...prev,
        senderName: user.full_name || "",
        senderSchool: user.school || "",
        senderMajor: user.major || "",
        senderCareerStage: user.career_stage || "undergrad",
      }));
    }
  }, [connectionId]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setEditMode(false);

    try {
      const response = await fetch("/api/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          connectionContext: connection
            ? {
                same_school: connection.same_school,
                same_major: connection.same_major,
                how_you_know: connection.how_you_know,
              }
            : {},
        }),
      });

      const data = await response.json();
      setGeneratedMessage(data);
      setEditedMessage(data.body);
    } catch (error) {
      console.error("Failed to generate message:", error);
      alert("Failed to generate message. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveAsDraft = () => {
    // Save to localStorage (will be Supabase later)
    const draft = {
      id: `draft-${Date.now()}`,
      user_id: "user-1",
      connection_id: connection?.id,
      target_company_id: null,
      recipient_name: formData.recipientName,
      recipient_email: connection?.email,
      message_subject: generatedMessage.subject,
      message_content: editMode ? editedMessage : generatedMessage.body,
      coaching_tips: generatedMessage.coaching_tips,
      why_this_works: generatedMessage.why_this_works,
      status: "draft",
      send_method: "linkedin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const stored = localStorage.getItem("pathfinder_outreach");
    const outreach = stored ? JSON.parse(stored) : [];
    outreach.push(draft);
    localStorage.setItem("pathfinder_outreach", JSON.stringify(outreach));

    alert("Message saved as draft! You can find it in your dashboard.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-600" />
            AI Message Generator
          </h1>
          <p className="text-gray-600">
            Generate personalized outreach messages that get responses. Our AI uses proven networking principles to craft messages that feel genuine and get results.
          </p>
        </div>

        {/* Demo Notice */}
        {generatedMessage?.isDemo && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900">Demo Mode</h3>
                <p className="text-sm text-yellow-800">{generatedMessage.demoNotice}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Input Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Message Details</h2>

              {/* Your Info */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">About You</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Your school"
                    value={formData.senderSchool}
                    onChange={(e) => setFormData({ ...formData, senderSchool: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Your major (optional)"
                    value={formData.senderMajor}
                    onChange={(e) => setFormData({ ...formData, senderMajor: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Recipient Info */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-800 mb-3">About Them</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Recipient's name"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Their role"
                    value={formData.recipientRole}
                    onChange={(e) => setFormData({ ...formData, recipientRole: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Their company"
                    value={formData.recipientCompany}
                    onChange={(e) => setFormData({ ...formData, recipientCompany: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Goal */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's your goal?
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="informational_interview">Ask for informational interview</option>
                  <option value="intro_request">Request introduction to someone</option>
                  <option value="job_referral">Ask for job referral</option>
                  <option value="general_networking">General networking / catch up</option>
                </select>
              </div>

              {/* Custom Context */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional context (optional)
                </label>
                <textarea
                  placeholder="E.g., Met at a conference, mutual friend introduced us, saw their recent LinkedIn post, etc."
                  value={formData.customContext}
                  onChange={(e) => setFormData({ ...formData, customContext: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Connection Info */}
              {connection && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-green-900 mb-2">Connection Strength</h4>
                  <div className="space-y-1 text-sm text-green-800">
                    {connection.same_school && <p>✓ Same school</p>}
                    {connection.same_major && <p>✓ Same major</p>}
                    {connection.how_you_know && <p>✓ {connection.how_you_know}</p>}
                    <p className="font-medium mt-2">
                      Intro Likelihood Score: {connection.intro_likelihood_score}
                    </p>
                  </div>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={
                  isGenerating ||
                  !formData.senderName ||
                  !formData.recipientName ||
                  !formData.recipientCompany
                }
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Message
                  </>
                )}
              </button>
            </div>

            {/* Teaching Tips */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6">
              <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Networking Best Practices
              </h3>
              <ul className="space-y-2 text-sm text-purple-800">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 flex-shrink-0">•</span>
                  <span>
                    <strong>Ask for advice, not a job.</strong> People are 3x more likely to respond when you're seeking guidance rather than asking for favors.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 flex-shrink-0">•</span>
                  <span>
                    <strong>Be specific.</strong> "Can we chat for 15 minutes?" is easier to say yes to than "Let me know if you have time."
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 flex-shrink-0">•</span>
                  <span>
                    <strong>Lead with your connection.</strong> Start with what you have in common (school, mutual friend, etc.) to build rapport.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 flex-shrink-0">•</span>
                  <span>
                    <strong>Keep it brief.</strong> 75-125 words is ideal. Busy people appreciate concise messages.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Generated Message */}
          <div>
            {generatedMessage ? (
              <div className="space-y-6">
                {/* Subject Line */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-bold text-gray-900">Subject Line</label>
                    <button
                      onClick={() => handleCopy(generatedMessage.subject, "subject")}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1"
                    >
                      {copiedField === "subject" ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{generatedMessage.subject}</p>
                </div>

                {/* Message Body */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-bold text-gray-900">Message</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditMode(!editMode)}
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        {editMode ? "Preview" : "Edit"}
                      </button>
                      <button
                        onClick={() =>
                          handleCopy(editMode ? editedMessage : generatedMessage.body, "body")
                        }
                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-all flex items-center gap-1"
                      >
                        {copiedField === "body" ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  {editMode ? (
                    <textarea
                      value={editedMessage}
                      onChange={(e) => setEditedMessage(e.target.value)}
                      rows={10}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-mono text-sm"
                    />
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800">
                      {editMode ? editedMessage : generatedMessage.body}
                    </div>
                  )}
                </div>

                {/* Why This Works */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Why This Works
                  </h3>
                  <p className="text-sm text-blue-800">{generatedMessage.why_this_works}</p>
                </div>

                {/* Coaching Tips */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
                  <h3 className="font-bold text-gray-900 mb-4">Coaching Tips</h3>
                  <ul className="space-y-3">
                    {generatedMessage.coaching_tips.map((tip: string, index: number) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                          {index + 1}
                        </div>
                        <p className="text-sm text-gray-700">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={handleSaveAsDraft}
                    className="flex-1 px-6 py-3 bg-white border-2 border-blue-500 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Save as Draft
                  </button>
                  {connection?.email && (
                    <a
                      href={`mailto:${connection.email}?subject=${encodeURIComponent(
                        generatedMessage.subject
                      )}&body=${encodeURIComponent(editMode ? editedMessage : generatedMessage.body)}`}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send Email
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border-2 border-gray-100">
                <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  Ready to generate your message
                </h3>
                <p className="text-gray-500">
                  Fill out the form on the left and click "Generate Message" to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessageGeneratorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessageGeneratorContent />
    </Suspense>
  );
}
