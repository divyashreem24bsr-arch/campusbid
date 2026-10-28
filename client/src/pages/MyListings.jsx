import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const response = await api.get("/listings/mine");
        setListings(response.data.listings || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your listings."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, []);

  const handleCancel = async (listingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this listing?"
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      await api.post(`/listings/${listingId}/cancel`);

      setListings((previous) =>
        previous.map((listing) =>
          listing._id === listingId
            ? { ...listing, status: "cancelled" }
            : listing
        )
      );

      setMessage("Listing cancelled successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to cancel this listing."
      );
    }
  };

  if (loading) return <p>Loading your listings...</p>;

  return (
    <div style={{ maxWidth: "1000px", margin: "40px auto", padding: "20px" }}>
      <Link to="/">← Back to Home</Link>

      <h1>My Listings</h1>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {listings.length === 0 ? (
        <p>You haven't listed any items yet.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {listings.map((listing) => (
            <div
              key={listing._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <Link
                to={`/listings/${listing._id}`}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {listing.images?.[0]?.url && (
                  <img
                    src={listing.images[0].url}
                    alt={listing.title}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                    }}
                  />
                )}

                <h3>{listing.title}</h3>
                <p>Starting price: ₹{listing.startingPrice}</p>
                <p>Condition: {listing.condition}</p>
                <p>Status: {listing.status}</p>
              </Link>

              {listing.status === "active" && (
                <button
                  type="button"
                  onClick={() => handleCancel(listing._id)}
                >
                  Cancel Listing
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
