-- Remove duplicate users keeping the lowest id per email
DELETE u1 FROM users u1
JOIN users u2
  ON u1.email = u2.email
 AND u1.id > u2.id;

-- Add a unique index on email to prevent future duplicates
ALTER TABLE users
  ADD UNIQUE INDEX uk_users_email (email);

