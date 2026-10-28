import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function CreateListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "Textbooks",
    condition: "Good",
    description: "",
    startingPrice: "",
    minIncrement: "50",
    closesAt: "",
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    if (images.length + files.length > 5) {
      setError("You can upload a maximum of 5 images.");
      e.target.value = "";
      return;
    }

    setError("");
    setUploading(true);

    try {
      const uploadedImages = [];

      for (const file of files) {
        const signResponse = await api.post("/uploads/sign", {
          folder: "campusbid",
        });

        const { signature, timestamp, cloudName, apiKey, folder } =
          signResponse.data;

        const data = new FormData();
        data.append("file", file);
        data.append("api_key", apiKey);
        data.append("timestamp", timestamp);
        data.append("signature", signature);
        data.append("folder", folder);

        const cloudResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: data,
          }
        );

        const result = await cloudResponse.json();

        if (!cloudResponse.ok) {
          throw new Error(result.error?.message || "Image upload failed.");
        }

        uploadedImages.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }

      setImages((previous) => [...previous, ...uploadedImages]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to upload images."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Please enter the item title and description.");
      return;
    }

    const startingPrice = Number(form.startingPrice);
    const minIncrement = Number(form.minIncrement);
    if (
      !Number.isInteger(startingPrice) ||
      startingPrice < 1 ||
      startingPrice > 10000000 ||
      !Number.isInteger(minIncrement) ||
      minIncrement < 1 ||
      minIncrement > 10000000
    ) {
      setError("Prices must be whole numbers from ₹1 to ₹1 crore.");
      return;
    }

    const closingDate = new Date(form.closesAt);
    const now = new Date();
    const maxClosingDate = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    if (
      !form.closesAt ||
      Number.isNaN(closingDate.getTime()) ||
      closingDate.getTime() < now.getTime() + 5 * 60 * 1000 ||
      closingDate > maxClosingDate
    ) {
      setError("Choose a closing date between 5 minutes and 30 days from now.");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one item image.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/listings", {
        ...form,
        startingPrice: Number(form.startingPrice),
        minIncrement: Number(form.minIncrement),
        closesAt: new Date(form.closesAt).toISOString(),
        images,
      });

      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create listing. Please check your details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <Link to="/">← Back to Home</Link>

      <h1>Sell an Item</h1>
      <p>Provide the details of the item you want to auction.</p>

      <form onSubmit={handleSubmit}>
        <label>Item Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Scientific Calculator"
          required
        />

        <br />
        <br />

        <label>Category</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
        >
          {[
            "Bicycles",
            "Calculators",
            "Textbooks",
            "Electronics",
            "Furniture",
            "Hostel Essentials",
            "Sports",
            "Other",
          ].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <br />
        <br />

        <label>Condition</label>
        <select
          name="condition"
          value={form.condition}
          onChange={handleChange}
        >
          {["Like new", "Good", "Fair", "Worn"].map((condition) => (
            <option key={condition} value={condition}>
              {condition}
            </option>
          ))}
        </select>

        <br />
        <br />

        <label>Item Images (Maximum 5)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={uploading || images.length >= 5}
        />

        {uploading && <p>Uploading images...</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            margin: "12px 0 20px",
          }}
        >
          {images.map((image, index) => (
            <img
              key={image.publicId}
              src={image.url}
              alt={`Uploaded item ${index + 1}`}
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ))}
        </div>

        <label>Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the item's condition and details"
          required
          rows={4}
        />

        <br />
        <br />

        <label>Starting Price (₹)</label>
        <input
          type="number"
          name="startingPrice"
          value={form.startingPrice}
          onChange={handleChange}
          min="1"
          required
        />

        <br />
        <br />

        <label>Minimum Bid Increment (₹)</label>
        <input
          type="number"
          name="minIncrement"
          value={form.minIncrement}
          onChange={handleChange}
          min="1"
          required
        />

        <br />
        <br />

        <label>Auction Closing Date and Time</label>
        <input
          type="datetime-local"
          name="closesAt"
          value={form.closesAt}
          onChange={handleChange}
          required
        />

        <br />
        <br />

        <button
          type="submit"
          disabled={uploading || submitting || images.length === 0}
        >
          {submitting ? "Creating Listing..." : "Create Listing"}
        </button>
      </form>
    </div>
  );
}
