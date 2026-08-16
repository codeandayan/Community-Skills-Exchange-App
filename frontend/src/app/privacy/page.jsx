"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { pagesAPI } from "@/lib/api";

export default function PrivacyPage() {
  const router = useRouter();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const data = await pagesAPI.getBySlug("privacy");
        setPage(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching page:", err);
        setLoading(false);
      }
    };
    fetchPage();
  }, []);

  const getContent = () => {
    if (!page?.content) return [];
    if (typeof page.content === "string") {
      return [{ type: "paragraph", text: page.content }];
    }
    if (Array.isArray(page.content)) {
      const blocks = [];
      page.content.forEach((block) => {
        if (block.type === "heading") {
          blocks.push({
            type: "heading",
            level: block.level || 2,
            text: block.children?.map((c) => c.text || "").join("") || "",
          });
        } else if (block.type === "list") {
          blocks.push({
            type:
              block.format === "ordered" ? "ordered-list" : "unordered-list",
            items:
              block.children?.map(
                (item) =>
                  item.children?.map((c) => c.text || "").join("") || "",
              ) || [],
          });
        } else {
          blocks.push({
            type: "paragraph",
            text:
              block.children
                ?.map((c) => {
                  if (c.bold) return `<strong>${c.text}</strong>`;
                  if (c.italic) return `<em>${c.text}</em>`;
                  return c.text || "";
                })
                .join("") || "",
          });
        }
      });
      return blocks;
    }
    return [{ type: "paragraph", text: String(page.content) }];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-600 mb-6">Page not found</p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <Card>
          <CardContent className="py-8">
            <h1 className="text-3xl font-bold mb-8">{page.title}</h1>
            <div className="prose max-w-none">
              {getContent().map((block, i) => {
                if (block.type === "heading") {
                  const HeadingTag = `h${block.level}`;
                  const headingClasses = {
                    h1: "text-3xl font-bold mb-6 mt-8",
                    h2: "text-2xl font-bold mb-4 mt-6",
                    h3: "text-xl font-semibold mb-3 mt-4",
                    h4: "text-lg font-semibold mb-2 mt-3",
                  };
                  return (
                    <HeadingTag
                      key={i}
                      className={
                        headingClasses[HeadingTag] || "text-xl font-bold mb-4"
                      }
                    >
                      {block.text}
                    </HeadingTag>
                  );
                }
                if (block.type === "unordered-list") {
                  return (
                    <ul
                      key={i}
                      className="list-disc list-inside mb-4 space-y-1"
                    >
                      {block.items.map((item, j) => (
                        <li key={j} className="text-gray-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === "ordered-list") {
                  return (
                    <ol
                      key={i}
                      className="list-decimal list-inside mb-4 space-y-1"
                    >
                      {block.items.map((item, j) => (
                        <li key={j} className="text-gray-700">
                          {item}
                        </li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p
                    key={i}
                    className="mb-4 text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: block.text }}
                  />
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
