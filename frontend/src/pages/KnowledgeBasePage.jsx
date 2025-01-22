import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function KnowledgeBasePage() {
  const [itemsByCategory, setItemsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  async function fetchKnowledgeBase() {
    try {
      const { data, error } = await supabase.from("knowledge_base").select("*");
      if (error) throw error;
      groupByCategory(data || []);
    } catch (error) {
      toast.error("Could not fetch knowledge base");
    } finally {
      setLoading(false);
    }
  }

  function groupByCategory(allItems) {
    const grouped = {};
    allItems.forEach((item) => {
      // Normalize category
      const categoryKey = item.category.trim().toLowerCase();

      if (!grouped[categoryKey]) {
        grouped[categoryKey] = [];
      }
      grouped[categoryKey].push(item);
    });
    setItemsByCategory(grouped);

    // Keep all categories as expanded when the page loads maybe disable when too many articles
    const allCatStates = {};
    Object.keys(grouped).forEach((cat) => {
      allCatStates[cat] = true;
    });
    setExpandedCategories(allCatStates);
  }

  function toggleCategory(cat) {
    setExpandedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
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
            Loading knowledge base...
          </p>
        </div>
      </div>
    );
  }

  const categories = Object.keys(itemsByCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Knowledge Base
        </h1>
        {categories.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No knowledge base articles found.
          </p>
        ) : (
          categories.map((cat) => {
            const isExpanded = expandedCategories[cat];
            const items = itemsByCategory[cat] || [];
            return (
              <div
                key={cat}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
              >
                <div
                  onClick={() => toggleCategory(cat)}
                  className="cursor-pointer flex items-center justify-between"
                >
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </h2>
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm">
                    {isExpanded ? "Hide" : "Show"}
                  </span>
                </div>
                {isExpanded && (
                  <div className="space-y-4 mt-2">
                    {items.map((item) => {
                      const previewContent = stripTitleFromContent(
                        item.content
                      );
                      const preview =
                        previewContent.slice(0, 120) +
                        (previewContent.length > 120 ? "..." : "");
                      return (
                        <div key={item.id}>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h3>
                          <div className="text-gray-700 dark:text-gray-100">
                            <ReactMarkdown>{preview}</ReactMarkdown>
                          </div>
                          <Link
                            to={`/knowledge-base/${item.id}`}
                            className="block text-indigo-600 dark:text-indigo-400 hover:underline mt-1"
                          >
                            Read More
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
