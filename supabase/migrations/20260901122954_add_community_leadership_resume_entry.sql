update public.resume_content
set content = jsonb_set(
  jsonb_set(
    content,
    '{sectionTitles,leadership}',
    to_jsonb('Leadership & community'::text),
    true
  ),
  '{leadership}',
  case
    when jsonb_typeof(content -> 'leadership') = 'array' then
      case
        when (content -> 'leadership') @> '[{"title":"Bringing People Together"}]'::jsonb
          then content -> 'leadership'
        else (content -> 'leadership') || jsonb_build_array(
          jsonb_build_object(
            'title', 'Bringing People Together',
            'organization', 'Friends across campus and beyond',
            'date', '',
            'bullets', jsonb_build_array(
              'Takes the initiative to turn “we should get together” into an actual plan, coordinating dates, invitations, logistics, and supplies.',
              'Hosts tea parties that bring the girls back together when they are home on breaks from colleges in different places.',
              'Recently organized a camping trip to Glenwood, New Mexico, to hike the Catwalk—complete with travel plans, a supply list, and an unexpected lesson for the boys whose improperly rigged tent cover gave them a little rainwater bath.'
            )
          )
        )
      end
    else jsonb_build_array(
      content -> 'leadership',
      jsonb_build_object(
        'title', 'Bringing People Together',
        'organization', 'Friends across campus and beyond',
        'date', '',
        'bullets', jsonb_build_array(
          'Takes the initiative to turn “we should get together” into an actual plan, coordinating dates, invitations, logistics, and supplies.',
          'Hosts tea parties that bring the girls back together when they are home on breaks from colleges in different places.',
          'Recently organized a camping trip to Glenwood, New Mexico, to hike the Catwalk—complete with travel plans, a supply list, and an unexpected lesson for the boys whose improperly rigged tent cover gave them a little rainwater bath.'
        )
      )
    )
  end,
  true
),
updated_at = now()
where id = 1;
