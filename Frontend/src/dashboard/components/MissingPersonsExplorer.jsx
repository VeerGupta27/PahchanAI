import { useState } from "react";

const BASE = "https://pahchanai.onrender.com";

export default function MissingPersonExplorer() {

  const [form, setForm] = useState({
    name: "",
    location: "",
    email: ""
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("location", form.location);
      formData.append("email", form.email);
      formData.append("image", image);   // must match multer

      const res = await fetch(`${BASE}/ai/add-suspect`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed");
      }

      setMessage("✅ Suspect registered successfully");

      setForm({
        name: "",
        location: "",
        email: ""
      });

      setImage(null);

    } catch (error) {

      setMessage("❌ " + error.message);

    } finally {

      setLoading(false);

    }
  };

  return (
    <div style={{maxWidth:"500px", margin:"40px auto"}}>

      <h2>Register Missing Person</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <br/><br/>

        <input
          type="text"
          name="location"
          placeholder="Last Seen Location"
          value={form.location}
          onChange={handleChange}
        />

        <br/><br/>

        <input
          type="email"
          name="email"
          placeholder="Reporter Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <br/><br/>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />

        <br/><br/>

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Register Suspect"}
        </button>

      </form>

      {message && (
        <p style={{marginTop:"20px"}}>
          {message}
        </p>
      )}

    </div>
  );
}