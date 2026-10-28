import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Countdown from "../components/Countdown";

export default function Home() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await api.get("/listings");
        setListings(response.data.listings);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load listings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div style={{ padding: "24px", maxWidth: "1100px", margin: "0 auto" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1>CampusBid</h1>
          <p>Find useful items from fellow students.</p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link to="/my-listings">My Listings</Link>
          <Link to="/listings/new">Sell an item</Link>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <h2>Active Listings</h2>

      {loading && <p>Loading listings...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && listings.length === 0 && (
        <p>No active listings yet. Be the first to sell an item!</p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {listings.map((listing) => (
          <Link
            key={listing._id}
            to={`/listings/${listing._id}`}
            style={{
              color: "inherit",
              textDecoration: "none",
              border: "1px solid #ddd",
              borderRadius: "10px",
              overflow: "hidden",
              paddingBottom: "16px",
            }}
          >
            {listing.images?.[0]?.url ? (
              <img
                src={listing.images[0].url}
                alt={listing.title}
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  height: "180px",
                  display: "grid",
                  placeItems: "center",
                  background: "#f2f2f2",
                }}
              >
                No image
              </div>
            )}

            <div style={{ padding: "0 14px" }}>
              <h3>{listing.title}</h3>
              <p>{listing.category}</p>
              <p>
                Starting price: <strong>₹{listing.startingPrice}</strong>
              </p>
              <p>Condition: {listing.condition}</p>
              <p>
                <strong>Time left:</strong>{" "}
                <Countdown closesAt={listing.closesAt} />
              </p>
              <p>
                Closes: {new Date(listing.closesAt).toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
