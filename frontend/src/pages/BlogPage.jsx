import { useState, useEffect } from 'react';
import CreateBlogModal from '../components/CreateBlogModal';
import axios from 'axios';
import { 
  Search, 
  Plus,
  Clock,
  TrendingUp,
  BookOpen,
  User
} from 'lucide-react';

function BlogPage({ user }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blogs from API
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async (searchQuery = '') => {
    try {
      setLoading(true);
      let url = 'http://localhost:9000/api/blogs';
      
      // Use search endpoint if query provided
      if (searchQuery.trim()) {
        url = `http://localhost:9000/api/blogs/search?q=${encodeURIComponent(searchQuery)}`;
      }
      
      const response = await axios.get(url);
      console.log('API Response:', response.data);
      
      // Handle Laravel API response structure
      let blogData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        blogData = response.data.data;
      } else if (Array.isArray(response.data)) {
        blogData = response.data;
      } else {
        console.warn('Unexpected API response structure:', response.data);
        blogData = [];
      }
      
      console.log('Processed blog data:', blogData);
      setPosts(blogData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch blogs. Please try again later.');
      console.error('Error fetching blogs:', err);
      setPosts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlog = async (newBlog) => {
    // Refresh the blogs list to include the newly created blog
    await fetchBlogs();
  };

  // Search handler
  const handleSearch = async (query) => {
    setSearchTerm(query);
    await fetchBlogs(query);
  };

  const handleClearSearch = async () => {
    setSearchTerm('');
    await fetchBlogs();
  };

  // Use posts directly since filtering is now done on the backend
  const filteredPosts = Array.isArray(posts) ? posts : [];
  
  console.log('Posts:', posts);
  console.log('Search term:', searchTerm);

  const BlogCard = ({ post }) => {
    const authorName = post.username || 'Anonymous';
    const authorInitials = authorName.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
    const publishDate = post.created_at || new Date().toISOString();
    const formattedDate = new Date(publishDate).toLocaleDateString();
    const category = post.category;
    
    // Create excerpt from content (first 200 characters)
    const excerpt = post.content ? post.content.substring(0, 200) + (post.content.length > 200 ? '...' : '') : 'No preview available';
    
    return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">{authorInitials}</span>
        </div>
        <div>
            <p className="font-medium text-gray-900">{authorName}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock size={14} />
              <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer transition-colors">
        {post.title}
      </h2>
      
        <p className="text-gray-600 mb-4 leading-relaxed">
          {excerpt}
        </p>

        {category && (
      <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full hover:bg-blue-200 cursor-pointer transition-colors">
              {category}
          </span>
      </div>
        )}

    </article>
  );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <BookOpen className="text-blue-600" size={32} />
          <h1 className="text-3xl font-bold text-gray-900">Community Blog</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Share your financial journey, learn from others, and build a community of financially savvy individuals.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
            placeholder="Search posts by title or content..."
              value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
        >
          <Plus size={18} />
          <span>Write Article</span>
        </button>
      </div>


      {/* Blog Posts Grid */}
      <div className="space-y-8">
        {loading ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Loading articles...</h3>
            <p className="text-gray-500">Please wait while we fetch the latest blogs.</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-600 mb-2">Error Loading Articles</h3>
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={fetchBlogs}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <BlogCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
            <p className="text-gray-500">Try adjusting your search terms.</p>
          </div>
        )}
      </div>

      {/* Create Blog Modal */}
      <CreateBlogModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateBlog}
        user={user}
      />
    </div>
  );
}

export default BlogPage;