import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ role: "", skills: "" });
  const [searchQuery, setSearchQuery] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
        setFilteredUsers(data);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Error fetching users", err);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user.email);
    setFormData({
      role: user.role,
      skills: user.skills?.join(", "),
    });
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/auth/update-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: editingUser,
            role: formData.role,
            skills: formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error(data.error || "Failed to update user");
        return;
      }

      setEditingUser(null);
      setFormData({ role: "", skills: "" });
      fetchUsers();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setFilteredUsers(
      users.filter((user) => user.email.toLowerCase().includes(query))
    );
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4 text-white">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">
        Admin Panel – Manage Users
      </h1>

      <input
        type="text"
        className="input input-bordered w-full bg-gray-900 text-white placeholder-gray-400 border-gray-600 mb-6"
        placeholder="🔍 Search by email"
        value={searchQuery}
        onChange={handleSearch}
      />

      {filteredUsers.map((user) => (
        <div
          key={user._id}
          className="bg-[#1e293b] border border-gray-700 shadow-md rounded-xl p-5 mb-4 transition hover:shadow-lg"
        >
          <div className="space-y-1">
            <p>
              <span className="font-semibold text-gray-300">📧 Email:</span>{" "}
              {user.email}
            </p>
            <p>
              <span className="font-semibold text-gray-300">🛡 Role:</span>{" "}
              {user.role}
            </p>
            <p>
              <span className="font-semibold text-gray-300">🛠 Skills:</span>{" "}
              {user.skills && user.skills.length > 0
                ? user.skills.join(", ")
                : "N/A"}
            </p>
          </div>

          {editingUser === user.email ? (
            <div className="mt-4 space-y-3">
              <select
                className="select select-bordered w-full bg-gray-800 text-white border-gray-600"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="text"
                placeholder="Comma-separated skills"
                className="input input-bordered w-full bg-gray-800 text-white border-gray-600 placeholder-gray-400"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />

              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="btn btn-sm bg-green-600 hover:bg-green-500 text-white"
                  onClick={handleUpdate}
                >
                  ✅ Save
                </button>
                <button
                  className="btn btn-sm bg-gray-700 hover:bg-gray-600 text-white"
                  onClick={() => setEditingUser(null)}
                >
                  ❌ Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end mt-4">
              <button
                className="btn btn-sm bg-blue-600 hover:bg-blue-500 text-white"
                onClick={() => handleEditClick(user)}
              >
                ✏️ Edit
              </button>
            </div>
          )}
        </div>
      ))}

      {filteredUsers.length === 0 && (
        <p className="text-gray-400 mt-6">No users found.</p>
      )}
    </div>
  );
}
