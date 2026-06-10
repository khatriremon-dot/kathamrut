'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  BookOpen,
  FileText,
  Swords,
  Map,
  Plus,
  Pencil,
  Trash2,
  Upload,
  ChevronLeft,
  ArrowUpDown,
  GripVertical,
  Loader2,
  LogOut,
  Lock,
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ──────────────────────────────────────────────────────────────────
interface NovelRow {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  language: string;
  category: string;
  rating: number;
  views: number;
  status: string;
  chapters: { id: string; number: number; title: string }[];
  createdAt: string;
  updatedAt: string;
}

interface ChapterRow {
  id: string;
  novelId: string;
  title: string;
  content: string;
  number: number;
  createdAt: string;
}

interface StoryRow {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  language: string;
  genre: string;
  scenes: SceneRow[];
  createdAt: string;
  updatedAt: string;
}

interface SceneRow {
  id: string;
  storyId: string;
  title: string;
  narrative: string;
  imageUrl: string;
  choices: string;
  isStart: boolean;
  createdAt: string;
}

interface ChoiceData {
  text: string;
  nextScene: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
  { value: 'ne', label: 'नेपाली' },
];

const CATEGORIES = [
  'fiction', 'mystery', 'romance', 'fantasy', 'scifi',
  'horror', 'action', 'literary', 'drama', 'historical', 'adventure',
];

const GENRES = [
  'adventure', 'mystery', 'romance', 'fantasy', 'scifi',
  'horror', 'action', 'drama', 'comedy', 'thriller',
];

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  hi: 'हिंदी',
  ne: 'नेपाली',
};

