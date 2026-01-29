from supabase import create_client, Client

# 1. إعداد البيانات الخاصة بك (تم تأكيدها من صورك)
url: str = "https://pbhkvwcrdztmcfecaaud.supabase.co"
key: str = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiaGt2d2NyZHp0bWNmZWNhYXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTk5MDYsImV4cCI6MjA4NTA5NTkwNn0.7K-t_F9698-crZaDM35VltNZFE-RhreONSZwrCWbIH8"

supabase: Client = create_client(url, key)

def upload_game_review_image(local_file_path, storage_file_name):
    """
    local_file_path: مسار الصورة في جهازك (مثلاً 'C:/games/fifa.png')
    storage_file_name: الاسم الذي سيظهر في السحابة (مثلاً 'fifa_review.png')
    """
    try:
        with open(local_file_path, 'rb') as f:
            # نرفع الملف إلى Bucket اسمه 'game_reviews'
            # تأكد أنك أنشأت هذا الـ Bucket في قسم Storage في Supabase
            response = supabase.storage.from_('game_reviews').upload(
                path=storage_file_name,
                file=f,
                file_options={"content-type": "image/png"}
            )
            
        # الحصول على الرابط العام للصورة
        public_url = supabase.storage.from_('game_reviews').get_public_url(storage_file_name)
        print(f"✅ تم الرفع بنجاح! الرابط هو: {public_url}")
        return public_url
        
    except Exception as e:
        print(f"❌ حدث خطأ: {e}")
        return None

# جرب الرفع الآن (تأكد من وجود صورة بهذا الاسم في جهازك)
# upload_game_review_image("test.png", "my_first_game_review.png")

if __name__ == "__main__":
    print("🚀 Supabase Upload Tool جاهز للاستخدام")
    print("استخدم الدالة upload_game_review_image() لرفع الصور")
