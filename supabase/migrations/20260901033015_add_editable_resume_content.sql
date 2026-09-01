create table public.resume_content (
  id smallint primary key default 1 check (id = 1),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

alter table public.resume_content enable row level security;

revoke all on table public.resume_content from anon, authenticated;
grant select on table public.resume_content to anon, authenticated;
grant update (content, updated_at, updated_by) on table public.resume_content to authenticated;

create policy "Resume content is publicly readable"
on public.resume_content
for select
to anon, authenticated
using (id = 1);

create policy "Admins can update resume content"
on public.resume_content
for update
to authenticated
using (
  id = 1
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  id = 1
  and exists (
    select 1 from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

insert into public.resume_content (id, content)
values (1, $resume$
{
  "eyebrow": "Résumé",
  "title": "Engineering with a creative signal.",
  "summary": "Senior Electrical Engineering student and IEEE officer with 2+ years of workplace experience, blending analytical engineering fundamentals with creative problem solving. Passionate musician with skills in circuit design, hardware assembly, and troubleshooting through independent audio electronics projects, including building custom guitar effects pedals.",
  "experience": [
    {
      "title": "Sales Associate",
      "organization": "Marshalls",
      "date": "August 2024 - Current",
      "bullets": [
        "Maintain organization and cleanliness of the women's department to support efficient merchandising and customer experience.",
        "Handle cash, credit, and returns with high accuracy in a fast-paced environment.",
        "Collaborate with team members to manage high customer traffic during peak hours."
      ]
    },
    {
      "title": "Worship Team Audio & Musician",
      "organization": "I Am Church",
      "date": "July 2022 - Current",
      "bullets": [
        "Configure in-ear monitoring systems, digital mixers, microphones, and stage equipment for one weekly worship service.",
        "Perform level balancing with digital audio workstations and microphones to deliver uninterrupted worship services.",
        "Perform featured violin and keyboard accompaniment for weekly worship services attended by 50-150 people."
      ]
    }
  ],
  "leadership": {
    "title": "Publicity and Multimedia Officer",
    "organization": "IEEE",
    "date": "",
    "bullets": [
      "Spearheaded digital marketing and social media campaigns to boost branch engagement and event turnout.",
      "Managed core online platforms, website updates, and member communications across the organization.",
      "Captured and curated high-quality photo and multimedia archives to showcase branch events and history."
    ]
  },
  "projects": [
    {
      "title": "Bacterial Incubator",
      "date": "July 2026",
      "description": "Engineered a yogurt incubator using dual microcontrollers, UART communication, and PWM-driven thermal regulation to maintain precise fermentation temperatures. Integrating ADC thermistor sensing and relay control for automated thermal regulation."
    },
    {
      "title": "Guitar Fuzz Pedal",
      "date": "September 2026",
      "description": "Designed and soldered a custom analog fuzz effect pedal featuring transistor-based clipping, true-bypass switching, and clean PCB component layout within a shielded enclosure. Validated audio signal integrity and minimized background noise through iterative bench testing and live audio evaluation."
    }
  ],
  "education": {
    "degree": "B.S. Electrical Engineering",
    "school": "The University of Texas at El Paso",
    "graduation": "Spring 2028",
    "gpa": "3.95"
  },
  "skills": {
    "programming": "C/C++, MATLAB, Xilinx Vivado",
    "tools": "LTspice",
    "hardware": "Breadboarding, oscilloscope, multimeter"
  },
  "contact": {
    "phoneDisplay": "(915) 401-5762",
    "phoneLink": "+19154015762",
    "email": "laurenhohnholt@gmail.com"
  }
}
$resume$::jsonb);
