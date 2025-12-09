import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const SignUpPage = () => {
  const { signup } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    preferredLanguage: "en",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-900">
      <form
        onSubmit={handleSubmit}
        className="bg-blue-300 p-6 rounded shadow-md space-y-4 w-80"
      >
        <h2 className="text-lg font-bold">Sign Up</h2>

        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />

        <label className="block">Preferred Language:</label>
        <select
          name="preferredLanguage"
          value={formData.preferredLanguage}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="ja">Japanese</option>
          <option value="zh">Chinese</option>
          <option value="de">German</option>
          <option value="fr">French</option>
          <option value="ru">Russian</option>
          <option value="es">Spanish</option>
          <option value="ar">Arabic</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 rounded"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignUpPage;
