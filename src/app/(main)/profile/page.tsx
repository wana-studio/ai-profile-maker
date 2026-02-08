"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import {
  User,
  Crown,
  Bell,
  Shield,
  Trash2,
  LogOut,
  ChevronRight,
  Plus,
  CreditCard,
  HelpCircle,
  Star,
  LogIn,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useSubscriptionStore,
  useFaceProfilesStore,
  useModalStore,
} from "@/lib/stores";
import type { FaceProfile } from "@/lib/db/schema";

export default function ProfilePage() {
  const { isSignedIn, isLoaded, user } = useUser();
  const {
    tier,
    generationsRemaining,
    setTier,
    setGenerationsRemaining,
    setGenerationsThisMonth,
  } = useSubscriptionStore();
  const { profiles, setProfiles } = useFaceProfilesStore();
  const { openSubscriptionModal } = useModalStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isPro = tier === "pro";

  // Load subscription status when signed in
  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/subscription")
        .then((res) => res.json())
        .then((data) => {
          if (data.tier) {
            setTier(data.tier);
          }
          if (data.generationsRemaining !== undefined) {
            setGenerationsRemaining(
              data.generationsRemaining === Infinity
                ? 999
                : data.generationsRemaining
            );
          }
          if (data.generationsThisMonth !== undefined) {
            setGenerationsThisMonth(data.generationsThisMonth);
          }
        })
        .catch((err) => console.error("Failed to load subscription:", err));
    }
  }, [isSignedIn, setTier, setGenerationsRemaining, setGenerationsThisMonth]);

  // Load face profiles when signed in
  useEffect(() => {
    if (isSignedIn) {
      fetch("/api/face-profiles")
        .then((res) => res.json())
        .then((data) => {
          if (data.profiles) {
            setProfiles(data.profiles);
          }
        })
        .catch((err) => console.error("Failed to load face profiles:", err));
    }
  }, [isSignedIn, setProfiles]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleUpload = async () => {
    if (!fileInputRef.current?.files?.[0]) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", fileInputRef.current.files[0]);
      formData.append("name", profileName || "My Face");
      formData.append("isDefault", profiles.length === 0 ? "true" : "false");

      const response = await fetch("/api/upload-face", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      setProfiles([data.profile, ...profiles]);

      // Reset and close modal
      setUploadPreview(null);
      setProfileName("");
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  // Guest state - show sign in prompt
  if (!isSignedIn) {
    return (
      <div className="min-h-screen pb-20">
        <header className="px-4 pt-6 pb-4 safe-area-top">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div className="p-6 rounded-full gradient-warm mb-6 glow">
            <User className="w-12 h-12 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Sign In to Your Account
          </h2>
          <p className="text-muted-foreground max-w-xs mb-8">
            Access your profile, manage subscriptions, and view your saved face
            profiles
          </p>

          <SignInButton mode="modal">
            <Button className="px-8 py-6 rounded-full gradient-warm text-white font-semibold text-lg shadow-lg glow">
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </SignInButton>

          <p className="text-xs text-muted-foreground mt-6">
            Free account • No credit card required
          </p>
        </motion.div>
      </div>
    );
  }

  // Authenticated user profile
  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 safe-area-top">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
      </header>

      <div className="px-4 space-y-6">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-2xl bg-foreground/10"
        >
          <div className="w-16 h-16 rounded-full overflow-hidden">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-warm flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-sm text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </motion.div>

        {/* Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`p-5 rounded-3xl ${isPro ? "gradient-warm" : "bg-foreground/10 border border-white/10"
            }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${isPro ? "bg-white/20" : "gradient-warm"
                  }`}
              >
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">
                  {isPro ? "Pro Member" : "Free Plan"}
                </h3>
                <p className="text-sm text-white/70">
                  {isPro
                    ? "Unlimited access"
                    : `${generationsRemaining} generations left`}
                </p>
              </div>
            </div>
            {isPro && (
              <Badge className="bg-white/20 text-white border-0">Active</Badge>
            )}
          </div>

          {!isPro && (
            <Button
              onClick={() => openSubscriptionModal()}
              className="w-full bg-white text-black hover:bg-white/90 font-semibold"
            >
              <Star className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          )}

          {isPro && (
            <Button
              variant="ghost"
              className="w-full text-white/80 hover:text-white hover:bg-white/10"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          )}
        </motion.div>

        {/* Face Profiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">
              Face Profiles ({profiles.length})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-brand-orange"
              onClick={() => setIsAddModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-foreground/10">
            {profiles.length === 0 ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  No face profiles yet
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Upload Your First Selfie
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {profiles.map((profile: FaceProfile) => (
                  <div key={profile.id} className="flex items-center gap-3">
                    <img
                      src={profile.thumbnailUrl || profile.imageUrl}
                      alt={profile.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-white">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.isDefault ? "Default" : "Secondary"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <h3 className="font-semibold text-white">Settings</h3>

          <div className="p-4 rounded-2xl bg-foreground/10 space-y-1">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="text-white">Notifications</span>
              </div>
              <Switch />
            </div>

            <Separator className="bg-white/10" />

            <button className="w-full flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span className="text-white">Privacy & Data</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <Separator className="bg-white/10" />

            <button className="w-full flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span className="text-white">Help & Support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* Privacy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-2xl glass"
        >
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-green-400" />
            <h4 className="font-semibold text-white">Your Privacy</h4>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Photos are not used for AI training
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              Delete your data anytime
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              End-to-end encrypted storage
            </p>
          </div>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-3"
        >
          <div className="p-4 rounded-2xl bg-foreground/10 space-y-1">
            <SignOutButton>
              <button className="w-full flex items-center justify-between py-3 text-muted-foreground hover:text-white transition-colors">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </div>
              </button>
            </SignOutButton>

            <Separator className="bg-white/10" />

            <button className="w-full flex items-center justify-between py-3 text-red-400 hover:text-red-300 transition-colors">
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5" />
                <span>Delete Account</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Version */}
        <p className="text-center text-xs text-muted-foreground py-4">
          Selfio v1.0.0
        </p>
      </div>

      {/* Add Face Profile Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-card border-white/10 max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-center">
              Add Face Profile
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-square rounded-2xl border-2 border-dashed transition-colors cursor-pointer
                ${uploadPreview
                  ? "border-brand-orange"
                  : "border-white/20 hover:border-white/40"
                }`}
            >
              {uploadPreview ? (
                <>
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadPreview(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                  <Upload className="w-10 h-10 mb-2" />
                  <p className="text-sm">Tap to upload</p>
                  <p className="text-xs">JPG, PNG up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Name Input */}
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">
                Profile Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="My Face"
                className="w-full px-4 py-3 rounded-xl bg-foreground/10 border border-white/10 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!uploadPreview || isUploading}
              className="w-full h-12 gradient-warm font-semibold disabled:opacity-50"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
