import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { templates } from '../../data/templates';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Eye, Edit, Store, ShoppingBag } from 'lucide-react';

const TemplateGallery = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'restaurant' | 'ecommerce'>('all');
  const navigate = useNavigate();

  const filteredTemplates = templates.filter(template => 
    selectedCategory === 'all' || template.category === selectedCategory
  );

  const handlePreview = (templateId: string) => {
    navigate(`/editor/preview/${templateId}`);
  };

  const handleEdit = (templateId: string) => {
    navigate(`/editor/edit/${templateId}`);
  };

  const getCategoryIcon = (category: string) => {
    return category === 'restaurant' ? <Store className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    return category === 'restaurant' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            معرض القوالب
          </h1>
          <p className="text-slate-600">اختر قالباً للبدء في تصميم موقعك</p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="flex items-center gap-2"
          >
            جميع القوالب
          </Button>
          <Button
            variant={selectedCategory === 'restaurant' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('restaurant')}
            className="flex items-center gap-2"
          >
            <Store className="w-4 h-4" />
            مطاعم
          </Button>
          <Button
            variant={selectedCategory === 'ecommerce' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('ecommerce')}
            className="flex items-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            متاجر إلكترونية
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: template.color }}
                    />
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <Badge className={getCategoryColor(template.category)}>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(template.category)}
                      <span className="capitalize">{template.category}</span>
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Preview Image */}
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center group-hover:from-slate-200 group-hover:to-slate-300 transition-colors">
                  <div className="text-center p-4">
                    <div className="text-2xl mb-2" style={{ color: template.color }}>
                      {getCategoryIcon(template.category)}
                    </div>
                    <p className="text-sm text-slate-600 font-medium">{template.preview}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-600 text-sm line-clamp-2">
                  {template.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                  {template.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.features.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(template.id)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    معاينة
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEdit(template.id)}
                    className="flex-1"
                    style={{ backgroundColor: template.color }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Store className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">لا توجد قوالب</h3>
            <p className="text-slate-600">جرب اختيار فئة مختلفة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateGallery;
