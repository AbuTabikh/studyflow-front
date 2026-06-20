"use client";

import { Resource } from "@/types/course";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Play, Link, Plus, ExternalLink, Trash2, X, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function uploadFile(file: File): Promise<string | null> {
  const token = typeof window !== "undefined" ? localStorage.getItem("studyflow_auth_token") : null;
  if (!token) return null;
  const formData = new FormData();
  formData.append("file", file);
  try {
    const res = await fetch(`${BASE_URL}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: formData,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.url ?? null;
  } catch {
    return null;
  }
}

function openResource(url: string) {
  if (url.startsWith("data:")) {
    // Legacy base64 stored in DB — convert to blob URL so Chrome can open it
    try {
      const [header, b64] = url.split(",");
      const mime = header.match(/:(.*?);/)?.[1] ?? "application/octet-stream";
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const win = window.open(blobUrl, "_blank");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      if (!win) window.location.href = blobUrl;
    } catch {
      window.open(url, "_blank");
    }
  } else {
    window.open(url, "_blank");
  }
}

interface ResourcesProps {
  resources?: Resource[];
  onResourcesChange?: (resources: Resource[]) => void;
}

function genId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function Resources({ resources = [], onResourcesChange }: ResourcesProps) {
  const { tr, t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newType, setNewType] = useState<Resource["type"]>("link");
  const [newDesc, setNewDesc] = useState("");
  const [uploading, setUploading] = useState(false);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "pdf":      return <FileText className="h-4 w-4" />;
      case "video":    return <Play className="h-4 w-4" />;
      case "document": return <FileText className="h-4 w-4" />;
      default:         return <Link className="h-4 w-4" />;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case "pdf":      return "text-red-600 dark:text-red-400 bg-red-100/20 dark:bg-red-900/20";
      case "video":    return "text-purple-600 dark:text-purple-400 bg-purple-100/20 dark:bg-purple-900/20";
      case "link":     return "text-blue-600 dark:text-blue-400 bg-blue-100/20 dark:bg-blue-900/20";
      case "document": return "text-amber-600 dark:text-amber-400 bg-amber-100/20 dark:bg-amber-900/20";
      case "image":    return "text-teal-600 dark:text-teal-400 bg-teal-100/20 dark:bg-teal-900/20";
      default:         return "text-slate-600 dark:text-slate-400 bg-slate-100/20 dark:bg-slate-900/20";
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadFile(file);
    if (url) {
      setNewUrl(url);
      setNewTitle(prev => prev || file.name);
      const ft = file.type;
      if (ft.includes("pdf")) setNewType("pdf");
      else if (ft.includes("video")) setNewType("video");
      else if (ft.includes("image")) setNewType("image");
      else setNewType("document");
    } else {
      alert("File upload failed. Please try again.");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleAdd = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    const updated = [
      ...resources,
      { id: genId(), title: newTitle.trim(), url: newUrl.trim(), type: newType, description: newDesc.trim() || undefined }
    ];
    onResourcesChange?.(updated);
    setNewTitle(""); setNewUrl(""); setNewDesc(""); setNewType("link");
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    onResourcesChange?.(resources.filter(r => r.id !== id));
  };

  return (
    <Card className="p-6 border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">{tr(t.courseDetails.courseResources)}</h3>
        <Button
          size="sm" variant="ghost"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-1 h-auto p-1.5"
        >
          {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-4 rounded-xl border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/10 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">{tr(t.tasks.title_field)} *</Label>
              <Input placeholder="e.g. Lecture Slides Week 3" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs">URL or Upload File *</Label>
              <div className="flex gap-2">
                <Input placeholder="https://..." value={newUrl} onChange={e => setNewUrl(e.target.value)} className="h-9 text-sm flex-1" />
                <div className="relative w-28">
                  <Input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={uploading}
                    onChange={handleFileSelect}
                  />
                  <Button type="button" variant="outline" size="sm" className="w-full h-9" disabled={uploading}>
                    {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : tr(t.courseDetails.uploadBtn)}
                  </Button>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{tr(t.tasks.type)}</Label>
              <Select value={newType} onValueChange={(v: Resource["type"]) => setNewType(v)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="link">{tr(t.courseDetails.typeLink)}</SelectItem>
                  <SelectItem value="pdf">{tr(t.courseDetails.typePdf)}</SelectItem>
                  <SelectItem value="video">{tr(t.courseDetails.typeVideo)}</SelectItem>
                  <SelectItem value="document">{tr(t.courseDetails.typeDocument)}</SelectItem>
                  <SelectItem value="image">{tr(t.courseDetails.typeImage)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{tr(t.tasks.description)}</Label>
              <Input placeholder={tr(t.courseDetails.optional)} value={newDesc} onChange={e => setNewDesc(e.target.value)} className="h-9 text-sm" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>{tr(t.actions.cancel)}</Button>
            <Button size="sm" onClick={handleAdd} disabled={!newTitle.trim() || !newUrl.trim() || uploading}>{tr(t.courseDetails.addResource)}</Button>
          </div>
        </div>
      )}

      {resources.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{tr(t.courseDetails.noResources)}</p>
          <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />{tr(t.courseDetails.addResource)}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <div key={resource.id} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/30 group">
              <div className={`p-2 rounded-md shrink-0 ${getResourceColor(resource.type)}`}>
                {getResourceIcon(resource.type)}
              </div>
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => openResource(resource.url)}
                  className="text-xs font-medium text-slate-900 dark:text-slate-100 hover:underline line-clamp-2 flex items-center gap-1 text-left"
                >
                  {resource.title}
                  <ExternalLink className="h-3 w-3 inline shrink-0 text-slate-400" />
                </button>
                {resource.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{resource.description}</p>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wide">{resource.type}</p>
              </div>
              {onResourcesChange && (
                <button
                  onClick={() => handleDelete(resource.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 shrink-0 mt-0.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => setShowAddForm(true)} className="w-full gap-2">
            <Plus className="h-4 w-4" />{tr(t.courseDetails.addAnotherResource)}
          </Button>
        </div>
      )}
    </Card>
  );
}
