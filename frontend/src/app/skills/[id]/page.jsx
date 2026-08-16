"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MapPin,
  Star,
  Calendar,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { skillsAPI, bookingsAPI, reviewsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SkillDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [checkingRequest, setCheckingRequest] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState({ average: 0, count: 0 });
  const [bookingForm, setBookingForm] = useState({
    message: "",
    scheduled_date: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await skillsAPI.getOne(id);
        setSkill(response.data);

        // Fetch reviews for this skill
        const skillId = response.data.documentId || response.data.id;
        const [reviewsRes, ratingRes] = await Promise.all([
          reviewsAPI.getForSkill(skillId),
          reviewsAPI.getAverageRating(skillId),
        ]);
        setReviews(reviewsRes?.data || []);
        setAvgRating(ratingRes);

        // Check if current user has already requested this skill
        if (user && response.data) {
          const existing = await bookingsAPI.checkExistingRequest(
            user.id,
            skillId,
          );
          setExistingRequest(existing);
        }

        setCheckingRequest(false);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setCheckingRequest(false);
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBookingLoading(true);

    try {
      const result = await bookingsAPI.create({
        message:
          bookingForm.message || "I'm interested in learning this skill!",
        scheduled_date: bookingForm.scheduled_date || new Date().toISOString(),
        requester: user.id,
        skill: skill.documentId || skill.id,
      });

      setExistingRequest(result.data || result);
      setBookingSuccess(true);
    } catch (err) {
      console.error("Booking failed:", err);
      setError(
        err.response?.data?.error?.message ||
          "Failed to send request. Please try again.",
      );
    } finally {
      setBookingLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = String(name).split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getDescription = () => {
    if (!skill?.description) return "No description provided.";
    if (typeof skill.description === "string") return skill.description;
    if (Array.isArray(skill.description)) {
      return (
        skill.description
          .map((block) => {
            if (block.children && Array.isArray(block.children)) {
              return block.children.map((child) => child.text || "").join("");
            }
            return "";
          })
          .join("\n") || "No description provided."
      );
    }
    return String(skill.description);
  };

  // Get booking status display
  const getBookingStatusDisplay = () => {
    if (!existingRequest) return null;

    const status = existingRequest.booking_status;
    const statusConfig = {
      Pending: {
        icon: <Clock className="h-5 w-5" />,
        text: "Request Pending",
        description: "Waiting for skill owner to respond",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "border-yellow-200",
      },
      Accepted: {
        icon: <CheckCircle className="h-5 w-5" />,
        text: "Request Accepted",
        description: "The skill owner has accepted your request",
        color: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
      },
      Completed: {
        icon: <CheckCircle className="h-5 w-5" />,
        text: "Exchange Completed",
        description: "This skill exchange has been completed",
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
      },
      Cancelled: {
        icon: <XCircle className="h-5 w-5" />,
        text: "Request Declined",
        description: "The skill owner has declined this request",
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;
    return config;
  };

  // Check if current user is the skill owner
  const isOwner =
    user &&
    skill?.user &&
    (skill.user.id === user.id ||
      String(skill.user.id) === String(user.id) ||
      skill.user.documentId === user.documentId);

  if (loading || checkingRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading skill details...</p>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Skill not found</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push("/skills")}
          >
            Browse Skills
          </Button>
        </div>
      </div>
    );
  }

  const statusDisplay = getBookingStatusDisplay();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Skills
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skill Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge>{skill.category || "Other"}</Badge>
                  <Badge
                    variant={
                      skill.skill_type === "Offering" ? "default" : "secondary"
                    }
                  >
                    {skill.skill_type}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{skill.title}</CardTitle>
                <CardDescription>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {skill.user ? getInitials(skill.user.username) : "?"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {skill.user?.username || "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span>{skill.location || "Online"}</span>
                    </div>
                    {/* Rating Badge */}
                    {avgRating.count > 0 && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="h-4 w-4 fill-yellow-500" />
                        <span className="font-medium">{avgRating.average}</span>
                        <span className="text-gray-400 text-sm">
                          ({avgRating.count})
                        </span>
                      </div>
                    )}
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {getDescription()}
                </p>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Reviews & Ratings</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(Number(avgRating.average))
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold text-lg">
                      {avgRating.average}
                    </span>
                    <span className="text-gray-500">
                      ({avgRating.count} reviews)
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {reviews.length === 0 ? (
                  <div className="text-center py-6">
                    <Star className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">
                      No reviews yet. Be the first to review!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div
                        key={review.id}
                        className="border-b last:border-0 pb-4 last:pb-0"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-purple-600 text-white text-sm">
                                {review.reviewer?.username
                                  ? getInitials(review.reviewer.username)
                                  : "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">
                                {review.reviewer?.username || "Anonymous"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-700 text-sm">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Form / Status */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Exchange</CardTitle>
              </CardHeader>
              <CardContent>
                {!isAuthenticated ? (
                  /* NOT LOGGED IN */
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Sign in to request this skill
                    </p>
                    <Button
                      onClick={() => router.push("/login")}
                      className="w-full"
                    >
                      Sign In
                    </Button>
                  </div>
                ) : isOwner ? (
                  /* OWN SKILL */
                  <div className="text-center py-4">
                    <p className="text-gray-600">
                      This is your own skill listing.
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Check your dashboard for incoming requests.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => router.push("/dashboard")}
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                ) : existingRequest ? (
                  /* ALREADY REQUESTED - Show Status */
                  <div className="text-center">
                    <div
                      className={`p-4 rounded-lg ${statusDisplay?.bg} ${statusDisplay?.border} border mb-4`}
                    >
                      <div
                        className={`flex justify-center mb-2 ${statusDisplay?.color}`}
                      >
                        {statusDisplay?.icon}
                      </div>
                      <p className={`font-semibold ${statusDisplay?.color}`}>
                        {statusDisplay?.text}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {statusDisplay?.description}
                      </p>
                      {existingRequest.message && (
                        <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-left">
                          <p className="text-xs text-gray-500 font-medium">
                            Your message:
                          </p>
                          <p className="text-sm text-gray-700">
                            {existingRequest.message}
                          </p>
                        </div>
                      )}
                      {existingRequest.scheduled_date && (
                        <p className="text-xs text-gray-500 mt-2">
                          📅{" "}
                          {new Date(
                            existingRequest.scheduled_date,
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">
                      You have already submitted a request for this skill.
                    </p>
                  </div>
                ) : (
                  /* SUBMIT NEW REQUEST FORM */
                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="scheduled_date">
                        <Calendar className="h-4 w-4 inline mr-1" /> Preferred
                        Date
                      </Label>
                      <Input
                        id="scheduled_date"
                        type="datetime-local"
                        value={bookingForm.scheduled_date}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            scheduled_date: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        <MessageSquare className="h-4 w-4 inline mr-1" />{" "}
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Describe what you'd like to learn, your current level, and availability..."
                        rows={4}
                        value={bookingForm.message}
                        onChange={(e) =>
                          setBookingForm({
                            ...bookingForm,
                            message: e.target.value,
                          })
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? "Sending Request..." : "Send Request"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
