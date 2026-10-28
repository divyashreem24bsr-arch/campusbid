import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";

export default function ListingDetails() {
  const { id } = useParams();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await api.get(`/listings/${id}`);
        setListing(response.data.listing);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load listing details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) return <p>Loading listing...</p>;
  if (error) return <p>{error}</p>;
  if (!listing) return <p>Listing not found.</p>;

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <Link to="/">← Back to Home</Link>

      <h1>{listing.title}</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        {listing.images?.map((image) => (
          <img
            key={image.publicId}
            src={image.url}
            alt={listing.title}
            style={{
              width: "220px",
              height: "180px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        ))}
      </div>

      <h2>Starting Price: ₹{listing.startingPrice}</h2>
      <p>
        <strong>Category:</strong> {listing.category}
      </p>
      <p>
        <strong>Condition:</strong> {listing.condition}
      </p>
      <p>
        <strong>Description:</strong> {listing.description}
      </p>
      <p>
        <strong>Minimum Bid Increment:</strong> ₹{listing.minIncrement}
      </p>
      <p>
        <strong>Auction Closes:</strong>{" "}
        {new Date(listing.closesAt).toLocaleString()}
      </p>
    </div>
  );
}
