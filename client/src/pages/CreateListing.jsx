import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

export default function CreateListing() {
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

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px" }}>
      <Link to="/">← Back to Home</Link>

      <h1>Sell an Item</h1>
      <p>Provide the details of the item you want to auction.</p>

      <form>
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

        <button type="button" disabled={!form.title.trim()}>
          Continue
        </button>
      </form>
    </div>
  );
}
