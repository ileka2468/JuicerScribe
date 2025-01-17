# Database Documentation

## Tables

### profiles
- Primary key: `id` (uuid, references auth.users)
- Fields:
  - `username` (text, unique)
  - `points` (integer, default: 0)
  - `created_at` (timestamptz, default: now())
  - `updated_at` (timestamptz, default: now())

### videos
- Primary key: `id` (uuid, default: gen_random_uuid())
- Fields:
  - `youtube_id` (text, unique)
  - `title` (text)
  - `duration` (integer)
  - `status` (text, check: ['AVAILABLE', 'CLAIMED', 'COMPLETED'])
  - `claimed_by` (uuid, references auth.users)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

### transcriptions
- Primary key: `id` (uuid)
- Fields:
  - `video_id` (uuid, references videos)
  - `user_id` (uuid, references profiles)
  - `content` (text)
  - `status` (text, check: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'])
  - `feedback` (text)
  - `estimated_payout` (decimal)
  - `actual_payout` (decimal)
  - `payment_status` (text, check: ['PENDING', 'APPROVED', 'PAID'])
  - `quality_score` (integer, check: 0-100)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

### points
- Primary key: `id` (uuid)
- Fields:
  - `user_id` (uuid, references profiles)
  - `amount` (integer)
  - `reason` (text)
  - `created_at` (timestamptz)

### payment_config
- Primary key: `id` (integer, default: 1)
- Fields:
  - `base_rate` (decimal, default: 0.50)
  - `updated_at` (timestamptz)
- Constraints: Only one row allowed (id = 1)

### stripe_accounts
- Primary key: `user_id` (uuid, references auth.users)
- Fields:
  - `account_id` (text, unique)
  - `charges_enabled` (boolean, default: false)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

### payouts
- Primary key: `id` (uuid)
- Fields:
  - `user_id` (uuid, references auth.users)
  - `amount` (decimal)
  - `status` (text, check: ['pending', 'paid', 'failed'])
  - `stripe_payout_id` (text, unique)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

## Functions

### is_admin()
- Returns: boolean
- Description: Checks if the current user has admin privileges
- Security: SECURITY DEFINER

### update_updated_at()
- Returns: trigger
- Description: Updates the updated_at timestamp before any update operation
- Used by: profiles, videos, transcriptions, stripe_accounts, payouts

### validate_video_state()
- Returns: trigger
- Description: Validates video state transitions and claimed_by updates
- Transitions allowed:
  - AVAILABLE → CLAIMED (must set claimed_by)
  - CLAIMED → COMPLETED (must clear claimed_by)

### validate_transcription_operation()
- Returns: trigger
- Description: Validates transcription operations and status transitions
- Rules:
  - New transcriptions must start as drafts
  - Only draft → submitted transition allowed
  - Video must be claimed by the user

### calculate_points()
- Parameters:
  - video_duration (integer)
  - quality_score (integer)
  - submitted_at (timestamptz)
  - claimed_at (timestamptz)
- Returns: integer
- Description: Calculates points based on duration, quality, and speed
- Formula:
  - Base points = (duration / 60) * 10
  - Quality multiplier = quality_score / 100
  - Speed bonus = 1.2 if completed within 24h, else 1.0

### calculate_estimated_payout()
- Parameters: video_duration (integer)
- Returns: decimal
- Description: Calculates estimated payout based on video duration and base rate
- Formula: (duration / 30) * base_rate

### submit_transcription()
- Parameters:
  - transcription_id (uuid)
  - transcription_content (text)
- Description: Handles transcription submission process
- Actions:
  - Updates transcription status to SUBMITTED
  - Calculates estimated payout
  - Updates video status to COMPLETED

### review_transcription()
- Parameters:
  - p_transcription_id (uuid)
  - p_status (text)
  - p_feedback (text)
  - p_quality_score (integer)
- Description: Handles transcription review process
- Actions:
  - Updates transcription status
  - Sets actual payout if approved
  - Awards points based on quality score

### award_points()
- Parameters:
  - p_user_id (uuid)
  - p_amount (integer)
  - p_reason (text)
- Description: Awards points to users and updates their total

### update_stripe_account_status()
- Parameters:
  - p_user_id (uuid)
  - p_charges_enabled (boolean)
- Description: Updates Stripe account status

## Policies

### profiles
- "Users can insert own profile": INSERT WHERE auth.uid() = id
- "Users can update own profile": UPDATE WHERE auth.uid() = id
- "Users can view all profiles": SELECT true

### videos
- "Users can view videos": SELECT WHERE status = 'AVAILABLE' OR claimed_by = auth.uid() OR is_admin()
- "Only admins can insert videos": INSERT WITH CHECK is_admin()
- "Users can claim available videos": UPDATE WHERE status = 'AVAILABLE' AND claimed_by IS NULL
- "Users can complete claimed videos": UPDATE WHERE status = 'CLAIMED' AND claimed_by = auth.uid()

### transcriptions
- "Users can view own transcriptions": SELECT WHERE user_id = auth.uid() OR is_admin()
- "Users can create transcriptions": INSERT WHERE user_id = auth.uid() AND status = 'DRAFT'
- "Users can update own transcriptions": UPDATE WHERE user_id = auth.uid() AND status = 'DRAFT'

### points
- "Users can view own points": SELECT WHERE user_id = auth.uid() OR is_admin()
- "System can insert points": INSERT WITH CHECK is_admin()

### payment_config
- "Anyone can view payment config": SELECT true
- "Only admins can update payment config": UPDATE WITH CHECK is_admin()

### stripe_accounts
- "Users can view own stripe account": SELECT WHERE auth.uid() = user_id
- "Only system can insert stripe accounts": INSERT WHERE auth.uid() = user_id
- "Only system can update stripe accounts": UPDATE WHERE auth.uid() = user_id

### payouts
- "Users can view own payouts": SELECT WHERE auth.uid() = user_id
- "Only system can manage payouts": ALL WHERE is_admin()

## Indexes
- `idx_videos_claimed_by` on videos(claimed_by)

## Unique Constraints
- `unique_video_user_transcription` on transcriptions(video_id, user_id)

## Triggers
- `update_profiles_updated_at`: BEFORE UPDATE
- `update_videos_updated_at`: BEFORE UPDATE
- `update_transcriptions_updated_at`: BEFORE UPDATE
- `video_state_validation`: BEFORE UPDATE
- `transcription_validation`: BEFORE INSERT OR UPDATE
- `stripe_accounts_updated_at`: BEFORE UPDATE
- `payouts_updated_at`: BEFORE UPDATE