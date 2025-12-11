export interface SavedTemplate {
  id: string;
  name: string;
  content: string;
  lastModified: Date;
  templateId: string;
}

export const saveTemplateToStorage = (templateId: string, content: string, name: string): void => {
  const savedTemplate: SavedTemplate = {
    id: `custom_${Date.now()}`,
    name,
    content,
    lastModified: new Date(),
    templateId
  };
  
  const existingTemplates = getSavedTemplates();
  existingTemplates.push(savedTemplate);
  localStorage.setItem('savedTemplates', JSON.stringify(existingTemplates));
};

export const getSavedTemplates = (): SavedTemplate[] => {
  const saved = localStorage.getItem('savedTemplates');
  return saved ? JSON.parse(saved) : [];
};

export const deleteSavedTemplate = (id: string): void => {
  const existingTemplates = getSavedTemplates();
  const filtered = existingTemplates.filter(template => template.id !== id);
  localStorage.setItem('savedTemplates', JSON.stringify(filtered));
};

export const getSavedTemplate = (id: string): SavedTemplate | null => {
  const templates = getSavedTemplates();
  return templates.find(template => template.id === id) || null;
};
