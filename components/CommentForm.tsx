'use client';

import { useState } from 'react';
import { Comment } from '@/types';
import styles from './CommentForm.module.css';

interface CommentFormProps {
  reviewId: string;
  onCommentAdded: (comment: Comment) => void;
}

export default function CommentForm({ reviewId, onCommentAdded }: CommentFormProps) {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    content: '',
    rating: 5,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reviewId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'تم إرسال التعليق بنجاح!' });
        setFormData({ userName: '', userEmail: '', content: '', rating: 5 });
        if (data.data) {
          onCommentAdded(data.data);
        }
      } else {
        setMessage({ type: 'error', text: data.message || 'حدث خطأ أثناء إرسال التعليق' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال بالخادم' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
      
      <div className={styles.row}>
        <input
          type="text"
          placeholder="الاسم"
          value={formData.userName}
          onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
          required
          className={styles.input}
        />
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          value={formData.userEmail}
          onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
          required
          className={styles.input}
        />
      </div>

      <textarea
        placeholder="اكتب تعليقك هنا..."
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        required
        rows={5}
        className={styles.textarea}
      />

      <div className={styles.footer}>
        <div className={styles.rating}>
          <label>التقييم:</label>
          <select
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
            className={styles.select}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={loading} className={styles.submit}>
          {loading ? 'جاري الإرسال...' : 'إرسال التعليق'}
        </button>
      </div>
    </form>
  );
}
