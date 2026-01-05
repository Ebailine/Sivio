"use client";

import { useState, useEffect } from "react";
import { Connection } from "@/lib/types";
import { Plus, Search, Building2, Mail, Phone, Linkedin, User, X, GraduationCap, Calendar, Briefcase, Edit2, Trash2, Star } from "lucide-react";

export default function NetworkingPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);

  // Load connections from localStorage (will be Supabase later)
  useEffect(() => {
    const stored = localStorage.getItem("pathfinder_connections");
    if (stored) {
      setConnections(JSON.parse(stored));
    }
  }, []);

  const saveConnections = (updated: Connection[]) => {
    setConnections(updated);
    localStorage.setItem("pathfinder_connections", JSON.stringify(updated));
  };

  const handleAddConnection = (connection: Omit<Connection, "id" | "created_at" | "updated_at">) => {
    const newConnection: Connection = {
      ...connection,
      id: `conn-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    saveConnections([...connections, newConnection]);
    setShowAddModal(false);
  };

  const handleUpdateConnection = (id: string, updates: Partial<Connection>) => {
    saveConnections(
      connections.map((c) =>
        c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
      )
    );
    setEditingConnection(null);
  };

  const handleDeleteConnection = (id: string) => {
    if (confirm("Are you sure you want to delete this connection?")) {
      saveConnections(connections.filter((c) => c.id !== id));
    }
  };

  // Filter connections
  const filteredConnections = connections.filter((conn) => {
    const matchesSearch =
      searchQuery === "" ||
      conn.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.current_company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.current_role?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCompany =
      filterCompany === "all" || conn.current_company === filterCompany;

    return matchesSearch && matchesCompany;
  });

  // Get unique companies for filter
  const companies = Array.from(new Set(connections.map((c) => c.current_company).filter(Boolean)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Network
          </h1>
          <p className="text-gray-600">
            Build and manage your professional connections. The stronger your network, the easier it is to find warm paths to opportunities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-md border-2 border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Connections</p>
                <p className="text-2xl font-bold text-blue-600">{connections.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-2 border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Same School</p>
                <p className="text-2xl font-bold text-green-600">
                  {connections.filter((c) => c.same_school).length}
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-2 border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Companies</p>
                <p className="text-2xl font-bold text-purple-600">{companies.length}</p>
              </div>
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-md border-2 border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Likelihood</p>
                <p className="text-2xl font-bold text-orange-600">
                  {connections.filter((c) => c.intro_likelihood_score >= 70).length}
                </p>
              </div>
              <Star className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search connections by name, company, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Companies</option>
              {companies.map((company) => (
                <option key={company} value={company}>
                  {company}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Connection
            </button>
          </div>
        </div>

        {/* Teaching Tip */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">💡 Networking Tip</h3>
          <p className="text-blue-800 text-sm">
            Focus on quality over quantity. Connections from your school, same major, or with mutual connections are most likely to help you. Add notes about how you know them to personalize your outreach later.
          </p>
        </div>

        {/* Connections Grid */}
        {filteredConnections.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No connections yet</h3>
            <p className="text-gray-500 mb-6">
              Start building your network by adding people you know who could help you find opportunities.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Your First Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConnections.map((connection) => (
              <ConnectionCard
                key={connection.id}
                connection={connection}
                onEdit={() => setEditingConnection(connection)}
                onDelete={() => handleDeleteConnection(connection.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Connection Modal */}
      {(showAddModal || editingConnection) && (
        <AddConnectionModal
          connection={editingConnection || undefined}
          onClose={() => {
            setShowAddModal(false);
            setEditingConnection(null);
          }}
          onSave={(connection) => {
            if (editingConnection) {
              handleUpdateConnection(editingConnection.id, connection);
            } else {
              handleAddConnection(connection as any);
            }
          }}
        />
      )}
    </div>
  );
}

// Connection Card Component
function ConnectionCard({
  connection,
  onEdit,
  onDelete,
}: {
  connection: Connection;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const scoreColor =
    connection.intro_likelihood_score >= 70
      ? "text-green-600 bg-green-50"
      : connection.intro_likelihood_score >= 40
      ? "text-orange-600 bg-orange-50"
      : "text-gray-600 bg-gray-50";

  return (
    <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 hover:border-blue-300 transition-all p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {connection.profile_photo_url ? (
            <img
              src={connection.profile_photo_url}
              alt={connection.full_name}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold text-lg">
              {connection.full_name.charAt(0)}
            </div>
          )}
          <div>
            <h3 className="font-bold text-gray-900">{connection.full_name}</h3>
            <p className="text-sm text-gray-600">{connection.current_role || "No role"}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {connection.current_company && (
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          {connection.current_company}
        </div>
      )}

      {connection.email && (
        <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
          <Mail className="w-4 h-4 text-gray-400" />
          {connection.email}
        </div>
      )}

      {connection.how_you_know && (
        <div className="bg-gray-50 rounded-lg p-2 mb-3">
          <p className="text-xs text-gray-600">How you know them:</p>
          <p className="text-sm text-gray-800">{connection.how_you_know}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex gap-2">
          {connection.same_school && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              Same School
            </span>
          )}
          {connection.same_major && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
              Same Major
            </span>
          )}
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${scoreColor}`}>
          Score: {connection.intro_likelihood_score}
        </div>
      </div>
    </div>
  );
}

