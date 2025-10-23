import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StoreSettings {
  id: string;
  store_name: string;
  logo_url: string | null;
}

interface StoreContextType {
  settings: StoreSettings | null;
  loading: boolean;
  updateStoreName: (name: string) => Promise<void>;
  updateLogo: (file: File) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Error fetching store settings:', error);
      toast.error('Failed to load store settings');
      return;
    }

    if (data) {
      setSettings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateStoreName = async (name: string) => {
    if (!settings) return;

    const { error } = await supabase
      .from('store_settings')
      .update({ store_name: name })
      .eq('id', settings.id);

    if (error) {
      toast.error('Failed to update store name');
      throw error;
    }

    setSettings({ ...settings, store_name: name });
    toast.success('Store name updated!');
  };

  const updateLogo = async (file: File) => {
    if (!settings) return;

    // Upload to storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('store-logos')
      .upload(filePath, file);

    if (uploadError) {
      toast.error('Failed to upload logo');
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('store-logos')
      .getPublicUrl(filePath);

    // Update database
    const { error: updateError } = await supabase
      .from('store_settings')
      .update({ logo_url: publicUrl })
      .eq('id', settings.id);

    if (updateError) {
      toast.error('Failed to update logo');
      throw updateError;
    }

    setSettings({ ...settings, logo_url: publicUrl });
    toast.success('Logo updated!');
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <StoreContext.Provider value={{ settings, loading, updateStoreName, updateLogo, refreshSettings }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};