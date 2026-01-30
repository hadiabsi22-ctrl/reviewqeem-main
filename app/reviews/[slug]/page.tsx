import { notFound } from 'next/navigation';
import { Review, Comment } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ReviewLocal } from '@/lib/models/ReviewLocal';
import { CommentLocal } from '@/lib/models/CommentLocal';
import ReviewViewClient from './ReviewViewClient';
import styles from './page.module.css';

async function getReview(slugOrId: string): Promise<Review | null> {
  try {
    // تنظيف slug/id
    const cleanSlug = decodeURIComponent(slugOrId.trim());
    
    console.log('🔍 البحث عن مراجعة:', cleanSlug);
    
    // Try by ID first (الأكثر موثوقية)
    let review = await ReviewLocal.findById(cleanSlug);
    if (review) {
      console.log('✅ وجدت المراجعة بـ ID:', review.toObject().title);
      return review.toObject();
    }
    
    // Try by slug (exact match)
    review = await ReviewLocal.findBySlug(cleanSlug);
    if (review) {
      console.log('✅ وجدت المراجعة بـ slug:', review.toObject().title);
      return review.toObject();
    }
    
    // إذا لم نجد، جرب البحث في جميع المراجعات (case-insensitive)
    console.log('🔍 البحث في جميع المراجعات...');
    const allReviews = await ReviewLocal.find({});
    console.log('📊 إجمالي المراجعات:', allReviews.length);
    
    // البحث بـ ID (case-insensitive)
    const foundById = allReviews.find(r => {
      const obj = r.toObject();
      const id = obj.id || obj._id || '';
      return id && id.toLowerCase() === cleanSlug.toLowerCase();
    });
    
    if (foundById) {
      console.log('✅ وجدت المراجعة بـ ID (case-insensitive):', foundById.toObject().title);
      return foundById.toObject();
    }
    
    // البحث بـ slug (case-insensitive)
    const foundBySlug = allReviews.find(r => {
      const obj = r.toObject();
      const slug = obj.slug || '';
      return slug && slug.toLowerCase() === cleanSlug.toLowerCase();
    });
    
    if (foundBySlug) {
      console.log('✅ وجدت المراجعة بـ slug (case-insensitive):', foundBySlug.toObject().title);
      return foundBySlug.toObject();
    }
    
    // البحث الجزئي في slug
    const foundByPartialSlug = allReviews.find(r => {
      const obj = r.toObject();
      const slug = obj.slug || '';
      return slug && (
        slug.toLowerCase().includes(cleanSlug.toLowerCase()) ||
        cleanSlug.toLowerCase().includes(slug.toLowerCase())
      );
    });
    
    if (foundByPartialSlug) {
      console.log('✅ وجدت المراجعة بـ slug (partial match):', foundByPartialSlug.toObject().title);
      return foundByPartialSlug.toObject();
    }
    
    console.log('❌ المراجعة غير موجودة');
    return null;
  } catch (error) {
    console.error('❌ خطأ في البحث عن المراجعة:', error);
    return null;
  }
}

async function getComments(reviewId: string): Promise<Comment[]> {
  try {
    const comments = await CommentLocal.find({ 
      reviewId, 
      status: 'approved' 
    });
    return comments
      .map((c) => c.toObject())
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const review = await getReview(params.slug);
  if (!review) {
    return {
      title: 'المراجعة غير موجودة - ReviewQeem',
    };
  }

  return {
    title: `${review.title} - ReviewQeem`,
    description: review.summary || review.title,
    openGraph: {
      title: review.title,
      description: review.summary,
      images: review.coverImage ? [review.coverImage] : [],
    },
  };
}

export default async function ReviewPage({ params }: { params: { slug: string } }) {
  const review = await getReview(params.slug);
  
  if (!review) {
    console.log('❌ المراجعة غير موجودة - عرض 404');
    notFound();
  }

  const comments = await getComments(review.id || review._id || '');

  return (
    <>
      <Header />
      <main className={styles.main}>
        <div className={styles.container}>
          <ReviewViewClient review={review} initialComments={comments} />
        </div>
      </main>
      <Footer />
    </>
  );
}
