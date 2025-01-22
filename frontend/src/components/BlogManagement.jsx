import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [newBlog, setNewBlog] = useState({ title: "", content: "" });
  const [editingBlog, setEditingBlog] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    try {
      const { data, error } = await supabase.from("blogs").select("*");
      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      toast.error("Could not fetch blogs");
    }
  }

  async function handleAddBlog(e) {
    e.preventDefault();
    if (!newBlog.title.trim() || !newBlog.content.trim()) return;
    try {
      const { error } = await supabase.from("blogs").insert([newBlog]);
      if (error) throw error;
      toast.success("Blog created");
      setNewBlog({ title: "", content: "" });
      fetchBlogs();
    } catch (error) {
      toast.error("Error creating blog");
    }
  }

  function startEditing(blog) {
    setEditingBlog(blog.id);
    setEditingTitle(blog.title);
    setEditingContent(blog.content);
  }

  async function handleUpdateBlog(id) {
    try {
      const { error } = await supabase
        .from("blogs")
        .update({ title: editingTitle, content: editingContent })
        .eq("id", id);
      if (error) throw error;
      toast.success("Blog updated");
      setEditingBlog(null);
      fetchBlogs();
    } catch (error) {
      toast.error("Error updating blog");
    }
  }

  async function handleDeleteBlog(id) {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", id);
      if (error) throw error;
      toast.success("Blog deleted");
      fetchBlogs();
    } catch (error) {
      toast.error("Error deleting blog");
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Manage Blogs
      </h2>

      {/* Create New Blog */}
      <form onSubmit={handleAddBlog} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={newBlog.title}
            onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            rows="4"
            value={newBlog.content}
            onChange={(e) =>
              setNewBlog({ ...newBlog, content: e.target.value })
            }
            required
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Blog
        </button>
      </form>

      {/* Display Blogs */}
      <div className="space-y-4">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow"
          >
            {editingBlog === blog.id ? (
              <>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm mb-2 focus:border-indigo-500 focus:ring-indigo-500"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                />
                <textarea
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm mb-2 focus:border-indigo-500 focus:ring-indigo-500"
                  rows="4"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                />
                <button
                  onClick={() => handleUpdateBlog(blog.id)}
                  className="bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingBlog(null)}
                  className="bg-gray-400 text-white py-1 px-3 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {blog.title}
                </h3>
                <p className="text-gray-800 dark:text-gray-100 mt-2">
                  {blog.content}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {new Date(blog.created_at).toLocaleString()}
                </p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => startEditing(blog)}
                    className="bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blog.id)}
                    className="bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
