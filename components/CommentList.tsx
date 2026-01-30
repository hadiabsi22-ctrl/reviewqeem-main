import { Comment } from '@/types';
import styles from './CommentList.module.css';

interface CommentListProps {
  comments: Comment[];
}

export default function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className={styles.empty}>
        <p>لا توجد تعليقات بعد. كن أول من يعلق!</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {comments.map((comment) => (
        <div key={comment.id || comment._id} className={styles.comment}>
          <div className={styles.header}>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{comment.userName}</span>
              <span className={styles.rating}>⭐ {comment.rating}/10</span>
            </div>
            <span className={styles.date}>
              {new Date(comment.createdAt).toLocaleDateString('ar-EG')}
            </span>
          </div>
          <div
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: comment.content }}
          />
          <div className={styles.footer}>
            <button className={styles.likeBtn}>
              👍 {comment.likes || 0}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
