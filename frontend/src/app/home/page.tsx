"use client";

import React, { useState } from "react";
import axios from "axios";

interface FormData {
  postType: string;
  like: string;
  share: string;
  comments: string;
}

const page: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    postType: "",
    like: "",
    share: "",
    comments: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("social-pulse-9gmk-g8vqxzzpv-rushabhbhalgats-projects.vercel.app/data", formData);
      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error sending data to the server:", error);
    }
  };

  return (
    <form
      className="max-w-lg mx-auto p-6 bg-white shadow-md rounded-lg"
      onSubmit={handleSubmit}
    >
      <div className="mb-4">
        <label
          htmlFor="postType"
          className="block text-sm font-medium text-gray-700"
        >
          Post Type:
        </label>
        <input
          type="text"
          id="postType"
          name="postType"
          value={formData.postType}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="like"
          className="block text-sm font-medium text-gray-700"
        >
          Like:
        </label>
        <input
          type="text"
          id="like"
          name="like"
          value={formData.like}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="share"
          className="block text-sm font-medium text-gray-700"
        >
          Share:
        </label>
        <input
          type="text"
          id="share"
          name="share"
          value={formData.share}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
        />
      </div>
      <div className="mb-4">
        <label
          htmlFor="comments"
          className="block text-sm font-medium text-gray-700"
        >
          Comments:
        </label>
        <input
          type="text"
          id="comments"
          name="comments"
          value={formData.comments}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Submit
      </button>
    </form>
  );
};

export default page;
