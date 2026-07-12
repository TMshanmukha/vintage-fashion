import { Link } from "react-router-dom";

export default function BlogCard({ post }) {
  return (
    <div className="group">
      <div className="relative overflow-hidden mb-4">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 bg-pink-500 text-white text-xs font-semibold px-2 py-0.5">
          {post.category}
        </span>
      </div>
      <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 group-hover:text-pink-500 transition-colors">
        <Link to={`/blog/${post.id}`}>{post.title}</Link>
      </h3>
      <p className="text-xs text-gray-400">By {post.author}</p>
    </div>
  );
}
