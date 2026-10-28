
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import Countdown from "../components/Countdown";

export default function ListingDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [bidError, setBidError] = useState("");
  const [bidding, setBidding] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await api.get(`/listings/${id}`);
        setListing(response.data.listing);
        const bidsResponse = await api.get(`/bids/${id}`);
        setBidHistory(bidsResponse.data.bids);
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

  useEffect(() => {
    if (!id) return;

    const refreshBiddingData = async () => {
      try {
        const [listingResponse, bidsResponse] = await Promise.all([
          api.get(`/listings/${id}`),
          api.get(`/bids/${id}`),
        ]);

        setListing(listingResponse.data.listing);
        setBidHistory(bidsResponse.data.bids);
      } catch (err) {
        console.error("Unable to refresh bidding data:", err);
      }
    };

    const timer = setInterval(refreshBiddingData, 5000);

    return () => clearInterval(timer);
  }, [id]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidMessage("");
    setBidError("");

    const amount = Number(bidAmount);

    if (!bidAmount.trim() || !Number.isFinite(amount) || amount <= 0) {
      setBidError("Enter a valid bid amount.");
      return;
    }

    setBidding(true);

    try {
      const response = await api.post(`/bids/${id}`, { amount });

      setBidMessage(response.data.message || "Bid placed successfully.");
      setBidAmount("");

      // Refresh listing details to show the latest bid information.
      const listingResponse = await api.get(`/listings/${id}`);
      setListing(listingResponse.data.listing);
    } catch (err) {
      setBidError(
        err.response?.data?.message || "Unable to place your bid."
      );
    } finally {
      setBidding(false);
    }
  };

  if (loading) return <p>Loading listing...</p>;
  if (error) return <p>{error}</p>;
  if (!listing) return <p>Listing not found.</p>;

  const minimumBid =
    listing.currentBid > 0
      ? listing.currentBid + listing.minIncrement
      : listing.startingPrice;

  const auctionOpen =
    listing.status === "active" &&
    new Date(listing.closesAt) > new Date();
  const isSeller =
    user && listing.sellerId?._id === user._id;

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
      <Link to="/">← Back to Home</Link>

      <h1>{listing.title}</h1>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        {listing.images?.map((image) => (
          <img
            key={image.publicId || image.url}
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
        <strong>Seller:</strong> {listing.sellerId?.name || "Unknown seller"}
      </p>

      {listing.sellerId?.department && (
        <p>
          <strong>Department:</strong> {listing.sellerId.department}
        </p>
      )}

      {listing.sellerId?.year && (
        <p>
          <strong>Year:</strong> {listing.sellerId.year}
        </p>
      )}

      <p>
        <strong>Current Bid:</strong>{" "}
        ₹{listing.currentBid > 0 ? listing.currentBid : "No bids yet"}
      </p>

      <p>
        <strong>Total Bids:</strong> {listing.bidCount || 0}
      </p>

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

      <p>
        <strong>Time left:</strong>{" "}
        <Countdown closesAt={listing.closesAt} />
      </p>

      <h2>Bidding History</h2>

      {bidHistory.length === 0 ? (
        <p>No bids have been placed yet.</p>
      ) : (
        <div>
          {bidHistory.map((bid) => (
            <div
              key={bid._id}
              style={{
                padding: "12px",
                marginBottom: "10px",
                border: "1px solid #ddd",
                borderRadius: "8px",
              }}
            >
              <p>
                <strong>Bid Amount:</strong> ₹{bid.amount}
              </p>

              <p>
                <strong>Bidder:</strong>{" "}
                {bid.bidder?.name || "Unknown bidder"}
              </p>

              <p>
                <strong>Placed At:</strong>{" "}
                {new Date(bid.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <hr style={{ margin: "24px 0" }} />

      <h2>Place Your Bid</h2>

      {isSeller ? (
        <p>You cannot bid on your own listing.</p>
      ) : auctionOpen ? (
        <form onSubmit={handlePlaceBid}>
          <p>
            <strong>Minimum next bid:</strong> ₹{minimumBid}
          </p>

          <input
            type="number"
            min={minimumBid}
            step="any"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={`Enter at least ₹${minimumBid}`}
            required
            style={{
              padding: "10px",
              width: "100%",
              maxWidth: "300px",
              display: "block",
              marginBottom: "12px",
            }}
          />

          <button type="submit" disabled={bidding}>
            {bidding ? "Placing Bid..." : "Place Bid"}
          </button>

          {bidMessage && (
            <p style={{ color: "green" }}>{bidMessage}</p>
          )}

          {bidError && (
            <p style={{ color: "red" }}>{bidError}</p>
          )}
        </form>
      ) : (
        <p>This auction is closed or no longer active.</p>
      )}
    </div>
  );
}