// ─── Sortable Row ───────────────────────────────────────────────────────────
function SortableChapterRow({
  chapter,
  onEdit,
  onDelete,
}: {
  chapter: ChapterRow;
  onEdit: (ch: ChapterRow) => void;
  onDelete: (ch: ChapterRow) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-10">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground">
          <GripVertical className="w-4 h-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{chapter.number}</TableCell>
      <TableCell className="font-medium">{chapter.title}</TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {chapter.content.split(/\s+/).filter(Boolean).length.toLocaleString()} words
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {new Date(chapter.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(chapter)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(chapter)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ─── Admin Page ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kathamrut_admin_auth') === 'true';
    }
    return false;
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordError, setShowPasswordError] = useState(false);

  const handleLogin = () => {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'kathamrut2025';
    if (passwordInput === adminPassword) {
      localStorage.setItem('kathamrut_admin_auth', 'true');
      setIsAuthenticated(true);
      setShowPasswordError(false);
    } else {
      setShowPasswordError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kathamrut_admin_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Password gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-sm space-y-6 p-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter the admin password to continue</p>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setShowPasswordError(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
              autoFocus
            />
            {showPasswordError && (
              <p className="text-sm text-destructive">Incorrect password. Please try again.</p>
            )}
            <Button onClick={handleLogin} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
              Sign In
            </Button>
          </div>
          <a
            href="/"
            className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 flex items-center h-14">
          <a href="/" className="flex items-center gap-2 mr-4 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Back to Site
          </a>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h1 className="font-bold text-lg">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" size="sm" className="ml-auto gap-2 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-6">
        <Tabs defaultValue="novels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-1 p-1">
            <TabsTrigger value="novels" className="gap-2 text-xs sm:text-sm py-2.5">
              <BookOpen className="w-4 h-4 hidden sm:block" />
              Novels
            </TabsTrigger>
            <TabsTrigger value="chapters" className="gap-2 text-xs sm:text-sm py-2.5" disabled>
              <FileText className="w-4 h-4 hidden sm:block" />
              Chapters
            </TabsTrigger>
            <TabsTrigger value="stories" className="gap-2 text-xs sm:text-sm py-2.5">
              <Swords className="w-4 h-4 hidden sm:block" />
              Roleplay Stories
            </TabsTrigger>
            <TabsTrigger value="scenes" className="gap-2 text-xs sm:text-sm py-2.5" disabled>
              <Map className="w-4 h-4 hidden sm:block" />
              Scenes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="novels">
            <NovelsTab />
          </TabsContent>
          <TabsContent value="chapters">
            <ChaptersTab />
          </TabsContent>
          <TabsContent value="stories">
            <StoriesTab />
          </TabsContent>
          <TabsContent value="scenes">
            <ScenesTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// NOVELS TAB
// ═══════════════════════════════════════════════════════════════════════════
function NovelsTab() {
  const [novels, setNovels] = useState<NovelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingNovel, setEditingNovel] = useState<NovelRow | null>(null);
  const [deletingNovel, setDeletingNovel] = useState<NovelRow | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formLanguage, setFormLanguage] = useState('en');
  const [formCategory, setFormCategory] = useState('fiction');
  const [formRating, setFormRating] = useState('4.5');
  const [formStatus, setFormStatus] = useState('ongoing');
  const [uploading, setUploading] = useState(false);

  const fetchNovels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/novels');
      const data = await res.json();
      setNovels(data);
    } catch {
      toast.error('Failed to load novels');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNovels(); }, [fetchNovels]);

  const resetForm = () => {
    setFormTitle('');
    setFormAuthor('');
    setFormDescription('');
    setFormCoverUrl('');
    setFormLanguage('en');
    setFormCategory('fiction');
    setFormRating('4.5');
    setFormStatus('ongoing');
    setEditingNovel(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (novel: NovelRow) => {
    setEditingNovel(novel);
    setFormTitle(novel.title);
    setFormAuthor(novel.author);
    setFormDescription(novel.description);
    setFormCoverUrl(novel.coverUrl);
    setFormLanguage(novel.language);
    setFormCategory(novel.category);
    setFormRating(String(novel.rating));
    setFormStatus(novel.status);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim() || !formAuthor.trim()) {
      toast.error('Title and Author are required');
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: formTitle,
        author: formAuthor,
        description: formDescription,
        coverUrl: formCoverUrl,
        language: formLanguage,
        category: formCategory,
        rating: parseFloat(formRating),
        status: formStatus,
      };

      if (editingNovel) {
        const res = await fetch(`/api/novels/${editingNovel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Update failed');
        toast.success('Novel updated');
      } else {
        const res = await fetch('/api/novels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Create failed');
        toast.success('Novel created');
      }
      setDialogOpen(false);
      fetchNovels();
    } catch {
      toast.error('Failed to save novel');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingNovel) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/novels/${deletingNovel.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Novel deleted');
      setDeleteOpen(false);
      fetchNovels();
    } catch {
      toast.error('Failed to delete novel');
    } finally {
      setSaving(false);
      setDeletingNovel(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setFormCoverUrl(data.url);
        toast.success('Image uploaded');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Novels</h2>
        <Button onClick={openCreate} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4" />
          Add Novel
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : novels.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No novels yet. Create your first novel!</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Author</TableHead>
                  <TableHead className="hidden md:table-cell">Language</TableHead>
                  <TableHead className="hidden md:table-cell">Category</TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Chapters</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {novels.map((novel) => (
                  <TableRow key={novel.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{novel.title}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{novel.author}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">{LANGUAGE_LABELS[novel.language] || novel.language}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs capitalize">{novel.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge variant="secondary" className={`text-xs ${novel.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {novel.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{novel.chapters.length}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { window.location.hash = '#chapters'; window.dispatchEvent(new CustomEvent('admin-view-chapters', { detail: novel.id })); }}>
                          <FileText className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(novel)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingNovel(novel); setDeleteOpen(true); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editingNovel ? 'Edit Novel' : 'Create Novel'}</DialogTitle>
            <DialogDescription>{editingNovel ? 'Update novel details below.' : 'Fill in the details to create a new novel.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Novel title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input id="author" value={formAuthor} onChange={(e) => setFormAuthor(e.target.value)} placeholder="Author name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Novel description..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={formLanguage} onValueChange={setFormLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formStatus} onValueChange={setFormStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input id="rating" type="number" min="0" max="5" step="0.1" value={formRating} onChange={(e) => setFormRating(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex items-center gap-2">
                <Input value={formCoverUrl} onChange={(e) => setFormCoverUrl(e.target.value)} placeholder="/uploads/image.jpg or URL" className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
                  <Button type="button" variant="outline" size="icon" className="h-9 w-9" disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </Button>
                </label>
              </div>
              {formCoverUrl && (
                <div className="mt-2 w-24 h-32 rounded border overflow-hidden bg-muted">
                  <img src={formCoverUrl} alt="Cover" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formTitle.trim() || !formAuthor.trim()} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingNovel ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Novel?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingNovel?.title}&quot; and all its chapters. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingNovel(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CHAPTERS TAB
// ═══════════════════════════════════════════════════════════════════════════
function ChaptersTab() {
  const [novelId, setNovelId] = useState<string | null>(null);
  const [novels, setNovels] = useState<NovelRow[]>([]);
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterRow | null>(null);
  const [deletingChapter, setDeletingChapter] = useState<ChapterRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formContent, setFormContent] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchNovels = useCallback(async () => {
    try {
      const res = await fetch('/api/novels');
      const data = await res.json();
      setNovels(data);
    } catch { /* silent */ }
  }, []);

  const fetchChapters = useCallback(async (nid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/novels/${nid}/chapters`);
      const data = await res.json();
      setChapters(data);
    } catch {
      toast.error('Failed to load chapters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNovels(); }, [fetchNovels]);

  // Listen for novel selection from novels tab
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      const nid = customEvent.detail;
      if (nid) {
        setNovelId(nid);
        fetchChapters(nid);
        // Switch to chapters tab
        const tabBtn = document.querySelector('[data-value="chapters"]') as HTMLElement;
        if (tabBtn) tabBtn.click();
      }
    };
    window.addEventListener('admin-view-chapters', handler);
    return () => window.removeEventListener('admin-view-chapters', handler);
  }, [fetchChapters]);

  const handleNovelSelect = (nid: string) => {
    setNovelId(nid);
    fetchChapters(nid);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormNumber('');
    setFormContent('');
    setEditingChapter(null);
  };

  const openCreate = () => {
    resetForm();
    if (chapters.length > 0) {
      setFormNumber(String(chapters.length + 1));
    } else {
      setFormNumber('1');
    }
    setDialogOpen(true);
  };

  const openEdit = (ch: ChapterRow) => {
    setEditingChapter(ch);
    setFormTitle(ch.title);
    setFormNumber(String(ch.number));
    setFormContent(ch.content);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!novelId || !formTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      if (editingChapter) {
        const res = await fetch(`/api/chapters/${editingChapter.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            content: formContent,
            number: parseInt(formNumber) || editingChapter.number,
          }),
        });
        if (!res.ok) throw new Error('Update failed');
        toast.success('Chapter updated');
      } else {
        const res = await fetch(`/api/novels/${novelId}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: formTitle,
            content: formContent,
            number: parseInt(formNumber) || undefined,
          }),
        });
        if (!res.ok) throw new Error('Create failed');
        toast.success('Chapter created');
      }
      setDialogOpen(false);
      fetchChapters(novelId);
    } catch {
      toast.error('Failed to save chapter');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingChapter) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/chapters/${deletingChapter.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Chapter deleted');
      setDeleteOpen(false);
      if (novelId) fetchChapters(novelId);
    } catch {
      toast.error('Failed to delete chapter');
    } finally {
      setSaving(false);
      setDeletingChapter(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !novelId) return;

    const oldIndex = chapters.findIndex((c) => c.id === active.id);
    const newIndex = chapters.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(chapters, oldIndex, newIndex);

    // Update local state optimistically
    setChapters(reordered.map((ch, i) => ({ ...ch, number: i + 1 })));

    // Persist new order
    try {
      await Promise.all(
        reordered.map((ch, i) =>
          fetch(`/api/chapters/${ch.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: i + 1 }),
          })
        )
      );
    } catch {
      toast.error('Failed to reorder chapters');
      if (novelId) fetchChapters(novelId);
    }
  };

  const selectedNovel = novels.find((n) => n.id === novelId);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="text-muted-foreground">Select a novel:</span>
        <Select value={novelId || ''} onValueChange={handleNovelSelect}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Choose a novel..." />
          </SelectTrigger>
          <SelectContent>
            {novels.map((n) => (
              <SelectItem key={n.id} value={n.id}>{n.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedNovel && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{selectedNovel.title}</h2>
            <p className="text-sm text-muted-foreground">{chapters.length} chapters</p>
          </div>
          <Button onClick={openCreate} className="gap-2 bg-amber-600 hover:bg-amber-700 text-white" disabled={!novelId}>
            <Plus className="w-4 h-4" />
            Add Chapter
          </Button>
        </div>
      )}

      {!novelId ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Select a novel above to manage its chapters.</p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : chapters.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No chapters yet. Add the first chapter!</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="w-20">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden sm:table-cell">Words</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                    {chapters.map((chapter) => (
                      <SortableChapterRow
                        key={chapter.id}
                        chapter={chapter}
                        onEdit={openEdit}
                        onDelete={(ch) => { setDeletingChapter(ch); setDeleteOpen(true); }}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Add Chapter'}</DialogTitle>
            <DialogDescription>{editingChapter ? 'Update chapter content below.' : 'Fill in the details to create a new chapter.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ch-title">Title *</Label>
                <Input id="ch-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Chapter title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ch-number">Chapter Number</Label>
                <Input id="ch-number" type="number" min="1" value={formNumber} onChange={(e) => setFormNumber(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-content">Content *</Label>
              <Textarea
                id="ch-content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Write your chapter content here..."
                rows={16}
                className="font-mono text-sm min-h-[300px]"
              />
              <p className="text-xs text-muted-foreground">
                {formContent.split(/\s+/).filter(Boolean).length.toLocaleString()} words
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formTitle.trim() || !formContent.trim()} className="bg-amber-600 hover:bg-amber-700 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingChapter ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingChapter?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingChapter(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STORIES TAB
// ═══════════════════════════════════════════════════════════════════════════
function StoriesTab() {
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryRow | null>(null);
  const [deletingStory, setDeletingStory] = useState<StoryRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverUrl, setFormCoverUrl] = useState('');
  const [formLanguage, setFormLanguage] = useState('en');
  const [formGenre, setFormGenre] = useState('adventure');
  const [uploading, setUploading] = useState(false);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roleplay');
      const data = await res.json();
      setStories(data);
    } catch {
      toast.error('Failed to load stories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormCoverUrl('');
    setFormLanguage('en');
    setFormGenre('adventure');
    setEditingStory(null);
  };

  const openCreate = () => { resetForm(); setDialogOpen(true); };

  const openEdit = (story: StoryRow) => {
    setEditingStory(story);
    setFormTitle(story.title);
    setFormDescription(story.description);
    setFormCoverUrl(story.coverUrl);
    setFormLanguage(story.language);
    setFormGenre(story.genre);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      const body = {
        title: formTitle,
        description: formDescription,
        coverUrl: formCoverUrl,
        language: formLanguage,
        genre: formGenre,
      };
      if (editingStory) {
        const res = await fetch(`/api/roleplay/${editingStory.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Update failed');
        toast.success('Story updated');
      } else {
        const res = await fetch('/api/roleplay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Create failed');
        toast.success('Story created');
      }
      setDialogOpen(false);
      fetchStories();
    } catch {
      toast.error('Failed to save story');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingStory) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/roleplay/${deletingStory.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Story deleted');
      setDeleteOpen(false);
      fetchStories();
    } catch {
      toast.error('Failed to delete story');
    } finally {
      setSaving(false);
      setDeletingStory(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setFormCoverUrl(data.url);
        toast.success('Image uploaded');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Roleplay Stories</h2>
        <Button onClick={openCreate} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
          <Plus className="w-4 h-4" />
          Add Story
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : stories.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Swords className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No roleplay stories yet. Create your first story!</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Language</TableHead>
                  <TableHead className="hidden md:table-cell">Genre</TableHead>
                  <TableHead className="hidden lg:table-cell">Scenes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stories.map((story) => (
                  <TableRow key={story.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{story.title}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="secondary" className="text-xs">{LANGUAGE_LABELS[story.language] || story.language}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className="text-xs capitalize">{story.genre}</Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">{story.scenes.length}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { window.dispatchEvent(new CustomEvent('admin-view-scenes', { detail: story.id })); }}>
                          <Map className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(story)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingStory(story); setDeleteOpen(true); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editingStory ? 'Edit Story' : 'Create Story'}</DialogTitle>
            <DialogDescription>{editingStory ? 'Update story details below.' : 'Fill in the details to create a new roleplay story.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="story-title">Title *</Label>
              <Input id="story-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Story title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="story-desc">Description</Label>
              <Textarea id="story-desc" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Story description..." rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={formLanguage} onValueChange={setFormLanguage}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Genre</Label>
                <Select value={formGenre} onValueChange={setFormGenre}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex items-center gap-2">
                <Input value={formCoverUrl} onChange={(e) => setFormCoverUrl(e.target.value)} placeholder="/uploads/image.jpg or URL" className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
                  <Button type="button" variant="outline" size="icon" className="h-9 w-9" disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </Button>
                </label>
              </div>
              {formCoverUrl && (
                <div className="mt-2 w-24 h-32 rounded border overflow-hidden bg-muted">
                  <img src={formCoverUrl} alt="Cover" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formTitle.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingStory ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Story?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingStory?.title}&quot; and all its scenes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingStory(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENES TAB
// ═══════════════════════════════════════════════════════════════════════════
function ScenesTab() {
  const [storyId, setStoryId] = useState<string | null>(null);
  const [stories, setStories] = useState<StoryRow[]>([]);
  const [scenes, setScenes] = useState<SceneRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingScene, setEditingScene] = useState<SceneRow | null>(null);
  const [deletingScene, setDeletingScene] = useState<SceneRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formNarrative, setFormNarrative] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formIsStart, setFormIsStart] = useState(false);
  const [formChoices, setFormChoices] = useState<ChoiceData[]>([]);

  const fetchStories = useCallback(async () => {
    try {
      const res = await fetch('/api/roleplay');
      const data = await res.json();
      setStories(data);
    } catch { /* silent */ }
  }, []);

  const fetchScenes = useCallback(async (sid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/roleplay/${sid}/scenes`);
      const data = await res.json();
      setScenes(data);
    } catch {
      toast.error('Failed to load scenes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStories(); }, [fetchStories]);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      const sid = customEvent.detail;
      if (sid) {
        setStoryId(sid);
        fetchScenes(sid);
        const tabBtn = document.querySelector('[data-value="scenes"]') as HTMLElement;
        if (tabBtn) tabBtn.click();
      }
    };
    window.addEventListener('admin-view-scenes', handler);
    return () => window.removeEventListener('admin-view-scenes', handler);
  }, [fetchScenes]);

  const handleStorySelect = (sid: string) => {
    setStoryId(sid);
    fetchScenes(sid);
  };

  const parseChoices = (choicesStr: string): ChoiceData[] => {
    try {
      const parsed = JSON.parse(choicesStr);
      if (Array.isArray(parsed)) return parsed;
    } catch { /* ignore */ }
    return [];
  };

  const resetForm = () => {
    setFormTitle('');
    setFormNarrative('');
    setFormImageUrl('');
    setFormIsStart(false);
    setFormChoices([]);
    setEditingScene(null);
  };

  const openCreate = () => {
    resetForm();
    setFormChoices([{ text: '', nextScene: 1 }]);
    setDialogOpen(true);
  };

  const openEdit = (scene: SceneRow) => {
    setEditingScene(scene);
    setFormTitle(scene.title);
    setFormNarrative(scene.narrative);
    setFormImageUrl(scene.imageUrl);
    setFormIsStart(scene.isStart);
    const choices = parseChoices(scene.choices);
    setFormChoices(choices.length > 0 ? choices : [{ text: '', nextScene: 1 }]);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!storyId || !formTitle.trim() || !formNarrative.trim()) {
      toast.error('Title and narrative are required');
      return;
    }
    setSaving(true);
    try {
      const validChoices = formChoices.filter((c) => c.text.trim());
      const body = {
        title: formTitle,
        narrative: formNarrative,
        imageUrl: formImageUrl,
        isStart: formIsStart,
        choices: JSON.stringify(validChoices),
      };

      if (editingScene) {
        const res = await fetch(`/api/roleplay/scenes/${editingScene.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Update failed');
        toast.success('Scene updated');
      } else {
        const res = await fetch(`/api/roleplay/${storyId}/scenes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error('Create failed');
        toast.success('Scene created');
      }
      setDialogOpen(false);
      fetchScenes(storyId);
    } catch {
      toast.error('Failed to save scene');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingScene) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/roleplay/scenes/${deletingScene.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      toast.success('Scene deleted');
      setDeleteOpen(false);
      if (storyId) fetchScenes(storyId);
    } catch {
      toast.error('Failed to delete scene');
    } finally {
      setSaving(false);
      setDeletingScene(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) {
        setFormImageUrl(data.url);
        toast.success('Image uploaded');
      } else {
        toast.error(data.error || 'Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addChoice = () => {
    setFormChoices([...formChoices, { text: '', nextScene: formChoices.length + 1 }]);
  };

  const removeChoice = (index: number) => {
    setFormChoices(formChoices.filter((_, i) => i !== index));
  };

  const updateChoice = (index: number, field: keyof ChoiceData, value: string | number) => {
    const updated = [...formChoices];
    updated[index] = { ...updated[index], [field]: value };
    setFormChoices(updated);
  };

  const selectedStory = stories.find((s) => s.id === storyId);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="text-muted-foreground">Select a story:</span>
        <Select value={storyId || ''} onValueChange={handleStorySelect}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Choose a story..." />
          </SelectTrigger>
          <SelectContent>
            {stories.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStory && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{selectedStory.title}</h2>
            <p className="text-sm text-muted-foreground">{scenes.length} scenes</p>
          </div>
          <Button onClick={openCreate} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white" disabled={!storyId}>
            <Plus className="w-4 h-4" />
            Add Scene
          </Button>
        </div>
      )}

      {!storyId ? (
        <div className="text-center py-12 text-muted-foreground">
          <Map className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Select a story above to manage its scenes.</p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : scenes.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Map className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No scenes yet. Add the first scene!</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Start</TableHead>
                  <TableHead className="hidden md:table-cell">Choices</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scenes.map((scene) => {
                  const choices = parseChoices(scene.choices);
                  return (
                    <TableRow key={scene.id}>
                      <TableCell className="font-medium">{scene.title}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {scene.isStart ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-xs">Start</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {choices.length} choice{choices.length !== 1 ? 's' : ''}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(scene)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingScene(scene); setDeleteOpen(true); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>{editingScene ? 'Edit Scene' : 'Add Scene'}</DialogTitle>
            <DialogDescription>{editingScene ? 'Update scene details below.' : 'Fill in the details to create a new scene.'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scene-title">Title *</Label>
                <Input id="scene-title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Scene title" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={formIsStart} onCheckedChange={setFormIsStart} id="scene-start" />
                  <Label htmlFor="scene-start" className="cursor-pointer">Starting scene</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scene-narrative">Narrative *</Label>
              <Textarea id="scene-narrative" value={formNarrative} onChange={(e) => setFormNarrative(e.target.value)} placeholder="Write the scene narrative..." rows={6} />
            </div>
            <div className="space-y-2">
              <Label>Scene Image</Label>
              <div className="flex items-center gap-2">
                <Input value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} placeholder="/uploads/image.jpg or URL" className="flex-1" />
                <label className="cursor-pointer">
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
                  <Button type="button" variant="outline" size="icon" className="h-9 w-9" disabled={uploading}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  </Button>
                </label>
              </div>
              {formImageUrl && (
                <div className="mt-2 w-32 h-20 rounded border overflow-hidden bg-muted">
                  <img src={formImageUrl} alt="Scene" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Choices</Label>
                <Button type="button" variant="outline" size="sm" onClick={addChoice} className="gap-1">
                  <Plus className="w-3 h-3" />
                  Add Choice
                </Button>
              </div>
              {formChoices.map((choice, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={choice.text}
                      onChange={(e) => updateChoice(idx, 'text', e.target.value)}
                      placeholder={`Choice ${idx + 1} text`}
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">Go to scene #</span>
                      <Input
                        type="number"
                        min="1"
                        value={choice.nextScene}
                        onChange={(e) => updateChoice(idx, 'nextScene', parseInt(e.target.value) || 1)}
                        className="w-24"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive mt-1"
                    onClick={() => removeChoice(idx)}
                    disabled={formChoices.length <= 1}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setDialogOpen(false); }}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formTitle.trim() || !formNarrative.trim()} className="bg-purple-600 hover:bg-purple-700 text-white">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingScene ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scene?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deletingScene?.title}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingScene(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}