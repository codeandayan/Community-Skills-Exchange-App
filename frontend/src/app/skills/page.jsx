"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Search,
  Star,
  MapPin,
  Filter,
  X,
  ArrowUpDown,
  Globe,
  Monitor,
} from "lucide-react";
import { skillsAPI, extractPlainText } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SkillsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    "All",
    "IT",
    "Arts",
    "Education",
    "Household",
    "Health",
    "Other",
  ];
  const skillTypes = ["All", "Offering", "Requesting"];
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "rating", label: "Highest Rated" },
    { value: "title", label: "Alphabetical" },
  ];

  // Get unique locations from skills
  const locations = [...new Set(skills.map((s) => s.location).filter(Boolean))];

  // Fetch skills from Strapi
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const response = await skillsAPI.getAll();
        const skillsData = response?.data || [];
        setSkills(Array.isArray(skillsData) ? skillsData : []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch skills:", err);
        setError(
          "Failed to load skills. Make sure Strapi is running at http://localhost:1337",
        );
        setSkills([]);
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  // Filter and sort skills
  const getFilteredAndSortedSkills = () => {
    let filtered = skills.filter((skill) => {
      const title = String(skill?.title || "").toLowerCase();
      const description = String(
        typeof skill.description === "string"
          ? skill.description
          : extractPlainText(skill.description) || "",
      ).toLowerCase();
      const term = String(searchTerm || "").toLowerCase();
      const category = String(skill?.category || "");
      const type = String(skill?.skill_type || "");
      const location = String(skill?.location || "").toLowerCase();
      const locationFilter = selectedLocation.toLowerCase();

      const matchesSearch =
        term === "" ||
        title.includes(term) ||
        description.includes(term) ||
        location.includes(term);

      const matchesCategory =
        selectedCategory === "All" || category === selectedCategory;

      const matchesType = selectedType === "All" || type === selectedType;

      const matchesLocation =
        !selectedLocation || location.includes(locationFilter);

      const isOwnSkill =
        user &&
        skill.user &&
        (skill.user.id === user.id || skill.user.documentId === user.id);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesLocation &&
        !isOwnSkill
      );
    });

    // Sort
    switch (sortBy) {
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case "title":
        filtered.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    return filtered;
  };

  const filteredSkills = getFilteredAndSortedSkills();

  // Count active filters
  const activeFilterCount =
    (selectedCategory !== "All" ? 1 : 0) +
    (selectedType !== "All" ? 1 : 0) +
    (selectedLocation ? 1 : 0);

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedType("All");
    setSelectedLocation("");
    setSortBy("newest");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = String(name).split(" ");
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const getDescription = (skill) => {
    if (!skill.description) return "";
    if (typeof skill.description === "string") return skill.description;
    return extractPlainText(skill.description);
  };

  const handleSkillClick = (skill) => {
    const skillId = skill.documentId || skill.id;
    router.push(`/skills/${skillId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">
            Make sure your Strapi backend is running on port 1337
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Browse Skills</h1>

          {/* Search Bar */}
          <div className="max-w-3xl flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by skill, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Advanced Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500"
                >
                  <X className="h-4 w-4 mr-1" /> Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Category
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant={
                          selectedCategory === cat ? "default" : "outline"
                        }
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat === "All" ? "All Categories" : cat}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Skill Type Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Skill Type
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {skillTypes.map((type) => (
                      <Badge
                        key={type}
                        variant={selectedType === type ? "default" : "outline"}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedType(type)}
                      >
                        {type === "All" ? "All Types" : type}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    Location
                  </Label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  {!selectedLocation && (
                    <p className="text-xs text-gray-500 mt-1">
                      Or type a location in the search bar above
                    </p>
                  )}
                </div>

                {/* Sort By */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    <ArrowUpDown className="h-3 w-3 inline mr-1" />
                    Sort By
                  </Label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 text-sm bg-white"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Quick Category Chips */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setSelectedCategory(category)}
              >
                {category === "All" ? "All" : category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            {filteredSkills.length} skill
            {filteredSkills.length !== 1 ? "s" : ""} found
            {activeFilterCount > 0 && " (filtered)"}
          </p>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="text-gray-500"
            >
              <X className="h-4 w-4 mr-1" /> Clear search
            </Button>
          )}
        </div>

        {/* Skills Grid */}
        {filteredSkills.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              No skills found matching your criteria
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <Card
                key={skill.id || skill.documentId}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => handleSkillClick(skill)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-1">
                      <Badge>{skill.category || "Other"}</Badge>
                      {skill.location && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {skill.location}
                        </Badge>
                      )}
                    </div>
                    <Badge
                      variant={
                        skill.skill_type === "Offering"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {skill.skill_type}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {skill.title || "Untitled"}
                  </CardTitle>
                  <CardDescription>
                    {skill.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {getDescription(skill)}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-blue-600 text-white">
                            {skill.user
                              ? getInitials(skill.user.username)
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600">
                          {skill.user?.username || "Unknown"}
                        </span>
                      </div>
                      {skill.location && (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <MapPin className="h-3 w-3" />
                          <span>{skill.location}</span>
                        </div>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">New</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSkillClick(skill);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
