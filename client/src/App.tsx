import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { HelmetProvider } from "react-helmet-async";
import Layout from "@/components/Layout";
import PersianLayout from "@/components/PersianLayout";
import AdminLayout from "@/components/AdminLayout";
import AdminAuth from "@/components/AdminAuth";
import Home from "@/pages/Home";
import Support from "@/pages/Support";
import UserGuide from "@/pages/UserGuide";
import Seller from "@/pages/Seller";
import ChatGPTPage from "@/pages/ChatGPTPage";
import ProductDetails from "@/pages/ProductDetails";
import ProductCatalog from "@/components/ProductCatalog";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminProducts from "@/pages/AdminProducts";
import AdminProductAdd from "@/pages/AdminProductAdd";
import AdminProductEdit from "@/pages/AdminProductEdit";
import AdminCategories from "@/pages/AdminCategories";
import AdminPages from "@/pages/AdminPages";
import AdminSettings from "@/pages/AdminSettings";
import AdminBlogDashboard from "@/pages/AdminBlogDashboard";
import AdminBlogPosts from "@/pages/AdminBlogPosts";
import AdminBlogEditor from "@/pages/AdminBlogEditor";
import AdminBlogAuthors from "@/pages/AdminBlogAuthors";
import AdminBlogAuthorNew from "@/pages/AdminBlogAuthorNew";
import AdminBlogAuthorEdit from "@/pages/AdminBlogAuthorEdit";
import AdminBlogCategories from "@/pages/AdminBlogCategories";
import AdminBlogTags from "@/pages/AdminBlogTags";
import NotFound from "@/pages/not-found";
import CategoryPage from "@/pages/CategoryPage";
import BlogListPage from "@/pages/BlogListPage";
import BlogPostPage from "@/pages/BlogPostPage";
import BlogSearchPage from "@/pages/BlogSearchPage";
import AuthorDirectoryPage from "@/pages/AuthorDirectoryPage";
import AuthorProfilePage from "@/pages/AuthorProfilePage";

function AdminRouter() {
  return (
    <AdminAuth>
      <AdminLayout>
        <Switch>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/products/add" component={AdminProductAdd} />
          <Route path="/admin/products/edit/:id" component={AdminProductEdit} />
          <Route path="/admin/categories" component={AdminCategories} />
          <Route path="/admin/pages" component={AdminPages} />
          <Route path="/admin/blog" component={AdminBlogDashboard} />
          <Route path="/admin/blog/posts" component={AdminBlogPosts} />
          <Route path="/admin/blog/authors" component={AdminBlogAuthors} />
          <Route path="/admin/blog/authors/new" component={AdminBlogAuthorNew} />
          <Route path="/admin/blog/authors/edit/:id" component={AdminBlogAuthorEdit} />
          <Route path="/admin/blog/categories" component={AdminBlogCategories} />
          <Route path="/admin/blog/tags" component={AdminBlogTags} />
          <Route path="/admin/blog/new" component={AdminBlogEditor} />
          <Route path="/admin/blog/edit/:id" component={AdminBlogEditor} />
          <Route path="/admin/settings" component={AdminSettings} />
        </Switch>
      </AdminLayout>
    </AdminAuth>
  );
}

function PublicRouter() {
  return (
    <Switch>
      {/* Persian pages using Persian layout */}
      <Route path="/">
        <PersianLayout>
          <Home />
        </PersianLayout>
      </Route>
      <Route path="/support">
        <PersianLayout>
          <Support />
        </PersianLayout>
      </Route>
      <Route path="/user-guide">
        <PersianLayout>
          <UserGuide />
        </PersianLayout>
      </Route>
      <Route path="/seller">
        <PersianLayout>
          <Seller />
        </PersianLayout>
      </Route>
      <Route path="/chatgpt">
        <PersianLayout>
          <ChatGPTPage />
        </PersianLayout>
      </Route>
      <Route path="/ai-tools/chatgpt-plus">
        <PersianLayout>
          <ChatGPTPage />
        </PersianLayout>
      </Route>
      
      {/* E-commerce pages using Persian layout */}
      <Route path="/products">
        <PersianLayout>
          <ProductCatalog />
        </PersianLayout>
      </Route>
      
      {/* Blog routes - specific routes come before generic ones */}
      <Route path="/blog/search">
        <PersianLayout>
          <BlogSearchPage />
        </PersianLayout>
      </Route>
      
      <Route path="/blog/category/:categorySlug">
        <PersianLayout>
          <BlogListPage />
        </PersianLayout>
      </Route>
      
      <Route path="/blog/tag/:tagSlug">
        <PersianLayout>
          <BlogListPage />
        </PersianLayout>
      </Route>
      
      {/* Author routes */}
      <Route path="/blog/authors">
        <PersianLayout>
          <AuthorDirectoryPage />
        </PersianLayout>
      </Route>
      
      <Route path="/blog/author/:slug">
        <PersianLayout>
          <AuthorProfilePage />
        </PersianLayout>
      </Route>
      
      {/* Individual blog post route - must come before generic /blog route */}
      <Route path="/blog/:slug">
        <PersianLayout>
          <BlogPostPage />
        </PersianLayout>
      </Route>
      
      <Route path="/blog">
        <PersianLayout>
          <BlogListPage />
        </PersianLayout>
      </Route>
      
      {/* Product detail route with category/product slug - must come before generic category route */}
      <Route path="/:categorySlug/:productSlug">
        <PersianLayout>
          <ProductDetails />
        </PersianLayout>
      </Route>
      
      {/* Category page route - generic route comes after specific routes */}
      <Route path="/:categorySlug">
        <PersianLayout>
          <CategoryPage />
        </PersianLayout>
      </Route>
      
      {/* 404 page */}
      <Route>
        <PersianLayout>
          <NotFound />
        </PersianLayout>
      </Route>
    </Switch>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin/*?" component={AdminRouter} />
      <Route component={PublicRouter} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
