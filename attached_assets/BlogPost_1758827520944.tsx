import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Clock, Eye } from "lucide-react";

interface BlogPostProps {
  id: string;
  title: string;
  image: string;
  category: string;
  categoryColor: string;
  author: string;
  date: string;
  authorAvatar?: string;
  readTime?: string;
  views?: string;
}

export function BlogPost({ title, image, category, categoryColor, author, date, authorAvatar, readTime, views }: BlogPostProps) {
  return (
    <article className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
      <div className="aspect-video relative overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Badge 
          className={`absolute top-3 left-3 text-white border-0 ${categoryColor} shadow-lg`}
        >
          {category}
        </Badge>
        {views && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            <Eye className="w-3 h-3" />
            {views}
          </div>
        )}
      </div>
      
      <div className="p-5">
        <h3 className="mb-3 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors duration-200">{title}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={authorAvatar} alt={author} />
              <AvatarFallback className="bg-red-500 text-white text-sm">
                {author.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm text-gray-700">{author}</p>
              <p className="text-xs text-gray-500">{date}</p>
            </div>
          </div>
          {readTime && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {readTime}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}