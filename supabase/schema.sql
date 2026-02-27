create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- Step 1: Company
  company_name text,
  company_number text,
  company_reference text,
  registered_address jsonb,
  incorporated_date date,
  company_status text,
  contact_name text,
  contact_email text,
  contact_phone text,
  site_postcode text,
  -- Step 2: Products
  selected_products jsonb,
  requires_callback boolean default false,
  -- Step 3: Quote
  quote_reference text,
  quote_term_months integer,
  monthly_total numeric,
  annual_total numeric,
  quote_pdf_url text,
  quote_sent_at timestamptz,
  -- Step 4: Signature
  signed_at timestamptz,
  signed_name text,
  signed_ip text,
  signed_user_agent text,
  -- Step 5: Direct Debit
  dd_account_holder text,
  dd_sort_code text,
  dd_account_number_last4 text,
  dd_confirmed boolean default false,
  dd_confirmed_at timestamptz,
  -- Step 6: CRM Sync
  cw_synced boolean default false,
  cw_synced_at timestamptz,
  cw_company_id text,
  cw_ticket_id text,
  -- Status
  status text default 'draft'
);

-- Zen order fields (added Phase 1.5)
alter table orders add column if not exists zen_availability_ref text;
alter table orders add column if not exists zen_reference text;
alter table orders add column if not exists zen_order_status text;
alter table orders add column if not exists zen_estimated_completion date;
alter table orders add column if not exists selected_address jsonb;
alter table orders add column if not exists appointment_date date;
alter table orders add column if not exists appointment_slot text;
alter table orders add column if not exists number_port_reference text;
alter table orders add column if not exists number_port_numbers jsonb;