// Add/Edit Connection Modal
function AddConnectionModal({
  connection,
  onClose,
  onSave,
}: {
  connection?: Connection;
  onClose: () => void;
  onSave: (connection: Omit<Connection, "id" | "created_at" | "updated_at">) => void;
}) {
  const [formData, setFormData] = useState<Partial<Connection>>(
    connection || {
      user_id: "user-1", // Will come from auth later
      full_name: "",
      headline: "",
      current_company: "",
      current_role: "",
      email: "",
      phone: "",
      linkedin_url: "",
      how_you_know: "",
      notes: "",
      same_school: false,
      same_major: false,
      recent_graduate: false,
      mutual_connections: 0,
      intro_likelihood_score: 0,
      source: "manual",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate intro likelihood score
    let score = 0;
    if (formData.same_school) score += 50;
    if (formData.same_major) score += 30;
    if (formData.recent_graduate) score += 20;
    if (formData.mutual_connections) score += Math.min(formData.mutual_connections * 10, 50);

    onSave({
      ...formData,
      intro_likelihood_score: score,
    } as any);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {connection ? "Edit Connection" : "Add New Connection"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="John Smith"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Role
                  </label>
                  <input
                    type="text"
                    value={formData.current_role}
                    onChange={(e) => setFormData({ ...formData, current_role: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.current_company}
                    onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="Google"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Headline/Bio
                </label>
                <input
                  type="text"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Product Manager at Google | Stanford MBA"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="https://linkedin.com/in/johnsmith"
                />
              </div>
            </div>
          </div>

          {/* Relationship Context */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Relationship Context</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  How You Know Them
                </label>
                <input
                  type="text"
                  value={formData.how_you_know}
                  onChange={(e) => setFormData({ ...formData, how_you_know: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Met at career fair, Former colleague, Friend's parent, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Personal Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Any helpful context for when you reach out later..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mutual Connections
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.mutual_connections}
                  onChange={(e) =>
                    setFormData({ ...formData, mutual_connections: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Relationship Strength */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Relationship Strength</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.same_school}
                  onChange={(e) => setFormData({ ...formData, same_school: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Same School (+50 intro likelihood)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.same_major}
                  onChange={(e) => setFormData({ ...formData, same_major: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Same Major (+30 intro likelihood)</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.recent_graduate}
                  onChange={(e) => setFormData({ ...formData, recent_graduate: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">Recent Graduate (+20 intro likelihood)</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {connection ? "Update Connection" : "Add Connection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
