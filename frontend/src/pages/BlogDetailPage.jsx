import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

export default function BlogDetailPage() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [blogId]);

  async function fetchBlog() {
    try {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", blogId)
        .single();
      if (error) throw error;
      setBlog(data);
    } catch (error) {
      toast.error("Could not fetch blog");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 dark:text-gray-400">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 dark:text-gray-400">Blog not found.</p>
          <Link
            to="/blog"
            className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Back to Blog List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Posted on: {new Date(blog.created_at).toLocaleDateString()}
        </p>
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{blog.content || ""}</ReactMarkdown>
        </div>
        <div className="mt-6">
          <Link
            to="/blog"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            &larr; Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
