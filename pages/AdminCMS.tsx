
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
  RotateCcw
} from 'lucide-react';
import { MOCK_NEWS, SERVICE_CATEGORIES } from '../constants';

interface Category {
  id: string;
  title: string;
  image?: string;
  description?: string;
}

const AdminCMS = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [posts, setPosts] = useState([...MOCK_NEWS]);
  // Khởi tạo danh mục với dữ liệu mẫu đầy đủ hơn
  const [categories, setCategories] = useState<Category[]>([
    ...SERVICE_CATEGORIES.map(c => ({ 
      id: c.id, 
      title: c.title,
      image: 'https://picsum.photos/seed/' + c.id + '/400/300',
      description: 'Các thông tin về ' + c.title.toLowerCase() + ' của ngành Y tế Hà Nội.'
    }))
  ]);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'categories'>('list');
  const [isSuccess, setIsSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form State cho bài viết
  const [newPost, setNewPost] = useState({
    title: '',
    category: 'Tin tức – Sự kiện y tế',
    excerpt: '',
    content: '',
    image: 'https://picsum.photos/seed/newpost/800/600',
    date: new Date().toLocaleDateString('vi-VN')
  });

  // Form State cho danh mục
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

  const handleDeletePost = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Xóa danh mục này có thể ảnh hưởng đến các bài viết hiện có. Bạn vẫn muốn tiếp tục?')) {
      setCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({
      title: cat.title,
      image: cat.image || '',
      description: cat.description || ''
    });
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({ title: '', image: '', description: '' });
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.title.trim()) return;

    if (editingCategory) {
      // Cập nhật danh mục hiện có
      setCategories(categories.map(c => 
        c.id === editingCategory.id ? { ...c, ...categoryForm } : c
      ));
    } else {
      // Thêm danh mục mới
      const id = categoryForm.title.toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
        
      if (categories.find(c => c.id === id)) {
        alert('Danh mục này đã tồn tại hoặc trùng mã định danh!');
        return;
      }

      setCategories([...categories, { id, ...categoryForm }]);
    }

    resetCategoryForm();
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2000);
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    const postToAdd = {
      ...newPost,
      id: posts.length + 1,
      isFeatured: false
    };
    setPosts([postToAdd, ...posts]);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setActiveTab('list');
      setNewPost({
        title: '',
        category: categories[0]?.title || 'Tin tức – Sự kiện y tế',
        excerpt: '',
        content: '',
        image: 'https://picsum.photos/seed/newpost/800/600',
        date: new Date().toLocaleDateString('vi-VN')
      });
    }, 2000);
  };

  const filteredPosts = posts.filter(post => {
    const matchSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* CMS Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-white font-black text-xl flex items-center gap-2">
            <LayoutDashboard className="text-primary-500" /> CMS ADMIN
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Hệ quản trị nội dung</p>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('list')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'list' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' : 'hover:bg-slate-800'}`}
          >
            <FileText size={18} /> Danh sách bài viết
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'add' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/50' : 'hover:bg-slate-800'}`}
          >
            <PlusCircle size={18} /> Thêm bài viết mới
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
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs">A</div>
              <div>
                <p className="text-xs font-bold text-white">Quản trị viên</p>
                <p className="text-[10px] text-slate-500">Đang trực tuyến</p>
              </div>
           </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm">
           <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                 <span>Hệ quản trị</span> <ChevronRight size={12} /> 
                 <span className="text-slate-900 font-medium">
                    {activeTab === 'list' ? 'Danh sách bài viết' : activeTab === 'add' ? 'Thêm bài viết' : 'Quản lý danh mục'}
                 </span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                {activeTab === 'list' ? 'Quản lý tin tức' : activeTab === 'add' ? 'Soạn thảo tin mới' : 'Danh mục hệ thống'}
              </h1>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8 bg-slate-50">
          {isSuccess && (
            <div className="mb-6 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
              <CheckCircle className="text-emerald-500" />
              <div>
                <p className="text-emerald-800 font-bold">Thao tác thành công!</p>
                <p className="text-emerald-600 text-sm">Dữ liệu đã được cập nhật lên hệ thống.</p>
              </div>
            </div>
          )}

          {activeTab === 'list' ? (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
                 <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Tìm tiêu đề bài viết..." 
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100 transition"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 <select 
                    className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-600 outline-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                 >
                    <option value="all">Tất cả danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.title}>{cat.title}</option>
                    ))}
                 </select>
              </div>

              {/* Table Post */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Bài viết</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Danh mục</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPosts.map(post => (
                        <tr key={post.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img src={post.image} className="w-12 h-12 rounded object-cover border border-slate-200" alt="" />
                              <div className="max-w-md">
                                <p className="font-bold text-slate-800 line-clamp-1">{post.title}</p>
                                <p className="text-xs text-slate-400 line-clamp-1">{post.excerpt}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase">{post.category}</span>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex justify-center items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition">
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
                  {/* ... nội dung form add bài viết giữ nguyên hoặc tinh chỉnh nhẹ ... */}
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                    <div className="flex items-center gap-2 pb-4 border-b border-slate-100 mb-6">
                       <PlusCircle className="text-primary-600" />
                       <h3 className="text-lg font-bold text-slate-800 uppercase">Thông tin bài viết mới</h3>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tiêu đề</label>
                       <input type="text" required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-100 font-bold" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Danh mục</label>
                          <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newPost.category} onChange={(e) => setNewPost({...newPost, category: e.target.value})}>
                             {categories.map(cat => <option key={cat.id} value={cat.title}>{cat.title}</option>)}
                          </select>
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Ảnh đại diện (URL)</label>
                          <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newPost.image} onChange={(e) => setNewPost({...newPost, image: e.target.value})} />
                       </div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tóm tắt</label>
                       <textarea rows={2} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newPost.excerpt} onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})} />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nội dung</label>
                       <textarea rows={10} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2">
                    <Send size={20} /> XUẤT BẢN
                  </button>
               </form>
            </div>
          ) : (
            /* TAB QUẢN LÝ DANH MỤC */
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-7xl mx-auto">
               {/* Left: Form Danh Mục */}
               <div className="xl:col-span-5">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-0">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 uppercase flex items-center gap-2">
                           {editingCategory ? <Edit3 size={20} className="text-orange-500" /> : <PlusCircle size={20} className="text-primary-600" />}
                           {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                        </h3>
                        {editingCategory && (
                           <button onClick={resetCategoryForm} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1">
                              <RotateCcw size={14}/> Hủy chỉnh sửa
                           </button>
                        )}
                     </div>
                     <form onSubmit={handleSaveCategory} className="space-y-4">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Tên danh mục</label>
                           <input 
                              type="text" 
                              required
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100 transition font-bold"
                              placeholder="Ví dụ: Cảnh báo dịch bệnh"
                              value={categoryForm.title}
                              onChange={(e) => setCategoryForm({...categoryForm, title: e.target.value})}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Ảnh đại diện danh mục (URL)</label>
                           <div className="relative">
                              <ImageIcon className="absolute left-3 top-3.5 text-slate-400" size={18} />
                              <input 
                                 type="text" 
                                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100 transition text-sm"
                                 placeholder="https://..."
                                 value={categoryForm.image}
                                 onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})}
                              />
                           </div>
                           {categoryForm.image && (
                              <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-slate-200">
                                 <img src={categoryForm.image} alt="Preview" className="w-full h-full object-cover" />
                              </div>
                           )}
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Mô tả danh mục</label>
                           <textarea 
                              rows={3}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-100 transition text-sm"
                              placeholder="Mô tả ngắn gọn về loại tin tức trong danh mục này..."
                              value={categoryForm.description}
                              onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                           ></textarea>
                        </div>
                        <button 
                           type="submit"
                           className={`w-full font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2 ${editingCategory ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                        >
                           {editingCategory ? <Save size={18} /> : <Send size={18} />}
                           {editingCategory ? 'LƯU THAY ĐỔI' : 'TẠO DANH MỤC'}
                        </button>
                     </form>
                  </div>
               </div>

               {/* Right: Bảng Danh Mục */}
               <div className="xl:col-span-7">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                     <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 uppercase flex items-center gap-2">
                           <FolderOpen size={20} className="text-primary-600" /> Danh sách hệ thống
                        </h3>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                                 <th className="px-6 py-4">Thông tin danh mục</th>
                                 <th className="px-6 py-4 text-center">Thao tác</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50">
                              {categories.map((cat) => (
                                 <tr key={cat.id} className="hover:bg-slate-50/50 transition group">
                                    <td className="px-6 py-4">
                                       <div className="flex gap-4 items-start">
                                          <div className="w-16 h-12 bg-slate-100 rounded border border-slate-200 overflow-hidden flex-shrink-0">
                                             {cat.image ? <img src={cat.image} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full"><ImageIcon size={16} className="text-slate-300"/></div>}
                                          </div>
                                          <div>
                                             <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-800">{cat.title}</span>
                                                <code className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">/{cat.id}</code>
                                             </div>
                                             <p className="text-xs text-slate-500 line-clamp-2 mt-1">{cat.description || 'Không có mô tả.'}</p>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-6 py-4">
                                       <div className="flex justify-center items-center gap-2">
                                          <button 
                                             onClick={() => handleEditCategory(cat)}
                                             className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                                             title="Chỉnh sửa"
                                          >
                                             <Edit3 size={18} />
                                          </button>
                                          <button 
                                             onClick={() => handleDeleteCategory(cat.id)}
                                             className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                             title="Xóa"
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
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCMS;
