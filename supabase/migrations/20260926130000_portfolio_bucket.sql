-- Private bucket for admin image uploads (served via long-lived signed URLs).
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', false)
on conflict (id) do nothing;
