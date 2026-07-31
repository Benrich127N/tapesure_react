import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Share2, Store } from "lucide-react";
import {
  getShareUrl,
  getShopProfile,
  saveShopProfile,
  slugify,
} from "../utils/shopProfile";

const Settings = () => {
  const initialProfile = useMemo(() => getShopProfile(), []);
  const [profile, setProfile] = useState(initialProfile);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = getShareUrl(profile.shareSlug || slugify(profile.shopName) || "my-shop");

  const updateField = ({ target: { name, value } }) => {
    setSaved(false);
    setProfile((current) => ({
      ...current,
      [name]: value,
      ...(name === "shopName" ? { shareSlug: slugify(value) } : {}),
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    const cleanProfile = {
      ...profile,
      shopName: profile.shopName.trim() || "My Tailoring Shop",
      shareSlug: slugify(profile.shareSlug || profile.shopName) || "my-shop",
    };
    saveShopProfile(cleanProfile);
    setProfile(cleanProfile);
    setSaved(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${profile.shopName} measurement form`,
        text: `Please submit your measurements to ${profile.shopName}.`,
        url: shareUrl,
      });
      return;
    }
    await copyLink();
  };

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-gray-200">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-gray-400">Manage your shop profile and client measurement link.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-5">
        <form onSubmit={handleSave} className="rounded-2xl border border-gray-800 bg-gray-900 p-6 xl:col-span-3">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-3"><Store className="h-6 w-6 text-indigo-400" /></div>
            <div><h2 className="text-xl font-semibold text-white">Shop profile</h2><p className="text-sm text-gray-400">This name appears at the top of your public form.</p></div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm text-gray-300">Shop name</span>
              <input required name="shopName" value={profile.shopName} onChange={updateField} className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-indigo-500" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">Owner name</span>
              <input name="ownerName" value={profile.ownerName} onChange={updateField} className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-indigo-500" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-gray-300">Email address</span>
              <input type="email" name="email" value={profile.email} onChange={updateField} className="w-full rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-white outline-none focus:border-indigo-500" />
            </label>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-500">Save shop profile</button>
            {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-400"><Check className="h-4 w-4" /> Saved</span>}
          </div>
        </form>

        <section className="rounded-2xl border border-indigo-800/60 bg-gradient-to-b from-indigo-950/70 to-gray-900 p-6 xl:col-span-2">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white"><Share2 className="h-6 w-6" /></div>
          <h2 className="text-xl font-semibold text-white">Client measurement link</h2>
          <p className="mt-2 text-sm leading-6 text-gray-400">Send this link to clients. They can open it without seeing your dashboard, fill in their measurements, and submit.</p>
          <div className="mt-5 break-all rounded-xl border border-gray-700 bg-black/30 p-4 text-sm text-indigo-300">{shareUrl}</div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={copyLink} className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-500">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Copied" : "Copy link"}
            </button>
            <button type="button" onClick={shareLink} className="flex items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-700"><Share2 className="h-4 w-4" /> Share</button>
          </div>
          <a href={shareUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-indigo-300 hover:text-indigo-200"><ExternalLink className="h-4 w-4" /> Preview public form</a>
        </section>
      </div>
    </div>
  );
};

export default Settings;
