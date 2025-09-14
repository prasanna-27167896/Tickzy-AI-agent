import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok) {
          setTicket(data.ticket);
        } else {
          alert(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center text-white mt-10">
        Loading ticket details...
      </div>
    );
  }

  if (!ticket) {
    return <div className="text-center text-white mt-10">Ticket not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 text-white">
      <h2 className="text-3xl font-bold mb-6 text-blue-400">
        🎫 Ticket Details
      </h2>

      <div className="bg-[#1e293b] border border-gray-700 rounded-lg shadow-lg p-6 space-y-5">
        {/* Title and Connect Button Row */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-blue-300">{ticket.title}</h3>

          <Link
            to={`/room/`}
            state={{ email: ticket.createdBy.email, ticketId: ticket._id }}
          >
            <div className="inline-block px-4 py-1 text-sm text-cyan-200 border border-cyan-500 rounded-lg shadow-md bg-cyan-800 hover:bg-cyan-700 hover:text-white transition-all duration-300 cursor-pointer">
              Connect
            </div>
          </Link>
        </div>

        <p className="text-gray-300">{ticket.description}</p>

        {ticket.status && (
          <>
            <div className="border-t border-gray-600 my-4"></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <p>
                <span className="text-gray-400">📌 Status:</span>{" "}
                {ticket.status}
              </p>
              {ticket.priority && (
                <p>
                  <span className="text-gray-400">⚡ Priority:</span>{" "}
                  {ticket.priority}
                </p>
              )}
              {ticket.relatedSkills?.length > 0 && (
                <p>
                  <span className="text-gray-400">🛠️ Skills:</span>{" "}
                  {ticket.relatedSkills.join(", ")}
                </p>
              )}
              {ticket.assignedTo && (
                <p>
                  <span className="text-gray-400">👤 Assigned To:</span>{" "}
                  {ticket.assignedTo}
                </p>
              )}
            </div>

            {ticket.helpfulNotes && (
              <div>
                <h4 className="text-md font-semibold text-blue-300 mt-4">
                  📝 Helpful Notes:
                </h4>
                <div className="prose max-w-none bg-gray-800 p-3 rounded-lg mt-2 text-gray-100">
                  <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                </div>
              </div>
            )}

            {ticket.createdAt && (
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mt-6 text-sm text-gray-300 space-y-3 shadow-md">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">⏱️</span>
                  <span className="font-medium text-gray-200">Created At:</span>
                  <span className="text-gray-400">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-blue-400">👤</span>
                  <span className="font-medium text-gray-200">Created By:</span>
                  <span className="text-gray-400">
                    {ticket.createdBy?.email || "N/A"}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
