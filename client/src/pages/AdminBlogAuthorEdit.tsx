import { useParams, useLocation } from "wouter";
import BlogAuthorForm from "@/components/BlogAuthorForm";
import { Helmet } from "react-helmet-async";

export default function AdminBlogAuthorEdit() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const handleSave = () => {
    navigate('/admin/blog/authors');
  };

  const handleCancel = () => {
    navigate('/admin/blog/authors');
  };

  if (!id) {
    navigate('/admin/blog/authors');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Edit Author - Admin</title>
      </Helmet>
      <BlogAuthorForm 
        authorId={id}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </>
  );
}