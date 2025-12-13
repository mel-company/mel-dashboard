/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { templates } from "../../data/templates";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { ArrowLeft, Edit, Share, Download } from "lucide-react";

const TemplatePreview = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);

  useEffect(() => {
    const foundTemplate = templates.find((t) => t.id === templateId);
    if (foundTemplate) {
      setTimeout(() => {
        setTemplate(foundTemplate);
      }, 100);
    }
  }, [templateId]);

  const handleEdit = () => {
    navigate(`/editor/edit/${templateId}`);
  };

  const renderTemplatePreview = () => {
    if (!template) return null;

    return (
      <div className="min-h-screen bg-background">
        {/* Render template based on sections */}
        {template.sections.map((section: any) => (
          <div key={section.id} className="border-b">
            {section.type === "header" && (
              <header className="bg-card shadow-sm border-b border-border">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                  <div className="text-xl font-bold">
                    {section.content.logo}
                  </div>
                  <nav className="hidden md:flex space-x-6">
                    {section.content.menuItems?.map(
                      (item: string, index: number) => (
                        <a
                          key={index}
                          href="#"
                          className="text-slate-600 hover:text-slate-900"
                        >
                          {item}
                        </a>
                      )
                    )}
                  </nav>
                  <div className="text-slate-600">
                    {section.content.phoneNumber}
                  </div>
                </div>
              </header>
            )}

            {section.type === "hero" && (
              <div className="relative h-96 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl font-bold mb-4">
                    {section.content.title}
                  </h1>
                  <p className="text-xl mb-8">{section.content.subtitle}</p>
                  <button className="bg-card text-primary px-6 py-3 rounded-lg font-semibold hover:bg-accent">
                    {section.content.ctaText}
                  </button>
                </div>
              </div>
            )}

            {section.type === "menu" && (
              <div className="max-w-6xl mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-center mb-8">
                  Our Menu
                </h2>
                {section.content.categories?.map(
                  (category: any, index: number) => (
                    <div key={index} className="mb-8">
                      <h3 className="text-2xl font-semibold mb-4">
                        {category.name}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.items?.map((item: any, itemIndex: number) => (
                          <div
                            key={itemIndex}
                            className="border rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-semibold">{item.name}</h4>
                                <p className="text-slate-600 text-sm">
                                  {item.description}
                                </p>
                              </div>
                              <div className="text-lg font-semibold text-blue-600">
                                {item.price}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {section.type === "products" && (
              <div className="max-w-6xl mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-center mb-8">
                  Featured Products
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {section.content.products?.map(
                    (product: any, index: number) => (
                      <div
                        key={index}
                        className="border rounded-lg overflow-hidden"
                      >
                        <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <div className="text-slate-400">
                            <svg
                              className="w-12 h-12"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold mb-2">{product.name}</h3>
                          <p className="text-slate-600 text-sm mb-3">
                            {product.description}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-blue-600">
                              {product.price}
                            </span>
                            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {section.type === "contact" && (
              <div className="max-w-6xl mx-auto px-4 py-12">
                <h2 className="text-3xl font-bold text-center mb-8">
                  Contact Us
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
                    <div className="space-y-3">
                      <p>
                        <strong>Address:</strong> {section.content.address}
                      </p>
                      <p>
                        <strong>Phone:</strong> {section.content.phone}
                      </p>
                      <p>
                        <strong>Email:</strong> {section.content.email}
                      </p>
                      <p>
                        <strong>Hours:</strong> {section.content.hours}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      Send us a Message
                    </h3>
                    <form className="space-y-4">
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full px-3 py-2 border rounded-lg"
                        disabled
                      />
                      <input
                        type="email"
                        placeholder="Your Email"
                        className="w-full px-3 py-2 border rounded-lg"
                        disabled
                      />
                      <textarea
                        placeholder="Your Message"
                        rows={4}
                        className="w-full px-3 py-2 border rounded-lg"
                        disabled
                      />
                      <button
                        type="button"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        disabled
                      >
                        Send Message
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/editor/templates")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{template.name}</h1>
              <p className="text-slate-600 text-sm">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {template.category}
            </Badge>
            <Button variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Template
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative">
        {renderTemplatePreview()}

        {/* Preview Overlay */}
        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <Badge variant="secondary">Preview Mode</Badge>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;
