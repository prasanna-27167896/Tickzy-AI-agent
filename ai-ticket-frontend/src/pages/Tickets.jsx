import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicketTitle, setSelectedTicketTitle] = useState(null);

  const navigate = useNavigate();

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/signup");
        return;
      }

      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.status === 401) {
        localStorage.removeItem("token");
        navigate("/signup");
        return;
      }

      if (res.ok) {
        setForm({ title: "", description: "" });
        fetchTickets();
      } else {
        alert(data.message || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTicketAPI = async (id, token) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // const data = await res.json();
      return res.ok;
    } catch (error) {
      console.error("Delete error:", error);
      return false;
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-4 text-blue-400">
        🎟️ Create Ticket
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-10">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ticket Title"
          className="input input-bordered w-full bg-gray-700 text-white border-gray-700"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ticket Description"
          className="textarea textarea-bordered w-full bg-gray-700 text-white border-gray-700"
          required
        />
        <button
          className="btn btn-primary bg-blue-950 hover:bg-gray-900 w-full border-hidden"
          type="submit"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      <h2 className="text-2xl font-semibold mb-4 text-blue-300">
        📄 All Tickets
      </h2>

      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket._id}
            className="relative bg-gray-800 border border-gray-700 rounded-xl p-4 hover:shadow-xl"
          >
            <Link
              to={`/room/`}
              state={{ email: ticket.createdBy.email, ticketId: ticket._id }}
            >
              <div className="absolute top-2 right-10 px-4 py-1 text-sm text-cyan-200 border border-cyan-500 rounded-lg shadow-md bg-cyan-800 hover:bg-cyan-700 hover:text-white transition-all duration-300 cursor-pointer">
                Connect
              </div>
            </Link>
            <Trash2
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600 cursor-pointer mt-0.5"
              title="Delete Ticket"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedTicketId(ticket._id);
                setSelectedTicketTitle(ticket.title);
                setShowModal(true);
              }}
            />

            <Link to={`/tickets/${ticket._id}`} className="block space-y-1">
              <h3 className="text-xl font-bold text-blue-300">
                {ticket.title}
              </h3>
              <p className="text-gray-300">{ticket.description}</p>
              <div className="flex flex-wrap text-xs text-gray-400 gap-4 mt-2">
                <p className="text-sm text-gray-500">
                  Created By: {ticket.createdBy?.email || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  Created At: {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
            </Link>
          </div>
        ))}

        {tickets.length === 0 && (
          <p className="text-center text-gray-400">No tickets submitted yet.</p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 p-6 rounded-xl w-[90%] max-w-sm shadow-xl relative text-white">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
              onClick={() => setShowModal(false)}
            >
              ✖
            </button>

            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="text-4xl">⚠️</div>
              <p className="text-lg">Are you sure you want to delete</p>
              <p className="text-xl font-bold text-red-500">
                {selectedTicketTitle}
              </p>

              <div className="flex gap-4 justify-center mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const token = localStorage.getItem("token");
                    const deleted = await deleteTicketAPI(
                      selectedTicketId,
                      token
                    );
                    if (deleted) {
                      setShowModal(false);
                      fetchTickets();
                    }
                  }}
                  className="btn btn-error"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
