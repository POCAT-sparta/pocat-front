import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, Eye, MessageSquare, Pencil, Reply, Trash2 } from "lucide-react";
import { deletePost, getPost } from "@/api/community/freeCommunityApi";
import { createComment, deleteComment, getCommentsByPost, updateComment } from "@/api/community/commentApi";
import { useAuth } from "@/app/auth/context/AuthContext";
import type { CommentTreeResponse, FreePostResponse } from "@/types/community.types";
import { toast } from "sonner";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function CommentItem({
  comment, userId, postId, onRefresh,
}: {
  comment: CommentTreeResponse;
  userId?: number;
  postId: number;
  onRefresh: () => void;
}) {
  const [isEditing, setIsEditing]       = useState(false);
  const [editContent, setEditContent]   = useState(comment.content);
  const [isReplying, setIsReplying]     = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const { isAuthenticated } = useAuth();

  const isOwner = userId === comment.authorId;

  async function handleUpdate() {
    if (!editContent.trim()) return;
    try {
      await updateComment(comment.id, { content: editContent.trim() });
      toast.success("댓글이 수정되었습니다.");
      setIsEditing(false);
      onRefresh();
    } catch { toast.error("수정에 실패했습니다."); }
  }

  async function handleDelete() {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;
    try {
      await deleteComment(comment.id);
      toast.success("댓글이 삭제되었습니다.");
      onRefresh();
    } catch { toast.error("삭제에 실패했습니다."); }
  }

  async function handleReply() {
    if (!replyContent.trim()) return;
    try {
      await createComment({ freePostId: postId, parentId: comment.id, content: replyContent.trim() });
      toast.success("답글이 등록되었습니다.");
      setIsReplying(false);
      setReplyContent("");
      onRefresh();
    } catch { toast.error("답글 등록에 실패했습니다."); }
  }

  return (
    <div className="space-y-1">
      <div className={`rounded-xl p-3.5 ${comment.parentId ? "bg-muted/50 ml-6 border-l-2 border-[#FFCB05]/40" : "bg-muted/30"}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-bold text-[10px]">
                {comment.authorNickname[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-semibold">{comment.authorNickname}</span>
              <span className="text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
            </div>
            {isEditing ? (
              <div className="mt-1.5 space-y-2">
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-1.5 text-xs bg-background resize-none focus:outline-none focus:border-[#CC0000]"
                />
                <div className="flex gap-2">
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-xs border rounded-lg hover:bg-muted transition-colors">취소</button>
                  <button onClick={handleUpdate} className="px-3 py-1 text-xs bg-[#CC0000] text-white rounded-lg hover:bg-[#aa0000] transition-colors">저장</button>
                </div>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {isAuthenticated && !comment.parentId && (
              <button onClick={() => setIsReplying(!isReplying)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                <Reply className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {isOwner && !isEditing && (
              <>
                <button onClick={() => { setIsEditing(true); setEditContent(comment.content); }} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={handleDelete} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </>
            )}
          </div>
        </div>

        {isReplying && (
          <div className="mt-2.5 flex gap-2">
            <input
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); }}}
              placeholder="답글을 입력하세요..."
              className="flex-1 border rounded-lg px-3 py-1.5 text-xs bg-background focus:outline-none focus:border-[#CC0000]"
            />
            <button onClick={handleReply} className="px-3 py-1.5 text-xs bg-[#CC0000] text-white rounded-lg hover:bg-[#aa0000] transition-colors whitespace-nowrap">등록</button>
          </div>
        )}
      </div>

      {comment.children.map(child => (
        <CommentItem key={child.id} comment={child} userId={userId} postId={postId} onRefresh={onRefresh} />
      ))}
    </div>
  );
}

export function FreeBoardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [post, setPost]         = useState<FreePostResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comments, setComments] = useState<CommentTreeResponse[]>([]);
  const [newComment, setNewComment] = useState("");

  function fetchPost() {
    if (!id) return;
    setIsLoading(true);
    getPost(Number(id))
      .then(setPost)
      .catch(() => { toast.error("게시글을 불러오지 못했습니다."); navigate("/free"); })
      .finally(() => setIsLoading(false));
  }

  function fetchComments() {
    if (!id) return;
    getCommentsByPost(Number(id)).then(res => setComments(res.content)).catch(() => {});
  }

  useEffect(() => { fetchPost(); fetchComments(); }, [id]); // eslint-disable-line

  async function handleDelete() {
    if (!confirm("게시글을 삭제하시겠습니까?")) return;
    try {
      await deletePost(Number(id));
      toast.success("게시글이 삭제되었습니다.");
      navigate("/free");
    } catch { toast.error("삭제에 실패했습니다."); }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await createComment({ freePostId: Number(id), content: newComment.trim() });
      toast.success("댓글이 등록되었습니다.");
      setNewComment("");
      fetchComments();
    } catch { toast.error("댓글 등록에 실패했습니다."); }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!post) return null;
  const isOwner = user?.id === post.authorId;

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] text-white py-10 border-b border-white/10">
        <div className="container mx-auto px-4 max-w-2xl">
          <Link to="/free" className="flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-3 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> 자유게시판
          </Link>
          <h1 className="text-xl font-bold text-white mb-2 leading-snug">{post.title}</h1>
          <div className="flex items-center gap-4 text-xs text-white/50">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#FFCB05] flex items-center justify-center text-[#1a1a2e] font-bold text-[9px]">
                {post.authorNickname[0]?.toUpperCase()}
              </div>
              <span>{post.authorNickname}</span>
            </div>
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{post.viewCount}</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.commentCount}</span>
            <span>{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-2xl space-y-8">
        {/* Content */}
        <div className="bg-card border rounded-xl p-6 min-h-[120px]">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div className="flex justify-end gap-2">
            <Link
              to={`/free/${post.id}/edit`}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border rounded-xl hover:bg-muted transition-colors"
            >
              <Pencil className="w-4 h-4" /> 수정
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-red-200 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> 삭제
            </button>
          </div>
        )}

        {/* Comments */}
        <section>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#CC0000]" />
            댓글 {post.commentCount}개
          </h3>

          <div className="space-y-2 mb-6">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">첫 댓글을 작성해보세요!</p>
            ) : (
              comments.map(c => (
                <CommentItem key={c.id} comment={c} userId={user?.id} postId={Number(id)} onRefresh={fetchComments} />
              ))
            )}
          </div>

          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="flex-1 border rounded-xl px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-[#CC0000] transition-colors"
              />
              <button type="submit" className="px-4 py-2.5 bg-[#CC0000] hover:bg-[#aa0000] text-white rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">
                등록
              </button>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-3">
              <Link to="/login" className="text-[#CC0000] hover:underline">로그인</Link> 후 댓글을 작성할 수 있습니다.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
