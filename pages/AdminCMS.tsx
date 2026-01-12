
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  LayoutDashboard, 
  FileText, 
  Image as ImageIcon, 
  Send, 
  Trash2, 
  Edit3, 
  Search, 
  Filter,
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight,
  MoreVertical,
  Layers,
  Hash,
  FolderOpen,
  Save,
  RotateCcw,
  Loader2,
  UploadCloud
} from 'lucide-react';

// Import Firebase (sử dụng CDN ESM cho môi trường browser)
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { db, storage } from '../firebase';

interface Category {
  id: string;
  title: string;
  image?: string;
  description?: string;
}

interface Post {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  createdAt: any;
}

const AdminCMS = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'categories'>('list');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form State bài viết
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    image: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form State danh mục
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<Omit<Category, 'id'>>({
    title: '',
    image: '',
    description: ''
  });

  useEffect(() => {
    const authStatus = localStorage.getItem('isLoggedIn') === 'true';
    if (!authStatus) {
      navigate('/login');
    } else {
      setIsLoggedIn(true);
    }
  }, [navigate]);

  // Lấy dữ liệu Realtime từ Firebase
  useEffect(() => {
    if (!isLoggedIn) return;

    // Lấy bài viết
    const qPosts = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribePosts = onSnapshot(qPosts, (querySnapshot) => {
      const postsData: Post[] = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(postsData);
    });

    // Lấy danh mục
    const unsubscribeCategories = onSnapshot(collection(db, "categories"), (querySnapshot) => {
      const categoriesData: Category[] = [];
      querySnapshot.forEach((doc) => {
        categoriesData.push({ id: doc.id, ...doc.data() } as Category);
      });
      setCategories(categoriesData);
      if (categoriesData.length > 0 && !postForm.category) {
        setPostForm(prev => ({ ...prev, category: categoriesData[0].title }));
      }
    });

    return () => {
      unsubscribePosts();
      unsubscribeCategories();
    };
  }, [isLoggedIn]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    const storageRef = ref(storage, `news/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let imageUrl = postForm.image;
      
      // Nếu có file mới thì up lên storage
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const dataToSave = {
        ...postForm,
        image: imageUrl,
        date: new Date().toLocaleDateString('vi-VN'),
        createdAt: new Date(),
      };

      if (editingPost) {
        await updateDoc(doc(db, "posts", editingPost.id), dataToSave);
      } else {
        await addDoc(collection(db, "posts"), dataToSave);
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setActiveTab('list');
        resetPostForm();
      }, 1500);
    } catch (err) {
      console.error("Error saving post:", err);
      alert("Đã có lỗi xảy ra khi lưu bài viết.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetPostForm = () => {
    setEditingPost(null);
    setPostForm({
      title: '',
      category: categories[0]?.title || '',
      excerpt: '',
      content: '',
      image: '',
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setPostForm({
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image,
    });
    setImagePreview(post.image);
    setActiveTab('add');
  };

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      await deleteDoc(doc(db, "posts", id));
    }
  };

  // Logic cho Danh Mục (Categories) tương tự
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingCategory) {
        await updateDoc(doc(db, "categories", editingCategory.id), categoryForm);
      } else {
        await addDoc(collection(db, "categories"), categoryForm);
      }
      setIsSuccess(true);
      setEditingCategory(null);
      setCategoryForm({ title: '', image: '', description: '' });
      setTimeout(() => setIsSuccess(false), 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Xóa danh mục có thể ảnh hưởng đến bài viết. Tiếp tục?')) {
      await deleteDoc(doc(db, "categories", id));
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar CMS */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-white font-black text-xl flex items-center gap-2">
            <LayoutDashboard className="text-primary-500" /> CMS ADMIN
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Hệ quản trị Cloud</p>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('list'); resetPostForm(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'list' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' : 'hover:bg-slate-800'}`}
          >
            <FileText size={18} /> Danh sách bài viết
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'add' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' : 'hover:bg-slate-800'}`}
          >
            <PlusCircle size={18} /> {editingPost ? 'Đang sửa bài' : 'Thêm bài mới'}
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'categories' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' : 'hover:bg-slate-800'}`}
          >
            <Layers size={18} /> Quản lý danh mục
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
           <div className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-xs uppercase">DB</div>
              <div>
                <p className="text-xs font-bold text-white">Firebase Connected</p>
                <p className="text-[10px] text-emerald-400">Database Live</p>
              </div>
           </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
           <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                 <span>Hệ quản trị</span> <ChevronRight size={12} /> 
                 <span className="text-slate-900 font-medium">
                    {activeTab === 'list' ? 'Danh sách bài viết' : activeTab === 'add' ? 'Thêm bài viết' : 'Quản lý danh mục'}
                 </span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                {activeTab === 'list' ? 'Quản lý tin tức' : activeTab === 'add' ? (editingPost ? 'Chỉnh sửa bài viết' : 'Soạn thảo tin mới') : 'Danh mục hệ thống'}
              </h1>
           </div>
           {isLoading && (
             <div className="flex items-center gap-2 text-primary-600 font-bold animate-pulse text-sm">
                <Loader2 className="animate-spin" size={20} /> ĐANG XỬ LÝ...
             </div>
           )}
        </header>

        <div className="flex-grow overflow-y-auto p-8 bg-slate-50">
          {isSuccess && (
            <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <CheckCircle className="text-emerald-500" />
              <div>
                <p className="text-emerald-800 font-bold">Thao tác thành công!</p>
                <p className="text-emerald-600 text-sm">Dữ liệu đã được cập nhật trực tiếp lên Cloud.</p>
              </div>
            </div>
          )}

          {activeTab === 'list' ? (
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                 <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm tiêu đề bài viết..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                 >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.title}>{cat.title}</option>
                    ))}
                 </select>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Bài viết</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Danh mục</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 text-center uppercase">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPosts.map(post => (
                        <tr key={post.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={post.image} className="w-12 h-12 rounded object-cover border" alt="" />
                              <div className="max-w-md">
                                <p className="font-bold text-slate-800 line-clamp-1">{post.title}</p>
                                <p className="text-xs text-slate-400 line-clamp-1">{post.date}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase">{post.category}</span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex justify-center items-center gap-2">
                                <button onClick={() => handleEditPost(post)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition">
                                   <Edit3 size={18} />
                                </button>
                                <button 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                   <Trash2 size={18} />
                                </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
            </div>
          ) : activeTab === 'add' ? (
            <div className="max-w-4xl mx-auto">
               <form onSubmit={handleSubmitPost} className="space-y-6">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
                       <PlusCircle className="text-primary-600" />
                       <h3 className="text-lg font-bold text-slate-800 uppercase">Thông tin bài viết</h3>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tiêu đề bài viết</label>
                       <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" value={postForm.title} onChange={(e) => setPostForm({...postForm, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Danh mục</label>
                          <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={postForm.category} onChange={(e) => setPostForm({...postForm, category: e.target.value})}>
                             {categories.map(cat => <option key={cat.id} value={cat.title}>{cat.title}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Hình ảnh đại diện</label>
                          <div className="flex items-center gap-4">
                             <label className="flex-grow flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-slate-300 px-4 py-2.5 rounded-xl cursor-pointer transition">
                                <UploadCloud size={18} className="text-slate-500" />
                                <span className="text-xs font-bold text-slate-600">CHỌN ẢNH TỪ MÁY</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                             </label>
                             {imagePreview && (
                                <div className="w-12 h-12 rounded border overflow-hidden">
                                   <img src={imagePreview} className="w-full h-full object-cover" />
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tóm tắt ngắn</label>
                       <textarea rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none italic" value={postForm.excerpt} onChange={(e) => setPostForm({...postForm, excerpt: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nội dung chi tiết (Rich Text)</label>
                       <textarea rows={10} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={postForm.content} onChange={(e) => setPostForm({...postForm, content: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" disabled={isLoading} className="flex-grow bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2">
                       {isLoading ? <Loader2 className="animate-spin" /> : <Send size={20} />} 
                       {editingPost ? 'LƯU THAY ĐỔI' : 'XUẤT BẢN BÀI VIẾT'}
                    </button>
                    <button type="button" onClick={() => { setActiveTab('list'); resetPostForm(); }} className="px-8 bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-2xl hover:bg-slate-50 transition">
                       HỦY BỎ
                    </button>
                  </div>
               </form>
            </div>
          ) : (
            /* Tab Quản lý danh mục */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-7xl mx-auto">
               <div className="xl:col-span-5">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-0">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 uppercase flex items-center gap-2">
                           {editingCategory ? <Edit3 size={20} className="text-orange-500" /> : <PlusCircle size={20} className="text-primary-600" />}
                           {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                        </h3>
                        {editingCategory && <button onClick={() => {setEditingCategory(null); setCategoryForm({title:'', image:'', description:''});}} className="text-xs font-bold text-slate-400">Hủy</button>}
                     </div>
                     <form onSubmit={handleSaveCategory} className="space-y-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tên danh mục</label>
                           <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold" value={categoryForm.title} onChange={(e) => setCategoryForm({...categoryForm, title: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ảnh / Icon đại diện (URL)</label>
                           <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={categoryForm.image} onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})} />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mô tả</label>
                           <textarea rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={categoryForm.description} onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})} />
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2">
                           {isLoading ? <Loader2 className="animate-spin" /> : <Save size={18} />} {editingCategory ? 'CẬP NHẬT' : 'TẠO DANH MỤC'}
                        </button>
                     </form>
                  </div>
               </div>

               <div className="xl:col-span-7">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 uppercase flex items-center gap-2">
                           <FolderOpen size={20} className="text-primary-600" /> Danh sách hiện có
                        </h3>
                     </div>
                     <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-50">
                           {categories.map((cat) => (
                              <tr key={cat.id} className="hover:bg-slate-50/50 transition group">
                                 <td className="px-6 py-4 flex gap-4 items-center">
                                    <img src={cat.image || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-lg object-cover" />
                                    <div>
                                       <span className="font-bold text-slate-800">{cat.title}</span>
                                       <p className="text-[10px] text-slate-400 line-clamp-1">{cat.description}</p>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex justify-end gap-2">
                                       <button onClick={() => {setEditingCategory(cat); setCategoryForm({title: cat.title, image: cat.image||'', description: cat.description||''});}} className="p-2 text-slate-400 hover:text-primary-600"><Edit3 size={18} /></button>
                                       <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-400 hover:text-red-600"><Trash2 size={18} /></button>
                                    </div>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCMS;
