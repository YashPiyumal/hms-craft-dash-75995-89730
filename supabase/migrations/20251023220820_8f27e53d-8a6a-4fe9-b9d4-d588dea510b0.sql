-- Add currency and language columns to store_settings table
ALTER TABLE public.store_settings 
ADD COLUMN currency text NOT NULL DEFAULT 'LKR',
ADD COLUMN language text NOT NULL DEFAULT 'English';

-- Add check constraints for valid values
ALTER TABLE public.store_settings
ADD CONSTRAINT valid_currency CHECK (currency IN ('LKR', 'USD', 'EUR')),
ADD CONSTRAINT valid_language CHECK (language IN ('English', 'Sinhala', 'Tamil', 'French', 'German', 'Dutch'));