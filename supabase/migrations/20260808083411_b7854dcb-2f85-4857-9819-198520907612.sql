-- 1. Extend letters
ALTER TABLE public.letters
  ADD COLUMN recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN status text NOT NULL DEFAULT 'draft',
  ADD COLUMN scheduled_for timestamptz,
  ADD COLUMN sent_at timestamptz,
  ADD COLUMN read_at timestamptz,
  DROP COLUMN is_archived;

ALTER TABLE public.letters
  ADD CONSTRAINT letters_status_check CHECK (status IN ('draft','sent')),
  ADD CONSTRAINT letters_no_self CHECK (recipient_id <> author_id);

CREATE INDEX letters_recipient_idx ON public.letters (recipient_id, status);
CREATE INDEX letters_author_idx ON public.letters (author_id, status);

-- 2. Guard immutable / locked fields
CREATE OR REPLACE FUNCTION public.letters_guard()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.space_id <> OLD.space_id
     OR NEW.author_id <> OLD.author_id
     OR NEW.recipient_id <> OLD.recipient_id THEN
    RAISE EXCEPTION 'A letter''s space, author and recipient cannot be changed.';
  END IF;
  IF OLD.status = 'sent' THEN
    IF NEW.status <> 'sent' THEN
      RAISE EXCEPTION 'A sent letter cannot be turned back into a draft.';
    END IF;
    IF NEW.title <> OLD.title OR NEW.body <> OLD.body
       OR COALESCE(NEW.mood,'') <> COALESCE(OLD.mood,'')
       OR NEW.scheduled_for IS DISTINCT FROM OLD.scheduled_for
       OR NEW.sent_at IS DISTINCT FROM OLD.sent_at THEN
      RAISE EXCEPTION 'A sent letter can no longer be edited.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER letters_guard_trigger
  BEFORE UPDATE ON public.letters
  FOR EACH ROW EXECUTE FUNCTION public.letters_guard();

-- 3. Readability helper
CREATE OR REPLACE FUNCTION public.can_read_letter(_letter_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.letters l
    WHERE l.id = _letter_id
      AND public.is_space_member(l.space_id, _user_id)
      AND (
        l.author_id = _user_id
        OR (
          l.recipient_id = _user_id
          AND l.status = 'sent'
          AND (l.scheduled_for IS NULL OR l.scheduled_for <= now())
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_letter_author(_letter_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.letters l
    WHERE l.id = _letter_id AND l.author_id = _user_id
  );
$$;

-- 4. Replace letters policies
DROP POLICY "Space members can read" ON public.letters;
DROP POLICY "Space members can insert" ON public.letters;
DROP POLICY "Space members can update" ON public.letters;
DROP POLICY "Space members can delete" ON public.letters;

CREATE POLICY "Author or delivered recipient can read"
  ON public.letters FOR SELECT TO authenticated
  USING (
    is_space_member(space_id, auth.uid())
    AND (
      author_id = auth.uid()
      OR (
        recipient_id = auth.uid()
        AND status = 'sent'
        AND (scheduled_for IS NULL OR scheduled_for <= now())
      )
    )
  );

CREATE POLICY "Author can create letters"
  ON public.letters FOR INSERT TO authenticated
  WITH CHECK (
    is_space_member(space_id, auth.uid())
    AND author_id = auth.uid()
    AND is_space_member(space_id, recipient_id)
  );

CREATE POLICY "Author can update own letters"
  ON public.letters FOR UPDATE TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Recipient can mark delivered letter read"
  ON public.letters FOR UPDATE TO authenticated
  USING (
    recipient_id = auth.uid()
    AND status = 'sent'
    AND (scheduled_for IS NULL OR scheduled_for <= now())
  )
  WITH CHECK (
    recipient_id = auth.uid()
    AND status = 'sent'
  );

CREATE POLICY "Author can delete own letters"
  ON public.letters FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- 5. Per-user letter state (favourite / archive)
CREATE TABLE public.letter_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id uuid NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_favorite boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (letter_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.letter_states TO authenticated;
GRANT ALL ON public.letter_states TO service_role;
ALTER TABLE public.letter_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own state on readable letters"
  ON public.letter_states FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND public.can_read_letter(letter_id, auth.uid()));

CREATE POLICY "Create own state on readable letters"
  ON public.letter_states FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.can_read_letter(letter_id, auth.uid()));

CREATE POLICY "Update own state"
  ON public.letter_states FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.can_read_letter(letter_id, auth.uid()))
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Delete own state"
  ON public.letter_states FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER letter_states_updated_at
  BEFORE UPDATE ON public.letter_states
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Attachments
CREATE TABLE public.letter_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  letter_id uuid NOT NULL REFERENCES public.letters(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.letter_attachments TO authenticated;
GRANT ALL ON public.letter_attachments TO service_role;
ALTER TABLE public.letter_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read attachments of readable letters"
  ON public.letter_attachments FOR SELECT TO authenticated
  USING (public.can_read_letter(letter_id, auth.uid()));

CREATE POLICY "Author can add attachments"
  ON public.letter_attachments FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND public.is_letter_author(letter_id, auth.uid()));

CREATE POLICY "Author can update attachments"
  ON public.letter_attachments FOR UPDATE TO authenticated
  USING (public.is_letter_author(letter_id, auth.uid()))
  WITH CHECK (public.is_letter_author(letter_id, auth.uid()));

CREATE POLICY "Author can delete attachments"
  ON public.letter_attachments FOR DELETE TO authenticated
  USING (public.is_letter_author(letter_id, auth.uid()));

CREATE TRIGGER letter_attachments_updated_at
  BEFORE UPDATE ON public.letter_attachments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Future timeline link
ALTER TABLE public.timeline_events
  ADD COLUMN letter_id uuid REFERENCES public.letters(id) ON DELETE SET NULL;