import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templates } from '../../data/templates';
import { saveTemplateToStorage } from '../../utils/editorUtils';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Plus
} from 'lucide-react';

declare global {
  interface Window {
    grapes: any;
  }
}

const GrapesEditor = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef<any>(null);
  const grapesEditorRef = useRef<any>(null);

  // Initialize GrapesJS when the container ref is set
  useEffect(() => {
    if (editorRef.current && templateId && !grapesEditorRef.current) {
      // Container is ready, define and call loadGrapesJS
      const loadGrapesJS = async () => {
        try {
          setIsLoading(true);
          
          // Clean up existing scripts and styles first
          const existingScripts = document.querySelectorAll('script[src*="grapesjs"]');
          const existingStyles = document.querySelectorAll('link[href*="grapesjs"]');
          
          existingScripts.forEach(script => script.remove());
          existingStyles.forEach(style => style.remove());

          // Load GrapesJS CSS
          const grapesCSS = document.createElement('link');
          grapesCSS.rel = 'stylesheet';
          grapesCSS.href = 'https://unpkg.com/grapesjs/dist/css/grapes.min.css';
          grapesCSS.onload = () => console.log('GrapesJS CSS loaded');
          grapesCSS.onerror = () => console.error('Failed to load GrapesJS CSS');
          document.head.appendChild(grapesCSS);

          // Load GrapesJS Preset Webpage CSS
          const presetCSS = document.createElement('link');
          presetCSS.rel = 'stylesheet';
          presetCSS.href = 'https://cdn.jsdelivr.net/npm/grapesjs-preset-webpage@1.0.3/dist/grapesjs-preset-webpage.min.css';
          presetCSS.onload = () => console.log('GrapesJS Preset CSS loaded');
          presetCSS.onerror = () => {
            console.warn('Failed to load GrapesJS Preset CSS from jsdelivr, trying unpkg...');
            // Try alternative CDN
            const fallbackCSS = document.createElement('link');
            fallbackCSS.rel = 'stylesheet';
            fallbackCSS.href = 'https://unpkg.com/grapesjs-preset-webpage@1.0.3/dist/grapesjs-preset-webpage.min.css';
            fallbackCSS.onload = () => console.log('GrapesJS Preset CSS loaded from fallback');
            fallbackCSS.onerror = () => console.warn('Failed to load GrapesJS Preset CSS from fallback - will use default styles');
            document.head.appendChild(fallbackCSS);
          };
          document.head.appendChild(presetCSS);

          // Load GrapesJS script
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/grapesjs';
          script.async = true;
          script.onload = () => {
            console.log('GrapesJS script loaded');
            
            // Load GrapesJS Preset Webpage plugin
            const presetScript = document.createElement('script');
            presetScript.src = 'https://unpkg.com/grapesjs-preset-webpage';
            presetScript.async = true;
            presetScript.onload = () => {
              console.log('GrapesJS Preset Webpage plugin loaded');
              setTimeout(() => initializeEditor(), 100);
            };
            presetScript.onerror = () => {
              console.error('Failed to load GrapesJS Preset Webpage plugin');
              setIsLoading(false);
            };
            document.body.appendChild(presetScript);
          };
          script.onerror = () => {
            console.error('Failed to load GrapesJS script');
            setIsLoading(false);
          };
          document.body.appendChild(script);

        } catch (error) {
          console.error('Error loading GrapesJS:', error);
          setIsLoading(false);
        }
      };

      const initializeEditor = () => {
        try {
          // Check for GrapesJS in multiple possible global variables
          const grapesJS = (window as any).grapes || (window as any).GrapesJS || (window as any)['grapesjs'];
          if (!grapesJS) {
            console.error('GrapesJS not loaded');
            console.log('Available globals:', Object.keys(window).filter(key => key.toLowerCase().includes('grape')));
            setIsLoading(false);
            return;
          }

          const foundTemplate = templates.find(t => t.id === templateId);
          if (!foundTemplate) {
            console.error('Template not found:', templateId);
            setIsLoading(false);
            return;
          }

          setTemplate(foundTemplate);

          // Initialize GrapesJS editor with error handling
          // Use the ref directly since we know it exists
          const editor = grapesJS.init({
            container: editorRef.current,
            height: '100%',
            width: '100%',
            plugins: ['grapesjs-preset-webpage'],
            pluginsOpts: {
              'grapesjs-preset-webpage': {
                blocksBasicOpts: {
                  blocks: ['column1', 'column2', 'column3', 'column3-7', 'text', 'link', 'image', 'video'],
                  flexGrid: 0
                },
                blocks: [
                  {
                    id: 'hero-section',
                    label: 'Hero Section',
                    content: `
                      <section class="hero-section" style="padding: 100px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                        <h1 style="font-size: 3em; margin-bottom: 20px;">مرحباً بك</h1>
                        <p style="font-size: 1.2em; margin-bottom: 30px;">اكتشف منتجاتنا المميزة</p>
                        <button style="padding: 15px 30px; background: white; color: #667eea; border: none; border-radius: 5px; font-size: 1em; cursor: pointer;">تسوق الآن</button>
                      </section>
                    `
                  },
                  {
                    id: 'products-section',
                    label: 'Products Section',
                    content: `
                      <section class="products-section" style="padding: 60px 20px; background: #f8f9fa;">
                        <h2 style="text-align: center; font-size: 2.5em; margin-bottom: 40px;">منتجاتنا</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
                          <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <img src="https://via.placeholder.com/300x200" style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px; margin-bottom: 15px;">
                            <h3 style="font-size: 1.5em; margin-bottom: 10px;">منتج 1</h3>
                            <p style="color: #666; margin-bottom: 15px;">وصف المنتج</p>
                            <div style="font-size: 1.2em; font-weight: bold; color: #007bff;">$99</div>
                          </div>
                          <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <img src="https://via.placeholder.com/300x200" style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px; margin-bottom: 15px;">
                            <h3 style="font-size: 1.5em; margin-bottom: 10px;">منتج 2</h3>
                            <p style="color: #666; margin-bottom: 15px;">وصف المنتج</p>
                            <div style="font-size: 1.2em; font-weight: bold; color: #007bff;">$149</div>
                          </div>
                          <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <img src="https://via.placeholder.com/300x200" style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px; margin-bottom: 15px;">
                            <h3 style="font-size: 1.5em; margin-bottom: 10px;">منتج 3</h3>
                            <p style="color: #666; margin-bottom: 15px;">وصف المنتج</p>
                            <div style="font-size: 1.2em; font-weight: bold; color: #007bff;">$199</div>
                          </div>
                        </div>
                      </section>
                    `
                  }
                ]
              }
            },
            canvas: {
              styles: [
                // Try multiple CDN sources for CSS
                'https://cdn.jsdelivr.net/npm/grapesjs-preset-webpage@1.0.3/dist/grapesjs-preset-webpage.min.css',
                'https://unpkg.com/grapesjs-preset-webpage@1.0.3/dist/grapesjs-preset-webpage.min.css',
                'https://unpkg.com/grapesjs-preset-webpage@1.0.3/dist/grapesjs-preset-webpage.min.css'
              ]
            },
            deviceManager: {
              devices: [
                { name: 'Desktop', width: '' },
                { name: 'Tablet', width: '768px', widthMedia: '992px' },
                { name: 'Mobile', width: '320px', widthMedia: '768px' }
              ]
            },
            // Add default styles in case CSS fails to load
            fromElement: true,
            cssIcons: false,
            noticeOnUnload: false,
            allowScripts: 1,
            allowImport: 1,
            storageManager: { type: 0 },
            showOffsets: 1,
            autorender: 1
          });

          if (!editor) {
            console.error('Failed to initialize GrapesJS editor');
            setIsLoading(false);
            return;
          }

          grapesEditorRef.current = editor;
          console.log('GrapesJS editor initialized successfully');

          // Load template content if available
          try {
            const templateContent = generateTemplateContent(foundTemplate);
            if (templateContent && typeof templateContent === 'string') {
              // Clear any existing content first
              editor.runCommand('core:canvas-clear');
              // Add the new content
              editor.setComponents(templateContent);
              console.log('Template content loaded successfully');
            } else {
              // Add default content if template is invalid
              editor.setComponents('<h1>Welcome to GrapesJS Editor</h1><p>Start building your website!</p>');
            }
          } catch (error) {
            console.error('Error loading template content:', error);
            // Add default content if template loading fails
            editor.setComponents('<h1>Welcome to GrapesJS Editor</h1><p>Start building your website!</p>');
          }

          // Add event listeners
          editor.on('storage:store', () => {
            setHasChanges(true);
          });

          editor.on('component:update', () => {
            setHasChanges(true);
          });

          // Handle editor errors
          editor.on('error', (error: any) => {
            console.error('GrapesJS editor error:', error);
          });

          setIsLoading(false);
          console.log('GrapesJS setup completed');

        } catch (error) {
          console.error('Error initializing GrapesJS:', error);
          setIsLoading(false);
        }
      };

      loadGrapesJS();
    }
  }, [templateId]);

  useEffect(() => {
    return () => {
      // Cleanup
      if (grapesEditorRef.current) {
        grapesEditorRef.current.destroy();
      }
    };
  }, []);

  const generateTemplateContent = (template: any) => {
    // Convert template sections to HTML for GrapesJS
    let html = '';
    
    template.sections.forEach((section: any) => {
      switch (section.type) {
        case 'header':
          html += `
            <header style="background: white; padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
              <div style="font-size: 1.5em; font-weight: bold;">${section.content.logo || 'Logo'}</div>
              <nav style="display: flex; gap: 20px;">
                ${section.content.menuItems?.map((item: string) => `<a href="#" style="color: #333; text-decoration: none;">${item}</a>`).join('') || ''}
              </nav>
            </header>
          `;
          break;
        case 'hero':
          html += `
            <section style="padding: 100px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
              <h1 style="font-size: 3em; margin-bottom: 20px;">${section.content.title || 'Welcome'}</h1>
              <p style="font-size: 1.2em; margin-bottom: 30px;">${section.content.subtitle || 'Description'}</p>
              <button style="padding: 15px 30px; background: white; color: #667eea; border: none; border-radius: 5px; cursor: pointer;">${section.content.ctaText || 'Get Started'}</button>
            </section>
          `;
          break;
        case 'menu':
          html += `
            <section style="padding: 60px 20px; background: #f8f9fa;">
              <h2 style="text-align: center; font-size: 2.5em; margin-bottom: 40px;">${section.content.title || 'Menu'}</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
                ${section.content.categories?.map((category: any) => `
                  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h3 style="font-size: 1.8em; margin-bottom: 20px; color: #333;">${category.name}</h3>
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                      ${category.items?.map((item: any) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #eee;">
                          <div>
                            <div style="font-weight: 600; color: #333;">${item.name}</div>
                            <div style="color: #666; font-size: 0.9em;">${item.description}</div>
                          </div>
                          <div style="font-weight: bold; color: #007bff; font-size: 1.1em;">${item.price}</div>
                        </div>
                      `).join('') || ''}
                    </div>
                  </div>
                `).join('') || ''}
              </div>
            </section>
          `;
          break;
        case 'products':
          html += `
            <section style="padding: 60px 20px; background: #f8f9fa;">
              <h2 style="text-align: center; font-size: 2.5em; margin-bottom: 40px;">${section.content.title || 'Products'}</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; max-width: 1200px; margin: 0 auto;">
                ${section.content.products?.map((product: any) => `
                  <div style="background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <img src="${product.image || 'https://via.placeholder.com/300x200'}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 5px; margin-bottom: 15px;">
                    <h3 style="font-size: 1.5em; margin-bottom: 10px;">${product.name}</h3>
                    <p style="color: #666; margin-bottom: 15px;">${product.description}</p>
                    <div style="font-size: 1.2em; font-weight: bold; color: #007bff;">$${product.price}</div>
                  </div>
                `).join('') || ''}
              </div>
            </section>
          `;
          break;
        case 'gallery':
          html += `
            <section style="padding: 60px 20px; background: white;">
              <h2 style="text-align: center; font-size: 2.5em; margin-bottom: 40px;">Gallery</h2>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; max-width: 1200px; margin: 0 auto;">
                ${Array.from({length: 8}, () => `
                  <img src="https://via.placeholder.com/400x300" style="width: 100%; height: 300px; object-fit: cover; border-radius: 10px;">
                `).join('')}
              </div>
            </section>
          `;
          break;
        case 'contact':
          html += `
            <section style="padding: 60px 20px; background: white;">
              <h2 style="text-align: center; font-size: 2.5em; margin-bottom: 40px;">${section.content.title || 'Contact Us'}</h2>
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px;">
                  <div>
                    <h3 style="font-size: 1.5em; margin-bottom: 15px;">Contact Information</h3>
                    <p style="margin-bottom: 10px;"><strong>Address:</strong> ${section.content.address || '123 Main St'}</p>
                    <p style="margin-bottom: 10px;"><strong>Phone:</strong> ${section.content.phone || '+1 234-567-8900'}</p>
                    <p style="margin-bottom: 10px;"><strong>Email:</strong> ${section.content.email || 'info@example.com'}</p>
                    <p style="margin-bottom: 10px;"><strong>Hours:</strong> ${section.content.hours || 'Mon-Fri: 9AM-6PM'}</p>
                  </div>
                  <div>
                    <h3 style="font-size: 1.5em; margin-bottom: 15px;">Send us a message</h3>
                    <form style="display: flex; flex-direction: column; gap: 15px;">
                      <input type="text" placeholder="Your Name" style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                      <input type="email" placeholder="Your Email" style="padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
                      <textarea placeholder="Your Message" rows="5" style="padding: 15px; border: 1px solid #ddd; border-radius: 5px; resize: vertical;"></textarea>
                      <button type="submit" style="padding: 15px 30px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Send Message</button>
                    </form>
                  </div>
                </div>
              </div>
            </section>
          `;
          break;
        case 'footer':
          html += `
            <footer style="background: #333; color: white; padding: 40px 20px; text-align: center;">
              <p>&copy; 2024 ${section.content.companyName || 'Company'}. All rights reserved.</p>
            </footer>
          `;
          break;
      }
    });

    return html;
  };

  const saveContent = () => {
    if (grapesEditorRef.current) {
      const html = grapesEditorRef.current.getHtml();
      const css = grapesEditorRef.current.getCss();
      const content = { html, css };
      
      saveTemplateToStorage(templateId || '', JSON.stringify(content), template?.name || 'Custom Template');
      setHasChanges(false);
      console.log('Content saved:', content);
    }
  };

  const togglePreview = () => {
    if (grapesEditorRef.current) {
      if (isPreview) {
        grapesEditorRef.current.runCommand('sw-visibility');
      } else {
        grapesEditorRef.current.runCommand('sw-visibility');
      }
      setIsPreview(!isPreview);
    }
  };

  const addSection = () => {
    if (grapesEditorRef.current) {
      // Add a new section
      const newSection = {
        type: 'text',
        content: '<h2>New Section</h2><p>Add your content here</p>'
      };
      grapesEditorRef.current.addComponents([newSection]);
      setHasChanges(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading GrapesJS Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/editor/templates')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
            <div>
              <h1 className="text-xl font-semibold">GrapesJS Editor</h1>
              <p className="text-sm text-muted-foreground">
                {template?.name || 'Custom Template'}
              </p>
            </div>
            {hasChanges && (
              <Badge variant="secondary">توجد تغييرات</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={addSection}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              إضافة قسم
            </Button>
            <Button
              variant="outline"
              onClick={togglePreview}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {isPreview ? 'تحرير' : 'معاينة'}
            </Button>
            <Button
              onClick={saveContent}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              حفظ
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="h-[calc(100vh-80px)]">
        <div id="gjs" style={{ height: '100%' }} ref={editorRef}></div>
      </div>
    </div>
  );
};

export default GrapesEditor;
