-- Highlight integration & automation capabilities on the portfolio.
-- Items use "Label — detail"; the home page renders this group as highlight cards.
-- Editable afterwards in /admin-user → Skills.
INSERT INTO public.skills (category, items, sort_order)
SELECT
  'Integrations & Automation',
  ARRAY[
    'Trading platforms → CRM — MT5 · cTrader & more connected via APIs',
    'Trading automations — API-driven workflows for brokers & prop firms',
    'Email providers — Transactional & marketing mail wired into the CRM',
    'AI agents — AI assistants and agents inside CRM workflows',
    'VoIP call dialers — Zadarma · 9ance & more in browser CRMs or mobile apps',
    'Mobile apps — Cross-platform Flutter apps for iOS & Android',
    'Any modern API — If it has an API, I can integrate it'
  ]::text[],
  COALESCE((SELECT MAX(sort_order) FROM public.skills), 0) + 1
WHERE NOT EXISTS (
  SELECT 1 FROM public.skills WHERE category = 'Integrations & Automation'
);
