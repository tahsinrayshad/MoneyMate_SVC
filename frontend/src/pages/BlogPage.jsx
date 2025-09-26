import { useState } from 'react';
import CreateBlogModal from '../components/CreateBlogModal';
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

  // Mock blog data
  const blogPosts = [
    {
      id: 1,
      title: "5 Simple Steps to Start Emergency Fund",
      excerpt: "Building an emergency fund is crucial for financial security. Here's how to start even with a tight budget.",
      author: "Sarah Johnson",
      authorAvatar: "SJ",
      publishedAt: "2025-01-14",
      readTime: "5 min read",
      likes: 24,
      comments: 8,
      tags: ["Emergency Fund", "Budgeting", "Savings"],
      content: "An emergency fund is your financial safety net...",
      isLiked: false
    },
    {
      id: 2,
      title: "How I Paid Off $30K in Student Loans",
      excerpt: "My personal journey of becoming debt-free in 2 years through strategic planning and side hustles.",
      author: "Mike Chen",
      authorAvatar: "MC",
      publishedAt: "2025-01-13",
      readTime: "8 min read",
      likes: 156,
      comments: 32,
      tags: ["Debt", "Student Loans", "Success Story"],
      content: "Two years ago, I was drowning in student debt...",
      isLiked: true
    },
    {
      id: 3,
      title: "Investment Basics for Beginners",
      excerpt: "Start your investment journey with these fundamental concepts and practical tips for new investors.",
      author: "Emily Rodriguez",
      authorAvatar: "ER",
      publishedAt: "2025-01-12",
      readTime: "6 min read",
      likes: 89,
      comments: 15,
      tags: ["Investment", "Beginner", "Stocks"],
      content: "Investing can seem intimidating at first...",
      isLiked: false
    },
    {
      id: 4,
      title: "Budgeting Apps vs. Spreadsheets: What Works Better?",
      excerpt: "A comprehensive comparison of digital budgeting tools and traditional spreadsheet methods.",
      author: "David Park",
      authorAvatar: "DP",
      publishedAt: "2025-01-11",
      readTime: "7 min read",
      likes: 67,
      comments: 21,
      tags: ["Budgeting", "Tools", "Comparison"],
      content: "The eternal debate in personal finance...",
      isLiked: false
    },
    {
      id: 5,
      title: "Side Hustle Ideas That Actually Make Money",
      excerpt: "Practical side hustle opportunities that can boost your income without overwhelming your schedule.",
      author: "Lisa Wang",
      authorAvatar: "LW",
      publishedAt: "2025-01-10",
      readTime: "9 min read",
      likes: 203,
      comments: 45,
      tags: ["Side Hustle", "Income", "Entrepreneurship"],
      content: "Everyone talks about side hustles, but which ones actually work?",
      isLiked: true
    }
  ];

  const [posts, setPosts] = useState(blogPosts);

  const handleCreateBlog = (newBlog) => {
    setPosts([newBlog, ...posts]);
  };


  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const BlogCard = ({ post }) => (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">{post.authorAvatar}</span>
        </div>
        <div>
          <p className="font-medium text-gray-900">{post.author}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock size={14} />
            <span>{post.publishedAt}</span>
            <span>•</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer transition-colors">
        {post.title}
      </h2>
      
      <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full hover:bg-blue-200 cursor-pointer transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>

    </article>
  );

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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search posts, tags, or authors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-72"
          />
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
        {filteredPosts.length > 0 ? (
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