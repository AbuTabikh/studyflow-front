"use client";
import { useState } from "react";
import { LearningResource } from "@/types/self-learning";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Link, Plus, ExternalLink, Trash2, X, Loader2 } from "lucide-react";
import { generatePlanId } from "@/lib/self-learning/utils";
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

interface PlanResourcesPanelProps {
  resources: LearningResource[];
  onResourcesChange: (resources: LearningResource[]) => void;
}

const formatUrl = (url: string) => {
  if (!url) return "#";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export function PlanResourcesPanel({ resources, onResourcesChange }: PlanResourcesPanelProps) {
  const { tr, t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState<LearningResource["type"]>("link");
  const [desc, setDesc] = useState("");
  const [uploading, setUploading] = useState(false);

  const getIcon = (tp: string) => {
    if (tp === "file") return <FileText className="h-4 w-4" />;
    if (tp === "note") return <FileText className="h-4 w-4" />;
    return <Link className="h-4 w-4" />;
  };

  const getColor = (tp: string) => {
    if (tp === "file") return "text-red-600 dark:text-red-400 bg-red-100/20 dark:bg-red-900/20";
    if (tp === "note") return "text-amber-600 dark:text-amber-400 bg-amber-100/20 dark:bg-amber-900/20";
    return "text-blue-600 dark:text-blue-400 bg-blue-100/20 dark:bg-blue-900/20";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const uploaded = await uploadFile(file);
    if (uploaded) {
      setUrl(uploaded);
      setTitle(prev => prev || file.name);
      setType("file");
    } else {
      alert("File upload failed. Please try again.");
    }
    setUploading(false);
    e.target.value = "";
  };

  const handleAdd = () => {
    if (!title.trim() || !url.trim()) return;
    onResourcesChange([...resources, { id: generatePlanId(), title: title.trim(), url: url.trim(), type, description: desc.trim() || undefined }]);
    setTitle(""); setUrl(""); setDesc(""); setType("link"); setShowForm(false);
  };

  const handleDelete = (id: string) => onResourcesChange(resources.filter(r => r.id !== id));

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-semibold">{tr(t.selfLearning.resourcesTitle)}</CardTitle>
        <Button size="sm" variant="ghost" onClick={() => setShowForm(!showForm)} className="h-8 w-8 p-0">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && (
          <div className="mb-4 p-4 rounded-xl border border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/30 dark:bg-blue-900/10 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">{tr(t.selfLearning.resourceTitleLabel)} *</Label>
                <Input placeholder={tr(t.selfLearning.resourceTitlePh)} value={title} onChange={e => setTitle(e.target.value)} className="h-9 text-sm" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs">{tr(t.selfLearning.resourceUrlLabel)} *</Label>
                <div className="flex gap-2">
                  <Input placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} className="h-9 text-sm flex-1" />
                  <div className="relative w-28">
                    <Input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploading}
                      onChange={handleFileSelect}
                    />
                    <Button type="button" variant="outline" size="sm" className="w-full h-9" disabled={uploading}>
                      {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : tr(t.selfLearning.resourceUploadBtn)}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{tr(t.selfLearning.resourceTypeLabel)}</Label>
                <Select value={type} onValueChange={(v: LearningResource["type"]) => setType(v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">{tr(t.selfLearning.resourceTypeLink)}</SelectItem>
                    <SelectItem value="file">{tr(t.selfLearning.resourceTypeFile)}</SelectItem>
                    <SelectItem value="note">{tr(t.selfLearning.resourceTypeNote)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{tr(t.selfLearning.resourceDescLabel)}</Label>
                <Input placeholder={tr(t.selfLearning.resourceDescPh)} value={desc} onChange={e => setDesc(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>{tr(t.actions.cancel)}</Button>
              <Button size="sm" onClick={handleAdd} disabled={!title.trim() || !url.trim() || uploading}>{tr(t.selfLearning.saveResourceBtn)}</Button>
            </div>
          </div>
        )}

        {resources.length === 0 && !showForm ? (
          <div className="py-6 text-center text-muted-foreground">
            <p className="text-sm">{tr(t.selfLearning.noResourcesYet)}</p>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(true)} className="mt-2 gap-1"><Plus className="h-3.5 w-3.5" />{tr(t.selfLearning.addResourceBtn)}</Button>
          </div>
        ) : (
          <div className="space-y-2">
            {resources.map(r => (
              <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card hover:bg-muted/50 transition-colors group">
                <div className={`p-2 rounded-lg shrink-0 ${getColor(r.type)}`}>{getIcon(r.type)}</div>
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => openResource(r.url)}
                    className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 text-left"
                  >
                    {r.title}
                    <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                  </button>
                  {r.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{r.description}</p>}
                </div>
                <button onClick={() => handleDelete(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 shrink-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
