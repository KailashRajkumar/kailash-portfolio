UPDATE public.profile
SET summary = 'I build high-performance websites for businesses across industries, custom CRM platforms, and mobile applications with Flutter or React Native. My work spans product design through delivery: responsive interfaces, reliable APIs, integrations, hosting, and secure infrastructure. I use powerful AI models, strong technical knowledge, and practical integrations to improve delivery speed while keeping client data, credentials, and production access protected.'
WHERE id = 1;

UPDATE public.skills
SET items = ARRAY['Powerful AI Models','Prompt Engineering','AI Integrations','AI CRM Plugins']
WHERE category = 'AI';
