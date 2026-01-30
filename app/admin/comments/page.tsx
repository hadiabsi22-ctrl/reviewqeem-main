'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Comment } from '@/types';
import styles from './page.module.css';

interface CommentWithReview extends Comment {
  reviewTitle?: string;
  reviewSlug?: string;
}

export default function AdminCommentsPage() {
  const router = useRouter();
  const [comments, setComments] = useState<CommentWithReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'reported'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComment, setSelectedComment] = useState<CommentWithReview | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    loadComments();
  }, [router, filter]);

  const loadComments = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const response = await fetch(`/api/comments-admin?status=${filter === 'all' ? '' : filter}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        // Load review titles for each comment
        const commentsWithReviews = await Promise.all(
          (data.comments || data.data || []).map(async (comment: Comment) => {
            try {
              const reviewResponse = await fetch(`/api/reviews/${comment.reviewId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              const reviewData = await reviewResponse.json();
              return {
                ...comment,
                reviewTitle: reviewData.review?.title || 'مراجعة محذوفة',
                reviewSlug: reviewData.review?.slug || '',
              };
            } catch {
              return {
                ...comment,
                reviewTitle: 'مراجعة محذوفة',
                reviewSlug: '',
              };
            }
          })
        );
        setComments(commentsWithReviews);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const response = await fetch(`/api/comments-admin/${id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      setComments(comments.map(c => (c.id === id || c._id === id) ? { ...c, status: 'approved' } : c));
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('هل أنت متأكد من رفض وحذف هذا التعليق؟')) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const response = await fetch(`/api/comments-admin/${id}/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      setComments(comments.filter(c => (c.id !== id && c._id !== id)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا التعليق نهائياً؟')) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const response = await fetch(`/api/comments-admin/${id}/delete`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.success) {
      setComments(comments.filter(c => (c.id !== id && c._id !== id)));
    }
  };

  const handleEdit = (comment: CommentWithReview) => {
    setSelectedComment(comment);
    setEditContent(comment.content);
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedComment) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const response = await fetch(`/api/comments-admin/${selectedComment.id || selectedComment._id}/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: editContent }),
    });

    const data = await response.json();
    if (data.success) {
      setComments(comments.map(c => 
        (c.id === selectedComment.id || c._id === selectedComment._id) 
          ? { ...c, content: editContent } 
          : c
      ));
      setEditMode(false);
      setSelectedComment(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setSelectedComment(null);
    setEditContent('');
  };

  const filteredComments = comments.filter(comment => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      comment.userName.toLowerCase().includes(query) ||
      comment.userEmail.toLowerCase().includes(query) ||
      comment.content.toLowerCase().includes(query) ||
      comment.reviewTitle?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link href="/admin" className={styles.backBtn}>
            ← العودة
          </Link>
          <h1>إدارة التعليقات ({comments.length})</h1>
        </div>
      </header>

      <main className={styles.main}>
        {/* Search and Filters */}
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="بحث في التعليقات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <button
              className={filter === 'all' ? styles.active : ''}
              onClick={() => setFilter('all')}
            >
              الكل ({comments.length})
            </button>
            <button
              className={filter === 'pending' ? styles.active : ''}
              onClick={() => setFilter('pending')}
            >
              في الانتظار ({comments.filter(c => c.status === 'pending').length})
            </button>
            <button
              className={filter === 'approved' ? styles.active : ''}
              onClick={() => setFilter('approved')}
            >
              الموافق عليها ({comments.filter(c => c.status === 'approved').length})
            </button>
            <button
              className={filter === 'reported' ? styles.active : ''}
              onClick={() => setFilter('reported')}
            >
              المبلغ عنها ({comments.filter(c => c.status === 'reported').length})
            </button>
          </div>
        </div>

        {filteredComments.length === 0 ? (
          <div className={styles.empty}>
            <p>{searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد تعليقات'}</p>
          </div>
        ) : (
          <div className={styles.list}>
            {filteredComments.map((comment) => (
              <div key={comment.id || comment._id} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <div className={styles.userInfo}>
                    <div>
                      <strong>{comment.userName}</strong>
                      <span className={styles.email}>{comment.userEmail}</span>
                    </div>
                    {comment.reviewTitle && (
                      <Link 
                        href={`/reviews/${comment.reviewSlug || comment.reviewId}`}
                        className={styles.reviewLink}
                        target="_blank"
                      >
                        📄 {comment.reviewTitle}
                      </Link>
                    )}
                  </div>
                  <span className={`${styles.status} ${styles[comment.status]}`}>
                    {comment.status === 'pending' ? 'في الانتظار' :
                     comment.status === 'approved' ? 'موافق عليها' :
                     comment.status === 'reported' ? 'مبلغ عنها' : 'مرفوض'}
                  </span>
                </div>

                {editMode && selectedComment && (selectedComment.id === comment.id || selectedComment._id === comment._id) ? (
                  <div className={styles.editMode}>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className={styles.editTextarea}
                    />
                    <div className={styles.editActions}>
                      <button onClick={handleSaveEdit} className={styles.saveBtn}>
                        حفظ
                      </button>
                      <button onClick={handleCancelEdit} className={styles.cancelBtn}>
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.commentContent} dangerouslySetInnerHTML={{ __html: comment.content }} />
                )}

                <div className={styles.commentFooter}>
                  <div className={styles.meta}>
                    <span>⭐ التقييم: {comment.rating}/10</span>
                    <span>👍 الإعجابات: {comment.likes || 0}</span>
                    <span>📅 {new Date(comment.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                    {comment.ipAddress && (
                      <span className={styles.ipAddress}>🌐 IP: {comment.ipAddress}</span>
                    )}
                  </div>
                  <div className={styles.actions}>
                    {!editMode && (
                      <>
                        <button 
                          onClick={() => handleEdit(comment)} 
                          className={styles.editBtn}
                        >
                          ✏️ تعديل
                        </button>
                        {comment.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(comment.id || comment._id || '')} 
                              className={styles.approveBtn}
                            >
                              ✅ موافقة
                            </button>
                            <button 
                              onClick={() => handleReject(comment.id || comment._id || '')} 
                              className={styles.rejectBtn}
                            >
                              ❌ رفض
                            </button>
                          </>
                        )}
                        {comment.status === 'approved' && (
                          <button 
                            onClick={() => handleDelete(comment.id || comment._id || '')} 
                            className={styles.deleteBtn}
                          >
                            🗑️ حذف
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
