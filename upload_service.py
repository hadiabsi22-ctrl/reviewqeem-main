from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # السماح بطلبات من أي مصدر

# إعداد Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://pbhkvwcrdztmcfecaaud.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiaGt2d2NyZHp0bWNmZWNhYXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTk5MDYsImV4cCI6MjA4NTA5NTkwNn0.7K-t_F9698-crZaDM35VltNZFE-RhreONSZwrCWbIH8')
SUPABASE_BUCKET = os.getenv('SUPABASE_BUCKET', 'game_reviews')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# السماح بجميع أنواع الصور
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Upload service is running'})

@app.route('/upload', methods=['POST'])
def upload_file():
    """
    استلام الملف من لوحة التحكم ورفعه إلى Supabase Storage
    """
    try:
        # التحقق من وجود الملف
        if 'game_image' not in request.files and 'image' not in request.files:
            return jsonify({
                'success': False,
                'message': 'لم يتم إرسال أي ملف'
            }), 400

        # الحصول على الملف
        file = request.files.get('game_image') or request.files.get('image')
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'message': 'لم يتم اختيار ملف'
            }), 400

        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'message': 'نوع الملف غير مدعوم. يُسمح فقط بصور PNG, JPG, JPEG, GIF, WebP'
            }), 400

        # إنشاء اسم فريد للملف
        import time
        import random
        file_extension = file.filename.rsplit('.', 1)[1].lower()
        secure_name = secure_filename(file.filename.rsplit('.', 1)[0])
        unique_name = f"{secure_name}-{int(time.time())}-{random.randint(1000, 9999)}.{file_extension}"
        
        # قراءة محتوى الملف
        file_content = file.read()
        
        # ==================== مرحلة "الاستلام والرفع" ====================
        # رفع الملف إلى Supabase Storage
        response = supabase.storage.from_(SUPABASE_BUCKET).upload(
            path=unique_name,
            file=file_content,
            file_options={"content-type": file.content_type or "image/png", "upsert": "false"}
        )
        
        if response.get('error'):
            return jsonify({
                'success': False,
                'message': f'فشل رفع الملف: {response["error"]}'
            }), 500

        # ==================== مرحلة "توليد الرابط" ====================
        # الحصول على الرابط العام للصورة
        public_url_data = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(unique_name)
        image_url = public_url_data.get('publicUrl') if isinstance(public_url_data, dict) else str(public_url_data)

        # ==================== إرجاع النتيجة ====================
        return jsonify({
            'success': True,
            'message': 'تم رفع الصورة بنجاح',
            'url': image_url,
            'filename': unique_name,
            'path': unique_name  # للاستخدام في قاعدة البيانات
        }), 200

    except Exception as e:
        print(f"❌ خطأ في رفع الملف: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'حدث خطأ: {str(e)}'
        }), 500

@app.route('/upload/multiple', methods=['POST'])
def upload_multiple():
    """
    رفع عدة ملفات دفعة واحدة
    """
    try:
        if 'images' not in request.files:
            return jsonify({
                'success': False,
                'message': 'لم يتم إرسال أي ملفات'
            }), 400

        files = request.files.getlist('images')
        
        if not files or files[0].filename == '':
            return jsonify({
                'success': False,
                'message': 'لم يتم اختيار ملفات'
            }), 400

        uploaded_files = []
        
        for file in files:
            if file and allowed_file(file.filename):
                import time
                import random
                file_extension = file.filename.rsplit('.', 1)[1].lower()
                secure_name = secure_filename(file.filename.rsplit('.', 1)[0])
                unique_name = f"{secure_name}-{int(time.time())}-{random.randint(1000, 9999)}.{file_extension}"
                
                file_content = file.read()
                
                # رفع الملف
                response = supabase.storage.from_(SUPABASE_BUCKET).upload(
                    path=unique_name,
                    file=file_content,
                    file_options={"content-type": file.content_type or "image/png", "upsert": "false"}
                )
                
                if not response.get('error'):
                    # الحصول على الرابط العام
                    public_url_data = supabase.storage.from_(SUPABASE_BUCKET).get_public_url(unique_name)
                    image_url = public_url_data.get('publicUrl') if isinstance(public_url_data, dict) else str(public_url_data)
                    
                    uploaded_files.append({
                        'url': image_url,
                        'filename': unique_name,
                        'path': unique_name
                    })

        if not uploaded_files:
            return jsonify({
                'success': False,
                'message': 'فشل رفع جميع الملفات'
            }), 500

        return jsonify({
            'success': True,
            'message': f'تم رفع {len(uploaded_files)} صورة بنجاح',
            'files': uploaded_files
        }), 200

    except Exception as e:
        print(f"❌ خطأ في رفع الملفات: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'حدث خطأ: {str(e)}'
        }), 500

@app.route('/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    """
    حذف ملف من Supabase Storage
    """
    try:
        response = supabase.storage.from_(SUPABASE_BUCKET).remove([filename])
        
        if response.get('error'):
            return jsonify({
                'success': False,
                'message': f'فشل حذف الملف: {response["error"]}'
            }), 500

        return jsonify({
            'success': True,
            'message': 'تم حذف الملف بنجاح'
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'حدث خطأ: {str(e)}'
        }), 500

if __name__ == '__main__':
    print('🚀 بدء تشغيل خدمة رفع الملفات...')
    print(f'📦 Supabase Bucket: {SUPABASE_BUCKET}')
    print(f'🌐 Supabase URL: {SUPABASE_URL}')
    app.run(host='0.0.0.0', port=5000, debug=True)
