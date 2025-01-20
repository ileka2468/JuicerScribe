import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import { PencilIcon } from "@heroicons/react/24/solid";

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [newBanner, setNewBanner] = useState({
    endpoint: "",
    content: "",
    enabled: false,
  });
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingEnabled, setEditingEnabled] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    try {
      const { data, error } = await supabase.from("banners").select("*");
      if (error) throw error;
      setBanners(data);
    } catch (error) {
      toast.error("Error fetching banners");
    }
  }

  async function handleAddBanner(e) {
    e.preventDefault();
    try {
      const { error } = await supabase.from("banners").insert([newBanner]);
      if (error) throw error;
      toast.success("Banner added successfully");
      fetchBanners();
      setNewBanner({ endpoint: "", content: "", enabled: false });
    } catch (error) {
      toast.error("Error adding banner");
    }
  }

  async function handleUpdateBanner(id) {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ content: editingContent, enabled: editingEnabled })
        .eq("id", id);
      if (error) throw error;
      toast.success("Banner updated successfully");
      fetchBanners();
      setEditingBanner(null);
    } catch (error) {
      toast.error("Error updating banner");
    }
  }

  async function handleDeleteBanner(id) {
    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (error) {
      toast.error("Error deleting banner");
    }
  }

  function startEditing(banner) {
    setEditingBanner(banner.id);
    setEditingContent(banner.content);
    setEditingEnabled(banner.enabled);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Banners</h2>
      <form onSubmit={handleAddBanner} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Endpoint
          </label>
          <input
            type="text"
            value={newBanner.endpoint}
            onChange={(e) =>
              setNewBanner({ ...newBanner, endpoint: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Content
          </label>
          <textarea
            value={newBanner.content}
            onChange={(e) =>
              setNewBanner({ ...newBanner, content: e.target.value })
            }
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={newBanner.enabled}
            onChange={(e) =>
              setNewBanner({ ...newBanner, enabled: e.target.checked })
            }
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
            Enabled
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Banner
        </button>
      </form>
      <div className="space-y-4">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow"
          >
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">{banner.endpoint}</h3>
              <button
                onClick={() => startEditing(banner)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
            {editingBanner === banner.id ? (
              <div className="mt-2">
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={editingEnabled}
                    onChange={(e) => setEditingEnabled(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                    Enabled
                  </label>
                </div>
                <button
                  onClick={() => handleUpdateBanner(banner.id)}
                  className="mt-2 bg-indigo-600 text-white py-1 px-3 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save
                </button>
              </div>
            ) : (
              <p>{banner.content}</p>
            )}
            <button
              onClick={() => handleDeleteBanner(banner.id)}
              className="mt-2 bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
