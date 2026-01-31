'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useState } from 'react';
import styles from './TipTapEditor.module.css';

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({ content, onChange, placeholder }: TipTapEditorProps) {
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // إزالة Link من StarterKit لتجنب التكرار
        link: false,
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
        },
      }),
    ],
    content,
    immediatelyRender: false, // حل مشكلة SSR
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: styles.editorContent,
      },
    },
  });

  const addImage = () => {
    if (!imageUrl.trim()) return;
    
    if (editor) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      // رفع صور المحتوى في مجلد content
      const response = await fetch('/api/upload/single?folder=content', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success && data.url) {
        // إذا كان URL من Supabase (يبدأ بـ http/https)، استخدمه مباشرة
        // وإلا استخدم /api/uploads/
        const imagePath = data.url.startsWith('http://') || data.url.startsWith('https://')
          ? data.url
          : data.url.startsWith('/api/')
          ? data.url
          : `/api${data.url}`;
        if (editor) {
          editor.chain().focus().setImage({ src: imagePath }).run();
        }
      } else {
        alert(data.message || 'فشل رفع الصورة');
      }
    } catch (err) {
      alert('حدث خطأ في رفع الصورة');
      console.error(err);
    }
  };

  if (!editor) {
    return <div>جاري تحميل المحرر...</div>;
  }

  return (
    <div className={styles.editorWrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${styles.toolbarButton} ${editor.isActive('bold') ? styles.active : ''}`}
            title="عريض (Bold)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${styles.toolbarButton} ${editor.isActive('italic') ? styles.active : ''}`}
            title="مائل (Italic)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${styles.toolbarButton} ${editor.isActive('underline') ? styles.active : ''}`}
            title="تحته خط (Underline)"
          >
            <u>U</u>
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`${styles.toolbarButton} ${editor.isActive('heading', { level: 1 }) ? styles.active : ''}`}
            title="عنوان رئيسي (H1)"
          >
            H1
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`${styles.toolbarButton} ${editor.isActive('heading', { level: 2 }) ? styles.active : ''}`}
            title="عنوان فرعي (H2)"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`${styles.toolbarButton} ${editor.isActive('heading', { level: 3 }) ? styles.active : ''}`}
            title="عنوان فرعي (H3)"
          >
            H3
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`${styles.toolbarButton} ${editor.isActive('bulletList') ? styles.active : ''}`}
            title="قائمة نقطية"
          >
            •
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`${styles.toolbarButton} ${editor.isActive('orderedList') ? styles.active : ''}`}
            title="قائمة مرقمة"
          >
            1.
          </button>
        </div>

        <div className={styles.toolbarGroup}>
          <label className={styles.uploadButton}>
            📷 رفع صورة
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </label>
          <div className={styles.imageUrlInput}>
            <input
              type="text"
              placeholder="أو أدخل رابط الصورة"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addImage();
                }
              }}
            />
            <button type="button" onClick={addImage} className={styles.addImageButton}>
              إضافة
            </button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className={styles.editorContainer}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
