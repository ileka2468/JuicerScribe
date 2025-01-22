import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

export default function KnowledgeBaseManagement() {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [newKnowledge, setNewKnowledge] = useState({
    category: "",
    title: "",
    content: "",
  });
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  async function fetchKnowledgeBase() {
    try {
      const { data, error } = await supabase.from("knowledge_base").select("*");
      if (error) throw error;
      setKnowledgeItems(data || []);
    } catch (error) {
      toast.error("Could not fetch knowledge base items");
    }
  }

  async function handleAddKnowledge(e) {
    e.preventDefault();
    if (
      !newKnowledge.category.trim() ||
      !newKnowledge.title.trim() ||
      !newKnowledge.content.trim()
    )
      return;
    try {
      const { error } = await supabase
        .from("knowledge_base")
        .insert([newKnowledge]);
      if (error) throw error;
      toast.success("Knowledge Base item created");
      setNewKnowledge({ category: "", title: "", content: "" });
      fetchKnowledgeBase();
    } catch (error) {
      toast.error("Error creating item");
    }
  }

  function startEditing(item) {
    setEditingItem(item.id);
    setEditingCategory(item.category);
    setEditingTitle(item.title);
    setEditingContent(item.content);
  }

  async function handleUpdateKnowledge(id) {
    try {
      const { error } = await supabase
        .from("knowledge_base")
        .update({
          category: editingCategory,
          title: editingTitle,
          content: editingContent,
        })
        .eq("id", id);
      if (error) throw error;
      toast.success("Knowledge Base item updated");
      setEditingItem(null);
      fetchKnowledgeBase();
    } catch (error) {
      toast.error("Error updating item");
    }
  }

  async function handleDeleteKnowledge(id) {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      const { error } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Item deleted");
      fetchKnowledgeBase();
    } catch (error) {
      toast.error("Error deleting item");
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Manage Knowledge Base
      </h2>

      {/* Create new item */}
      <form onSubmit={handleAddKnowledge} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={newKnowledge.category}
            onChange={(e) =>
              setNewKnowledge({ ...newKnowledge, category: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={newKnowledge.title}
            onChange={(e) =>
              setNewKnowledge({ ...newKnowledge, title: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content
          </label>
          <textarea
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={newKnowledge.content}
            onChange={(e) =>
              setNewKnowledge({ ...newKnowledge, content: e.target.value })
            }
            required
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Item
        </button>
      </form>

      {/* List existing items */}
      <div className="space-y-4">
        {knowledgeItems.map((item) => (
          <div
            key={item.id}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow"
          >
            {editingItem === item.id ? (
              <>
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm mb-2 focus:border-indigo-500 focus:ring-indigo-500"
                  value={editingCategory}
                  onChange={(e) => setEditingCategory(e.target.value)}
                />
                <input
                  type="text"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm mb-2 focus:border-indigo-500 focus:ring-indigo-500"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                />
                <textarea
                  rows="4"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm mb-2 focus:border-indigo-500 focus:ring-indigo-500"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                />
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleUpdateKnowledge(item.id)}
                    className="bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingItem(null)}
                    className="bg-gray-400 text-white py-1 px-3 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-300 mb-1">
                  Category: {item.category}
                </p>
                <p className="text-gray-800 dark:text-gray-100">
                  {item.content}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Created: {new Date(item.created_at).toLocaleString()}
                </p>
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => startEditing(item)}
                    className="bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteKnowledge(item.id)}
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
