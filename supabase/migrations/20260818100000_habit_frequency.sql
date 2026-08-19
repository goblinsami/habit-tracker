alter table public.habits
  add column frequency_type text not null default 'daily'
    check (frequency_type in ('daily', 'weekdays', 'weekly', 'yearly')),
  add column frequency_days smallint[] not null default '{}'
    check (
      cardinality(frequency_days) = 0
      or (frequency_days <@ array[0,1,2,3,4,5,6] and frequency_days @> '{}'::smallint[])
    ),
  add column frequency_weekday smallint,
  add column yearly_month smallint,
  add column yearly_day smallint,
  add constraint habits_frequency_valid check (
    (
      frequency_type = 'daily'
      and cardinality(frequency_days) = 0
      and frequency_weekday is null
      and yearly_month is null
      and yearly_day is null
    )
    or (
      frequency_type = 'weekdays'
      and cardinality(frequency_days) between 1 and 7
      and frequency_days <@ array[0,1,2,3,4,5,6]
      and frequency_weekday is null
      and yearly_month is null
      and yearly_day is null
    )
    or (
      frequency_type = 'weekly'
      and frequency_weekday between 0 and 6
      and cardinality(frequency_days) = 0
      and yearly_month is null
      and yearly_day is null
    )
    or (
      frequency_type = 'yearly'
      and cardinality(frequency_days) = 0
      and frequency_weekday is null
      and yearly_month between 1 and 12
      and yearly_day between 1 and 31
    )
  );

create index habits_frequency_user_idx
  on public.habits (user_id, frequency_type, frequency_weekday);
