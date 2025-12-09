import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, X, Save, Image, ArrowLeft } from "lucide-react";

type Props = {};

interface Property {
  key: string;
  value: string;
}

const AddProduct = ({}: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  // @ts-ignore
  const [image, setImage] = useState("");
  const [rate, setRate] = useState("");
  const [properties, setProperties] = useState<Property[]>([
    { key: "", value: "" },
  ]);

  const addProperty = () => {
    setProperties([...properties, { key: "", value: "" }]);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const updateProperty = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...properties];
    updated[index][field] = value;
    setProperties(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert properties array to object
    const propertiesObj = properties.reduce((acc, prop) => {
      if (prop.key && prop.value) {
        acc[prop.key] = prop.value;
      }
      return acc;
    }, {} as Record<string, string>);

    const productData = {
      title,
      description,
      price: parseFloat(price),
      image,
      rate: parseFloat(rate),
      properties: propertiesObj,
    };

    console.log("Product data:", productData);
    // TODO: Submit to API
  };

  return (
    <div className="mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-secondary p-4 rounded-lg">
          <p className="text-lg font-bold">معلومات المنتج الأساسية</p>
        </div>
        <Card className="gap-2">
          <CardContent className="spacey-4">
            <div className="flex gap-x-2 mb-4">
              <div className="w-32 h-32 flex items-center justify-center bg-gray-200 rounded-lg">
                <Image className="w-12 h-12 object-cover text-gray-400" />
              </div>
              <div className="space-y-2 flex items-center">
                <div>
                  <h3 className="text-xl font-bold">صورة المنتج</h3>
                  <p className="text-sm text-gray-500">
                    يمكنك إضافة صورة للمنتج من خلال التحديد من الملفات المحلية
                  </p>
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="text-sm font-medium text-right block"
              >
                العنوان
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المنتج"
                required
                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="text-sm font-medium text-right block"
              >
                الوصف
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف المنتج"
                required
                rows={4}
                className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 resize-none"
              />
            </div>

            {/* Price and Rate Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div className="space-y-2">
                <label
                  htmlFor="price"
                  className="text-sm font-medium text-right block"
                >
                  السعر (دينار عراقي)
                </label>
                <div className="relative">
                  <input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    required
                    min="0"
                    step="0.01"
                    className="w-full text-right rounded-md border border-input bg-background py-2.5 pl-12 pr-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    IQD
                  </span>
                </div>
              </div>

              {/* Rate */}
              <div className="space-y-2">
                <label
                  htmlFor="rate"
                  className="text-sm font-medium text-right block"
                >
                  التقييم (من 5)
                </label>
                <input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="0.0"
                  required
                  min="0"
                  max="5"
                  step="0.1"
                  className="w-full text-right rounded-md border border-input bg-background py-2.5 px-4 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Section */}
        <div className="bg-secondary p-4 rounded-lg flex items-center justify-between">
          <p className="text-lg font-bold">الخصائص</p>
          <Button
            type="button"
            size="sm"
            onClick={addProperty}
            className="gap-2"
          >
            <Plus className="size-4" />
            إضافة خاصية
          </Button>
        </div>
        <Card>
          <CardContent className="space-y-4">
            {properties.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                لا توجد خصائص. اضغط على "إضافة خاصية" لإضافة خاصية جديدة.
              </p>
            ) : (
              properties.map((property, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                >
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground text-right block">
                        المفتاح
                      </label>
                      <input
                        type="text"
                        value={property.key}
                        onChange={(e) =>
                          updateProperty(index, "key", e.target.value)
                        }
                        placeholder="مثال: العلامة التجارية"
                        className="w-full text-right rounded-md border border-input bg-background py-2 px-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground text-right block">
                        القيمة
                      </label>
                      <input
                        type="text"
                        value={property.value}
                        onChange={(e) =>
                          updateProperty(index, "value", e.target.value)
                        }
                        placeholder="مثال: سامسونج"
                        className="w-full text-right rounded-md border border-input bg-background py-2 px-3 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:bg-input/30"
                      />
                    </div>
                  </div>
                  {properties.length > 1 && (
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => removeProperty(index)}
                      className="shrink-0"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <Button type="submit" size="lg" className="gap-2">
            <Save className="size-4" />
            إضافة المنتج
            <ArrowLeft className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
