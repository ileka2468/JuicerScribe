import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  }

  function stripTitleFromContent(content) {
    const lines = content.split("\n");
    return lines.slice(1).join("\n");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-gray-500 dark:text-gray-400">
            Loading blogs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Blog
        </h1>
        {blogs.map((blog) => {
          const previewContent = stripTitleFromContent(blog.content);
          const preview =
            previewContent.slice(0, 120) +
            (previewContent.length > 120 ? "..." : "");
          return (
            <div
              key={blog.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {blog.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Posted on: {new Date(blog.created_at).toLocaleDateString()}
              </p>
              <div className="text-gray-700 dark:text-gray-100">
                <ReactMarkdown>{preview}</ReactMarkdown>
              </div>
              <Link
                to={`/blog/${blog.id}`}
                className="inline-block mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Read More
              </Link>
            </div>
          );
        })}
        {blogs.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">
            No blog posts found.
          </p>
        )}
      </div>
    </div>
  );
}
