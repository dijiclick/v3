import { useLocation } from "wouter";
import BlogAuthorForm from "@/components/BlogAuthorForm";
import { Helmet } from "react-helmet-async";

export default function AdminBlogAuthorNew() {
  const [, navigate] = useLocation();

  const handleSave = () => {
    navigate('/admin/blog/authors');
  };

  const handleCancel = () => {
    navigate('/admin/blog/authors');
  };

  return (
    <>
      <Helmet>
        <title>Add New Author - Admin</title>
      </Helmet>
      <BlogAuthorForm 
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </>
  );
}