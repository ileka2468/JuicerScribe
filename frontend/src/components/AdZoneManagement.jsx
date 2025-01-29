import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";
import LinkedAds from "../components/LinkedAds";

export default function AdZoneManagement() {
  const [zones, setZones] = useState([]);
  const [ads, setAds] = useState([]);
  const [newZone, setNewZone] = useState({
    zone_name: "",
    container_type: "vertical",
  });
  const [newAd, setNewAd] = useState({
    ad_title: "",
    ad_content: "",
    target_url: "",
    image_url: "",
    is_active: true,
  });
  const [selectedZone, setSelectedZone] = useState(null);
  const [linkingAdId, setLinkingAdId] = useState("");
  const [linkStartDate, setLinkStartDate] = useState("");
  const [linkEndDate, setLinkEndDate] = useState("");

  // States for editing Zones
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [editedZone, setEditedZone] = useState({
    zone_name: "",
    container_type: "vertical",
  });

  // States for editing Ads
  const [editingAdId, setEditingAdId] = useState(null);
  const [editedAd, setEditedAd] = useState({
    ad_title: "",
    ad_content: "",
    target_url: "",
    image_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchZones();
    fetchAds();
  }, []);

  async function fetchZones() {
    try {
      const { data, error } = await supabase
        .from("zones")
        .select("zone_id, zone_name, container_type");
      if (error) throw error;
      setZones(data || []);
    } catch (error) {
      toast.error("Failed to fetch zones.");
    }
  }

  async function fetchAds() {
    try {
      const { data, error } = await supabase
        .from("ads")
        .select(
          "ad_id, ad_title, ad_content, target_url, image_url, is_active"
        );
      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      toast.error("Failed to fetch ads.");
    }
  }

  // Zone Handlers
  async function handleAddZone(e) {
    e.preventDefault();
    if (!newZone.zone_name.trim()) return;
    try {
      const { error } = await supabase.from("zones").insert([
        {
          zone_name: newZone.zone_name,
          container_type: newZone.container_type,
        },
      ]);
      if (error) throw error;
      toast.success("Zone added!");
      setNewZone({ zone_name: "", container_type: "vertical" });
      fetchZones();
    } catch (error) {
      toast.error("Error adding zone.");
    }
  }

  async function handleEditZone(zone) {
    setEditingZoneId(zone.zone_id);
    setEditedZone({
      zone_name: zone.zone_name,
      container_type: zone.container_type,
    });
  }

  async function handleUpdateZone(zone_id) {
    if (!editedZone.zone_name.trim()) {
      toast.error("Zone name cannot be empty.");
      return;
    }
    try {
      const { error } = await supabase
        .from("zones")
        .update({
          zone_name: editedZone.zone_name,
          container_type: editedZone.container_type,
        })
        .eq("zone_id", zone_id);
      if (error) throw error;
      toast.success("Zone updated!");
      setEditingZoneId(null);
      setEditedZone({ zone_name: "", container_type: "vertical" });
      fetchZones();
    } catch (error) {
      toast.error("Error updating zone.");
    }
  }

  function handleCancelEditZone() {
    setEditingZoneId(null);
    setEditedZone({ zone_name: "", container_type: "vertical" });
  }

  // Ad Handlers
  async function handleAddAd(e) {
    e.preventDefault();
    if (
      !newAd.ad_title.trim() ||
      !newAd.ad_content.trim() ||
      !newAd.target_url.trim()
    ) {
      return;
    }
    try {
      const { error } = await supabase.from("ads").insert([newAd]);
      if (error) throw error;
      toast.success("Ad added!");
      setNewAd({
        ad_title: "",
        ad_content: "",
        target_url: "",
        image_url: "",
        is_active: true,
      });
      fetchAds();
    } catch (error) {
      toast.error("Error adding ad.");
    }
  }

  async function handleEditAd(ad) {
    setEditingAdId(ad.ad_id);
    setEditedAd({
      ad_title: ad.ad_title,
      ad_content: ad.ad_content,
      target_url: ad.target_url,
      image_url: ad.image_url,
      is_active: ad.is_active,
    });
  }

  async function handleUpdateAd(ad_id) {
    if (
      !editedAd.ad_title.trim() ||
      !editedAd.ad_content.trim() ||
      !editedAd.target_url.trim()
    ) {
      toast.error("Ad title, content, and target URL are required.");
      return;
    }
    try {
      const { error } = await supabase
        .from("ads")
        .update({
          ad_title: editedAd.ad_title,
          ad_content: editedAd.ad_content,
          target_url: editedAd.target_url,
          image_url: editedAd.image_url,
          is_active: editedAd.is_active,
        })
        .eq("ad_id", ad_id);
      if (error) throw error;
      toast.success("Ad updated!");
      setEditingAdId(null);
      setEditedAd({
        ad_title: "",
        ad_content: "",
        target_url: "",
        image_url: "",
        is_active: true,
      });
      fetchAds();
    } catch (error) {
      toast.error("Error updating ad.");
    }
  }

  function handleCancelEditAd() {
    setEditingAdId(null);
    setEditedAd({
      ad_title: "",
      ad_content: "",
      target_url: "",
      image_url: "",
      is_active: true,
    });
  }

  async function linkAdToZone() {
    if (!selectedZone || !linkingAdId || !linkStartDate || !linkEndDate) {
      toast.error("Please select zone, ad, start date, and end date.");
      return;
    }
    try {
      const { error } = await supabase.from("ad_assignments").insert([
        {
          ad_id: linkingAdId,
          zone_id: selectedZone,
          is_active: true,
          start_date: linkStartDate,
          end_date: linkEndDate,
        },
      ]);
      if (error) throw error;
      toast.success("Ad linked to zone via ad_assignments.");
      setSelectedZone(null);
      setLinkingAdId("");
      setLinkStartDate("");
      setLinkEndDate("");
      fetchZones();
    } catch (error) {
      toast.error("Failed to link ad to zone.");
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Ad Zone Management
      </h2>

      {/* Create Zone */}
      <form onSubmit={handleAddZone} className="space-y-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Create New Zone
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Zone Name
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            value={newZone.zone_name}
            onChange={(e) =>
              setNewZone({ ...newZone, zone_name: e.target.value })
            }
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Container Type
          </label>
          <select
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            value={newZone.container_type}
            onChange={(e) =>
              setNewZone({ ...newZone, container_type: e.target.value })
            }
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
            <option value="grid">Grid</option>
          </select>
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white py-1 px-3 rounded hover:bg-indigo-700"
        >
          Add Zone
        </button>
      </form>

      {/* Create Ad */}
      <form onSubmit={handleAddAd} className="space-y-4 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Create New Ad
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ad Title
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            value={newAd.ad_title}
            onChange={(e) => setNewAd({ ...newAd, ad_title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Ad Content
          </label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            rows="2"
            value={newAd.ad_content}
            onChange={(e) => setNewAd({ ...newAd, ad_content: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Target URL
          </label>
          <input
            type="url"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            value={newAd.target_url}
            onChange={(e) => setNewAd({ ...newAd, target_url: e.target.value })}
            required
          />
        </div>
        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Image URL
          </label>
          <input
            type="url"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            value={newAd.image_url}
            onChange={(e) => setNewAd({ ...newAd, image_url: e.target.value })}
          />
        </div>
        {/* Active Toggle */}
        <div className="flex items-center space-x-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Is Active?
          </label>
          <input
            type="checkbox"
            checked={newAd.is_active}
            onChange={(e) =>
              setNewAd({ ...newAd, is_active: e.target.checked })
            }
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 text-white py-1 px-3 rounded hover:bg-indigo-700"
        >
          Add Ad
        </button>
      </form>

      {/* Link Ad to Zone */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Link Ad to Zone
        </h3>
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-2">
          <select
            className="min-w-[150px] rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            value={selectedZone || ""}
            onChange={(e) => setSelectedZone(e.target.value)}
          >
            <option value="">Select Zone</option>
            {zones.map((zone) => (
              <option key={zone.zone_id} value={zone.zone_id}>
                {zone.zone_name} [{zone.container_type}]
              </option>
            ))}
          </select>
          <select
            className="min-w-[150px] rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            value={linkingAdId || ""}
            onChange={(e) => setLinkingAdId(e.target.value)}
          >
            <option value="">Select Ad</option>
            {ads.map((ad) => (
              <option key={ad.ad_id} value={ad.ad_id}>
                {ad.ad_title}
              </option>
            ))}
          </select>
          {/* Start Date */}
          <input
            type="date"
            className="min-w-[120px] rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            value={linkStartDate}
            onChange={(e) => setLinkStartDate(e.target.value)}
            required
          />
          {/* End Date */}
          <input
            type="date"
            className="min-w-[120px] rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            value={linkEndDate}
            onChange={(e) => setLinkEndDate(e.target.value)}
            required
          />
          <button
            onClick={linkAdToZone}
            className="bg-indigo-600 text-white py-1 px-3 rounded hover:bg-indigo-700"
          >
            Link
          </button>
        </div>
      </div>

      {/* Existing Zones */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          Existing Zones
        </h3>
        {zones.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No zones found.</p>
        ) : (
          <>
            {zones.map((zone) => (
              <div
                key={zone.zone_id}
                className="p-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                {editingZoneId === zone.zone_id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                      value={editedZone.zone_name}
                      onChange={(e) =>
                        setEditedZone({
                          ...editedZone,
                          zone_name: e.target.value,
                        })
                      }
                      required
                    />
                    <select
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                      value={editedZone.container_type}
                      onChange={(e) =>
                        setEditedZone({
                          ...editedZone,
                          container_type: e.target.value,
                        })
                      }
                    >
                      <option value="vertical">Vertical</option>
                      <option value="horizontal">Horizontal</option>
                      <option value="grid">Grid</option>
                    </select>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateZone(zone.zone_id)}
                        className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditZone}
                        className="bg-gray-600 text-white py-1 px-3 rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Name: {zone.zone_name} ({zone.container_type})
                    </p>
                    <button
                      onClick={() => handleEditZone(zone)}
                      className="mt-2 bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    {/* Display linked ads */}
                    <LinkedAds zoneId={zone.zone_id} />
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Existing Ads */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
          Existing Ads
        </h3>
        {ads.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No ads found.</p>
        ) : (
          <>
            {ads.map((ad) => (
              <div
                key={ad.ad_id}
                className="p-3 mb-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                {editingAdId === ad.ad_id ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                      value={editedAd.ad_title}
                      onChange={(e) =>
                        setEditedAd({ ...editedAd, ad_title: e.target.value })
                      }
                      required
                    />
                    <textarea
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                      rows="2"
                      value={editedAd.ad_content}
                      onChange={(e) =>
                        setEditedAd({ ...editedAd, ad_content: e.target.value })
                      }
                      required
                    />
                    <input
                      type="url"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                      value={editedAd.target_url}
                      onChange={(e) =>
                        setEditedAd({ ...editedAd, target_url: e.target.value })
                      }
                      required
                    />
                    <input
                      type="url"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                      value={editedAd.image_url}
                      onChange={(e) =>
                        setEditedAd({ ...editedAd, image_url: e.target.value })
                      }
                    />
                    <div className="flex items-center space-x-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Is Active?
                      </label>
                      <input
                        type="checkbox"
                        checked={editedAd.is_active}
                        onChange={(e) =>
                          setEditedAd({
                            ...editedAd,
                            is_active: e.target.checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateAd(ad.ad_id)}
                        className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditAd}
                        className="bg-gray-600 text-white py-1 px-3 rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Title: {ad.ad_title}
                    </p>
                    <p className="text-gray-500 dark:text-gray-300">
                      URL: {ad.target_url}
                    </p>
                    <p className="text-gray-500 dark:text-gray-300">
                      Image: {ad.image_url || "None"}
                    </p>
                    <p className="text-gray-500 dark:text-gray-300">
                      Active: {ad.is_active ? "Yes" : "No"}
                    </p>
                    <button
                      onClick={() => handleEditAd(ad)}
                      className="mt-2 bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
