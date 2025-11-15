-- Create enum for user roles
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Create user_roles table
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);

-- Enable RLS
alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- RLS policies for user_roles
create policy "Users can view their own roles"
on public.user_roles
for select
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles
for select
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert roles"
on public.user_roles
for insert
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update roles"
on public.user_roles
for update
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete roles"
on public.user_roles
for delete
using (public.has_role(auth.uid(), 'admin'));

-- Update comments table RLS policies for moderation
drop policy if exists "Anyone can submit comments" on public.comments;
drop policy if exists "Approved comments are viewable by everyone" on public.comments;

create policy "Anyone can submit comments"
on public.comments
for insert
with check (status = 'pending'::text);

create policy "Approved comments are viewable by everyone"
on public.comments
for select
using (status = 'approved'::text);

create policy "Admins and moderators can view all comments"
on public.comments
for select
using (
  public.has_role(auth.uid(), 'admin') 
  or public.has_role(auth.uid(), 'moderator')
);

create policy "Admins and moderators can update comments"
on public.comments
for update
using (
  public.has_role(auth.uid(), 'admin') 
  or public.has_role(auth.uid(), 'moderator')
);