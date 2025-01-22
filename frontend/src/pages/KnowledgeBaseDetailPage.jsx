import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";

export default function KnowledgeBaseDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    try {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      setItem(data);
    } catch (error) {
      toast.error("Could not fetch knowledge base item");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Loading knowledge base article...
          </p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 dark:text-gray-400">Item not found.</p>
          <Link
            to="/knowledge-base"
            className="mt-4 inline-block text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Back to Knowledge Base
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {item.title}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Category: {item.category}
        </p>
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown>{item.content || ""}</ReactMarkdown>
        </div>
        <div className="mt-6">
          <Link
            to="/knowledge-base"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            &larr; Back to Knowledge Base
          </Link>
        </div>
      </div>
    </div>
  );
}
